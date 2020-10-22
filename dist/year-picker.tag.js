console.log('year-picker', import.meta.url);
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
HTML.innerHTML = `<main on-tap=''></main>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		font-size: 16px;
		/* font-family: "Lucida Console"; */
		/* font-weight: 100; */
		font-family: publicSans, Helvetica, sans-serif;
		width: 220px;
		/* scrollbar-width: none; */
	}
	main {
		overflow-x: scroll;
		scrollbar-width: none;
		/* overflow: -moz-scrollbars-none; */
		/* scrollbar-height: none; */
		/* overflow: hidden; */
		width: 100%;
		white-space: nowrap;
	}
	span {
		display: inline-block;
		padding: .3rem;
	}
	span:hover {
		background: #eee;
		cursor: pointer;
	}
	.selected {
		background: #ddd;
		background: #555;
	}
	::-webkit-scrollbar {
		display: none;
	}
	/* 
	::-webkit-scrollbar {
		width: 5px;
		height: 0px;
	}
	::-webkit-scrollbar-track {
		background: silver;
	}
	::-webkit-scrollbar-thumb {
		background: gray;
	} */`));
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
		this.addEventListener('click', e => action(e, 'on-tap')); //: onTap
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
class year_picker extends WebTag {
		$onFrameChange() {
			let now = this.A.year ?? 2020;
			let years = NODE('main');
			for (let i = 1900; i < 2050; i++) {
				years.appendChild(NODE('span', { year: i, class: i == now ? 'selected' : '', 'on-tap': 'select' }, i + ''));
			}
			this.$view = years;
			this.$view.Q('.selected', 1)?.scrollIntoView({ inline: 'center' }); // , behavior:'smooth'
		}
		select(node) {
			this.A.year = node.getAttribute('year');
			this.$event('change', { year: this.A.year });
		}
		get value() {
			return this.A.month;
		}
	}
window.customElements.define('year-picker', year_picker)