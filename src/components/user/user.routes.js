import Router from 'express';
import { auth, roles } from '../../middleware/auth.js';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as users from './user.js';
import * as Val from './user.validation.js';
const router = Router();


router.post('/signup',
    validation(Val.signUp),
    asyncErrorHandler(users.signUp)
)
router.post('/signin',
    validation(Val.signIn),
    asyncErrorHandler(users.signIn)
)

router.post('/social-login',
    validation(Val.socialSignIn),
    asyncErrorHandler(users.socialSignIn)
)

router.post('/check-token',
    validation(Val.checkToken),
    asyncErrorHandler(users.checkToken)
)
router.get('/confirm/:token',
    asyncErrorHandler(users.confirmEmail)
)
router.get('/logout',
    auth([roles.user]),
    validation(Val.NoDataSchema),
    asyncErrorHandler(users.logOut)
)
router.post('/send-code',
    validation(Val.SendCode),
    asyncErrorHandler(users.SendCode)
)
router.post('/reset-password',
    validation(Val.reset),
    asyncErrorHandler(users.changePass)
)


export default router