/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";

import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import bcryptjs from "bcryptjs";
import config from "../config/index.js";
import { userModel } from "../modules/user/user.model.js";
import { IsActive, Role } from "../modules/user/user.interface.js";
import { Strategy as LocalStrategy } from "passport-local";

// set passwrd for after google login

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await userModel
          .findOne({ email })
          .select("+password");

        // if (!isUserExist) {
        //     return done(null, false, { message: "User does not exist" })
        // }

        if (!isUserExist) {
          return done("User does not exist");
        }

        if (!isUserExist.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          return done("User is not verified");
        }

        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
          return done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
          return done("User is deleted");
        }

        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObjects) => providerObjects.provider == "google",
        );

        if (isGoogleAuthenticated && !isUserExist.password) {
          return done(null, false, {
            message:
              "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password.",
          });
        }

        // if (isGoogleAuthenticated) {
        //     return done("You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password.")
        // }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string,
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        done(error);
      }
    },
  ),
);

// for google login

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id as string,
      clientSecret: config.google_client_secret as string,
      callbackURL: config.google_callback_url as string,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, {
            message: "No email found",
          });
        }

        let isUserExist = await userModel.findOne({ email });
        if (isUserExist && !isUserExist.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          // done("User is not verified")
          return done(null, false, { message: "User is not verified" });
        }

        if (
          isUserExist &&
          (isUserExist.isActive === IsActive.BLOCKED ||
            isUserExist.isActive === IsActive.INACTIVE)
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
          done(`User is ${isUserExist.isActive}`);
        }

        if (isUserExist && isUserExist.isDeleted) {
          return done(null, false, { message: "User is deleted" });
          // done("User is deleted")
        }

        if (!isUserExist) {
          isUserExist = await userModel.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value ?? "",
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error as Error);
      }
    },
  ),
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await userModel.findById(id);

      done(null, user);
    } catch (error) {
      console.error("Deserialize User Error:", error);
      done(error);
    }
  },
);

export default passport;
