/** @format */

const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT;
const cors = require("cors");
const dbconnect = require("./config/dbconfig");

dbconnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		credentials: true,
	})
);

app.get("/", (req, res) => {
	res.send("Hello World");
});

const teamRoutes = require("./Routes/TeamRoutes");
const userRoutes = require("./Routes/UserRoutes");
const authRoutes = require("./Routes/authRoutes");
const taskRoutes = require("./Routes/TaskRoutes");
const eventRoutes = require("./Routes/EventRoutes");
const attendanceRoutes = require("./Routes/Attendance");
const feedbackRoutes = require("./Routes/FeedBacksRoutes");
const rolesRoutes = require("./Routes/RolesRoutes");
const achievementRoutes = require("./Routes/AchievementRoutes");
const applicantRoutes = require("./Recruitment/Routes/Applicant");

app.use("/api/roles", rolesRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/recruitment/applicants", applicantRoutes);

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
