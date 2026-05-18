/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import appError from "../../errorsHelpers/appErrors.js";
import httpStatus from "http-status-codes";
import { IsActive, type IAuthProvider, type IUser } from "../user/user.interface.js";
import { userModel } from "../user/user.model.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utlis/jwt.js";
import config from "../../config/index.js";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utlis/userTokens.js";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utlis/sendEmail.js";

const credentialsLogin = async (payload: IUser) => {
  const { email, password } = payload;

  const isUserExist = await userModel.findOne({ email }).select("+password");

  if (!isUserExist) {
    throw new appError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatched) {
    throw new appError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  //  const jwtPayload = {
  //     userId: isUserExist._id,
  //     email: isUserExist.email,
  //     role: isUserExist.role
  // }

  // const accessToken = generateToken(jwtPayload, config.jwt_acess_token_secret as string, config.jwt_access_token_expires_in as string)
  //     const refreshToken = generateToken(jwtPayload, config.jwt_refresh_token_secret as string, config.jwt_refresh_token_expires_in as string)

  const userTokens = createUserTokens(isUserExist);

  const { password: pass, ...rest } = isUserExist.toObject();
  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await userModel
    .findById(decodedToken.userId)
    .select("+password");

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user!.password as string,
  );
  if (!isOldPasswordMatch) {
    throw new appError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(config.bcrypt_salt_round),
  );

  user!.save();
};


const setPassword = async (userId: string, plainPassword: string) => {
    const user = await userModel.findById(userId);

    if (!user) {
        throw new appError(404, "User not found");
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new appError(httpStatus.BAD_REQUEST, "You have already set you password. Now you can change the password from your profile password update")
    }

    const hashedPassword = await bcryptjs.hash(
        plainPassword,
        Number(config.bcrypt_salt_round)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }

    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword

    user.auths = auths

    await user.save()

}


const forgotPassword = async (email: string) => {
    const isUserExist = await userModel.findOne({ email });

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

    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const resetToken = jwt.sign(jwtPayload, config.jwt_acess_token_secret as string, {
        expiresIn: "10m"
    })

    const resetUILink = `${config.frontend_url}/reset-password?id=${isUserExist._id}&token=${resetToken}`

    sendEmail({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isUserExist.name,
            resetUILink
        }
    })

    /**
     * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
     */
}


const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
    if (payload.id != decodedToken.userId) {
        throw new appError(401, "You can not reset your password")
    }

    const isUserExist = await userModel.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new appError(401, "User does not exist")
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_round)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  forgotPassword,
  resetPassword
};
