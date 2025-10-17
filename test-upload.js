/**
 * Test script to debug file upload issues
 * Run this with: node test-upload.js
 *
 * @format
 */

const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

// Test configuration
const BASE_URL = "http://localhost:4005";
const AUTH_TOKEN = "your_auth_token_here"; // Replace with your actual token
const USER_ID = "your_user_id_here"; // Replace with your actual user ID

// Test file paths (create these test files first)
const TEST_PDF_PATH = "./test.pdf";
const TEST_IMAGE_PATH = "./test-image.png";

async function testFileUpload() {
	try {
		console.log("🧪 Testing file upload functionality...\n");

		// Test 1: Create achievement with PDF file
		console.log("📄 Test 1: Creating achievement with PDF file...");
		await testCreateAchievementWithFile(TEST_PDF_PATH, "application/pdf");
		console.log("✅ PDF upload test completed\n");

		// Test 2: Create achievement with image file
		console.log("🖼️ Test 2: Creating achievement with image file...");
		await testCreateAchievementWithFile(TEST_IMAGE_PATH, "image/png");
		console.log("✅ Image upload test completed\n");

		// Test 3: Create achievement without file
		console.log("📝 Test 3: Creating achievement without file...");
		await testCreateAchievementWithoutFile();
		console.log("✅ No-file test completed\n");
	} catch (error) {
		console.error("❌ Test failed:", error.message);
		if (error.response) {
			console.error("Response status:", error.response.status);
			console.error("Response data:", error.response.data);
		}
	}
}

async function testCreateAchievementWithFile(filePath, mimeType) {
	// Check if test file exists
	if (!fs.existsSync(filePath)) {
		console.log(`⚠️ Test file not found: ${filePath}`);
		console.log("Creating a dummy file for testing...");
		createDummyFile(filePath, mimeType);
	}

	const formData = new FormData();

	// Add form fields
	formData.append("title", "Test Achievement");
	formData.append("description", "This is a test achievement for debugging");
	formData.append("achievementType", "best_member_of_the_month");
	formData.append("userId", USER_ID);
	formData.append("badgeIcon", "https://example.com/badge.png");

	// Add file - IMPORTANT: field name must be "file"
	formData.append("file", fs.createReadStream(filePath), {
		filename: filePath.split("/").pop(),
		contentType: mimeType,
	});

	const response = await axios.post(`${BASE_URL}/api/achievements`, formData, {
		headers: {
			Authorization: `Bearer ${AUTH_TOKEN}`,
			...formData.getHeaders(),
		},
	});

	console.log("Response:", response.data);
	return response.data;
}

async function testCreateAchievementWithoutFile() {
	const achievementData = {
		title: "Test Achievement (No File)",
		description: "This is a test achievement without file upload",
		achievementType: "best_member_of_the_month",
		userId: USER_ID,
		badgeIcon: "https://example.com/badge.png",
	};

	const response = await axios.post(
		`${BASE_URL}/api/achievements`,
		achievementData,
		{
			headers: {
				Authorization: `Bearer ${AUTH_TOKEN}`,
				"Content-Type": "application/json",
			},
		}
	);

	console.log("Response:", response.data);
	return response.data;
}

function createDummyFile(filePath, mimeType) {
	if (mimeType.startsWith("image/")) {
		// Create a simple PNG file
		const pngHeader = Buffer.from([
			0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
			0x49, 0x48, 0x44, 0x52,
		]);
		fs.writeFileSync(filePath, pngHeader);
	} else if (mimeType === "application/pdf") {
		// Create a simple PDF file
		const pdfHeader = Buffer.from(
			"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n"
		);
		fs.writeFileSync(filePath, pdfHeader);
	}
	console.log(`Created dummy file: ${filePath}`);
}

// Run the test
if (require.main === module) {
	console.log("🚀 Starting file upload tests...\n");
	console.log("Make sure your server is running on:", BASE_URL);
	console.log("Update AUTH_TOKEN and USER_ID variables before running\n");

	testFileUpload()
		.then(() => console.log("🎉 All tests completed!"))
		.catch(console.error);
}

module.exports = {
	testFileUpload,
	testCreateAchievementWithFile,
	testCreateAchievementWithoutFile,
};
