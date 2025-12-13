// app_api/models/db.js
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error('Missing MONGODB_URI. Make sure your .env is set.');
  process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose
  .connect(dbURI, {
    // tune as needed; these are sensible defaults for Atlas
    autoIndex: true,
    maxPoolSize: 10,
  })
  .then(() => console.log('Mongoose connected'))
  .catch((err) => {
    console.error('Mongoose connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () =>
  console.log('Mongoose disconnected')
);

// Compile models here so they’re available app-wide
require('./trips.model');  // registers Trip
require('./user.model');   // registers User

// Graceful shutdown (Ctrl+C / platform stop)
const gracefulExit = () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
};
process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

module.exports = mongoose;
