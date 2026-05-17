import { deleteImageFromCLoudinary } from "../../config/cloudinary.config.js";
import { QueryBuilder } from "../../utlis/QueryBuilder.js";
import { divisionSearchableFields } from "./division.constant.js";
import type { IDivision } from "./division.interface.js";
import { divisionModel } from "./division.model.js";


const createDivision = async (payload: IDivision) => {

    const existingDivision = await divisionModel.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("A division with this name already exists.");
    }


    // const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}-division`

    // let counter = 0;
    // while (await divisionModel.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }

    // payload.slug = slug;

    const division = await divisionModel.create(payload);

    return division
};

// const getAllDivisions = async () => {
//     const divisions = await divisionModel.find({});
//     const totalDivisions = await divisionModel.countDocuments();
//     return {
//         data: divisions,
//         meta: {
//             total: totalDivisions
//         }
//     }
// };

const getAllDivisions = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(divisionModel.find(), query)

    const divisionsData = queryBuilder
        .search(divisionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        divisionsData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};


const getSingleDivision = async (slug: string) => {
    const division = await divisionModel.findOne({ slug });
    return {
        data: division,
    }
};



const updateDivision = async (id: string, payload: Partial<IDivision>) => {

    const existingDivision = await divisionModel.findById(id);
    if (!existingDivision) {
        throw new Error("divisionModel not found.");
    }

    if (payload.name) {
        const duplicateDivision = await divisionModel.findOne({
            name: payload.name,
            _id: { $ne: id },
        });

        if (duplicateDivision) {
            throw new Error("A division with this name already exists.");
        }
    }

    // if (payload.name) {
    //     const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    //     let slug = `${baseSlug}-division`

    //     let counter = 0;
    //     while (await divisionModel.exists({ slug })) {
    //         slug = `${slug}-${counter++}` // dhaka-division-2
    //     }

    //     payload.slug = slug
    // }

    const updatedDivision = await divisionModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    if (payload.thumbnail && existingDivision.thumbnail) {
        await deleteImageFromCLoudinary(existingDivision.thumbnail)
    }

    return updatedDivision

};

const deleteDivision = async (id: string) => {
    await divisionModel.findByIdAndDelete(id);
    return null;
};

export const DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};