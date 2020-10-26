console.log('month-picker', import.meta.url);
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
		<table class='months'>
			<xsl:for-each select='//set'>
				<tr>
					<xsl:for-each select='month'>
						<td class='{@selected}' on-tap='select' month='{@month}'>
							<xsl:value-of select='@name' />
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
		font-size: 20px;
		/* font-family: "Lucida Console"; */
		/* font-weight: 100; */
		font-family: publicSans, Helvetica, sans-serif;
	}
	* {
		color: var(--color1);
	}
	table {
		width: 100%;
	}
	td {
		padding: .2rem;
		text-align: center;
	}
	.selected {
		/* background: #ddd; */
		background: var(--color4)
	}
	td:hover {
		background: var(--color4);
		cursor: pointer;
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
class month_picker extends WebTag {
		$onFrameChange() {
			if (!this.A.month) return;
			let year = NODE('year');
			for (let i = 0; i < 3; i++) {
				let set = NODE('set');
				for (let j = 0; j < 4; j++) {
					let number = i * 4 + (j + 1);
					let month = NODE('month', {
						month: number,
						selected: this.A.month * 1 == number ? 'selected' : '',
						name: new Date(2000, number - 1, 11).toLocaleString('default', { month: 'short' })
					});
					set.appendChild(month);
				}
				year.appendChild(set);
			}
			this.$data = year;
		}
		select(node) {
			this.A.month = node.getAttribute('month').padStart(2, '0');
			this.$event('change', { month: this.A.month });
		}
		get value() {
			return this.A.month;
		}
	}
window.customElements.define('month-picker', month_picker)