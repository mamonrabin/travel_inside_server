import { model, Schema } from "mongoose";
import type { ITourType } from "./tourtype.interface.js";

const tourTypeSchema = new Schema<ITourType>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export const tourTypeModel = model<ITourType>("tourType", tourTypeSchema);
