console.log('time-picker', import.meta.url);
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
	<table on-tap=''>
		<tr>
			<td id='hours'>
				<!-- <table>
					<tr>
						<td>00</td>
						<td>01</td>
						<td>02</td>
						<td>03</td>
					</tr>
				</table> -->
			</td>
			<td id='minutes'>
			</td>
		</tr>
	</table>`;
let STYLE = document.createElement('style');
STYLE.appendChild(document.createTextNode(`:host {
		display: inline-block;
		--color1: #fff;
		--color2: #aaa;
		--color3: #777;
		--color4: #444;
		width: 13rem;
		border: 1px solid var(--color4)
	}
	* {
		color: var(--color1);
	}
	#value {
		padding: .5rem 0;
		font-size: 30px;
		font-weight: 300;
		/* font-family: "Lucida Console"; */
		font-family: publicSans, Helvetica, sans-serif;
		text-align: center;
		vertical-align: middle;
		border-bottom: 1px solid var(--color4)
	}
	table {
		width: 100%;
		/* width: 300px; */
	}
	#hours {
		border-right: 1px solid var(--color4);
	}
	td {
		/* display: inline-block; */
		padding: .3rem;
		text-align: center;
	}
	.night {
		color: gray;
	}
	.evening {
		color: gray;
	}
	#minutes td {
		color: silver;
	}
	#minutes td.quarter {
		/* color: white; */
	}
	.selected {
		background: var(--color4);
	}
	td td:hover {
		cursor: pointer;
		background: var(--color4);
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
function pad(x) { return (x + '').padStart(2, '0') }
	class time_picker extends WebTag {
		$onReady() {
			this.buildHours();
			this.buildMinutes();
			this.$onFrameChange();
		}
		buildHours() {
			let hours = '';
			for (let i = 0; i < 24; i++) {
				hours += `<td on-tap='setHour'  class='${i < 8 ? 'night' : ''} ${i > 19 ? 'evening' : ''}'>${(i + '').padStart(1, '0')}</td>`;
				if (i % 4 == 3) hours += '</tr>\n<tr>'
			}
			this.$view.Q('#hours', 1).innerHTML = '<table><tr>' + hours + '</tr></table>';
		}
		buildMinutes() {
			let minutes = '';
			for (let i = 0; i < 60; i += 5) {
				minutes += `<td on-tap='setMinute' class='${i % 15 == 0 ? 'quarter' : ''} '>${(i + '').padStart(2, '0')}</td>`;
				if (i % 10 == 5) minutes += '</tr>\n<tr>'
			}
			this.$view.Q('#minutes', 1).innerHTML = '<table><tr>' + minutes + '</tr></table>';
		}
		$onFrameChange() {
			let [hour, minute] = (this.getAttribute('value') ?? ':').split(':');
			if (!hour) hour = new Date().getHours();
			if (!minute) minute = new Date().getMinutes();
			if (minute % 5 < 3) minute -= minute % 5;
			else minute += (5 - minute % 5);
			let value = pad(hour) + ':' + pad(minute)
			if (this.getAttribute('value') != value) return this.setAttribute('value', value);
			this.$view.Q('#value', 1).innerHTML = value;
			this.$view.Q('#hours td').map(x => x.innerHTML * 1 == hour * 1 ? x.classList.add('selected') : x.classList.remove('selected'))
			this.$view.Q('#minutes td').map(x => x.innerHTML * 1 == minute * 1 ? x.classList.add('selected') : x.classList.remove('selected'))
		}
		get value() {
			return this.getAttribute('value')
		}
		get hour() {
			return this.value.split(':')[0];
		}
		set hour(v) {
			this.setAttribute('value', pad(v) + ':' + this.minute)
		}
		get minute() {
			return this.value.split(':')[1];
		}
		set minute(v) {
			this.setAttribute('value', this.hour + ':' + pad(v))
		}
		setHour(node) {
			this.hour = node.innerHTML;
			this.$event('change', { value: this.value })
		}
		setMinute(node) {
			this.minute = node.innerHTML;
			this.$event('change', { value: this.value })
		}
	}
window.customElements.define('time-picker', time_picker)