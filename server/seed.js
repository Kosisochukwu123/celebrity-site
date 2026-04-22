const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MemberCode = require('./models/MemberCode.model');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await MemberCode.insertMany([
    { code: 'WELCOME1' },
    { code: 'STERLING2' },
    { code: 'MEMBER3' },
    { code: 'FOUNDING4' },
    { code: 'PIONEER5' },
  ]);
  console.log('✅ Codes seeded');
  process.exit();
});