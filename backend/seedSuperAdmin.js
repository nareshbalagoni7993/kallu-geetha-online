require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  await connectDB();
  const existing = await User.findOne({ email: 'superadmin@geetha.com' });
  if (existing) {
    console.log('SuperAdmin already exists:', existing.email);
    process.exit(0);
  }
  const superAdmin = await User.create({
    name:     'Super Admin',
    email:    'superadmin@geetha.com',
    password: 'Admin@123',
    role:     'superadmin',
    phone:    '9999999999',
  });
  console.log('SuperAdmin created successfully!');
  console.log('Email:', superAdmin.email);
  console.log('Password: Admin@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
