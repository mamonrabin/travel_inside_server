import bcryptjs from "bcryptjs";
import { userModel } from "../modules/user/user.model.js";
import config from "../config/index.js";
import { Role, type IAuthProvider, type IUser } from "../modules/user/user.interface.js";


export const seedSuperAdmin = async () => {
    try {
        const superAdminEmail = config.super_admin_email
        if (!superAdminEmail) {
            throw new Error("Super admin email is not configured")
        }

        const isSuperAdminExist = await userModel.findOne({ email: superAdminEmail })

        if (isSuperAdminExist) {
            console.log("Super Admin Already Exists!");
            return;
        }

        console.log("Trying to create Super Admin...");

        const hashedPassword = await bcryptjs.hash(config.super_admin_password as string, Number(config.bcrypt_salt_round))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: superAdminEmail
        }

        const payload: IUser = {
            name: "Super admin",
            role: Role.SUPER_ADMIN,
            email: superAdminEmail,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider]

        }

        const superadmin = await userModel.create(payload)
        console.log("Super Admin Created Successfuly! \n");
        console.log(superadmin);
    } catch (error) {
        console.log(error);
    }
}