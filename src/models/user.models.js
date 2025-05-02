import mongoose, {mongo, Schema} from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema({
    avatar: {
        type: {
            url: String,
            localPath: String, 
        },
        default: {
            url: `https://placehold.co/600x400`,
            localPath: ""
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    refreshToken:{
        type: String
    },
    emailVerificationToken:{
        type: String
    },
    emailVerificationTokenExpiry:{
        type: Date
    }
},{timestamps: true})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign({id: this._id, email: this.email, username: this.username},process.env.ACCESSTOKEN_SECRET,{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({id: this._id},process.env.REFRESHTOKEN_SECRET,{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}
userSchema.statics.generateVerificationToken =  () => {
   const unHashedToken =  crypto.randomBytes(32).toString("hex");
   const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
   const tokenExpiry = Date.now() + 20*60*1000
   return {hashedToken,unHashedToken,tokenExpiry}
}
userSchema.statics.generatePasswordVerificationToken =  () => {
    const unHashedPasswordToken =  crypto.randomBytes(32).toString("hex");
    const hashedPasswordToken = crypto.createHash("sha256").update(unHashedPasswordToken).digest("hex");
    const passwordTokenExpiry = Date.now() + 2*60*1000
    return {unHashedPasswordToken,hashedPasswordToken,passwordTokenExpiry}
 }

export const User = mongoose.model("User",userSchema)