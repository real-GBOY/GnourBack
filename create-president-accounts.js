const mongoose = require('mongoose');
const User = require('./Models/User');
const Role = require('./Models/Role');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to database directly
const connectDB = async () => {
  try {
    // Try different MongoDB connection strings
    const mongoURIs = [
      process.env.DB_URL,
      process.env.MONGODB_URI,
      'mongodb://localhost:27017/gnour_db',
      'mongodb://127.0.0.1:27017/gnour_db',
      'mongodb+srv://username:password@cluster.mongodb.net/gnour_db' // Example Atlas connection
    ];
    
    let connected = false;
    for (const uri of mongoURIs) {
      if (uri) {
        try {
          await mongoose.connect(uri);
          console.log('Database connected successfully to:', uri);
          connected = true;
          break;
        } catch (err) {
          console.log('Failed to connect to:', uri);
          continue;
        }
      }
    }
    
    if (!connected) {
      throw new Error('Could not connect to any MongoDB instance');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Please make sure MongoDB is running or provide a valid connection string');
    process.exit(1);
  }
};

const createPresidentAccounts = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log('🚀 Starting to create president accounts...');

    // Find the President role
    const presidentRole = await Role.findOne({ key: 'President' });
    if (!presidentRole) {
      console.error('❌ President role not found. Please run the seed script first.');
      return;
    }

    console.log('✅ Found President role:', presidentRole._id);

    // Create Mahmoud's account
    const mahmoudData = {
      firstName: 'Mahmoud',
      lastName: 'President',
      nationalID: '12345678901',
      dateOfBirth: new Date('1995-01-01'),
      email: 'mahmoud@president.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      profilePicture: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/default-avatar.png',
      role: presidentRole._id,
      isActive: true,
      isVerified: true
    };

    // Create Nour's account
    const nourData = {
      firstName: 'Nour',
      lastName: 'President',
      nationalID: '12345678902',
      dateOfBirth: new Date('1995-02-01'),
      email: 'nour@president.com',
      password: 'password123',
      phoneNumber: '+1234567891',
      profilePicture: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/default-avatar.png',
      role: presidentRole._id,
      isActive: true,
      isVerified: true
    };

    // Check if users already exist
    const existingMahmoud = await User.findOne({ 
      $or: [{ email: mahmoudData.email }, { nationalID: mahmoudData.nationalID }] 
    });
    
    const existingNour = await User.findOne({ 
      $or: [{ email: nourData.email }, { nationalID: nourData.nationalID }] 
    });

    if (existingMahmoud) {
      console.log('⚠️  Mahmoud account already exists, updating role...');
      existingMahmoud.role = presidentRole._id;
      existingMahmoud.isActive = true;
      existingMahmoud.isVerified = true;
      await existingMahmoud.save();
      console.log('✅ Mahmoud account updated with President role');
    } else {
      const mahmoud = new User(mahmoudData);
      await mahmoud.save();
      console.log('✅ Mahmoud account created successfully');
    }

    if (existingNour) {
      console.log('⚠️  Nour account already exists, updating role...');
      existingNour.role = presidentRole._id;
      existingNour.isActive = true;
      existingNour.isVerified = true;
      await existingNour.save();
      console.log('✅ Nour account updated with President role');
    } else {
      const nour = new User(nourData);
      await nour.save();
      console.log('✅ Nour account created successfully');
    }

    // Verify the accounts were created/updated correctly
    const mahmoudUser = await User.findOne({ email: mahmoudData.email }).populate('role');
    const nourUser = await User.findOne({ email: nourData.email }).populate('role');

    console.log('\n📋 Account Details:');
    console.log('Mahmoud:', {
      name: `${mahmoudUser.firstName} ${mahmoudUser.lastName}`,
      email: mahmoudUser.email,
      role: mahmoudUser.role?.key,
      isActive: mahmoudUser.isActive,
      isVerified: mahmoudUser.isVerified
    });
    
    console.log('Nour:', {
      name: `${nourUser.firstName} ${nourUser.lastName}`,
      email: nourUser.email,
      role: nourUser.role?.key,
      isActive: nourUser.isActive,
      isVerified: nourUser.isVerified
    });

    console.log('\n🎉 President accounts setup completed successfully!');
    console.log('You can now login with:');
    console.log('Mahmoud: mahmoud@president.com / password123');
    console.log('Nour: nour@president.com / password123');

  } catch (error) {
    console.error('❌ Error creating president accounts:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the script
createPresidentAccounts();
