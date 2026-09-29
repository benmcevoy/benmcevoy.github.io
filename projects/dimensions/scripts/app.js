import { Dimension } from "./dimension.js";
import { Tags } from "./tags.js";
const hydrateViewModel = () => {
    const viewModel = {
        tags: document.querySelector("x-tags"),
        notes: document.querySelector("#notes"),
        dimensions: {
            fatigue: document.querySelector("#fatigueDimension"),
            cognition: document.querySelector("#cognitionDimension"),
            physicalCapacity: document.querySelector("#physicalCapacityDimension"),
            mood: document.querySelector("#moodDimension"),
            PEM: document.querySelector("#pemDimension")
        },
        saveButton: document.getElementById("save-button"),
        exportButton: document.getElementById("export-button"),
        saveStatus: document.getElementById("save-status"),
    };
    viewModel.exportButton.addEventListener("click", () => {
        const observations = loadObservations();
        const tags = viewModel.tags?.tags;
        const data = { observations, tags };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "observations.json";
        link.click();
        URL.revokeObjectURL(url);
    });
    viewModel.saveButton.addEventListener("click", (event) => {
        const observation = {
            timestamp: new Date(Math.floor(Date.now() / (5 * 60 * 1000)) * (5 * 60 * 1000)),
            values: {
                fatigue: viewModel.dimensions.fatigue.value,
                cognition: viewModel.dimensions.cognition.value,
                physicalCapacity: viewModel.dimensions.physicalCapacity.value,
                mood: viewModel.dimensions.mood.value,
                PEM: viewModel.dimensions.PEM.value,
            },
            tags: viewModel.tags.selectedTags,
            notes: viewModel.notes.value
        };
        saveObservation(observation);
        if (viewModel.saveStatus) {
            viewModel.saveStatus.textContent = "Saved";
            setTimeout(() => viewModel.saveStatus.textContent = "", 2000);
            viewModel.dimensions.fatigue.resetValue();
            viewModel.dimensions.cognition.resetValue();
            viewModel.dimensions.physicalCapacity.resetValue();
            viewModel.dimensions.mood.resetValue();
            viewModel.dimensions.PEM.resetValue();
            viewModel.tags.clearSelected();
            viewModel.notes.value = "";
        }
    });
};
document.addEventListener("DOMContentLoaded", hydrateViewModel);
const dataKey = "observations";
const loadObservations = () => {
    const data = localStorage.getItem(dataKey);
    const obs = (data == null) ? [] : JSON.parse(data);
    return (obs ?? []).map(o => ({
        ...o,
        timestamp: new Date(o.timestamp)
    }));
};
const saveObservation = (observation) => {
    const observations = loadObservations();
    const index = observations.findIndex(o => o.timestamp.getTime() === observation.timestamp.getTime());
    if (index >= 0) {
        observations[index] = observation;
    }
    else {
        observations.push(observation);
    }
    const data = JSON.stringify(observations);
    localStorage.setItem(dataKey, data);
};
window.addEventListener("error", (event) => {
    const { message, filename, lineno, colno, error } = event;
    alert(`${message}\n\n` +
        `at ${filename}:${lineno}:${colno}\n\n` +
        `${error?.stack ?? ""}`);
});
window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    alert(`Unhandled rejection:\n\n` +
        (reason instanceof Error ? `${reason.message}\n\n${reason.stack}` : String(reason)));
});
customElements.define('x-dimension', Dimension);
customElements.define('x-tags', Tags);
