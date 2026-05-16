import { QueryBuilder } from "../../utlis/QueryBuilder.js";
import { tourSearchableFields } from "./tour.constant.js";
import type { ITour } from "./tour.interface.js";
import { tourModel } from "./tour.model.js";



const createTour = async (payload: ITour) => {
    const existingTour = await tourModel.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }



    const tour = await tourModel.create(payload)

    return tour;
};



const getAllTours = async (query: Record<string, string>) => {


    const queryBuilder = new QueryBuilder(tourModel.find(), query)

    const tours = await queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    // const meta = await queryBuilder.getMeta()

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])


    return {
        data,
        meta
    }
};


const updateTour = async (id: string, payload: Partial<ITour>) => {

    const existingTour = await tourModel.findById(id);

    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    

    const updatedTour = await tourModel.findByIdAndUpdate(id, payload, { new: true });

    return updatedTour;
};

const deleteTour = async (id: string) => {
    return await tourModel.findByIdAndDelete(id);
};





export const TourService = {
    createTour,
    getAllTours,
    updateTour,
    deleteTour,
};