import { Router } from "express";
import { userRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { DivisionRoutes } from "../modules/division/division.route.js";

const rounter = Router();

const modulRouter = [
  {
    path: "/user",
    route: userRoutes,
  },

  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
];

modulRouter.forEach((route) => rounter.use(route.path, route.route));

export default rounter;
