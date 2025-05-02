import { body} from "express-validator"


// yh pura arrray jo return hora hai behind the scene yh array req object mai jata haii 
// fr hum middleware mai req ko validate krke errors check and show krwate hai
const userRegistrationValidator = () => {
    return [
        body('email')
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is invalid"),
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required")
            .isLength({min: 3}).withMessage("Username should be greater than 3 characters")
            .isLength({max: 25}).withMessage("Username should be lesser than 13 characters"),
        body('password')
            .notEmpty().withMessage("Password is required")
            .isLength({min: 6}).withMessage("Password should be atleast of 6 length"),
        body('fullname')
            .trim()
            .notEmpty().withMessage("Fullname is required")
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .isEmail().withMessage("Email is not valid")
            .notEmpty().withMessage("Email is required"),

        body("password")
            .notEmpty().withMessage("Password is required")
    ]
}



export {userRegistrationValidator,userLoginValidator}