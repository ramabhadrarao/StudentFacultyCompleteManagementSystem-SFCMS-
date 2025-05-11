const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_db');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

// Import models
const Gender = require('../models/Gender');
const Nationality = require('../models/Nationality');
const Religion = require('../models/Religion');
const StudentType = require('../models/StudentType');
const Caste = require('../models/Caste');
const SubCaste = require('../models/SubCaste');

// Seed Genders
const seedGenders = async () => {
  await Gender.deleteMany({});
  await Gender.insertMany([
    { name: 'Male' },
    { name: 'Female' },
    { name: 'Other' }
  ]);
  console.log('✅ Gender data seeded');
};

// Seed Nationalities
const seedNationalities = async () => {
  await Nationality.deleteMany({});
  await Nationality.insertMany([
    { name: 'Indian' },
    { name: 'American' },
    { name: 'British' },
    { name: 'Other' }
  ]);
  console.log('✅ Nationality data seeded');
};

// Seed Religions
const seedReligions = async () => {
  await Religion.deleteMany({});
  await Religion.insertMany([
    { name: 'Hindu' },
    { name: 'Muslim' },
    { name: 'Christian' },
    { name: 'Sikh' },
    { name: 'Other' }
  ]);
  console.log('✅ Religion data seeded');
};

// Seed Student Types
const seedStudentTypes = async () => {
  await StudentType.deleteMany({});
  await StudentType.insertMany([
    { name: 'Regular' },
    { name: 'Lateral Entry' },
    { name: 'Transfer' }
  ]);
  console.log('✅ StudentType data seeded');
};

// Seed Castes and SubCastes
const seedCastesAndSubCastes = async () => {
  await Caste.deleteMany({});
  await SubCaste.deleteMany({});

  const casteDocs = await Caste.insertMany([
    { name: 'General' },
    { name: 'Other Backward Class' },
    { name: 'Scheduled Caste' },
    { name: 'Scheduled Tribe' }
  ]);

  const findCaste = (name) => casteDocs.find(c => c.name === name);

  const subcastes = [
    // General
    { name: 'Brahmin', caste_id: findCaste('General')._id },
    { name: 'Kshatriya', caste_id: findCaste('General')._id },
    { name: 'Vaishya', caste_id: findCaste('General')._id },
    { name: 'Others', caste_id: findCaste('General')._id },

    // OBC
    { name: 'Yadav', caste_id: findCaste('Other Backward Class')._id },
    { name: 'Kurmi', caste_id: findCaste('Other Backward Class')._id },
    { name: 'Teli', caste_id: findCaste('Other Backward Class')._id },
    { name: 'Others', caste_id: findCaste('Other Backward Class')._id },

    // SC
    { name: 'Chamar', caste_id: findCaste('Scheduled Caste')._id },
    { name: 'Dhobi', caste_id: findCaste('Scheduled Caste')._id },
    { name: 'Pasi', caste_id: findCaste('Scheduled Caste')._id },
    { name: 'Others', caste_id: findCaste('Scheduled Caste')._id },

    // ST
    { name: 'Gond', caste_id: findCaste('Scheduled Tribe')._id },
    { name: 'Santhal', caste_id: findCaste('Scheduled Tribe')._id },
    { name: 'Bhil', caste_id: findCaste('Scheduled Tribe')._id },
    { name: 'Others', caste_id: findCaste('Scheduled Tribe')._id }
  ];

  await SubCaste.insertMany(subcastes);
  console.log('✅ Caste and SubCaste data seeded');
};

// Main Seed Function
const seedAll = async () => {
  await connectDB();
  await seedGenders();
  await seedNationalities();
  await seedReligions();
  await seedStudentTypes();
  await seedCastesAndSubCastes();
  console.log('🌱 All lookup data seeded successfully');
  process.exit(0);
};

// Run if executed directly
if (require.main === module) {
  seedAll();
}
