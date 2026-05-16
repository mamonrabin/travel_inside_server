import { Router } from "express";
import { userRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { DivisionRoutes } from "../modules/division/division.route.js";
import {TourtypeRoutes } from "../modules/tourtype/tourtype.route.js";
import { TourRoutes } from "../modules/tour/tour.route.js";
import { BookingRoutes } from "../modules/booking/booking.route.js";

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
  {
    path: "/tour-types",
    route: TourtypeRoutes,
  },
  {
        path: "/tour",
        route: TourRoutes
    },
  {
        path: "/booking",
        route: BookingRoutes
    }
];

modulRouter.forEach((route) => rounter.use(route.path, route.route));

export default rounter;
