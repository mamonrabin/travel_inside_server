import express from "express";
import { TourController } from "./tour.controller.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation.js";
import { multerUpload } from "../../config/multer.config.js";


const router = express.Router();


/* --------------------- TOUR ROUTES ---------------------- */

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("files"),
    validateRequest(createTourZodSchema),
    TourController.createTour
);

router.get("/", TourController.getAllTours);



router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("files"),
    validateRequest(updateTourZodSchema),
    TourController.updateTour
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourController.deleteTour);




export const TourRoutes = router