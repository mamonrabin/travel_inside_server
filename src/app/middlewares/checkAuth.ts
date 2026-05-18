
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import appError from "../errorsHelpers/appErrors.js";
import { verifyToken } from "../utlis/jwt.js";
import config from "../config/index.js";
import type { JwtPayload } from "jsonwebtoken";
import { userModel } from "../modules/user/user.model.js";
import { IsActive } from "../modules/user/user.interface.js";


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new appError(403, "No Token Recieved")
        }


        const verifiedToken = verifyToken(accessToken, config.jwt_acess_token_secret as string) as JwtPayload

        const isUserExist = await userModel.findOne({ email: verifiedToken.email })

        if (!isUserExist) {
            throw new appError(httpStatus.BAD_REQUEST, "User does not exist")
        }
        if (!isUserExist.isVerified) {
            throw new appError(httpStatus.BAD_REQUEST, "User is not verified")
        }
        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new appError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }
        if (isUserExist.isDeleted) {
            throw new appError(httpStatus.BAD_REQUEST, "User is deleted")
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new appError(403, "You are not permitted to view this route!!!")
        }
        req.user = verifiedToken
        next()

    } catch (error) {
        console.log("jwt error", error);
        next(error)
    }
}