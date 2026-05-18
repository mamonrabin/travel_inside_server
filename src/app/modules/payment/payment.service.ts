/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { paymentModel } from "./payment.model.js";
import appError from "../../errorsHelpers/appErrors.js";
import { bookingModel } from "../booking/booking.model.js";
import type { ISSLCommerz } from "../sslCommerz/sslCommerz.interface.js";
import { SSLService } from "../sslCommerz/sslCommerz.service.js";
import { PAYMENT_STATUS } from "./payment.interface.js";
import { BOOKING_STATUS } from "../booking/booking.interface.js";
import { generatePdf, type IInvoiceData } from "../../utlis/invoice.js";
import type { ITour } from "../tour/tour.interface.js";
import type { IUser } from "../user/user.interface.js";
import { sendEmail } from "../../utlis/sendEmail.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config.js";

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

     if (!updatedPayment) {
      throw new appError(401, "payment not found");
    }
    //  normal booking
    //   await bookingModel.findByIdAndUpdate(
    //   updatedPayment?.booking,
    //   { status: BOOKING_STATUS.COMPLETE },
    //   { runValidators: true, session },
    // );

    // with pdf invoice

    const updatedBooking = await bookingModel
      .findByIdAndUpdate(
        updatedPayment?.booking,
        { status: BOOKING_STATUS.COMPLETE },
        { new: true, runValidators: true, session },
      )
      .populate("tour", "title")
      .populate("user", "name email");

    if (!updatedBooking) {
      throw new appError(401, "Booking not found");
    }

    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      userName: (updatedBooking.user as unknown as IUser).name,
    };

    const pdfBuffer = await generatePdf(invoiceData);

    const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        if (!cloudinaryResult) {
            throw new appError(401, "Error uploading pdf")
        }

        await paymentModel.findByIdAndUpdate(updatedPayment._id, 
          { invoiceUrl: cloudinaryResult.secure_url }, 
          { runValidators: true, session })

        await sendEmail({
            to: (updatedBooking.user as unknown as IUser).email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        })

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



const getInvoiceDownloadUrl = async (paymentId: string) => {
    const payment = await paymentModel.findById(paymentId)
        .select("invoiceUrl")

    if (!payment) {
        throw new appError(401, "Payment not found")
    }

    if (!payment.invoiceUrl) {
        throw new appError(401, "No invoice found")
    }

    return payment.invoiceUrl
};

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  getInvoiceDownloadUrl
};
