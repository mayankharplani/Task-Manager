import { Project } from "../models/project.models.js"
import {asyncHandler} from "../utils/async-handler.js"
import {ApiError} from "../utils/api-error.js"
import {ApiResponse} from "../utils/api-response.js"
import { ProjectMember } from "../models/projectmember.models.js"
import { UserRolesEnum } from "../utils/constants.js"


const getProjects = asyncHandler( async (req,res) => {
    try {
        const projects = await Project.find();
        const user = req.user;
        if(!user.id){
            throw new ApiError(404, "Unauthorized Access, Please Login First");
        }
        if(!projects){
            new ApiError(400,"No Projects Found")
        }
        return res.status(200).json(
            new ApiResponse(200,projects,"All Projects Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})



const getProjectById = asyncHandler( async (req,res) => {
    try {
        const projectId = req.params.projectId;
        const user = req.user;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login First");
        }
        if(!projectId){
            throw new ApiError(400,"Invalid Project")
        }
        const project = await Project.findById(projectId);
        // console.log(project);
        if(!project){
            new ApiError(400,"No Project Found")
        }
        return res.status(200).json(
            new ApiResponse(200,project,"Project Found Successfully")
        );
    } catch (error) {
        throw new ApiError(500,"Project Fetching Failed")
    }
})



const createProject = asyncHandler( async (req,res) => {
    try {
        const {name,description} = req.body;
        const user = req.user;
        // console.log(user.fullname);
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login");
        }
        if(!name || !description){
            return res.status(400).json(
                new ApiResponse(400,{},"Name and Description is required")
            );
        }
        const existingProject = await Project.findOne({name});
        if(existingProject){
            throw new ApiError(400,"Project Already Exist");
        }
        const project = await Project.create({
            name,
            description,
            createdBy: user.id,
        })
        const projectAdmin = await ProjectMember.create({
            user: user.id,
            project: project.id,
            role: UserRolesEnum.ADMIN
        })

        if(!project || !projectAdmin){
           throw new ApiError(404,"Project Creation Failed")
        }
        return res.status(200).json(
            new ApiResponse(200,{project,projectAdmin},"Project Created Successfuly")
        )
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})



const getAllProjectsOfUser = asyncHandler( async (req,res) => {
    try {
        const user = req.user;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login First");
        }
        const userProjects = await Project.find({createdBy: user.id});
        if(!userProjects){
            throw new ApiError(400,"No Project Found");
        }
        return res.status(201).json(
            new ApiResponse(201,userProjects,"All Projects of user Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})



const updateProject = asyncHandler( async (req,res) => {
    try {
        const {name,description} = req.body
        const user = req.user;
        const projectId = req.params.projectId;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login");
        }
        if(!projectId){
            throw new ApiError(404,"Invalid Project");
        }
        const loggedInUser = await ProjectMember.findOne({user: user.id, project: projectId});
        if(!loggedInUser){
            throw new ApiError(404,"You are not member of this project");
        }
        if(loggedInUser === "member"){
            throw new ApiError(400, "You are not allowed to update project");
        }
        const project = await Project.findById(projectId);
        if(!project){
            throw new ApiError(404,"Project not found");
        }
        project.name = name;
        project.description = description;
        await project.save();
        return res.status(200).json(
            new ApiResponse(200,project,"Project Updated Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }



})



const deleteProject = asyncHandler( async (req,res) => {
    try {
        const user = req.user;
        const projectId  = req.params.projectId;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login");
        }
        if(!projectId){
            throw new ApiError(404,"Invalid Project");
        }
        const loggedInUser = await ProjectMember.findOne({user: user.id, project: projectId});
        if(!loggedInUser){
            throw new ApiError(404,"You are not the member of this project");
        }
        if(loggedInUser === "member"){
            throw new ApiError(404,"You are not allowed to delete the project");
        }
        const project = await Project.findByIdAndDelete(projectId);
        if(!project){
            throw new ApiError(400,"No Project Found");
        }
        return res.status(200).json(
            new ApiResponse(200,project,"Project Deleted Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }



})





const addMemberToProject = asyncHandler( async (req,res) => {
    try {
        const {memberId,role} = req.body;
        const projectId = req.params.projectId;
        const user = req.user;
        if(!memberId || !role){
            throw new ApiError(400,"All fields are required");
        }
        if(!user.id){
            throw new ApiError(404, "Unauthorized Access,Please Login First");
        }
        const member = await ProjectMember.findOne({user: user.id, project: projectId});
        if(!member){
            throw new ApiError(404,"You are not a members of this project");
        }
        if(member.role === "member"){
            throw new ApiError(404,"You are not allowed to add members");
        }
        const existingMember = await ProjectMember.findOne({user: memberId,project: projectId})
        // if(role === "project_admin"){
        //     const projectAdmin = await ProjectMember.findOne({role: role});
        //     if(projectAdmin){

        //     }   
        // }
        if(existingMember){
            throw new ApiError(400,"Already a Member");
        }
        const addMember = await ProjectMember.create({
            user: memberId,
            project: projectId,
            role: role
        })
        if(!addMember){
            throw new ApiError(400,"Add Member Failed")
        }
        return res.status(200).json(
            new ApiResponse(200,addMember,"Member Added Successfuly")
        );
    } catch (error) {
        throw new ApiError(500, error.message)
    }
})



const getProjectMembers = asyncHandler( async (req,res) => {
    try {
        const projectId = req.params.projectId;
        if(!projectId){
            throw new ApiError(404,"Invalid Project");
        }
        const allProjectMembers = await ProjectMember.find({project: projectId}).populate("user");
        if(!allProjectMembers){
            throw new ApiError(400,"No Project Members Found");
        }
        return res.status(200).json(
            new ApiResponse(200,allProjectMembers,"Project Members Fetched Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})



const updateProjectMember = asyncHandler( async (req,res) => {

    

})

const updateMemberRole = asyncHandler( async (req,res) => {
    try {
        const projectId = req.params.projectId;
        const user = req.user;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login")
        }
        if(!projectId){
            throw new ApiError(404,"Invalid Access");
        }
        const loggedInUser = await ProjectMember.findOne({user: user.id,project: projectId});
        if(!loggedInUser){
            throw new ApiError(404, "You are not the member of project");
        }
        if(loggedInUser.role === "member"){
            throw new ApiError(404,"You are not allowed to update project members")
        }
        const {memberId,role} = req.body;
        if(!role){
            throw new ApiError(400,"Role is required");
        }
        const existingMember = await ProjectMember.findOne({user: memberId, project: projectId});
        if(!existingMember){
            throw new ApiError(404,"Not a Member");
        }
        if(existingMember.role === "admin"){
            throw new ApiError(400,"You cannot update the role of admin");
        }
        if(existingMember.role == role){
            throw new ApiError(400,"Member already on that role");
        }
        existingMember.role = role;
        await existingMember.save();
        return res.status(200).json(
            new ApiResponse(200,existingMember,"Member updated Successfully")
        );

    } catch (error) {
        throw new ApiError(500,error.message);
    }

})



const deleteMember = asyncHandler( async (req,res) => {
    try {
        const projectId = req.params.projectId;
        const memberId = req.params.memberId;
        const user = req.user;
        if(!user.id){
            throw new ApiError(404,"Unauthorized Access, Please Login")
        }
        if(!projectId || !memberId){
            throw new ApiError(404,"Invalid access");
        }
        const loggedInUser = await ProjectMember.findOne({user: user.id, project: projectId});
        if(!loggedInUser){
            throw new ApiError(404, "You are not the member of this project");
        }
        if(loggedInUser === "member"){
            throw new ApiError(404,"You are not allowed to remove the member");
        }
        const member = await ProjectMember.findOneAndDelete({user: memberId, project: projectId});
        if(!member){
            throw new ApiError(404, "Member does not exist");
        }
        return res.status(200).json(
            new ApiResponse(200,member,"Member deleted Successfully")
        );
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})



export {getProjects,getProjectById,createProject,getAllProjectsOfUser,updateProject,deleteProject,deleteMember,addMemberToProject,getProjectMembers,updateProjectMember,updateMemberRole}











// const user = req.user;
// const projectId = req.params.projectId;
// if(!user.id){
//     throw new ApiError(404,"Unauthorized Access");
// }
// if(!projectId){
//     throw new ApiError(404,"No project Id Found");
// }
// // check user is admin member of this project or not
// const member = await ProjectMember.findOne({user: user.id, project: projectId});
// // here we are checking user is member of this project or not
// if(!member){
//     throw new ApiError(404,"You are not a member of this project");
// }
// // check for user is admin of this project or not
// if(member.role !== "admin"){
//     throw new ApiError(404, "You are not allowed to add member to this project");
// }   
// const {memberId} = req.body;
// if(!memberId){
//     throw new ApiError(404, "Invalid Member Id");
// }
// const existingMember = await ProjectMember.findOne({user: memberId});
// if(existingMember){
//     throw new ApiError(400,"Member already assigned to this project");
// }
// const newMember = await ProjectMember.create({
//     user: memberId,
//     project: projectId
// });
// if(!newMember){
//     throw new ApiError(404,"Member Assigning Failed");
// }
// return res.status(201).json(
//     new ApiResponse(201,newMember,"Member Added Successfully")
// )