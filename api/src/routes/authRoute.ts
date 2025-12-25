import { Router } from "express";

import { authController } from "../controllers/authController";
import passport from "passport";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: true }),
  authController.googleCallback
);

router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

router.post("/forgot-password", authController.forgotPassword);
router.get("/verify-reset", authController.verifyResetSession);
router.post("/reset-password", authController.resetPassword);

export default router;
