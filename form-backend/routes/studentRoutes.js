const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Helper function to validate data
const validateStudentData = (data) => {
  const errors = [];
  
  if (!data.rollNo) errors.push('Roll number is required');
  if (!data.firstName) errors.push('First name is required');
  if (!data.lastName) errors.push('Last name is required');
  if (!data.email) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');
  
  // Check for SSC in academic qualifications
  if (!data.academicQualifications || !Array.isArray(data.academicQualifications)) {
    errors.push('Academic qualifications are required');
  } else {
    const hasSSC = data.academicQualifications.some(q => q.examType === 'S.S.C.');
    if (!hasSSC) {
      errors.push('S.S.C. qualification is mandatory');
    }
  }
  
  return errors;
};

// 1. Register a new student
router.post('/register', async (req, res) => {
  try {
    console.log('📥 Received registration data');
    
    // Validate required fields
    const validationErrors = validateStudentData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Check if roll number or email already exists
    const existingStudent = await Student.findOne({
      $or: [
        { rollNo: req.body.rollNo },
        { email: req.body.email }
      ]
    });
    
    if (existingStudent) {
      const field = existingStudent.rollNo === req.body.rollNo ? 'roll number' : 'email';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    // Create student
    const student = new Student(req.body);
    await student.save();
    
    console.log('✅ Student registered successfully:', student._id);
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        id: student._id,
        rollNo: student.rollNo,
        name: `${student.firstName} ${student.lastName}`,
        registrationDate: student.registrationDate
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error registering student',
      error: error.message
    });
  }
});

// 2. Get all students for dashboard
router.get('/', async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ registrationDate: -1 })
      .select('-password'); // Exclude password
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('❌ Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
});

// 3. Get single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('❌ Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student'
    });
  }
});

// 4. Get student by roll number
router.get('/roll/:rollNo', async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo }).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('❌ Get student by roll error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student'
    });
  }
});

// 5. Update student
router.put('/:id', async (req, res) => {
  try {
    // Don't allow updating password through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    console.error('❌ Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student'
    });
  }
});

// 6. Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student'
    });
  }
});

// 7. Get statistics for dashboard
router.get('/stats/summary', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    // Get counts by course
    const courseStats = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentRegistrations = await Student.countDocuments({
      registrationDate: { $gte: sevenDaysAgo }
    });
    
    // Get department stats
    const departmentStats = await Student.aggregate([
      { $unwind: '$departments' },
      {
        $group: {
          _id: '$departments',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        recentRegistrations,
        courseStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// 8. Get paginated students
router.get('/page/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const students = await Student.find()
      .select('-password')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Student.countDocuments();
    
    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    console.error('❌ Pagination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching paginated data'
    });
  }
});

module.exports = router;