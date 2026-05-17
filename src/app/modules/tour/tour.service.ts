import { deleteImageFromCLoudinary } from "../../config/cloudinary.config.js";
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

    // for image update start...

     if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images]
    }

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

        const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl))

        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl))

        payload.images = [...restDBImages, ...updatedPayloadImages]


    }

    // for image update end...

    const updatedTour = await tourModel.findByIdAndUpdate(id, payload, { new: true });

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCLoudinary(url)))
    }

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