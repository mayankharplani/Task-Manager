import express from "express"
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "../controllers/note.controllers.js";
const router = express.Router();

router.route("/create-note/:projectId").post(isLoggedIn,createNote);

router.route("/get-notes/:projectId").get(isLoggedIn,getNotes);

router.route("/get-notes/:noteId").post(isLoggedIn,getNoteById);

router.route("/update-note/:noteId").post(isLoggedIn,updateNote);

router.route("/delete-note/:noteId").post(isLoggedIn,deleteNote);

export default router