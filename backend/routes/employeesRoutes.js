const express = require('express');

const {
  getEmployees,
  createEmployee,
  updateEmployee,
  archiveEmployee,
  deleteEmployee,
} = require('../controllers/employeesController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes - only authenticated users can manage employees
router.use(protect);

router.get('/', getEmployees);

router.post('/', createEmployee);

router.patch('/:id', updateEmployee);

router.patch('/:id/archive', archiveEmployee);

router.delete('/:id', deleteEmployee);

module.exports = router;
