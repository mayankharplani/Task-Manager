import express from "express"
const router = express.Router({mergeParams: true});
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";


router.route("/create-note").post(isLoggedIn,createNote);

router.route("/get-all").get(isLoggedIn,getNotes);

router.route("/get-note").get(isLoggedIn,getNoteById);

router.route("/update-note/:noteId").post(isLoggedIn,updateNote);

router.route("/delete-note/:noteId").delete(isLoggedIn,deleteNote);

export default router