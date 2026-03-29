export const saveToLocal = (key, value) => {
  try {
    const serializedValue =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getFromLocal = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return null;
  }
};

export const removeFromLocal = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};
