const getAsync = async (key) => {
    const data = localStorage.getItem(key);
    return (data === null) ? null : JSON.parse(data);
};
const setAsync = async (key, value) => {
    if (value == null)
        throw new Error("setAsync - value was null or undefined");
    const data = JSON.stringify(value);
    if (!data?.trim())
        throw new Error("setAsync - empty JSON is not allowed");
    localStorage.setItem(key, data);
};
const removeAsync = async (key) => localStorage.removeItem(key);
const clearAsync = async () => localStorage.clear();
export { getAsync, setAsync, removeAsync, clearAsync };
