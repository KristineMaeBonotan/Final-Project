const mongoose = require('mongoose');

const userLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.action !== 'failed_login'; // Only required for non-failed login actions
        }
    },
    action: {
        type: String,
        required: true,
        enum: ['login', 'logout', 'attendance_marked', 'profile_updated', 'failed_login']
    },
    details: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    },
    attemptedId: {
        type: String, // To store the ID that was attempted during failed login
        required: function() {
            return this.action === 'failed_login';
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserLog', userLogSchema); 