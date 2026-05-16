import { model, Schema } from "mongoose";
import { BOOKING_STATUS, type IBooking } from "./booking.interface.js";



const bookingSchema = new Schema<IBooking>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    tour: {
        type: Schema.Types.ObjectId,
        ref: "tour",
        required: true,
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: "payment"
    },
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.PENDING
    },
    guestCount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

export const bookingModel = model<IBooking>("booking", bookingSchema)