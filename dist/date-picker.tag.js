console.log('date-picker', import.meta.url);
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
const HTML = document.createElement('template');
HTML.innerHTML = `<div id='value'></div>
	<hr />
	<year-picker year='2000'></year-picker>
	<hr />
	<month-picker month='7'></month-picker>
	<hr />
	<day-picker year='2000' month='7' day='1'></day-picker>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
	}
	#value{
		font-size: 30px;
		/* font-family: "Lucida Console"; */
		font-family: Helvetica, sans-serif;
		text-align: center;
	}
	month-picker {
		width: 100%;
	}`));
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
class WebTag extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open', delegatesFocus: true });
		this.shadowRoot.appendChild(STYLE.cloneNode(true)); //: CSS
		this.$HTM = document.createElement('htm')
		this.shadowRoot.appendChild(this.$HTM)
	}
	async connectedCallback() {
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onFrameChange();  //: onFrameChange
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				this.$onFrameChange(
					this.att,//Object.fromEntries(events.map(e => [e.attributeName, this.getAttribute(e.attributeName)])),
					Object.fromEntries(events.map(e => [e.attributeName, e.oldValue]))
				);
			} else {
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
	}
	$applyHTML() {
		this.$view = HTML.content.cloneNode(true)
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
	get $frame() {  // attributes
		return new Proxy(
			Object.fromEntries(Array.from(this.attributes).map(x => [x.nodeName, x.nodeValue])),
			{
				set: (target, key, value) => {
					this.setAttribute(key, value);
					return Reflect.set(target, key, value);
				}
			}
		)
	}
};
import './day-picker.tag.js';
	import './month-picker.tag.js';
	class date_picker extends WebTag {
		$onReady() {
			let dayPicker = this.$view.Q('day-picker', 1);
			this.$view.addEventListener('change', e => {
				console.log('e', e.target, e.target.nodeName);
				if (e.target.nodeName == 'YEAR-PICKER')
					dayPicker.setAttribute('year', e.target.value);
				if (e.target.nodeName == 'MONTH-PICKER')
					dayPicker.setAttribute('month', e.target.value);
				for (let x of ['year', 'month', 'day'])
					this.$frame[x] = dayPicker.getAttribute(x)
			})
		}
		$onFrameChange() {
			let dayPicker = this.$view.Q('day-picker', 1);
			this.$view.Q('#value', 1).innerHTML =
				this.$frame.year + '-' +
				this.$frame.month.padStart(2, '0') + '-' +
				this.$frame.day.padStart(2, '0')
		}
	}
window.customElements.define('date-picker', date_picker)