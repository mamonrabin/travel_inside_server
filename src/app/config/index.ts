import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

export default {
  port: process.env.PORT,
  database_url: process.env.MONGO_CONNECTION_STRING,
  node_env: process.env.NODE_ENV,

  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,

  jwt_acess_token_secret: process.env.JWT_ACCESS_SECRET_KEY,
  jwt_access_token_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,

  jwt_refresh_token_secret: process.env.JWT_REFRESH_SECRET_KEY,
  jwt_refresh_token_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,

  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,

  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET,

  //   email_user: process.env.EMAIL_USERNAME,
  //   email_pass: process.env.EMAIL_PASSWORD,
  //   email_from: process.env.EMAIL_FROM,
};
