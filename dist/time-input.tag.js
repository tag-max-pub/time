console.log('time-input', import.meta.url);
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
HTML.innerHTML = `<span id='value' on-tap='open'>time</span>
	<pop-up>
		<table>
			<tr>
				<td colspan='2'>
					<time-picker></time-picker>
				</td>
			</tr>
			<tr>
				<td on-tap='save'>save</td>
				<td on-tap='cancel'>cancel</td>
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
	}
	td[on-tap] {
		background: #444;
		/* color: white; */
		font-size: 20px;
		font-weight: 100;
		font-family: publicSans;
		text-align: center;
		width: 50%;
		padding: .5rem;
		/* border: #aaa; */
	}
	td[on-tap]:hover {
		background: #555;
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
	class time_input extends WebTag {
		$onReady() {
			this.popup = this.$view.Q('pop-up', 1);
			this.$view.addEventListener('change', event => {
				event.stopPropagation();
			})
		}
		open() {
			console.log('open teim')
			this.popup.open(this.$view.Q('#value', 1));
		}
		set value(v) {
			this.setAttribute('value', v);
			this.$view.Q('#value', 1).innerHTML = v;
		}
		save() {
			this.value = this.$view.Q('time-picker', 1).value;
			this.$event('change');
			this.popup.close();
		}
		cancel() {
			this.popup.close();
		}
	}
window.customElements.define('time-input', time_input)