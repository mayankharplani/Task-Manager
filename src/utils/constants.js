export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    MEMBER: "member"
}

export const AvailableUserRoles = Object.values(UserRolesEnum);
// this above line will give you array  => ["admin", "project_admin", "member"]

export const TaskStatusEnum = {
    TODO: "todo",
    IN_PROGESS: "in_progress",
    DONE: "done"
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum)
// this above line will give you array  =>  ["todo", "in_progess", "done"]