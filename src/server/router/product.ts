import express from 'express';
import { getProductById } from '../../middleware/product';
const router = express.Router();

router.get('/:productId', getProductById);

export default router;
