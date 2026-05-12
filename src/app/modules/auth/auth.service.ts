import appError from "../../errorsHelpers/appErrors.js";
import httpStatus from "http-status-codes";
import type { IUser } from "../user/user.interface.js";
import { userModel } from "../user/user.model.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utlis/jwt.js";
import config from "../../config/index.js";
const credentialsLogin = async (payload: IUser) => {
    const { email,password } = payload;

    const isUserExist = await userModel.findOne({ email })
    .select("+password");

    if (!isUserExist) {
        throw new appError(httpStatus.BAD_REQUEST, "Email does not exist")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if (!isPasswordMatched) {
        throw new appError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

     const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(jwtPayload, config.jwt_acess_token_secret as string, config.jwt_access_token_expires_in as string)

    return {
        accessToken
    }

}



export const AuthServices = {
    credentialsLogin
}