// User - Booking(Pending) -> Payment (Unpaid) -> SSLCommerz -> Booking update = confirm -> Payment update = Paid

import { Types } from "mongoose";
import type { IUser } from "../user/user.interface.js";
import type { ITour } from "../tour/tour.interface.js";
import type { IPayment } from "../payment/payment.interface.js";


export enum BOOKING_STATUS {
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED"
}

export interface IBooking {
    user: Types.ObjectId | IUser,
    tour: Types.ObjectId | ITour,
    payment?: Types.ObjectId | IPayment,
    guestCount: number,
    status: BOOKING_STATUS
     // for invoive
  createdAt?: Date;
}