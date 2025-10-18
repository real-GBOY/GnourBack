/** @format */

// This script should be run when the server is already running
// It directly creates users in the database without going through the API

const mongoose = require("mongoose");
const User = require("./Models/User");
const Role = require("./Models/Role");

// MongoDB connection string
const MONGODB_URI =
	"mongodb+srv://mahmmoudnayel2004_db_user:sR7NyoJAXSJ1b0ld@cluster0.n1sgunm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const createPresidentAccounts = async () => {
	try {
		console.log("🚀 Starting to create president accounts...");
		console.log("Connecting to:", MONGODB_URI);

		// Connect to database
		await mongoose.connect(MONGODB_URI);
		console.log("✅ Database connected successfully");

		// Find the President role
		const presidentRole = await Role.findOne({ key: "President" });
		if (!presidentRole) {
			console.error(
				"❌ President role not found. Please run the seed script first: npm run seed"
			);
			return;
		}

		console.log("✅ Found President role:", presidentRole._id);

		// Create Mahmoud's account
		const mahmoudData = {
			firstName: "Mahmoud",
			lastName: "President",
			nationalID: "12345678901",
			dateOfBirth: new Date("1995-01-01"),
			email: "mahmoud@president.com",
			password: "password123",
			phoneNumber: "+1234567890",
			profilePicture:
				"https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/default-avatar.png",
			role: presidentRole._id,
			isActive: true,
			isVerified: true,
		};

		// Create Nour's account
		const nourData = {
			firstName: "Nour",
			lastName: "President",
			nationalID: "12345678902",
			dateOfBirth: new Date("1995-02-01"),
			email: "nour@president.com",
			password: "password123",
			phoneNumber: "+1234567891",
			profilePicture:
				"https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/default-avatar.png",
			role: presidentRole._id,
			isActive: true,
			isVerified: true,
		};

		// Check if users already exist
		const existingMahmoud = await User.findOne({
			$or: [
				{ email: mahmoudData.email },
				{ nationalID: mahmoudData.nationalID },
			],
		});

		const existingNour = await User.findOne({
			$or: [{ email: nourData.email }, { nationalID: nourData.nationalID }],
		});

		if (existingMahmoud) {
			console.log("⚠️  Mahmoud account already exists, updating role...");
			existingMahmoud.role = presidentRole._id;
			existingMahmoud.isActive = true;
			existingMahmoud.isVerified = true;
			await existingMahmoud.save();
			console.log("✅ Mahmoud account updated with President role");
		} else {
			const mahmoud = new User(mahmoudData);
			await mahmoud.save();
			console.log("✅ Mahmoud account created successfully");
		}

		if (existingNour) {
			console.log("⚠️  Nour account already exists, updating role...");
			existingNour.role = presidentRole._id;
			existingNour.isActive = true;
			existingNour.isVerified = true;
			await existingNour.save();
			console.log("✅ Nour account updated with President role");
		} else {
			const nour = new User(nourData);
			await nour.save();
			console.log("✅ Nour account created successfully");
		}

		// Verify the accounts were created/updated correctly
		const mahmoudUser = await User.findOne({
			email: mahmoudData.email,
		}).populate("role");
		const nourUser = await User.findOne({ email: nourData.email }).populate(
			"role"
		);

		console.log("\n📋 Account Details:");
		console.log("Mahmoud:", {
			name: `${mahmoudUser.firstName} ${mahmoudUser.lastName}`,
			email: mahmoudUser.email,
			role: mahmoudUser.role?.key,
			isActive: mahmoudUser.isActive,
			isVerified: mahmoudUser.isVerified,
		});

		console.log("Nour:", {
			name: `${nourUser.firstName} ${nourUser.lastName}`,
			email: nourUser.email,
			role: nourUser.role?.key,
			isActive: nourUser.isActive,
			isVerified: nourUser.isVerified,
		});

		console.log("\n🎉 President accounts setup completed successfully!");
		console.log("You can now login with:");
		console.log("Mahmoud: mahmoud@president.com / password123");
		console.log("Nour: nour@president.com / password123");
	} catch (error) {
		console.error("❌ Error creating president accounts:", error);
	} finally {
		// Close database connection
		mongoose.connection.close();
	}
};

// Run the script
createPresidentAccounts();
