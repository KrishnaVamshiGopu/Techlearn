const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router(); 
const User = require('../models/user');
const auth = require('../middleware/authMiddleware');

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

router.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  
  try {
    const { name, email, mobile_number, gender, password, confirm_password } = req.body;

    // Validate required fields
    if (!name || !email || !mobile_number || !gender || !password || !confirm_password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ msg: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      mobile_number,
      gender,
      password: hashedPassword
    });

    await user.save();
    console.log('User registered successfully:', email);
    res.status(201).json({ msg: "User registered successfully" });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: "Server error during registration" });
  }
});

router.post('/signin', async (req, res) => {
  console.log('Signin request received:', req.body);
  
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // Find user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '1h' }
    );

    console.log('User signed in successfully:', email);
    res.status(200).json({
      msg: "Login successful",
      token,
      redirect: "/dashboard.html"
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ msg: "Server error during login" });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ msg: "Server error while fetching profile" });
    }
});

module.exports = router;
