import express from "express"
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createSubTask, createTask, deleteSubTask, deleteTask, getTaskById, getTasks, updateSubTask, updateTask } from "../controllers/task.controllers.js";

const router = express.Router({mergeParams: true});

router.route("/create").post(isLoggedIn,createTask);

router.route("/all-tasks").get(isLoggedIn,getTasks);

router.route("/onetask/:taskId").get(isLoggedIn,getTaskById);

router.route("/subtask/:taskId").post(isLoggedIn,createSubTask);

router.route("/update-task/:taskId").post(isLoggedIn,updateTask);

router.route("/:taskId/update-subtask/:subtaskId").put(isLoggedIn,updateSubTask);


router.route("/delete-task/:taskId").delete(isLoggedIn,deleteTask);

router.route("/delete-subtask/:subtaskId").get(isLoggedIn,deleteSubTask);



export default router