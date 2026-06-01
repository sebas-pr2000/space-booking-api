import  { Router }  from "express";
import { methods as validateMiddleware } from "../middlewares/validate.middleware.js";
import { methods as authMiddleware } from "../middlewares/auth.middleware.js";
import {methods as methodsSpaces} from "../controllers/space.controller.js"

const router = Router();

router.get("/", 
    authMiddleware.authenticate,
    methodsSpaces.getSpaces
)

router.get("/:id", 
    authMiddleware.authenticate,
    methodsSpaces.getSpaceForId
)

router.post('/',
    authMiddleware.authenticate,//? verifica JWT → adjunta req.user
    authMiddleware.isAdmin,  // ? verifica req.user.role === 'admin'
    validateMiddleware.checkFieldsSpace,
    methodsSpaces.createSpace);

router.patch('/:id',
    authMiddleware.authenticate,//? verifica JWT → adjunta req.user
    authMiddleware.isAdmin,  // ? verifica req.user.role === 'admin'
    methodsSpaces.editSpace);

export default router;