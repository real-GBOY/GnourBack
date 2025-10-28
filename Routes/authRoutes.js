/** @format */

const router = require("express").Router();
const authController = require("../Controllers/authControllers");
const { verifyToken } = require("../Middlewares/AuthMiddleWare");

const { handleupload } = require("../Middlewares/UploadMiddleWare");

// Public routes
router.post("/signup", handleupload, authController.SignUp);
router.post("/login", authController.Login);
router.post("/refresh", authController.RefreshToken);
router.post("/logout", authController.Logout);

// Profile routes - requires authentication
router.get("/profile/:id", verifyToken, authController.GetProfile);
router.get("/profile", verifyToken, authController.GetMyProfile);
router.patch("/profile", verifyToken, handleupload, authController.UpdateProfile);
router.patch("/profile/password", verifyToken, authController.ChangePassword);

module.exports = router;
