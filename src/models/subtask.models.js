import mongoose, {Schema} from "mongoose";

const subTaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task"
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true})


export const SubTask = mongoose.model("SubTask",subTaskSchema)