import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { Note } from "../models/note.models.js";



const getNotes = async (req, res) => {
    // get all notes
    try {
      const user = req.user;
      const projectId = req.params.projectId;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login")
      }
      if(!projectId){
        throw new ApiError(404,"Invalid Project");
      }

      const allNotes =  await Note.find({});
      if(!allNotes){
        throw new ApiError(400,"No Notes Found");
      }
      return res.status(200).json(
        new ApiResponse(200,allNotes,"Notes fetched Successfully")
      );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
  };
  
  const getNoteById = async (req, res) => {
    // get note by id
    try {
      const user = req.user;
      const noteId = req.params.noteId;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login")
      }
      if(!noteId){
        throw new ApiError(404,"Invalid Note");
      }
      const note = await Note.findById(noteId);
      if(!note){
        throw new ApiError(400,"No Note Found");
      }
      return res.status(200).json(
        new ApiResponse(200,note,"Note Fetched Successfully")
      );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
  };
  
  const createNote = async (req, res) => {
    // create note
    try {
      const user = req.user;
      const projectId = req.params.projectId;
      const {content} = req.body;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login")
      }
      if(!projectId){
        throw new ApiError(404,"Invalid Project");
      }
      const note = await Note.create({
        project: projectId,
        createdBy: user.id,
        content
      })
      if(!note){
        throw new ApiError(400,"Note creation Failed");
      }
      return res.status(200).json(
        new ApiResponse(200,note,"Note Created Successfully")
      );
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  };
  
  const updateNote = async (req, res) => {
    // update note
    try {
      const user = req.user;
      const noteId = req.params.noteId;
      const {content} = req.body;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login")
      }
      if(!content){
        throw new ApiError(400,"Field is required");
      }
      if(!noteId){
        throw new ApiError(404,"Invalid Project");
      }
      const updateNote = await Note.findById(noteId);
      if(!updateNote){
        throw new ApiError(400,"Note not found");
      }
      updateNote.content = content;
      await updateNote.save();
      return res.status(200).json(
        new ApiResponse(200,updateNote,"Note updated Successfully")
      );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
  };
  
  const deleteNote = async (req, res) => {
    // delete note
    try {
      const user = req.user;
      const noteId = req.params.noteId;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login")
      }
      if(!noteId){
        throw new ApiError(404,"Invalid Project");
      }
      const deleteNote = await Note.findById(noteId);
      if(!deleteNote){
        throw new ApiError(400,"Deletion Failed");
      }
      return res.status(200).json(
        new ApiResponse(200,deleteNote,"Note deleted Successfully")
      );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
  };


  export {getNotes,getNoteById,createNote,updateNote,deleteNote};