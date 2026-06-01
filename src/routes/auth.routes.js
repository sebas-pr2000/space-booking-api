import  { Router }  from "express";
import { methods as validateMiddleware } from "../middlewares/validate.middleware.js";
import { methods as authMiddleware } from "../middlewares/auth.middleware.js";
import {methods as methods} from "../controllers/auth.controller.js"

const router = Router();

router.get('/me',
    authMiddleware.authenticate, 
    methods.obtainUser);

router.post('/register',
    validateMiddleware.checkFieldsRegister,
    methods.registerUser);

router.post('/login', methods.loginUser);

export default router;