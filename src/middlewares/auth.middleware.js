import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import dotenv from "dotenv"


dotenv.config({
    path: "./.env"
})

export const isLoggedIn = asyncHandler(async (req,res,next) => {
    try {
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;
        if(!accessToken){
            if(!refreshToken){
                return res.status(404).json(
                    new ApiResponse(404,{},"Unauthorized Access")
                );
            }
            const decodeRefresh =  jwt.verify(refreshToken,process.env.REFRESHTOKEN_SECRET);
            const user = await User.findById(decodeRefresh.id);
            if(!user){
                return res.status(404).json(
                    new ApiResponse(404,{},"User not found")
                );
            }
            const newAccessToken = await user.generateAccessToken();
            const newRefreshToken = await user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save();
            const cookieOptions = {
                httpOnly: true
            }
            res.cookie("accessToken",newAccessToken,cookieOptions);
            res.cookie("refreshToken",newRefreshToken,cookieOptions);
            req.user = decodeRefresh;
            next();
        }
        else{
            const accessDecode = jwt.verify(accessToken,process.env.ACCESSTOKEN_SECRET);
            const user = await User.findById(accessDecode.id);
            if(!user){
                return res.status(404).json(
                    new ApiResponse(404,{},"User not found",false)
                );
            }
            const newAccessToken = await user.generateAccessToken();
            const newRefreshToken = await user.generateRefreshToken();

            user.refreshToken = newRefreshToken;
            await user.save();
            const cookieOptions = {
                httpOnly: true
            }
            res.cookie("accessToken",newAccessToken,cookieOptions);
            res.cookie("refreshToken",newRefreshToken,cookieOptions);
            req.user = accessDecode;
            next();
        }
    } catch (error) {
        throw new ApiError(404,error.message);
    }
})


