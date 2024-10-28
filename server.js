const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointmentRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/salons', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route Handling
app.use('/appointments', appointmentRoutes);
app.use('/customers', customerRoutes);
app.use('/admins', adminRoutes);

// Serve customer signup page
app.get('/user-signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'customer', 'user_signup.html'));
});

// Serve admin signup page
app.get('/admin-signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin_signup.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});