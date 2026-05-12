import type { NextFunction, Request, Response } from "express";
import appError from "../errorsHelpers/appErrors.js";
import { verifyToken } from "../utlis/jwt.js";
import config from "../config/index.js";
import type { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        user?: JwtPayload;
    }
}

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new appError(403, "No Token Recieved")
        }


        const verifiedToken = verifyToken(accessToken, config.jwt_acess_token_secret as string) as JwtPayload
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