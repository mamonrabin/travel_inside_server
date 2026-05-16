import type { Request, Response } from "express";
import { catchAsync } from "../../utlis/catchAsync.js";
import { tourTypeService } from "./tourtype.service.js";
import { sendResponse } from "../../utlis/sendResponse.js";

const getAllTourTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await tourTypeService.getAllTourTypes();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour types retrieved successfully',
        data: result,
    });
});


const createTourType = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;
    const result = await tourTypeService.createTourType({name});
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Tour type created successfully',
        data: result,
    });
});

const updateTourType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await tourTypeService.updateTourType(id as string, name);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour type updated successfully',
        data: result,
    });
});
const deleteTourType = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tourTypeService.deleteTourType(id as string);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Tour type deleted successfully',
        data: result,
    });
});

export const TourtypeController = {
    createTourType,
    getAllTourTypes,
    deleteTourType,
    updateTourType,
   
};