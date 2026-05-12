/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import { sendResponse } from "../../utlis/sendResponse.js";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userLogin = req.body;
    const result = await AuthServices.credentialsLogin(userLogin);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged In Successfully",
      data: result,
    });
  },
);

export const AuthControllers = {
  credentialsLogin,
};
