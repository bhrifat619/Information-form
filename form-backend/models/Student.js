const mongoose = require('mongoose');

// Academic Qualification Schema
const academicQualificationSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true
  },
  instituteName: {
    type: String,
    required: true,
    trim: true
  },
  groupSubject: {
    type: String,
    required: true,
    trim: true
  },
  boardUniversity: {
    type: String,
    required: true,
    trim: true
  },
  passingYear: {
    type: Number,
    required: true
  },
  gpa: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Main Student Schema
const studentSchema = new mongoose.Schema({
  // Personal Information
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  fathersName: {
    type: String,
    required: true,
    trim: true
  },
  mothersName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  
  // Academic Information
  departments: [String],
  course: {
    type: String,
    required: true
  },
  
  // Address Information
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Academic Qualifications
  academicQualifications: [academicQualificationSchema],
  
  // Timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;