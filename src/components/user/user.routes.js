import Router from 'express';
import validation from '../../middleware/validation.js';
import { asyncErrorHandler } from '../../utils/errorHandeling.js';
import { addUser } from './user.js';
import { addUserSchema } from './user.validation.js';
const router = Router();


router.post('/add-user',validation(addUserSchema),asyncErrorHandler(addUser))


export default router