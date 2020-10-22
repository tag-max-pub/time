console.log('day-picker', import.meta.url);
function NODE(name, attributes = {}, children = []) {
	let node = document.createElement(name);
	for (let key in attributes)
		node.setAttribute(key, attributes[key]);
	for (let child of children)
		node.appendChild(typeof child == 'string' ? document.createTextNode(child) : child);
	return node;
}
class XML {
	static parse(string, type = 'xml') {
		return new DOMParser().parseFromString(string.replace(/xmlns=".*?"/g, ''), 'text/' + type)
	}
	static stringify(DOM) {
		return new XMLSerializer().serializeToString(DOM).replace(/xmlns=".*?"/g, '')
	}
}
XMLDocument.prototype.stringify = XML.stringify
Element.prototype.stringify = XML.stringify
function XSLT(xsl) {
	let p = new XSLTProcessor();
	p.importStylesheet(typeof xsl == 'string' ? XML.parse(xsl) : xsl);
	return p;
}
XSLTProcessor.prototype.transform = function (xml) { return this.transformToFragment(typeof xml == 'string' ? XML.parse(xml) : xml, document) }
const XSL = XSLT(`<?xml version="1.0"?>
		<xsl:stylesheet version="1.0"  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
		<xsl:template match='*'>
		<table class=''>
			<xsl:for-each select='//week'>
				<tr>
					<xsl:for-each select='day'>
						<td class='{@weekday} {@samemonth} {@selected}' on-tap='select' day='{@day}'>
							<xsl:value-of select='@day' />
						</td>
					</xsl:for-each>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
		</xsl:stylesheet>
		`);
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		font-size: 16px;
		/* font-family: "Lucida Console"; */
		font-family: publicSans, Helvetica, sans-serif;
	}
	td {
		padding: .3rem;
		text-align: right;
	}
	td:hover {
		background: #eee;
		background: #444;
		cursor: pointer;
	}
	.sat,
	.sun {
		color: #ccc;
		color: #aaa;
	}
	.other {
		color: #999;
		color: #777;
	}
	.selected {
		background: #ddd;
		background: #555;
	}`));
function ATTR() {  // attributes
	return new Proxy(
		Object.fromEntries(Array.from(this.attributes).map(x => [x.nodeName, x.nodeValue])),
		{
			set: (target, key, value) => {
				if (this.getAttribute(key) != value)
					this.setAttribute(key, value);
				return Reflect.set(target, key, value);
			}
		}
	)
}
Object.defineProperty(Element.prototype, "A", { get: ATTR, configurable:true });
Object.defineProperty(DocumentFragment.prototype, "A", { get: ATTR, configurable:true });
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onFrameChange();  //: onFrameChange
		await this.$render() //: XSLT
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				this.$onFrameChange(
					this.A,//Object.fromEntries(events.map(e => [e.attributeName, this.getAttribute(e.attributeName)])),
					Object.fromEntries(events.map(e => [e.attributeName, e.oldValue]))
				);
			} else {
				if (this.$autoUpdate !== false) this.$render(events); //: XSLT
			}
		}).observe(this, { attributes: true, characterData: true, attributeOldValue: true, childList: true, subtree: true });
	}
	$attachEventListeners() {
		let action = (event, key) => {
			try {
				let target = event.composedPath()[0];
				let action = target.closest(`[${key}]`);
				this[action.getAttribute(key)](action, event, target)
			}
			catch { }
		}
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
	}
	$clear(R) {
		while (R.lastChild)
			R.removeChild(R.lastChild);
	}
	get $view() {
		return this.$HTM;
	}
	set $view(HTML) {
		this.$clear(this.$view);
		if (typeof HTML == 'string')
			HTML = new DOMParser().parseFromString(HTML, 'text/html').firstChild
		this.$view.appendChild(HTML);
	}
	get $data() {
		return this;
	}
	set $data(XML) {
		this.$clear(this.$data);
		if (typeof XML == 'string')
			XML = new DOMParser().parseFromString(XML, 'text/xml').firstChild
		this.appendChild(XML);
	}
	$render(events) {
		return new Promise((resolve, reject) => {
			window.requestAnimationFrame(t => {
				let xml = XML.parse(XML.stringify(this))  // some platforms need to reparse the xml
				let output = XSL.transform(xml);
				this.$view = output;
				resolve()
			});
		});
	}
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
class day_picker extends WebTag {
		$onFrameChange() {
			let date = new Date(this.A.year, this.A.month - 1, 1);
			if (!date.getFullYear()) return;
			date.setDate(date.getDate() - date.getDay());
			let month = NODE('month');
			for (let i = 0; i < 6; i++) {
				let week = NODE('week');
				for (let j = 1; j <= 7; j++) {
					let day = NODE('day', {
						month: date.getMonth() + 1,
						day: date.getDate(),
						sameMonth: date.getMonth() + 1 == this.A.month ? 'same' : 'other',
						weekday: date.toLocaleDateString('en-us', { weekday: 'short' }).toLowerCase(),
						selected: this.A.day == date.getDate() && date.getMonth() + 1 == this.A.month ? 'selected' : '',
					});
					date.setDate(date.getDate() + 1);
					week.appendChild(day);
				}
				month.appendChild(week);
				if (date.getMonth() + 1 != this.A.month) break;
			}
			this.$data = month;
		}
		select(node) {
			this.A.day = node.getAttribute('day').padStart(2, '0');
			this.$event('change', { day: this.A.day });
		}
		get value() {
			return this.A.value;
		}
	}
window.customElements.define('day-picker', day_picker)