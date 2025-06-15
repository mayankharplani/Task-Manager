# Mega Project Management API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-brightgreen" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-4.x-blue" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-green" alt="MongoDB">
  <img src="https://img.shields.io/badge/JWT-Auth-blueviolet" alt="JWT">
  <img src="https://img.shields.io/badge/Nodemailer-Email-yellowgreen" alt="Nodemailer">
  <img src="https://img.shields.io/badge/Mailgen-Transactional%20Email-orange" alt="Mailgen">
  <img src="https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange" alt="OpenAPI">
  <img src="https://img.shields.io/badge/Docker-MongoDB-blue" alt="Docker MongoDB">
  <img src="https://img.shields.io/badge/Environment-.env-informational" alt="Dotenv">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

A robust, secure, and scalable backend API for project, task, and team management. Built with Node.js, Express, and MongoDB. Features include authentication, RBAC, project/task/subtask/boards/notes management.

---

## 🚀 Key Benefits

- **Enterprise-Ready Security:** JWT authentication, RBAC, CORS, and secure HTTP headers.
- **Modular & Scalable:** Clean separation of concerns, modular routes/controllers.
- **Team Collaboration:** Projects, tasks, subtasks, boards, and notes for real-world team workflows.
- **Modern API Standards:** Fully documented with OpenAPI 3.0, CI-validated, and ready for frontend or third-party integration.
- **Developer Experience:** Centralized error handling, logging, and easy local setup.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Testing & Linting](#testing--linting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## Features

- **User Authentication:** Secure login, registration, and session management using JWT (access/refresh tokens) and HTTP-only cookies. Supports email verification and password reset flows.
- **Role-Based Access Control (RBAC):** Fine-grained permissions for project admins, members, and guests. Protects sensitive endpoints and enforces business rules at the API level.
- **Project Management:** Create, update, and delete projects. Each project can have multiple members with different roles and permissions.
- **Task Management:** Create, assign, update, and delete tasks within projects. Tasks support priorities, due dates, attachments, and assignment to multiple users.
- **Subtask Management:** Break down tasks into subtasks for granular tracking. Subtasks inherit permissions from their parent task/project.
- **Notes & Comments:** Add notes to projects and tasks for collaboration, documentation, or discussion. Notes support visibility (public/private) and are RBAC-protected.
- **Security Best Practices:** Includes rate limiting, CORS, secure HTTP headers (Helmet), input validation, and centralized error handling to protect against common web vulnerabilities.
- **Centralized Error Handling & Logging:** Consistent error responses and detailed logging using Winston for easier debugging and monitoring.
- **Scalable & Modular Codebase:** Clean separation of concerns with modular routes, controllers, models, validators, and utilities. Easy to extend and maintain as your team or requirements grow.
- **Docker-Ready for MongoDB:** Supports running MongoDB in a Docker container for local development and testing.

## Tech Stack

- **Backend:** Node.js (18.x), Express.js (4.x) — Core server and routing framework
- **Database:** MongoDB (with Mongoose ODM) — Flexible NoSQL storage and schema modeling
- **Authentication & Security:**
  - JWT (jsonwebtoken) — Access/refresh token authentication
  - HTTP-only cookies — Secure session management
  - bcryptjs — Password hashing
  - helmet — Secure HTTP headers
  - cors — Cross-origin resource sharing
  - express-validator — Input validation and sanitization
- **Email & Notifications:**
  - Nodemailer — Transactional email delivery
  - Mailgen — Beautiful email templates
- **File Uploads & Media:**
  - multer — File upload middleware
  - cloudinary & multer-storage-cloudinary — Cloud image storage
- **Utilities & Tooling:**
  - dotenv — Environment variable management
  - prettier — Code formatting
  - nodemon — Hot-reloading for development
- **DevOps & Environment:**
  - Docker (for MongoDB in local/dev)
  - .env files for configuration
- **Project Structure:** Modular organization (controllers, routes, models, middlewares, utils, validators, scripts)

Each technology is chosen for reliability, scalability, and best practices in modern Node.js backend development.



## License

This project is licensed under the [MIT License](LICENSE).
