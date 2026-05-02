const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Login
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id:      user._id,
        name:     user.name,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Change password
// @route PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
