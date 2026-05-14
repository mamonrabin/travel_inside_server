import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createDivisionSchema, updateDivisionSchema } from "./division.validation.js";
import { DivisionController } from "./division.controller.js";



const router = Router()

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createDivisionSchema),
    DivisionController.createDivision
);
router.get("/", DivisionController.getAllDivisions);
router.get("/:slug", DivisionController.getSingleDivision)
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateDivisionSchema),
    DivisionController.updateDivision
);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.deleteDivision);

export const DivisionRoutes = router