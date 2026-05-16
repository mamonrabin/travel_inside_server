/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { BOOKING_STATUS, type IBooking } from "./booking.interface.js";
import { bookingModel } from "./booking.model.js";
// import { userModel } from "../user/user.model.js";
import appError from "../../errorsHelpers/appErrors.js";
import { tourModel } from "../tour/tour.model.js";
import { paymentModel } from "../payment/payment.model.js";
import { PAYMENT_STATUS } from "../payment/payment.interface.js";
import { userModel } from "../user/user.model.js";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Duplicate DB Collections / replica
 *
 * Relica DB -> [ Create Booking -> Create Payment ->  Update Booking -> Error] -> Real DB
 */

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await bookingModel.startSession();
  session.startTransaction();

  try {
      const user = await userModel.findById(userId);

    const tour = await tourModel.findById(payload.tour).select("costFrom");

    if (!tour?.costFrom) {
      throw new appError(httpStatus.BAD_REQUEST, "No Tour Cost Found!");
    }

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

      if (!user?.phone || !user.address) {
        throw new appError(
          httpStatus.BAD_REQUEST,
          "Please Update Your Profile to Book a Tour.",
        );
      }

    const booking = await new bookingModel({
      user: userId,
      status: BOOKING_STATUS.PENDING,
      ...payload,
    }).save({ session });

    const payment = await new paymentModel({
      booking: booking._id,
      status: PAYMENT_STATUS.UNPAID,
      transactionId: transactionId,
      amount: amount,
    }).save({ session });

    const updateedBooking = await bookingModel
      .findByIdAndUpdate(
        booking._id,
        { payment: payment._id },
        { new: true, runValidators: true, session },
      )
      .populate("user", "name email phone address")
      .populate("tour", "title location costFrom")
      .populate("payment");

    await session.commitTransaction();
    session.endSession();

    return updateedBooking;
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Complete -> Backend(localhost:5000/api/v1/payment/success) -> Update Payment(PAID) & Booking(CONFIRM) -> redirect to frontend -> Frontend(localhost:5173/payment/success)

// Frontend(localhost:5173) - User - Tour - Booking (Pending) - Payment(Unpaid) -> SSLCommerz Page -> Payment Fail / Cancel -> Backend(localhost:5000) -> Update Payment(FAIL / CANCEL) & Booking(FAIL / CANCEL) -> redirect to frontend -> Frontend(localhost:5173/payment/cancel or localhost:5173/payment/fail)

const getUserBookings = async () => {
  return {};
};

const getBookingById = async () => {
  return {};
};

const updateBookingStatus = async () => {
  return {};
};

const getAllBookings = async () => {
  return {};
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings,
};
