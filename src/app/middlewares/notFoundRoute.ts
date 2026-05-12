import type { NextFunction, Request, Response } from "express";
import httpStatus from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const notFoundRoute = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API/Route not found',
    error: '',
  });
};

export default notFoundRoute;