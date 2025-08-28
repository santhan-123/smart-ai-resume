const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB.
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Database connected successfully..');
    } catch (error) {
        console.error(`Database Connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
