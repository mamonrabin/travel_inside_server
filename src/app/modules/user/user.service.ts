import bcryptjs from "bcryptjs";
import appError from "../../errorsHelpers/appErrors.js";
import { Role, type IAuthProvider, type IUser } from "./user.interface.js";
import { userModel } from "./user.model.js";
import httpStatus from "http-status-codes";
import config from "../../config/index.js";
import type { JwtPayload } from "jsonwebtoken";
const createUserServive = async (payload: IUser) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await userModel.findOne({ email });
  if (isUserExist) {
    throw new appError(httpStatus.BAD_REQUEST, "User Already Exits");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(config.bcrypt_salt_round),
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };
  const result = await userModel.create({
    email,
    password: hashedPassword,
    ...rest,
    auths: [authProvider],
  });

  return result;
};


const updateUserService = async (userId: string, payload: IUser, decodedToken: JwtPayload) => {

    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
        if (userId !== decodedToken.userId) {
            throw new appError(401, "You are not authorized")
        }
    }

    const ifUserExist = await userModel.findById(userId);

    if (!ifUserExist) {
        throw new appError(httpStatus.NOT_FOUND, "User Not Found")
    }

     if (decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new appError(401, "You are not authorized")
    }

    /**
     * email - can not update
     * name, phone, password address
     * password - re hashing
     *  only admin superadmin - role, isDeleted...
     * 
     * promoting to superadmin - superadmin
     */

    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new appError(httpStatus.FORBIDDEN, "You are not authorized");
        }

        // if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
        //     throw new appError(httpStatus.FORBIDDEN, "You are not authorized");
        // }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new appError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    // if (payload.password) {
    //     payload.password = await bcryptjs.hash(payload.password, config.bcrypt_salt_round as string)
    // }

    const newUpdatedUser = await userModel.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser
}

const getAllUserService = async () => {
  const result = await userModel.find();

  const totalUser = await userModel.countDocuments();
  return {
    data: result,
    meta: {
      total: totalUser,
    },
  };
};

const getSingleUser = async (id: string) => {
    const user = await userModel.findById(id).select("-password");
    return {
        data: user
    }
};

const getMe = async (userId: string) => {
    const user = await userModel.findById(userId).select("-password");
    return {
        data: user
    }
};

export const userService = {
  createUserServive,
  updateUserService,
  getAllUserService,
  getSingleUser,
  getMe
};
