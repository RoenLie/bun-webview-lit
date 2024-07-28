import {customElement} from 'lit/decorators.js';
import {html, LitElement} from 'lit'



@customElement('test-1')
class Test1Cmp extends LitElement {
	override render() {
		return html`
		HELLO
		<button @click=${() => window.press(1,2,3)}>
			Click
		</button>
		`
	}
}