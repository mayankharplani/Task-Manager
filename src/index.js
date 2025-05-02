import app from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/dbConnect.js";

dotenv.config({
    path: "./.env"
})
const PORT = process.env.PORT || 3000;
connectDB()
    .then(() => {
        app.listen(PORT,() => {
            console.log(`App is listening on:${PORT}`);
            
        })
    })
    .catch((err) => {
        console.error("Mongodb connect error", err);
        process.exit(1);
    })