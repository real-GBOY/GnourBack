/**
 * Script to delete all tasks from the database
 * Usage: node delete-all-tasks.js
 *
 * @format
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./Models/Task");

async function deleteAllTasks() {
	try {
		console.log("🔌 Connecting to database...");
		await mongoose.connect(process.env.DB_URL);
		console.log("✅ Database connected successfully\n");

		// Find all tasks
		const tasks = await Task.find();

		if (tasks.length === 0) {
			console.log("✅ No tasks found in the database.");
			await mongoose.disconnect();
			process.exit(0);
		}

		console.log(`⚠️  Found ${tasks.length} task(s) to delete:`);
		console.log("─".repeat(80));

		tasks.forEach((task, index) => {
			const status = task.status || "N/A";
			const dueDate = task.dueDate
				? new Date(task.dueDate).toLocaleDateString()
				: "N/A";
			console.log(
				`${index + 1}. ${task.title} (Status: ${status}, Due: ${dueDate})`
			);
		});

		console.log("─".repeat(80));
		console.log("\n⚠️  WARNING: This will permanently delete the above tasks!");
		console.log("Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n");

		// Wait 3 seconds before proceeding
		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log("🗑️  Deleting tasks...\n");

		// Delete all tasks
		const deleteResult = await Task.deleteMany({});

		console.log(`✅ Successfully deleted ${deleteResult.deletedCount} task(s)`);

		// Verify deletion
		const remainingTasks = await Task.find();
		console.log(`\n✅ Remaining tasks: ${remainingTasks.length}`);

		await mongoose.disconnect();
		console.log("\n✅ Script completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error.message);
		if (mongoose.connection.readyState === 1) {
			await mongoose.disconnect();
		}
		process.exit(1);
	}
}

// Run the script
deleteAllTasks();
