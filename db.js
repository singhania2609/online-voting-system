const mongoose = require('mongoose');
require('dotenv').config();


const mongoURL = process.env.MONGODB_URL || process.env.MONGODB_URL_LOCAL ; 

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connection successful');
}).catch((err) => {
    console.error('MongoDB connection failed:', err.message);
});


const db = mongoose.connection;



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