import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import { filesValidation, myMulter } from '../../utils/multer.js';
import * as product from './product.js';
import * as productValidation from './product.validation.js';
const router = Router();
router.post('/add-product',
    auth([roles.admin, roles.superAdmin]),
    myMulter(filesValidation.all).fields([
        { name: "mainImage", maxCount: 1 },
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    validation(productValidation.addProductSchema),
    asyncErrorHandler(product.addProduct)
);
router.patch('/edit-product/:_id',
    auth([roles.admin, roles.superAdmin]),
    myMulter(filesValidation.all).fields([
        { name: "mainImage", maxCount: 1 },
        { name: 'images', maxCount: 5 },
        { name: 'video', maxCount: 1 }
    ]),
    validation(productValidation.updateProductSchema),
    asyncErrorHandler(product.updateProduct)
);
router.delete('/delete-product/:_id',
    validation(productValidation.deleteProductSchema),
    auth([roles.admin, roles.superAdmin]),
    asyncErrorHandler(product.deleteProduct)
);
router.get('/products',
    validation(productValidation.getProducts),
    asyncErrorHandler(product.getAllProducts)
)

router.get('/products-sorted',
    validation(productValidation.getProducts),
    asyncErrorHandler(product.sort)
)

router.get('/product/:productId',
    validation(productValidation.getProductById),
    asyncErrorHandler(product.getProductById)
)

export default router