// Seed SubCaste data
const seedSubCastes = async (castes) => {
  try {
    await SubCaste.deleteMany({});
    
    if (!castes || castes.length === 0) {
      console.log('No castes found, skipping subcaste seeding');
      return;
    }
    
    // Get caste IDs by name
    const generalCaste = castes.find(caste => caste.name === 'General');
    const obcCaste = castes.find(caste => caste.name === 'Other Backward Class');
    const scCaste = castes.find(caste => caste.name === 'Scheduled Caste');
    const stCaste = castes.find(caste => caste.name === 'Scheduled Tribe');
    
    // Example subcastes for each caste category
    const subcastes = [];
    
    // General subcastes (examples)
    if (generalCaste) {
      subcastes.push(
        { name: 'Brahmin', caste_id: generalCaste._id },
        { name: 'Kshatriya', caste_id: generalCaste._id },
        { name: 'Vaishya', caste_id: generalCaste._id },
        { name: 'Others', caste_id: generalCaste._id }
      );
    }
    
    // OBC subcastes (examples)
    if (obcCaste) {
      subcastes.push(
        { name: 'Yadav', caste_id: obcCaste._id },
        { name: 'Kurmi', caste_id: obcCaste._id },
        { name: 'Teli', caste_id: obcCaste._id },
        { name: 'Others', caste_id: obcCaste._id }
      );
    }
    
    // SC subcastes (examples)
    if (scCaste) {
      subcastes.push(
        { name: 'Chamar', caste_id: scCaste._id },
        { name: 'Dhobi', caste_id: scCaste._id },
        { name: 'Pasi', caste_id: scCaste._id },
        { name: 'Others', caste_id: scCaste._id }
      );
    }
    
    // ST subcastes (examples)
    if (stCaste) {
      subcastes.push(
        { name: 'Gond', caste_id: stCaste._id },
        { name: 'Santhal', caste_id: stCaste._id },
        { name: 'Bhil', caste_id: stCaste._id },
        { name: 'Others', caste_id: stCaste._id }
      );
    }
    
    await SubCaste.insertMany(subcastes);
    console.log('SubCaste data seeded successfully');
  } catch (err) {
    console.error('Error seeding subcaste data:', err);
  }
};

// Run all seed functions
const seedAll = async () => {
  await connectDB();
  
  // Seed independent lookup tables
  await seedGenders();
  await seedNationalities();
  await seedReligions();
  await seedStudentTypes();
  
  // Seed dependent lookup tables (caste -> subcaste)
  const castes = await seedCastes();
  await seedSubCastes(castes);
  
  console.log('All lookup data seeded successfully');
  process.exit(0);
};

// Execute the seeding if this file is run directly
if (require.main === module) {
  seedAll();
}

module.exports = {
  seedAll,
  seedGenders,
  seedNationalities,
  seedReligions,
  seedStudentTypes,
  seedCastes,
  seedSubCastes
};