/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import type { ISSLCommerz } from "./sslCommerz.interface.js";
import config from "../../config/index.js";
import appError from "../../errorsHelpers/appErrors.js";
import axios from "axios";
import { paymentModel } from "../payment/payment.model.js";

const sslPaymentInit = async (payload: ISSLCommerz) => {
  try {
    const data = {
      store_id: config.ssl_store_id,
      store_passwd: config.ssl_store_pass,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,
      success_url: `${config.ssl_success_backend_url}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
      fail_url: `${config.ssl_fail_backend_url}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
      cancel_url: `${config.ssl_cancel_backend_url}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
      // ipn_url: "http://localhost:3030/ipn",
      shipping_method: "N/A",
      product_name: "Tour",
      product_category: "Service",
      product_profile: "general",
      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address,
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phoneNumber,
      cus_fax: "01711111111",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000,
      ship_country: "N/A",
    };

    if (!config.ssl_payment_api) {
      throw new Error("SSL payment API URL is missing");
    }

    const response = await axios({
      method: "POST",
      url: config.ssl_payment_api,
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log("Payment Error Occured", error);
    throw new appError(httpStatus.BAD_REQUEST, error.message);
  }
};

const validatePayment = async (payload: any) => {
    try {
        const response = await axios({
            method: "GET",
            url: `${config.ssl_validation_api}?val_id=${payload.val_id}&store_id=${config.ssl_store_id}&store_passwd=${config.ssl_store_pass}`
        })

        console.log("sslcomeerz validate api response", response.data);

        await paymentModel.updateOne(
            { transactionId: payload.tran_id },
            { paymentGatewayData: response.data },
            { runValidators: true })
    } catch (error: any) {
        console.log(error);
        throw new appError(401, `Payment Validation Error, ${error.message}`)
    }
}

export const SSLService = {
  sslPaymentInit,
  validatePayment
};
