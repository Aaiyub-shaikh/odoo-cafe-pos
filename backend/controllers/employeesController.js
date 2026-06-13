const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET ALL EMPLOYEES (cashiers)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'cashier' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// CREATE EMPLOYEE (cashier)
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: 'Email already in use',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'cashier',
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const employee = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ARCHIVE EMPLOYEE (soft delete)
exports.archiveEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        error: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
