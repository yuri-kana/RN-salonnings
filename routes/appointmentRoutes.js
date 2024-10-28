const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');

// Placeholder for notification logic
async function sendNotificationToCustomer(customerId, message) {
    // Implement your notification logic here
    // For example, send an email or push notification
    console.log(`Notification sent to customer ${customerId}: ${message}`);
}

// Create a new appointment
router.post('/', async (req, res) => {
    try {
        const appointment = new Appointment(req.body);
        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error saving appointment:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all appointments
router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve appointment
router.patch('/:id/approve', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'approved'; // Update the status
        await appointment.save();

        // Optionally, send notification to customer here
        await sendNotificationToCustomer(appointment.customerId, 'Your appointment has been approved.');

        res.status(200).json({ message: 'Appointment approved successfully' });
    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Decline appointment
router.patch('/:id/decline', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'decline'; // Update the status
        await appointment.save();

        // Optionally, send notification to customer here
        await sendNotificationToCustomer(appointment.customerId, 'Your appointment has been decline.');

        res.status(200).json({ message: 'Appointment decline successfully' });
    } catch (error) {
        console.error('Error approving appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update appointment status generically (if needed)
router.patch('/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.status(200).json(appointment);
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.status(204).send(); // No content response on successful deletion
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

module.exports = router;    