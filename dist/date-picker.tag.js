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
	<!-- <hr /> -->
	<year-picker></year-picker>
	<!-- <hr /> -->
	<month-picker></month-picker>
	<!-- <hr /> -->
	<day-picker></day-picker>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		border: 1px solid var(--color4);
		/* width: 300px; */
		--color1: #fff;
		--color2: #aaa;
		--color3: #777;
		--color4: #444;
		width: 13rem;
	}
	htm>* {
		display: block;
		border-bottom: 1px solid var(--color4);
		width: 100%;
		padding: .5rem;
		box-sizing: border-box;
	}
	#value {
		/* margin-top: .5rem; */
		font-size: 30px;
		font-weight: 300;
		/* font-family: "Lucida Console"; */
		font-family: publicSans, Helvetica, sans-serif;
		text-align: center;
		vertical-align: middle;
	}
	month-picker {
		width: 100%;
	}
	hr {
		border: none;
		height: 1px;
		background-color: #ddd;
	}`));
function QQ(query, i) {
	let result = Array.from(this.querySelectorAll(query));
	return i ? result?.[i - 1] : result;
}
Element.prototype.Q = QQ
ShadowRoot.prototype.Q = QQ
DocumentFragment.prototype.Q = QQ
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
		this.$onReady(); //: onReady
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
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
import './day-picker.tag.js';
	import './month-picker.tag.js';
	import './year-picker.tag.js';
	class date_picker extends WebTag {
		$onReady() {
			let dayPicker = this.$view.Q('day-picker', 1);
			this.$view.addEventListener('change', event => {
				let value = this.A.value.split('-');
				let order = ['year', 'month', 'day'];
				for (let key in event.detail) {
					value[order.indexOf(key)] = event.detail[key];
				}
				this.A.value = value.join('-');
				event.stopPropagation();
				this.$event('change', { value: this.A.value })
			})
		}
		$onFrameChange() {
			let date = this.A.value ?? new Date().toISOString().slice(0, 10);
			this.A.value = date;
			this.$view.Q('#value', 1).innerHTML = date;
			let [year, month, day] = date.split('-');
			let dayPicker = this.$view.Q('day-picker', 1).A;
			dayPicker.year = year;
			dayPicker.month = month;
			dayPicker.day = day;
			this.$view.Q('month-picker', 1).A.month = month;
			this.$view.Q('year-picker', 1).A.year = year;
		}
		get value() {
			return this.getAttribute('value')
		}
	}
window.customElements.define('date-picker', date_picker)