const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    services: { type: [String], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'start' } // Default status
});

module.exports = mongoose.model('Appointment', appointmentSchema);