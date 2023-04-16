import express, { Request, Response } from 'express';
import { getProductById } from '../middleware/product';

const port = 8080;
const app = express();

// this is only for testing the throughput of express cluster along
app.get('/test', async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: 'Hello World!' });
});

app.get('/products/:productId', getProductById);

app.listen(port, () => {
  console.log(`Worker ${process.pid}: App listening on port ${port}`);
});
