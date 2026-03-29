import httpClient from "../httpClient";

export const getAllCategories = async (onlyActive) => {
  try {
    const { data } = await httpClient.get(
      `/categories?onlyactive=${onlyActive == true ? "1" : "0"}`
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCategory = async (newCategory) => {
  const { data } = await httpClient.post("/categories", newCategory);
  return data;
};

export const updateCategory = async (categoryId, category) => {
  try {
    const { data } = await httpClient.put(
      `/categories/${categoryId}`,
      category
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const { data } = await httpClient.put(
      `/categories/${categoryId}/changestatus`
    );
    return data;
  } catch (error) {
    return error;
  }
};
