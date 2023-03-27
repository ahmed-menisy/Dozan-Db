import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as admin from './admin.js';
import * as adminValidation from './admin.validation.js';
const router = Router();


router.post('/add-admin',
    validation(adminValidation.addAdminSchema),
    asyncErrorHandler(auth([roles.superAdmin])),
    asyncErrorHandler(admin.addAdmin))
router.post('/signin',
    validation(adminValidation.signinSchema),
    asyncErrorHandler(admin.signIn)
)
router.patch('/change-password',
    validation(adminValidation.changePassSchema),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(admin.changePassword)
)
router.patch('/update',
    validation(adminValidation.update),
    asyncErrorHandler(auth([roles.admin, roles.superAdmin])),
    asyncErrorHandler(admin.update)
)
router.delete('/delete/:id',
    validation(adminValidation.deleteAdmin),
    asyncErrorHandler(auth([roles.superAdmin])),
    asyncErrorHandler(admin.deleteAdmin)
)


// router.get('/confirm', asyncErrorHandler(admin.confirmEmail))
router.get('/data', asyncErrorHandler(admin.charts))


export default router