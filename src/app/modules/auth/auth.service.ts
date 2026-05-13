/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import appError from "../../errorsHelpers/appErrors.js";
import httpStatus from "http-status-codes";
import type { IUser } from "../user/user.interface.js";
import { userModel } from "../user/user.model.js";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utlis/jwt.js";
import config from "../../config/index.js";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utlis/userTokens.js";
import type { JwtPayload } from "jsonwebtoken";

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

const resetPassword = async (
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

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
