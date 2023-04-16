import { Request, Response, NextFunction } from 'express';

// Error but with one more property code
export class HttpError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.code = code;
    this.name = 'HttpError';
  }
}

// Error Handler Middleware for all routes
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  console.log(err);
  res.status(err.code).json({ err: err.message });
}
