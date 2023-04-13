import { Response, Request } from 'express';
import { getProductById } from '../model';

async function findProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.productId);
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `server error` });
  }
}

export { findProduct };