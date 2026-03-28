import Category from "../models/Category.js";

export const createCategoryService = async (data) => {
  const category = await Category.create(data);
  return category;
};

export const getAllCategoriesService = async () => {
  const categories = await Category.find();
  return categories;
};

export const getCategoryByIdService = async (id) => {
  const category = await Category.findById(id);
  return category;
};

export const updateCategoryService = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  return category;
};

export const deleteCategoryService = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  return category;
};