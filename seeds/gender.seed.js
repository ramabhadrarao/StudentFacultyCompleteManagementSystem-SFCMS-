const Gender = require('../models/Gender');

const seedGenders = async () => {
  const genders = ['Male', 'Female', 'Other'];
  await Gender.deleteMany({});
  for (const name of genders) {
    await Gender.create({ name });
  }
  console.log('✅ Gender data seeded');
};

module.exports = seedGenders;
