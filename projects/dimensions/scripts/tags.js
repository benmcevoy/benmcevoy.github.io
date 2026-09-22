import * as Store from "./store.js";
const dataKey = "tags";
const LoadTagsAsync = async () => {
    const tags = (await Store.getAsync(dataKey));
    return (tags === null) ? [] : tags;
};
const SaveTagsAsync = async (tags) => await Store.setAsync(dataKey, tags);
class Tags extends HTMLElement {
    tagList = document.createElement("div");
    tagItems = document.createElement("div");
    addTagContainer = document.createElement("div");
    addTagInput = document.createElement("input");
    addTagButton = document.createElement("button");
    get selectedTags() {
        return Array.from(this.tagItems.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);
    }
    constructor() {
        super();
        this.tagList.className = "tags";
        this.tagList.role = "group";
        this.tagList.ariaLabel = "Tags";
        this.addTagContainer.className = "tag-add";
        this.tagItems.className = "tags";
        this.addTagInput.type = "text";
        this.addTagInput.id = "x-tag-new";
        this.addTagInput.placeholder = "Add...";
        this.addTagInput.maxLength = 50;
        this.addTagButton.type = "button";
        this.addTagButton.id = "x-tag-add";
        this.addTagButton.textContent = "+";
        this.addTagButton.addEventListener("click", this.OnAddTagButton_Clicked);
        this.addTagInput.addEventListener("keydown", (e) => { if (e.key === "Enter")
            this.OnAddTagButton_Clicked(); });
        this.addTagContainer.append(this.addTagInput, this.addTagButton);
        this.tagList.append(this.tagItems, this.addTagContainer);
    }
    OnAddTagButton_Clicked = async () => {
        const tag = this.addTagInput.value;
        if (tag === null || tag === undefined || tag == "")
            return;
        const tags = await LoadTagsAsync();
        if (tags.some((t) => t.toLowerCase() == tag.toLowerCase()))
            return;
        tags.push(tag);
        await SaveTagsAsync(tags);
        this.addTagInput.value = "";
        this.renderTags();
    };
    renderTags = async () => {
        const tags = await LoadTagsAsync() ?? [];
        this.tagItems.replaceChildren();
        tags.forEach((tag, i) => {
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
    clearSelectedTags = () => {
        return Array.from(this.tagItems.querySelectorAll('input[type="checkbox"]:checked')).forEach(input => input.checked = false);
    };
    async connectedCallback() {
        if (this.querySelector("div.tags"))
            return;
        this.renderTags();
        this.append(this.tagList);
    }
}
export { Tags, LoadTagsAsync };
customElements.define('x-tags', Tags);
//# sourceMappingURL=tags.js.map