import crypto from "crypto";
import { userModel } from "../user/user.model.js";
import appError from "../../errorsHelpers/appErrors.js";
import { redisClient } from "../../config/redis.config.js";
import { sendEmail } from "../../utlis/sendEmail.js";

const OTP_EXPIRATION = 2 * 60 // 2minute

const generateOtp = (length = 6) => {
    //6 digit otp
    const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString()

    // 10 ** 5 => 10 * 10 *10 *10 *10 * 10 => 1000000

    return otp
}

const sendOTP = async (email: string, name: string) => {

    const user = await userModel.findOne({ email })

    if (!user) {
        throw new appError(404, "User not found")
    }

    if (user.isVerified) {
        throw new appError(401, "You are already verified")
    }
    const otp = generateOtp();

    const redisKey = `otp:${email}`

    await redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    })

    await sendEmail({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    })
};

const verifyOTP = async (email: string, otp: string) => {
    // const user = await User.findOne({ email, isVerified: false })
    const user = await userModel.findOne({ email })

    if (!user) {
        throw new appError(404, "User not found")
    }

    if (user.isVerified) {
        throw new appError(401, "You are already verified")
    }

    const redisKey = `otp:${email}`

    const savedOtp = await redisClient.get(redisKey)

    if (!savedOtp) {
        throw new appError(401, "Invalid OTP");
    }

    if (savedOtp !== otp) {
        throw new appError(401, "Invalid OTP");
    }


    await Promise.all([
        userModel.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redisClient.del([redisKey])
    ])

};

export const OTPService = {
    sendOTP,
    verifyOTP
}