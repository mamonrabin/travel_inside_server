/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync.js";
import { AuthServices } from "./auth.service.js";
import { sendResponse } from "../../utlis/sendResponse.js";
import appError from "../../errorsHelpers/appErrors.js";
import { setAuthCookie } from "../../utlis/setCookie.js";
import type { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utlis/userTokens.js";
import config from "../../config/index.js";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // normal login
    // const userLogin = req.body;
    // const loginInfo = await AuthServices.credentialsLogin(userLogin);

    

    // res.cookie("accessToken", loginInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    //  res.cookie("refreshToken", loginInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    // setAuthCookie(res, loginInfo);

    // sendResponse(res, {
    //   success: true,
    //   statusCode: httpStatus.OK,
    //   message: "User Logged In Successfully",
    //   data: loginInfo,
    // });



    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {

            // ❌❌❌❌❌
            // throw new AppError(401, "Some error")
            // next(err)
            // return new AppError(401, err)


            // ✅✅✅✅
            // return next(err)
            // console.log("from err");
            return next(new appError(401, err))
        }

        if (!user) {
            // console.log("from !user");
            // return new AppError(401, info.message)
            return next(new appError(401, info.message))
        }

        const userTokens = createUserTokens(user)

        // delete user.toObject().password

        const { password: pass, ...rest } = user.toObject()


        setAuthCookie(res, userTokens)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest

            },
        })
    })(req, res, next)

  },
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new appError(
        httpStatus.BAD_REQUEST,
        "No refresh token recieved from cookies",
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(
      refreshToken as string,
    );

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false
    // })

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New Access Token Retrived Successfully",
      data: tokenInfo,
    });
  },
);


const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully",
        data: null,
    })
})


const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Changed Successfully",
        data: null,
    })
})


const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    // /booking => booking , => "/" => ""
    const user= req.user;

    // console.log("............user..........",user)

    if (!user) {
        throw new appError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password Changed Successfully",
    //     data: null,
    // })

    res.redirect(`${config.frontend_url}/${redirectTo}`)
})

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController
};
