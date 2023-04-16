import { Response, Request, NextFunction } from 'express';
import { queryProductById } from '../model';
import { HttpError } from './error';


export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.productId); 

    // Error: when product id is not valid number
    if (Number.isNaN(id)) return next(new HttpError('Product Id is not valid number', 400));
    
    const queryResult = await queryProductById(id);
    
    // Error: when product id does not exist
    if (queryResult === null) return next(new HttpError('Product Not Found', 404));
    
    res.status(200).json(queryResult);
  } catch (err) {
    // Error: unknown errors
    if (err instanceof Error) return next(new HttpError(err.message, 500));
    else console.log(err);
  }
}

