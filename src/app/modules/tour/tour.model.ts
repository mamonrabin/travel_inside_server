import { model, Schema } from "mongoose";
import type { ITour } from "./tour.interface.js";


const tourSchema = new Schema<ITour>({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    costFrom: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    included: { type: [String], default: [] },
    excluded: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    tourPlan: { type: [String], default: [] },
    maxGuest: { type: Number },
    minAge: { type: Number },
    division: {
        type: Schema.Types.ObjectId,
        ref: "division",
        required: true
    },
    tourType: {
        type: Schema.Types.ObjectId,
        ref: "tourType",
        required: true
    }
}, {
    timestamps: true
})


tourSchema.pre("save", async function () {

    if (this.isModified("title")) {
        const baseSlug = this.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`

        let counter = 0;
        while (await tourModel.exists({ slug })) {
            slug = `${slug}-${counter++}`
        }

        this.slug = slug;
    }
    
})

tourSchema.pre("findOneAndUpdate", async function () {
    const tour = this.getUpdate() as Partial<ITour>

    if (tour.title) {
        const baseSlug = tour.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`


        let counter = 0;
        while (await tourModel.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        tour.slug = slug
    }

    this.setUpdate(tour)

 
})

export const tourModel = model<ITour>("tour", tourSchema)