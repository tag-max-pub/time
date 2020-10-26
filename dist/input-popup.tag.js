console.log('input-popup', import.meta.url);
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
HTML.innerHTML = `<span id='value' on-tap='open'></span>
	<pop-up>
		<style>
			td[pop-up] {
				background: #444;
				color: white;
				/* color: white; */
				font-size: 20px;
				font-weight: 100;
				font-family: publicSans, Helvetica, sans-serif;
				text-align: center;
				width: 50%;
				padding: .5rem;
				/* border: #aaa; */
			}
			td[pop-up]:hover {
				background: #555;
				cursor: pointer;
			}
		</style>
		<table>
			<tr>
				<td colspan='2' id='content'>
					<!-- <slot></slot> -->
				</td>
			</tr>
			<tr>
				<td pop-up='save'>save</td>
				<td pop-up='cancel'>cancel</td>
			</tr>
		</table>
	</pop-up>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
	}
	:host(:hover) {
		color: red;
		cursor: pointer;
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
	$event(name, options) {
		this.dispatchEvent(new CustomEvent(name, {
			bubbles: true,
			composed: true,
			cancelable: true,
			detail: options
		}));
	}
};
import './pop-up.tag.js';
	class input_popup extends WebTag {
		async $onReady() {
			this.popup = this.$view.Q('pop-up', 1);
			await customElements.whenDefined('pop-up')
			this.$onDataChange()
			this.$view.Q('#value')[0].innerHTML = this.getAttribute('placeholder')
		}
		$onDataChange() {
			console.log('copy to ', this.popup.Q('#content', 1))
			this.popup.Q('#content', 1).innerHTML = this.innerHTML;
			console.log('input data-change', this, this.innerHTML, '\n\n', this.$view, this.$view.innerHTML);
		}
		open() {
			console.log('open time')
			let popup = this.popup.open(this);
			console.log('new popup', popup);
			popup.addEventListener('change', event => {
				console.log('popup event', event.detail, event)
				this.tempValue = event.detail.value;
			})
			popup.addEventListener('close', event => {
				console.log('popup close event', event.detail, event)
				if (event.detail.message == 'save')
					this.value = this.tempValue;
			})
		}
		set value(v) {
			this.setAttribute('value', v);
			this.$view.Q('#value', 1).innerHTML = v;
		}
		save() {
			let picker = this.children[0];
			this.value = picker.value;
			this.$event('change');
			this.popup.close();
		}
		cancel() {
			this.popup.close();
		}
	}
window.customElements.define('input-popup', input_popup)