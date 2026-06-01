import  { Router }  from "express";
import { methods as validateMiddleware } from "../middlewares/validate.middleware.js";
import { methods as authMiddleware } from "../middlewares/auth.middleware.js";
import {methods as methodsBooking} from "../controllers/booking.controller.js"

const router = Router();

router.get("/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    validateMiddleware.checkStatusQuery,
    validateMiddleware.checkDateQuery,
    methodsBooking.getAllBookings
)

router.get("/my",
    authMiddleware.authenticate,
    validateMiddleware.checkStatusQuery,
    methodsBooking.getMyBookings
)

router.post('/',
    authMiddleware.authenticate,//? verifica JWT → adjunta req.user
    validateMiddleware.checkFieldsBooking,
    methodsBooking.createBooking);

router.patch("/:id/confirm",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    methodsBooking.confirmBooking
)

router.patch("/:id/cancel",
    authMiddleware.authenticate,
    methodsBooking.cancelledBooking
)

export default router;