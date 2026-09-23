import { Dimension } from "./dimension.js";
import { Tags, LoadTagsAsync } from "./tags.js";
import { LoadObservationsAsync, SaveObservationsAsync } from "./observations.js";
const saveButton = document.getElementById("save-button");
const exportButton = document.getElementById("export-button");
const saveStatus = document.getElementById("save-status");
const viewModel = {
    tags: document.querySelector("x-tags"),
    notes: document.querySelector("#notes"),
    dimensions: {
        fatigue: document.querySelector("#fatigueDimension"),
        cognition: document.querySelector("#cognitionDimension"),
        physicalCapacity: document.querySelector("#physicalCapacityDimension"),
        mood: document.querySelector("#moodDimension"),
        PEM: document.querySelector("#pemDimension")
    }
};
exportButton?.addEventListener("click", async () => {
    const observations = await LoadObservationsAsync();
    const tags = await LoadTagsAsync();
    const data = { observations, tags };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "observations.json";
    link.click();
    URL.revokeObjectURL(url);
});
saveButton?.addEventListener("click", async (event) => {
    const observation = {
        timestamp: new Date(Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000)),
        values: {
            fatigue: viewModel.dimensions.fatigue.valueAsNumber,
            cognition: viewModel.dimensions.cognition.valueAsNumber,
            physicalCapacity: viewModel.dimensions.physicalCapacity.valueAsNumber,
            mood: viewModel.dimensions.mood.valueAsNumber,
            PEM: viewModel.dimensions.PEM.valueAsNumber,
        },
        tags: viewModel.tags.selectedTags,
        notes: viewModel.notes.value
    };
    const observations = await LoadObservationsAsync();
    const index = observations.findIndex(o => o.timestamp.getTime() === observation.timestamp.getTime());
    if (index >= 0) {
        observations[index] = observation;
    }
    else {
        observations.push(observation);
    }
    await SaveObservationsAsync(observations);
    if (saveStatus) {
        saveStatus.textContent = "Saved";
        setTimeout(() => saveStatus.textContent = "", 2000);
        viewModel.dimensions.fatigue.resetValue();
        viewModel.dimensions.cognition.resetValue();
        viewModel.dimensions.physicalCapacity.resetValue();
        viewModel.dimensions.mood.resetValue();
        viewModel.dimensions.PEM.resetValue();
        viewModel.tags.clearSelectedTags();
        viewModel.notes.value = "";
    }
});
export { Dimension, Tags };
//# sourceMappingURL=app.js.map