import httpStatus from "http-status-codes";
import { IsActive, type IUser } from "../modules/user/user.interface.js";
import { generateToken, verifyToken } from "./jwt.js";
import config from "../config/index.js";
import type { JwtPayload } from "jsonwebtoken";
import { userModel } from "../modules/user/user.model.js";
import appError from "../errorsHelpers/appErrors.js";

export const createUserTokens = (user: IUser) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_acess_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );
  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string,
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    config.jwt_refresh_token_secret as string,
  ) as JwtPayload;

  const isUserExist = await userModel.findOne({
    email: verifiedRefreshToken.email,
  });

  if (!isUserExist) {
    throw new appError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    isUserExist.isActive === IsActive.BLOCKED ||
    isUserExist.isActive === IsActive.INACTIVE
  ) {
    throw new appError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isActive}`,
    );
  }
  if (isUserExist.isDeleted) {
    throw new appError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_acess_token_secret as string,
    config.jwt_access_token_expires_in as string,
  );

  return accessToken;
};
