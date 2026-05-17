import type { Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync.js";
import { TourService } from "./tour.service.js";
import { sendResponse } from "../../utlis/sendResponse.js";
import type { ITour } from "./tour.interface.js";

const createTour = catchAsync(async (req: Request, res: Response) => {

   const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }


  const result = await TourService.createTour(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tour created successfully",
    data: result,
  });
});

const getAllTours = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TourService.getAllTours(query as Record<string, string>);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tours retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  const payload: ITour = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }
  const result = await TourService.updateTour(req.params.id as string, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour updated successfully",
    data: result,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TourService.deleteTour(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tour deleted successfully",
    data: result,
  });
});

export const TourController = {
  createTour,
  getAllTours,
  updateTour,
  deleteTour,
};
