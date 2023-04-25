import express from 'express';
// import compression from 'compression';
import productRouter from './router/product';
import { errorHandler } from '../middleware/error';

const app = express();
// app.use(compression({ level: 1 }));
app.use('/products', productRouter);

// set up a testing route
import { Request, Response } from 'express';
app.get('/test', async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'hi' });
});

// custom error handler for the app
app.use(errorHandler);

export default app;
