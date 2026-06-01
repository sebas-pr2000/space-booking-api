import { Router } from "express";
import authRoutes from "./auth.routes.js";
import spacesRoutes from "./space.routes.js";
import bookingsRoutes from "./booking.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/spaces", spacesRoutes);
router.use("/bookings", bookingsRoutes);

export default router;


