
import express from "express"
import {userRegistrationValidator,userLoginValidator} from "../validators/index.js"
import { validate } from "../middlewares/validator.middleware.js";
import {registerUser,verifyUserEmail,loginUser, logoutUser,resendVerificationEmail,forgotPasswordRequest,changeCurrentPassword,refreshAccessToken,getCurrentUser} from "../controllers/auth.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";


const router = express.Router();
// jese he koi is route pr ayega userRegistrationValidator execute hojaega at that instance of time mai he
router.route("/register").post(upload.single('avatar'),userRegistrationValidator(),validate,registerUser);

router.route("/verify/:token").get(verifyUserEmail)

router.route("/login").post(userLoginValidator(),validate,loginUser)

router.route("/logout").post(isLoggedIn,logoutUser)


router.route("/resend-verification-mail").get(resendVerificationEmail);

router.route("/reset-password").post(forgotPasswordRequest);

router.route("/reset-password/:token").get(changeCurrentPassword);


router.route("/refresh-access-token").post(refreshAccessToken);

router.route("/profile").get(isLoggedIn,getCurrentUser);


export default router;