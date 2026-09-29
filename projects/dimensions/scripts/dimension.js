var Quantization;
(function (Quantization) {
    Quantization["Continuous"] = "Continuous";
    Quantization["Boolean"] = "Boolean";
})(Quantization || (Quantization = {}));
class Dimension extends HTMLElement {
    static DEFAULT_VALUE = 0.5;
    _defaultValue;
    inputId = `x-dimension-${crypto.randomUUID()}`;
    root = document.createElement("div");
    rangeInput = document.createElement("input");
    rangeLabel = document.createElement("label");
    minRangeLabel = document.createElement("small");
    maxRangeLabel = document.createElement("small");
    constructor() {
        super();
        this.rangeInput.id = this.inputId;
        this.rangeInput.type = "range";
        this.rangeInput.min = "0";
        this.rangeInput.max = "1";
        this.rangeLabel.htmlFor = this.inputId;
        this.maxRangeLabel.style.float = "right";
        this.root.className = "x-dimension";
        this.root.appendChild(this.rangeLabel);
        this.root.appendChild(this.minRangeLabel);
        this.root.appendChild(this.maxRangeLabel);
        this.root.appendChild(this.rangeInput);
    }
    get label() { return this.getAttribute("label") ?? ""; }
    set label(value) { this.setAttribute("label", value); }
    get value() { return this.rangeInput.valueAsNumber; }
    get quantization() {
        return this.getAttribute("quantization") === Quantization.Boolean
            ? Quantization.Boolean
            : Quantization.Continuous;
    }
    set quantization(value) { this.setAttribute("quantization", value); }
    get minLabel() { return this.getAttribute("min-label") ?? ""; }
    set minLabel(value) { this.setAttribute("min-label", value); }
    get maxLabel() { return this.getAttribute("max-label") ?? ""; }
    set maxLabel(value) { this.setAttribute("max-label", value); }
    render() {
        const step = (this.quantization === Quantization.Boolean)
            ? "1" : "any";
        this.root.title = this.title;
        this.rangeLabel.textContent = `${this.label}:`;
        this.minRangeLabel.textContent = `${this.minLabel}`;
        this.maxRangeLabel.textContent = `${this.maxLabel}`;
        this.rangeInput.step = step;
    }
    connectedCallback() {
        if (!this.contains(this.root))
            this.append(this.root);
        if (this._defaultValue === undefined) {
            this._defaultValue = Number(this.getAttribute("default") ?? Dimension.DEFAULT_VALUE);
            this.rangeInput.value = String(this._defaultValue);
        }
        this.render();
    }
    resetValue = () => this.rangeInput.value = String(this._defaultValue);
}
export { Dimension };
