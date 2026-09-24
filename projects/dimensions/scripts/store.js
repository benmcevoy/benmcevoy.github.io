const getAsync = async (key) => {
    const data = localStorage.getItem(key);
    return (data === null) ? null : JSON.parse(data);
};
const setAsync = async (key, value) => localStorage.setItem(key, JSON.stringify(value));
const removeAsync = async (key) => localStorage.removeItem(key);
const clearAsync = async () => localStorage.clear();
export { getAsync, setAsync, removeAsync, clearAsync };
