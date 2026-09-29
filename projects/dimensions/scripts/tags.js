class Tags extends HTMLElement {
    root = document.createElement("div");
    tagItems = document.createElement("div");
    addTagContainer = document.createElement("div");
    addTagInput = document.createElement("input");
    addTagButton = document.createElement("button");
    _tags = [];
    dataKey = "tags";
    get selectedTags() {
        return Array.from(this.tagItems.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    }
    get tags() { return this._tags; }
    set tags(value) {
        this._tags = value;
        this.render();
    }
    constructor() {
        super();
        this.root.className = "tags";
        this.root.role = "group";
        this.root.ariaLabel = "Tags";
        this.addTagContainer.className = "tag-add";
        this.tagItems.className = "tags";
        this.addTagInput.type = "text";
        this.addTagInput.id = "x-tag-new";
        this.addTagInput.placeholder = "Add...";
        this.addTagInput.maxLength = 50;
        this.addTagButton.type = "button";
        this.addTagButton.id = "x-tag-add";
        this.addTagButton.textContent = "+";
        this.addTagButton.addEventListener("click", this.onAddTagButton_Clicked);
        this.addTagInput.addEventListener("keydown", (e) => { if (e.key === "Enter")
            this.onAddTagButton_Clicked(); });
        this.addTagContainer.append(this.addTagInput, this.addTagButton);
        this.root.append(this.tagItems, this.addTagContainer);
        this.load();
    }
    clearSelected = () => {
        return Array.from(this.tagItems.querySelectorAll('input[type="checkbox"]:checked')).forEach(input => input.checked = false);
    };
    load = () => {
        const data = localStorage.getItem(this.dataKey);
        this.tags = (data === null) ? [] : JSON.parse(data);
    };
    save = () => {
        const tags = this.tags;
        if (tags == null)
            throw new Error("save - tags value was null or undefined");
        const data = JSON.stringify(tags);
        if (!data?.trim())
            throw new Error("save - tags empty JSON is not allowed");
        localStorage.setItem(this.dataKey, data);
    };
    onAddTagButton_Clicked = () => {
        const tag = this.addTagInput.value;
        if (tag === null || tag === undefined || tag == "")
            return;
        if (this.tags.some((t) => t.toLowerCase() == tag.toLowerCase()))
            return;
        this.tags.push(tag);
        this.addTagInput.value = "";
        this.save();
        this.render();
    };
    render = () => {
        this.tagItems.replaceChildren();
        this.tags.forEach((tag, i) => {
            const tagInput = document.createElement("input");
            const tagLabel = document.createElement("label");
            const id = `tag-${i}`;
            tagInput.type = "checkbox";
            tagInput.name = "tags";
            tagInput.id = id;
            tagInput.value = tag;
            tagLabel.htmlFor = id;
            tagLabel.textContent = tag;
            this.tagItems.append(tagInput, tagLabel);
        });
    };
    async connectedCallback() {
        if (!this.contains(this.root))
            this.append(this.root);
        this.render();
    }
}
export { Tags };
