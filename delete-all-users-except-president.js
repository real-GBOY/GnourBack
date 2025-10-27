/**
 * Script to delete all users except those with the President role
 * Usage: node delete-all-users-except-president.js
 *
 * @format
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./Models/User");
const Role = require("./Models/Role");

async function deleteAllUsersExceptPresident() {
	try {
		console.log("🔌 Connecting to database...");
		await mongoose.connect(process.env.DB_URL);
		console.log("✅ Database connected successfully\n");

		// Find the President role
		const presidentRole = await Role.findOne({ key: "President" });

		if (!presidentRole) {
			console.error("❌ President role not found!");
			process.exit(1);
		}

		console.log(`📋 President Role ID: ${presidentRole._id}`);
		console.log("🔍 Finding all users except President...\n");

		// Find all users that are NOT president
		const usersToDelete = await User.find({
			$or: [{ role: { $ne: presidentRole._id } }, { role: null }],
		}).populate("role", "key");

		if (usersToDelete.length === 0) {
			console.log(
				"✅ No users to delete. All users are Presidents or there are no other users."
			);
			await mongoose.disconnect();
			process.exit(0);
		}

		console.log(`⚠️  Found ${usersToDelete.length} user(s) to delete:`);
		console.log("─".repeat(60));

		usersToDelete.forEach((user, index) => {
			const role = user.role ? user.role.key : "No role";
			console.log(
				`${index + 1}. ${user.firstName} ${user.lastName} (${
					user.email
				}) - Role: ${role}`
			);
		});

		console.log("─".repeat(60));
		console.log("\n⚠️  WARNING: This will permanently delete the above users!");
		console.log("Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n");

		// Wait 3 seconds before proceeding
		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log("🗑️  Deleting users...\n");

		// Delete all non-president users
		const deleteResult = await User.deleteMany({
			$or: [{ role: { $ne: presidentRole._id } }, { role: null }],
		});

		console.log(`✅ Successfully deleted ${deleteResult.deletedCount} user(s)`);

		// Find remaining users
		const remainingUsers = await User.find().populate("role", "key");
		console.log(`\n👥 Remaining users: ${remainingUsers.length}`);

		if (remainingUsers.length > 0) {
			console.log("\n📋 Remaining users:");
			remainingUsers.forEach((user, index) => {
				const role = user.role ? user.role.key : "No role";
				console.log(
					`${index + 1}. ${user.firstName} ${user.lastName} (${
						user.email
					}) - Role: ${role}`
				);
			});
		}

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
deleteAllUsersExceptPresident();
