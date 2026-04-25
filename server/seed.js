// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const MemberCode = require('./models/MemberCode.model');

// dotenv.config();

// mongoose.connect(process.env.MONGO_URI).then(async () => {
//   await MemberCode.insertMany([
//     { code: 'WELCOME1' },
//     { code: 'STERLING2' },
//     { code: 'MEMBER3' },
//     { code: 'FOUNDING4' },
//     { code: 'PIONEER5' },
//   ]);
//   console.log('✅ Codes seeded');
//   process.exit();
// });


const mongoose = require("mongoose");
require("dotenv").config();

const MemberCode = require("./models/MemberCode.model"); 

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    // OPTIONAL: clear old codes first
    await MemberCode.deleteMany();

    // insert new seed data
    await MemberCode.insertMany([
      { code: "WELCOME1", used: false },
      { code: "VIP2026", used: false },
      { code: "ACCESS100", used: false },
    ]);

    console.log("Seed data inserted successfully");

    process.exit();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();