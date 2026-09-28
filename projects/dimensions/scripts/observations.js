import * as Store from "./store.js";
const dataKey = "observations";
const LoadObservationsAsync = async () => {
    const data = (await Store.getAsync(dataKey));
    return (data ?? []).map(o => ({
        ...o,
        timestamp: new Date(o.timestamp)
    }));
};
const SaveObservationsAsync = async (data) => {
    if (data.length === 0)
        throw new Error("Observation data is missing");
    await Store.setAsync(dataKey, data);
};
export { LoadObservationsAsync, SaveObservationsAsync };
