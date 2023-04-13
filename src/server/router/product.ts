// add router, we only have GET /products/:product_id
import express from 'express';
import { findProduct } from '../../middleware/product';
const router = express.Router();

router.get('/:productId', findProduct);

export default router;
/*
middleware/
    auth.ts
    logger.ts
    product.ts


    router.get('\route1', middleware1)
    router.get('\route2', middleware2)
*/

