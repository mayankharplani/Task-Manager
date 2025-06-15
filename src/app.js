import express from "express"
import cookieParser from "cookie-parser"

const app = express()


import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js" 
import noteRouter from "./routes/note.routes.js"
import taskRouter from "./routes/task.routes.js"

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(cookieParser())

app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users",authRouter)
app.use("/api/v1/users/project",projectRouter)

// app.use("/api/v1/users/project/:projectId/task",taskRouter)

// app.use("/api/v1/notes",noteRouter)
export default app; 