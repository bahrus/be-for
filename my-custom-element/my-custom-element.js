export class MyCustomElement extends HTMLElement {
    #numValue = 23;
    get numValue() {
        return this.#numValue;
    }
    set numValue(nv) {
        this.#numValue = nv;
        this.shadowRoot.querySelector('#target2').innerHTML = nv.toString();
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.shadowRoot.innerHTML = String.raw `
        <div id=target2></div>
        <script nomodule>
            numValue ** 2
        </script>
        <data itemprop=squared be-for='Value based on /numValue.'>
        <be-hive></be-hive>
    `;
    }
}
customElements.define('my-custom-element', MyCustomElement);
