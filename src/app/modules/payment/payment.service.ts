/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { paymentModel } from "./payment.model.js";
import appError from "../../errorsHelpers/appErrors.js";
import { bookingModel } from "../booking/booking.model.js";
import type { ISSLCommerz } from "../sslCommerz/sslCommerz.interface.js";
import { SSLService } from "../sslCommerz/sslCommerz.service.js";
import { PAYMENT_STATUS } from "./payment.interface.js";
import { BOOKING_STATUS } from "../booking/booking.interface.js";

const initPayment = async (bookingId: string) => {
  const payment = await paymentModel.findOne({ booking: bookingId });

  if (!payment) {
    throw new appError(
      httpStatus.NOT_FOUND,
      "paymentModel Not Found. You have not booked this tour",
    );
  }

  const booking = await bookingModel.findById(payment.booking);

  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};
const successPayment = async (query: Record<string, string>) => {
  // Update bookingModel Status to COnfirm
  // Update paymentModel Status to PAID

  const session = await bookingModel.startSession();
  session.startTransaction();

  try {
    const transactionId = query.transactionId;
    const filter = { transactionId } as Record<string, string>;

    const updatedPayment = await paymentModel.findOneAndUpdate(
      filter,
      {
        status: PAYMENT_STATUS.PAID,
      },
      { new: true, runValidators: true, session: session },
    );

    await bookingModel.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.COMPLETE },
      { runValidators: true, session },
    );

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: true, message: "paymentModel Completed Successfully" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};
const failPayment = async (query: Record<string, string>) => {
  // Update bookingModel Status to FAIL
  // Update paymentModel Status to FAIL

  const session = await bookingModel.startSession();
  session.startTransaction();

  try {
    const transactionId = query.transactionId;
    const filter = { transactionId } as Record<string, string>;
    const updatedPayment = await paymentModel.findOneAndUpdate(
      filter,
      {
        status: PAYMENT_STATUS.FAILED,
      },
      { new: true, runValidators: true, session: session },
    );

    await bookingModel.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.FAILED },
      { runValidators: true, session },
    );

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "paymentModel Failed" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};
const cancelPayment = async (query: Record<string, string>) => {
  // Update bookingModel Status to CANCEL
  // Update paymentModel Status to CANCEL

  const session = await bookingModel.startSession();
  session.startTransaction();

  try {
    const transactionId = query.transactionId;
    const filter = { transactionId } as Record<string, string>;
    const updatedPayment = await paymentModel.findOneAndUpdate(
      filter,
      {
        status: PAYMENT_STATUS.CANCELLED,
      },
      { runValidators: true, session: session },
    );

    await bookingModel.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BOOKING_STATUS.CANCEL },
      { runValidators: true, session },
    );

    await session.commitTransaction(); //transaction
    session.endSession();
    return { success: false, message: "paymentModel Cancelled" };
  } catch (error) {
    await session.abortTransaction(); // rollback
    session.endSession();
    // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
    throw error;
  }
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
};
