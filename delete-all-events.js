/**
 * Script to delete all events from the database
 * Usage: node delete-all-events.js
 *
 * @format
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./Models/Events");

async function deleteAllEvents() {
	try {
		console.log("🔌 Connecting to database...");
		await mongoose.connect(process.env.DB_URL);
		console.log("✅ Database connected successfully\n");

		// Find all events
		const events = await Event.find();

		if (events.length === 0) {
			console.log("✅ No events found in the database.");
			await mongoose.disconnect();
			process.exit(0);
		}

		console.log(`⚠️  Found ${events.length} event(s) to delete:`);
		console.log("─".repeat(80));

		events.forEach((event, index) => {
			const startDate = event.startDate
				? new Date(event.startDate).toLocaleDateString()
				: "N/A";
			const status = event.status || "N/A";
			const eventType = event.eventType || "N/A";
			console.log(
				`${index + 1}. ${
					event.title
				} (Type: ${eventType}, Status: ${status}, Start: ${startDate})`
			);
		});

		console.log("─".repeat(80));
		console.log(
			"\n⚠️  WARNING: This will permanently delete the above events!"
		);
		console.log("Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n");

		// Wait 3 seconds before proceeding
		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log("🗑️  Deleting events...\n");

		// Delete all events
		const deleteResult = await Event.deleteMany({});

		console.log(
			`✅ Successfully deleted ${deleteResult.deletedCount} event(s)`
		);

		// Verify deletion
		const remainingEvents = await Event.find();
		console.log(`\n✅ Remaining events: ${remainingEvents.length}`);

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
deleteAllEvents();


