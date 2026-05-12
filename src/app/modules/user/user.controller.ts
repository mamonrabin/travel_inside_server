/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userService } from "./user.service.js";
import { catchAsync } from "../../utlis/catchAsync.js";
import { sendResponse } from "../../utlis/sendResponse.js";
import { verifyToken } from "../../utlis/jwt.js";
import type { JwtPayload } from "jsonwebtoken";
import config from "../../config/index.js";

// const createUser = async (req: Request, res: Response,next: NextFunction) => {
//   try {
//     const user = req.body;
//     const result = await userService.createUserServive(user)

//     res.status(httpStatus.CREATED).json({
//       message: 'User created successfully',
//       result
//     });
//   } catch (err:any) {
//      next(err);
//   }
// };

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.body;
    const result = await userService.createUserServive(user);

    // res.status(httpStatus.CREATED).json({
    //   message: "User created successfully",
    //   result,
    // });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully",
      data: result,
    });
  },
);

// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = await userService.getAllUserService();
//     res.status(200).json({
//       success: true,
//       message: "all user get successfully",
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userService.getAllUserService();
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: "all user get successfully",
    //   data: result,
    // });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "all user get successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);


const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization
    // const verifiedToken = verifyToken(token as string, config.jwt_acess_token_secret as string) as JwtPayload

    const verifiedToken = req.user;

    if (!verifiedToken) {
        throw new Error("User not authenticated");
    }

    const payload = req.body;
    const user = await userService.updateUserService(userId as string, payload, verifiedToken)

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user,
    })
})

export const userController = {
  createUser,
  getAllUsers,
  updateUser
};
