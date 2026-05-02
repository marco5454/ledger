// ============================================================
// FILE: seedAdmin.js
// PURPOSE: Promotes an existing registered user to admin role
// PHASE: 2 (new)
// USAGE: node seedAdmin.js
// IMPORTANT: Run this ONCE then keep it but don't run again
// HOW IT WORKS: Finds your account by email and sets role: admin
// ============================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// TARGET_EMAIL: the email you registered with
// Change this to YOUR actual registered email before running
const TARGET_EMAIL = 'your@email.com';

async function seedAdmin() {
  try {
    // Step 1: Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Step 2: Find user by TARGET_EMAIL
    const user = await User.findOne({ email: TARGET_EMAIL });
    
    if (!user) {
      console.log('User not found. Check your email.');
      process.exit(0);
    }

    // Step 3: Check if already admin
    if (user.role === 'admin') {
      console.log(`✅ ${user.name} is already an admin`);
      process.exit(0);
    }

    // Step 4: Promote to admin and save
    user.role = 'admin';
    await user.save();

    // Step 5: Log success and exit
    console.log(`✅ ${user.name} has been promoted to admin`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
}

seedAdmin();