import { asyncHandler } from "../utils/async-handler.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import {
  sendMail,
  emailVerificationMailGenContent,
  resetPasswordMailGenContent
} from "../utils/sendMail.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullname } = req.body;
  const avatarFile = req.file?.path
  // validate the fields
  // now check if user already exist or not
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            null,
            { message: "User Already Registered" },
            false,
          ),
        );
    }
    const cloudinaryUploadResult = await uploadOnCloudinary(avatarFile);

    if(!cloudinaryUploadResult){
        return res.status(404).json(
            new ApiResponse(404,{},"File Uploading Error")
        )
    }
    const token = User.generateVerificationToken();
    const user = await User.create({
      email,
      username,
      password,
      fullname,
      emailVerificationToken: token.unHashedToken,
      emailVerificationTokenExpiry: token.tokenExpiry,
      avatar: {
        localPath: avatarFile,
        url: cloudinaryUploadResult.url
      }
    });
    if (!user) {
      return res
        .status(401)
        .json(
          new ApiResponse(
            401,
            null,
            { message: "User Registration Failed" },
            false,
          ),
        );
    }
    const verificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${token.unHashedToken}`;
    await sendMail({
      email,
      subject: "Verify Your Email",
      mailGenContent: emailVerificationMailGenContent(
        username,
        verificationUrl,
      ),
    });
    //   console.log("Verification Email sent successfuly");
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User Registered Successfully"));
    // new ApiResponse(200,{message: "User Registered Successfully"})
  } catch (error) {
        throw new ApiError(500,"Registration Failed",error)
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // validate req.body fields using express-validator
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Please register yourself", false));
    }

    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User Email is not verified", false));
    }

    const isPassword = await user.comparePassword(password);

    if (!isPassword) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email or password is incorrect"));
    }

    // console.log(user);
    const accessToken = await user.generateAccessToken(user);
    const refreshToken = await user.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();
    const cookieOption = {
      httpOnly: true,
    };
    res.cookie("accessToken", accessToken, cookieOption);
    res.cookie("refreshToken", refreshToken, cookieOption);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { name: user.fullname, email },
          "Logged In Successfuly",
        ),
      );
  } catch (error) {
    throw new ApiError(500, "Login Failed");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    // console.log(req.cookies);
    if(!token){
        return res.status(400).json(
            new ApiResponse(400,null,"Invalid Token",false)
        )
    }
    try {
        const userId = jwt.verify(token,process.env.REFRESHTOKEN_SECRET);
        const user = await User.findById(userId.id);
        console.log(user);
        if(!user){
            return res.status(400).json(
                new ApiResponse(400,null,"User not Found",false)
            )
        }
        user.refreshToken = null;
        await user.save();
        res.cookie("accessToken","",{
            httpOnly: true
        })
        res.cookie("refreshToken","",{
            httpOnly: true
        })
        return res.status(200).json(
            new ApiResponse(200,null,"Logged Out Successfully")
        )
    } catch (error) {
        throw new ApiError(500,"Logout Error")
    }
});

const verifyUserEmail = asyncHandler(async (req, res) => {
  try {
        const token = req.params.token;
    if (!token) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid Token", false));
    }
    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        return res
        .status(401)
        .json(new ApiResponse(401, null, "Email Verification Failed", false));
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email verified Successfully"));
  } catch (error) {
        throw new ApiError(500,"Email Verification Error");
  }
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json(
                new ApiResponse(400,null,"User not found",false)
            )
        }

        if(user.isEmailVerified){
            return res.status(400).json(
                new ApiResponse(400,null,"User Email Already Verified",false)
            )
        }


        const newTokenInfo = await User.generateVerificationToken();
        user.emailVerificationToken = newTokenInfo.unHashedToken;
        user.emailVerificationTokenExpiry = newTokenInfo.tokenExpiry;
        await user.save();

        const newVerificationUrl = `${process.env.BASE_URL}/api/v1/users/verify/${newTokenInfo.unHashedToken}`

        await sendMail({
            email,
            subject: "Verify your Email",
            mailGenContent: emailVerificationMailGenContent(
                user.username,
                newVerificationUrl
            )
        })
        return res.status(200).json(
            new ApiResponse(200,{email,username: user.username,fullname: user.fullname},"Email sent Successfuly")
        );
    } catch (error) {
            throw new ApiError(500,"Error in resending verification link")
    }
});



const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;
    if(!token){
        return res.status(400).json(
            new ApiResponse(400,{},"Token Invalid",false)
        )
    }
    try {
        const userInfo = jwt.verify(token,process.env.REFRESHTOKEN_SECRET);
        const user = await User.findById(userInfo.id);
        if(!user){
            throw new ApiError(404,"User not found");
        }
        const newAccessToken = await user.generateAccessToken();
        const newRefreshToken = await user.generateRefreshToken();
        user.refreshToken = newRefreshToken;
        await user.save();


        const cookieOptions = {
            httpOnly: true
        }
        res.cookie("refreshToken",newRefreshToken,cookieOptions);
        res.cookie("accessToken",newAccessToken,cookieOptions);

        return res.status(200).json(
            new ApiResponse(200,{id: user._id, newAccessToken, newRefreshToken},"Token Refreshed Successfully")
        );
    } catch (error) {
        throw new ApiError(500,"Error in refreshinG Token");
    }

});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json(
                new ApiResponse(400,null,"User not Found",false)
            );
        }
        const forgotPasswordToken = await User.generatePasswordVerificationToken();
        console.log(forgotPasswordToken);
        user.forgotPasswordToken = forgotPasswordToken.unHashedPasswordToken;
        user.forgotPasswordTokenExpiry = forgotPasswordToken.passwordTokenExpiry
        await user.save();

        const passwordResetUrl =  `${process.env.BASE_URL}/api/v1/users/reset/${forgotPasswordToken.unHashedPasswordToken}`
        await sendMail({
            email,
            subject: "Reset Your Password",
            mailGenContent: resetPasswordMailGenContent(
                user.username,
                passwordResetUrl
            )
        })
        return res.status(200).json(
            new ApiResponse(200,null,"Reset Link sent Successfully")
        )
    } catch (error) {
        throw new ApiError(500,"Reset Password Error");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const token = req.params.token;
    const {newPassword} = req.body;
    if(!token){
        return res.status(400).json(
            new ApiResponse(400,null,"Invalid Reset Password Token")
        );
    }
    try {
        const user = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: {$gt: Date.now()}
        });
        if(!user){
            return res.status(400).json(
                new ApiResponse(400,null,"Failed to Reset Password")
            );
        }
        user.password = newPassword;
        user.forgotPasswordToken = undefined;
        user.forgotPasswordTokenExpiry = undefined;
        await user.save();
        return res.status(200).json(
            new ApiResponse(200,null,"Password Reset Successfully")
        );
    } catch (error) {
        throw new ApiError(500,"Reset Password Failed")
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken")
});

export { registerUser, verifyUserEmail, loginUser,logoutUser,resendVerificationEmail,refreshAccessToken,forgotPasswordRequest,changeCurrentPassword,getCurrentUser };
