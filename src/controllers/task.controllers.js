import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Task } from "../models/task.models.js";
import { TaskStatusEnum } from "../utils/constants.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { SubTask } from "../models/subtask.models.js";

// get all tasks
const getTasks = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const projectId = req.params.projectId;
    if (!user.id) {
      throw new ApiError(404, "Unauthorized Access, Please Login");
    }
    if (!projectId) {
      throw new ApiError(404, "No Project Found");
    }
    const loggedInUser = await ProjectMember.findOne({
      user: user.id,
      project: projectId,
    });
    if (!loggedInUser) {
      throw new ApiError(404, "You are not a member of this project");
    }
    const allTasks = await Task.find({project: projectId})
      .populate("project")
      .populate("assignedTo", "fullname email")
      .populate("assignedBy", "fullname email")
    if (!allTasks) {
      throw new ApiError(400, "No Task Found");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, allTasks, "Task fetched Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const projectId = req.params.projectId;
    const user = req.user;
    if(!user.id){
      throw new ApiError(404,"Unauthorized Access, Please Login")
    }
    if(!projectId){
      throw new ApiError(404,"No project Found");
    }
    if(!taskId){
      throw new ApiError(404,"Task not found");
    }
    const loggedInUser = await ProjectMember.findOne({user: user.id, project: projectId});
    if(!loggedInUser){
      throw new ApiError(404,"You are not the member of this project");
    }
    const task = await Task.findById(taskId).populate("assignedTo","fullname email").populate("assignedBy","fullname email");
    if(!task){
      throw new ApiError(404,"Error Fetching Task");
    }
    return res.status(201).json(
      new ApiResponse(201,task,"task fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// create task
const createTask = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      status = TaskStatusEnum.TODO,
    } = req.body;
    const user = req.user;
    const projectId = req.params.projectId;
    if (!user.id) {
      throw new ApiError(404, "Unauthorized Access, Please Login");
    }
    if (!title || !description || !assignedTo) {
      throw new ApiError(400, "All fields are required");
    }
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "No Project Found");
    }
    const loggedInUser = await ProjectMember.findOne({
      user: user.id,
      project: projectId,
    });
    if (!loggedInUser) {
      throw new ApiError(404, "You are not a member of this project");
    }
    if (loggedInUser.role === "member") {
      throw new ApiError(400, "You are not authorized to create a task");
    }
    const assignedMember = await ProjectMember.findOne({
      user: assignedTo,
      project: projectId,
    });
    if (!assignedMember) {
      throw new ApiError(404, "Assigned Member is not the member of project");
    }
    const files = req.files ?? [];
    const uploadedAttachments = [];
    for (const file of files) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded?.url) {
        uploadedAttachments.push({
          url: uploaded.url,
          mimetype: file.mimetype,
          size: file.size,
        });
      }
    }
    if (req.files && uploadedAttachments.length === 0) {
      throw new ApiError(400, "Error uploading attachments");
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      assignedBy: user.id,
      status,
      attachments: uploadedAttachments,
    });
    if (!task) {
      throw new ApiError(400, "Error creating task");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, task, "Task created Successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// update task
const updateTask = asyncHandler(async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const user = req.user;
    const {title,description,assignedTo,status} = req.body;
    if(!user.id){
      throw new ApiError(404,"Unauthorized Access, Please Login First");
    }
    if(!title && !description && !status && !assignedTo){
      throw new ApiError(404,"Provide Atleast One Field");
    }
    if(!taskId){
      throw new ApiError(404,"No Task found"); 
    }
    const task =  await Task.findById(taskId);
    if(!task){
      throw new ApiError(400,"Task not found");
    }
    const loggedInUser = await ProjectMember.findOne({user: user.id, project: task.project});
    if(!loggedInUser){
      throw new ApiError(400,"You are not member of the project");
    }
    if(loggedInUser.role === "member"){
      throw new ApiError(404,"You are not allowed to update");
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId,req.body,{new: true});
    if(!updatedTask){
      throw new ApiError(404,"Error Updating Task");
    }
    return res.status(201).json(
      new ApiResponse(201,updateTask,"Task Updated Successfuly")
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// delete task
const deleteTask = asyncHandler(async (req, res) => {
  try {
    const {taskId} = req.params;
    if(!taskId){
      throw new ApiError(404,"Error in Task");
    }
    const task = await Task.findByIdAndDelete(taskId);
    if(!task){
      throw new ApiError(400,"No Task Found");
    }
    return res.status(201).json(
      new ApiResponse(201,task,"Task Deleted Successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// create subtask
const createSubTask = asyncHandler(async (req, res) => {
  try {
    const {title,isCompleted = false} = req.body;
    const user = req.user;
    const taskId = req.params.taskId;
    const projectId = req.params.projectId;
    if(!user.id){
      throw new ApiError(404,"Unauthorized Access, Please Login First");
    }
    if(!title){
      throw new ApiError(404,"All fields are required");
    }
    if(!taskId){
      throw new ApiError(404,"No Task Found");
    }
    if(!projectId){
      throw new ApiError(404,"No Project Found");
    }
    const task = await Task.findById(taskId);
    if(!task){
      throw new ApiError(400,"No Task Found");
    }
    const loggedInUser = await ProjectMember.findOne({
      user: user.id,
      project: projectId
    })
    if(!loggedInUser){
      throw new ApiError(400,"You are not the member of project");
    }
    if(loggedInUser.role === "member"){
      throw new ApiError(400,"You are not Allowed to Create Subtask");
    }
    const existingSubtask = await SubTask.findOne({
        title,
        task: taskId
    })
    if(existingSubtask){
      throw new ApiError(400,"Subtask Already Exists");
    }
    const subTask = await SubTask.create({
      title,
      isCompleted,
      task: taskId,
      createdBy: user.id
    })
    return res.status(200).json(
      new ApiResponse(200,subTask,"Subtask Added Successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const {title,isCompleted} = req.body;
    const {taskId,subtaskId, projectId} = req.params;
    if(!user.id){
      throw new ApiError(404,"Unauthorized Access, Please Login First");
    }
    if(!title || !isCompleted){
      throw new ApiError(404,"Atleast one field required");
    }
    if(!taskId){
      throw new ApiError(404,"TaskId not found");
    }
    if(!subtaskId){
      throw new ApiError(404,"subtask id not found");
    }
    if(!projectId){
      throw new ApiError(404,"Project not found");
    }
    const task =  await Task.findById(taskId);
    if(!task){
      throw new ApiError(400,"Task not found");
    }
    const loggedInUser = await ProjectMember.findOne({user: user.id, project: task.project});
    if(!loggedInUser){
      throw new ApiError(400,"You are not member of the project");
    }
    if(loggedInUser.role === "member"){
      throw new ApiError(404,"You are not allowed to update");
    }
    const updateSubtask = await SubTask.findById(subtaskId);
    if(!updateSubtask){
      throw new ApiError(404,"Subtask not found");
    }
    updateSubtask.title = title;
    updateSubtask.isCompleted = isCompleted;

    await updateSubtask.save();
    
    return res.status(201).json(
      new ApiResponse(201,updateSubtask,"SubTask Updated Successfully")
    );
  } catch (error) {
    throw new ApiError(500,error.message);
  }
});

// delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
  try {
    const {subTaskId} = req.params.subtaskId;
    if(!subTaskId){
      throw new ApiError(404,"Error in Subtask");
    }
    const subtask = await SubTask.findByIdAndDelete(subTaskId);
    if(!subtask){
      throw new ApiError(400,"No Subtask Found");
    }
    return res.status(201).json(
      new ApiResponse(201,subtask,"Subtask Deleted Successfully")
    )
  } catch (error) {
    throw new ApiError(500, error.message);
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
