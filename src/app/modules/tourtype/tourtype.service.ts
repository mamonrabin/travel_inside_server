import type { ITourType } from "./tourtype.interface.js";
import { tourTypeModel } from "./tourtype.model.js";

const createTourType = async (payload: ITourType) => {
  const existingTourType = await tourTypeModel.findOne({ name: payload.name });

  if (existingTourType) {
    throw new Error("Tour type already exists.");
  }

  return await tourTypeModel.create(payload);
};
const getAllTourTypes = async () => {
  return await tourTypeModel.find();
};
const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await tourTypeModel.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  const updatedTourType = await tourTypeModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedTourType;
};
const deleteTourType = async (id: string) => {
  const existingTourType = await tourTypeModel.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  return await tourTypeModel.findByIdAndDelete(id);
};

export const tourTypeService = {
  createTourType,
  deleteTourType,
  updateTourType,
  getAllTourTypes,
};
