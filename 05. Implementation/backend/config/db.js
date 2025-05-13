const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Directly use the new connection string without any config or env variables
        const conn = await mongoose.connect('mongodb+srv://Mikemisoles74:1234567890@cluster0.8zps4xn.mongodb.net/PXDB?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Add performance optimizations
            maxPoolSize: 10,
            minPoolSize: 5,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000,
            // Add write concern for better reliability
            writeConcern: {
                w: 'majority',
                j: true
            }
        });
        
        if (conn.connection.readyState === 1) {
            console.log('Successfully connected to MongoDB Database:', conn.connection.db.databaseName);
            console.log('Database Host:', conn.connection.host);
            
            // Enable mongoose debug mode for performance monitoring
            mongoose.set('debug', true);
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        return false;
    }
};

module.exports = connectDB; 