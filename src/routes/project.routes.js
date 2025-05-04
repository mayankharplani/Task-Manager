import express from "express"
import {getProjects,getProjectById,createProject, getAllProjectsOfUser, addMemberToProject, getProjectMembers, updateMemberRole, updateProjectMember, deleteMember, updateProject, deleteProject} from "../controllers/project.controllers.js"
import {isLoggedIn} from "../middlewares/auth.middleware.js"
const router = express.Router();


router.route("/create-project").post(isLoggedIn,createProject);

router.route("/get-projects").get(isLoggedIn,getProjects);

router.route("/get-projects/:projectId").get(isLoggedIn,getProjectById);

router.route("/get-user-projects").get(isLoggedIn,getAllProjectsOfUser);

router.route("/add-member/:projectId").post(isLoggedIn,addMemberToProject);


router.route("/get-members/:projectId").get(isLoggedIn,getProjectMembers);
router.route("/update-member/:projectId").post(isLoggedIn,updateMemberRole);


router.route("/delete-member/:projectId/:memberId").post(isLoggedIn,deleteMember);
router.route("/update-project/:projectId").post(isLoggedIn,updateProject);
router.route("/delete-project/:projectId").post(isLoggedIn,deleteProject);

export default router;