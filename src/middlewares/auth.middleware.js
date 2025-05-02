import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";


export const isLoggedIn = asyncHandler(async (req,res,next) => {
    const token = req.cookies?.accessToken ??
      req.header("Authorization")?.replace("Bearer ", "");
    console.log(req.cookies);
        if(!token){
            return res.status(404).json(
                new ApiResponse(404,{},"Invalid Token")
            );
    }
    try {
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken.id);
        if(!user){
            throw new ApiError(404,"Invalid user access");
        }
        req.user = user
        next();
    } catch (error) {
        throw new ApiError(500,"Unauthorized Access");
    }
})