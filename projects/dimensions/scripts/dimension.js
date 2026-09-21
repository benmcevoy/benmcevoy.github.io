var Quantization;
(function (Quantization) {
    Quantization["Continuous"] = "Continuous";
    Quantization["Boolean"] = "Boolean";
})(Quantization || (Quantization = {}));
class Dimension extends HTMLElement {
    defaultValue = "0.5";
    container = document.createElement("div");
    rangeInput = document.createElement("input");
    rangeLabel = document.createElement("label");
    constructor() {
        super();
        this.rangeInput.type = "range";
        this.rangeInput.min = "0";
        this.rangeInput.max = "1";
        this.container.className = "x-dimension";
        this.container.appendChild(this.rangeLabel);
        this.container.appendChild(this.rangeInput);
    }
    get label() { return this.getAttribute("label") ?? ""; }
    set label(value) { this.setAttribute("label", value); }
    get value() { return this.rangeInput.value; }
    set value(value) { this.rangeInput.value = value; }
    get valueAsNumber() { return this.rangeInput.valueAsNumber; }
    get quantization() { return Quantization[(this.getAttribute("quantization") ?? Quantization.Continuous)]; }
    set quantization(value) { this.setAttribute("quantization", value); }
    connectedCallback() {
        if (this.querySelector("div.x-dimension"))
            return;
        const step = (this.quantization == Quantization.Boolean)
            ? "1" : "any";
        const id = `{this.id}-input`;
        this.rangeLabel.htmlFor = id;
        this.rangeLabel.textContent = `${this.label}:`;
        this.rangeInput.id = id;
        this.rangeInput.step = step;
        this.rangeInput.value = this.defaultValue;
        this.append(this.container);
    }
}
export { Dimension };
customElements.define('x-dimension', Dimension);
//# sourceMappingURL=dimension.js.map