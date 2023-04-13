import express from 'express';
import productRouter from './router/product';

const app = express();
app.use('/products', productRouter);

export default app;