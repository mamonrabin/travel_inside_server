import express from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createTourTypeZodSchema } from "./tourtype.validation.js";
import { TourtypeController } from "./tourtype.controller.js";



const router = express.Router();

router.post(
    "/create-tour-type",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createTourTypeZodSchema),
    TourtypeController.createTourType
);

router.get("/", TourtypeController.getAllTourTypes);



router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createTourTypeZodSchema),
    TourtypeController.updateTourType
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourtypeController.deleteTourType);



export const TourtypeRoutes = router