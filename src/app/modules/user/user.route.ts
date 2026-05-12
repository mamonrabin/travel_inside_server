import express from "express";
import { userController } from "./user.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "./user.interface.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.getAllUsers,
);

router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), userController.updateUser)

export const userRoutes = router;
