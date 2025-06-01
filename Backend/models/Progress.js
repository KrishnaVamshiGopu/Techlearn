const mongoose = require('mongoose');

const ProgressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseId: {
        type: Number,
        required: true,
    },
    codeState: {
        type: String,
        default: ''
    },
    lastSavedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Progress', ProgressSchema); 