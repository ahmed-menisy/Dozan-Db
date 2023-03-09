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
    myMulter(filesValidation.image).array('image',5),
    validation(productValidation.addProductSchema),
    asyncErrorHandler(product.addProduct)
);
router.patch('/edit-product/:_id',
    validation(productValidation.updateProductSchema),
    auth([roles.admin, roles.superAdmin]),
    asyncErrorHandler(product.updateProduct)
);
router.delete('/delete-product/:_id',
    validation(productValidation.deleteProductSchema),
    auth([roles.admin, roles.superAdmin]),
    asyncErrorHandler(product.deleteProduct)
);
router.get('/products',
    validation(productValidation.NoDataSchema),
    auth([roles.admin, roles.superAdmin]),
    asyncErrorHandler(product.getAllproducts)
)
router.patch('/update-main-image/:_id',
    auth([roles.admin, roles.superAdmin]),
    myMulter(filesValidation.image).single('image'),
    asyncErrorHandler(product.updateMainImage)
)
router.patch('/update-video/:_id',
    auth([roles.admin, roles.superAdmin]),
    myMulter(filesValidation.video).single('video'),
    asyncErrorHandler(product.updateVideo)
)
router.patch('/update-images/:_id',
    auth([roles.admin, roles.superAdmin]),
    myMulter(filesValidation.image).array('files', 5),
    asyncErrorHandler(product.udpateImages)
)

export default router