const mongoose = require('mongoose');
require('dotenv').config();

// Define the MongoDB connection URL
const mongoURL = process.env.MONGODB_URL || process.env.MONGODB_URL_LOCAL || 'mongodb://localhost:27017/voting'; // Replace 'mydatabase' with your database name
// const mongoURL = process.env.MONGODB_URL;


console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URL exists:', !!process.env.MONGODB_URL);


// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connection successful');
}).catch((err) => {
    console.error('MongoDB connection failed:', err.message);
});

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Define event listeners for database connection

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;