console.log('time-format', import.meta.url);
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
HTML.innerHTML = ``;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(``));
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
		this.$applyHTML(); //: HTML
		this.$attachMutationObservers();
		this.$attachEventListeners();
		this.$onFrameChange();  //: onFrameChange
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
				this.$onFrameChange(
					this.A,//Object.fromEntries(events.map(e => [e.attributeName, this.getAttribute(e.attributeName)])),
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
};
import {format} from 'https://max.pub/lib/date.mjs'
	class time_format extends WebTag {
		$onFrameChange(){
			console.log('format',this.A)
			let date = new Date(Date.parse(this.A.time));
			console.log('date',date)
			let output = format(date,this.A.format)
			console.log('output',output)
			this.$view.textContent = output
		}
	}
window.customElements.define('time-format', time_format)