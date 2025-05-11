const mongoose = require('mongoose');

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
    });
    console.log('✅ MongoDB connected:', conn.connection.name);
  } catch (err) {
    console.error('[✘] MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
