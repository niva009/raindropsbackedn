const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const loginSchema = require('../models/login');

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await loginSchema.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email does not exist", success: false, error: true });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password", success: false, error: true });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({ message: "Login successful", token: token, success: true, error: false });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = login;
