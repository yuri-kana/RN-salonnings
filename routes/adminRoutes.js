const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send({ error: 'Username, password, and email are required.' });
    }

    try {
        const existingUsername = await Admin.findOne({ username });
        if (existingUsername) {
            return res.status(400).send({ error: 'Username already in use.' });
        }

        const existingEmail = await Admin.findOne({ email });
        if (existingEmail) {
            return res.status(400).send({ error: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, email, password: hashedPassword });
        await admin.save();
        
        res.status(201).send({ message: 'User signed up successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required.' });
    }

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).send({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/me', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send(admin);
    } catch (error) {
        res.status(401).send({ error: 'Invalid token' });
    }
});

router.put('/update', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).send({ error: 'User not found' });
        }

        const { name, password, email } = req.body;
        if (name) admin.username = name;
        if (email) admin.email = email;
        if (password) admin.password = await bcrypt.hash(password, 10);

        await admin.save();
        res.status(200).send({ message: 'User information updated successfully' });
    } catch (error) {
        res.status(401).send({ error: 'Invalid token' });
    }
});

module.exports = router;