console.log('pop-up', import.meta.url);
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
HTML.innerHTML = `<!-- <div on-tap=''></div> -->
	<!-- <div id='back'></div> -->
	<!-- <slot></slot> -->`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		position: absolute;
		/* padding: 1rem; */
		background: #333;
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
		this.$onReady(); //: onReady
	}
	$attachMutationObservers() {
		this.modelObserver = new MutationObserver(events => {
			if ((events[0].type == 'attributes') && (events[0].target == this)) {
			} else {
				this.$onDataChange(events); //: $onDataChange
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
};
class pop_up extends WebTag {
		$onReady() {
			this.hidden = true;
			this.$onDataChange();
			window.addEventListener('mousedown', event => {
				if (this.clone && !event.composedPath().includes(this.clone)) {
					this.close({ message: 'blur' });
				}
			})
		}
		$onDataChange() {
			this.$view.innerHTML = this.innerHTML
			console.log('popup data-change', this, this.innerHTML, '\n\n', this.$view, this.$view.innerHTML);
		}
		open(anchor) {
			console.log('copy to root', this.$view.innerHTML)
			let dim = anchor?.getBoundingClientRect()
			console.log('dim', dim);
			this.clone = document.createElement('pop-up')
			this.clone.innerHTML = this.$view.innerHTML;
			this.clone.style.zIndex = 1000;
			document.body.appendChild(this.clone);
			console.log('clone', this.clone, this);
			this.clone.style.top = dim.y + 'px';
			this.clone.style.left = dim.x + dim.width + 'px';
			this.clone.hidden = false;
			this.clone.$view.addEventListener('mousedown', event => {
				let node = event.target.closest('[pop-up]');
				if (this.clone && node) {
					this.close({ message: node.getAttribute('pop-up') })
				}
			});
			console.log(document.body)
			return this.clone;
		}
		save() {
		}
		close(o) {
			this.clone.dispatchEvent(new CustomEvent('close', {
				bubbles: true,
				composed: true,
				cancelable: true,
				detail: o
			}));
			this.clone.hidden = true;
			this.clone = null;
		}
	}
window.customElements.define('pop-up', pop_up)