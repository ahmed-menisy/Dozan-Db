import Router from 'express';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import * as users from './user.js';
import * as Val from './user.validation.js';
const router = Router();


router.post('/signup',validation(Val.signUp),asyncErrorHandler(users.signUp))
router.post('/signin',validation(Val.signIn),asyncErrorHandler(users.signIn))
router.post('/check-token',validation(Val.checkToken),asyncErrorHandler(users.checkToken))

export default router