import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.models.js";
import { TaskStatusEnum } from "../utils/constants.js"; 
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";


// get all tasks
const getTasks = asyncHandler(async (req, res) => {
    try {
       
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // get task by id
  const getTaskById = asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // create task
  const createTask = asyncHandler(async (req, res) => {
    try {
      const {title,description,assignedTo,status=TaskStatusEnum.TODO}  = req.body;
      const user = req.user;
      const projectId = req.params.projectId;
      if(!user.id){
        throw new ApiError(404,"Unauthorized Access, Please Login");
      }
      if(!title || !description || !assignedTo){
        throw new ApiError(400,"All fields are required");
      }
      const project = await Project.findById(projectId);
      if(!project){
        throw new ApiError(404,"No Project Found");
      }
      const loggedInUser = await ProjectMember.findOne({user: user.id, project: projectId});
      if(!loggedInUser){
        throw new ApiError(404,"You are not a member of this project")
      }
      if(loggedInUser.role === "member"){
        throw new ApiError(400,"You are not authorized to create a task");
      }
      const assignedMember = await ProjectMember.findOne({user: assignedTo,project: projectId});
      if(!assignedMember){
        throw new ApiError(404,"Assigned Member is not the member of project");
      }
      const task = await Task.create({
        title,
        description,
        project: projectId,
        assignedTo,
        assignedBy: user.id,
        status
      })
      if(!task){
        throw new ApiError(400,"Error creating task");
      }
      return res.status(200).json(
        new ApiResponse(200,task,"Task created Successfully")
      );
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // update task
  const updateTask =asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // delete task
  const deleteTask = asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // create subtask
  const createSubTask = asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // update subtask
  const updateSubTask = asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });
  
  // delete subtask
  const deleteSubTask = asyncHandler(async (req, res) => {
    try {
      
    } catch (error) {
      throw new ApiError(500,error.message);
    }
  });


  export {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
  };
  