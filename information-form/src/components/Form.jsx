import React, { useState } from 'react';

const Form = ({ onRegistrationSuccess }) => {
    const [formData, setFormData] = useState({
        rollNo: '',
        firstName: '',
        lastName: '',
        fathersName: '',
        mathersName: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        mobile: '',
        email: '',
        password: '',
        gender: '',
        departments: [],
        course: '',
        city: '',
        address: '',
        studentPhoto: null
    });

    // Exam types with their configurations
    const examTypes = [
        { id: 'ssc', label: 'S.S.C.', mandatory: true },
        { id: 'hsc', label: 'H.S.C.', mandatory: false },
        { id: 'diploma_eng', label: 'Diploma in Engineering', mandatory: false },
        { id: 'diploma_textile', label: 'Diploma in Textile Engineering', mandatory: false },
        { id: 'bsc', label: 'B.Sc.(Hon\'s)', mandatory: false },
        { id: 'msc', label: 'M.Sc.', mandatory: false },
        { id: 'mca', label: 'MCA', mandatory: false }
    ];

    // Initial state for academic data - SSC is pre-added and mandatory
    const [academicData, setAcademicData] = useState({
        selectedExams: ['ssc'], // SSC is pre-selected
        exams: {
            'ssc': {
                label: 'S.S.C.',
                institute: '',
                groupSubject: '',
                boardUniversity: '',
                passingYear: '',
                gpa: '',
                mandatory: true
            }
        }
    });

    // State for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle exam selection from dropdown
    const handleExamSelect = (examId) => {
        const exam = examTypes.find(e => e.id === examId);
        if (!exam) return;

        if (!academicData.selectedExams.includes(examId)) {
            setAcademicData(prev => ({
                ...prev,
                selectedExams: [...prev.selectedExams, examId],
                exams: {
                    ...prev.exams,
                    [examId]: {
                        label: exam.label,
                        institute: '',
                        groupSubject: '',
                        boardUniversity: '',
                        passingYear: '',
                        gpa: '',
                        mandatory: exam.mandatory
                    }
                }
            }));
        }
    };

    // Handle removing an exam (can't remove SSC)
    const handleRemoveExam = (examId) => {
        const exam = examTypes.find(e => e.id === examId);
        if (exam?.mandatory) {
            alert(`${exam.label} is mandatory and cannot be removed.`);
            return;
        }

        setAcademicData(prev => ({
            ...prev,
            selectedExams: prev.selectedExams.filter(id => id !== examId),
            exams: Object.keys(prev.exams).reduce((acc, key) => {
                if (key !== examId) {
                    acc[key] = prev.exams[key];
                }
                return acc;
            }, {})
        }));
    };

    // Handle academic data change for a specific exam
    const handleAcademicChange = (examId, field, value) => {
        setAcademicData(prev => ({
            ...prev,
            exams: {
                ...prev.exams,
                [examId]: {
                    ...prev.exams[examId],
                    [field]: value
                }
            }
        }));
        
        // Clear error for this field
        if (errors[`${examId}_${field}`]) {
            setErrors(prev => ({ ...prev, [`${examId}_${field}`]: '' }));
        }
    };

    const handleCheckbox = (dept) => {
        const currentDepts = formData.departments.includes(dept)
            ? formData.departments.filter(d => d !== dept)
            : [...formData.departments, dept];
        setFormData({ ...formData, departments: currentDepts });
    };

    const handleGenderChange = (gender) => {
        setFormData({ ...formData, gender });
        if (errors.gender) {
            setErrors(prev => ({ ...prev, gender: '' }));
        }
    };

    // Validate all form data
    const validateForm = () => {
        const newErrors = {};
        
        // Personal Information Validation
        if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.fathersName.trim()) newErrors.fathersName = "Father's name is required";
        if (!formData.mathersName.trim()) newErrors.mathersName = "Mother's name is required";
        
        // Date of Birth Validation
        if (!formData.dobDay.trim() || !formData.dobMonth.trim() || !formData.dobYear.trim()) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const day = parseInt(formData.dobDay);
            const month = parseInt(formData.dobMonth);
            const year = parseInt(formData.dobYear);
            
            if (day < 1 || day > 31) newErrors.dobDay = 'Invalid day';
            if (month < 1 || month > 12) newErrors.dobMonth = 'Invalid month';
            if (year < 1900 || year > new Date().getFullYear()) newErrors.dobYear = 'Invalid year';
        }
        
        // Contact Information Validation
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!/^[0-9]{10}$/.test(formData.mobile)) newErrors.mobile = 'Mobile must be 10 digits';
        
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        
        // Gender Validation
        if (!formData.gender) newErrors.gender = 'Gender is required';
        
        // Course Validation
        if (!formData.course) newErrors.course = 'Course is required';
        
        // Address Validation
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        
        // Validate SSC data
        const sscData = academicData.exams['ssc'];
        if (!sscData.institute?.trim()) newErrors.ssc_institute = 'Institute name is required for SSC';
        if (!sscData.groupSubject?.trim()) newErrors.ssc_groupSubject = 'Group/Subject is required for SSC';
        if (!sscData.boardUniversity?.trim()) newErrors.ssc_boardUniversity = 'Board/University is required for SSC';
        
        if (!sscData.passingYear?.trim()) {
            newErrors.ssc_passingYear = 'Passing year is required for SSC';
        } else if (!/^\d{4}$/.test(sscData.passingYear)) {
            newErrors.ssc_passingYear = 'Passing year must be 4 digits (YYYY)';
        } else {
            const passingYear = parseInt(sscData.passingYear);
            if (passingYear < 1900 || passingYear > new Date().getFullYear()) {
                newErrors.ssc_passingYear = 'Invalid passing year';
            }
        }
        
        if (!sscData.gpa?.trim()) newErrors.ssc_gpa = 'GPA is required for SSC';
        
        return newErrors;
    };

    // Format data for backend
    const formatDataForBackend = () => {
        // Format date of birth
        const dateOfBirth = new Date(
            `${formData.dobYear}-${formData.dobMonth.padStart(2, '0')}-${formData.dobDay.padStart(2, '0')}`
        );

        // Format academic qualifications
        const academicQualifications = academicData.selectedExams.map(examId => ({
            examType: academicData.exams[examId].label,
            instituteName: academicData.exams[examId].institute,
            groupSubject: academicData.exams[examId].groupSubject,
            boardUniversity: academicData.exams[examId].boardUniversity,
            passingYear: parseInt(academicData.exams[examId].passingYear),
            gpa: academicData.exams[examId].gpa
        }));

        return {
            rollNo: formData.rollNo,
            firstName: formData.firstName,
            lastName: formData.lastName,
            fathersName: formData.fathersName,
            mothersName: formData.mathersName,
            dateOfBirth: dateOfBirth,
            mobile: formData.mobile,
            email: formData.email,
            password: formData.password,
            gender: formData.gender,
            departments: formData.departments,
            course: formData.course,
            city: formData.city,
            address: formData.address,
            academicQualifications: academicQualifications
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Scroll to first error
            const firstErrorField = Object.keys(validationErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                                document.querySelector(`[id*="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Format the data
            const formattedData = formatDataForBackend();
            console.log('Sending data to backend:', formattedData);

            // Send data to backend API
            const response = await fetch('https://form-backend-e1ipay46j-rifat-bhuiyans-projects.vercel.app/api/students/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData)
            });

            const result = await response.json();
            console.log('Backend response:', result);

            if (response.ok && result.success) {
                // Reset form
                setFormData({
                    rollNo: '',
                    firstName: '',
                    lastName: '',
                    fathersName: '',
                    mathersName: '',
                    dobDay: '',
                    dobMonth: '',
                    dobYear: '',
                    mobile: '',
                    email: '',
                    password: '',
                    gender: '',
                    departments: [],
                    course: '',
                    city: '',
                    address: '',
                    studentPhoto: null
                });
                
                setAcademicData({
                    selectedExams: ['ssc'],
                    exams: {
                        'ssc': {
                            label: 'S.S.C.',
                            institute: '',
                            groupSubject: '',
                            boardUniversity: '',
                            passingYear: '',
                            gpa: '',
                            mandatory: true
                        }
                    }
                });
                
                setErrors({});
                
                // Call parent component callback
                if (onRegistrationSuccess) {
                    onRegistrationSuccess();
                }
                
            } else {
                // Handle backend errors
                const errorMessage = result.message || result.error || 'Registration failed';
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            setSubmitError(error.message || 'Failed to register. Please check your connection and try again.');
            alert(`❌ Registration failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get available exams (not yet selected)
    const availableExams = examTypes.filter(exam => !academicData.selectedExams.includes(exam.id));

    // Check if SSC is filled
    const isSSCFilled = () => {
        const sscData = academicData.exams['ssc'];
        return sscData?.institute && sscData?.groupSubject && sscData?.boardUniversity && 
               sscData?.passingYear && sscData?.gpa;
    };

    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center p-4">
                <div className="w-full max-w-6xl">
                    {/* Modern Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Student Registration
                        </h1>
                        <p className="text-gray-600">Complete the form below to register as a student</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Error message */}
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <strong>Error:</strong> {submitError}
                                </div>
                            )}

                            {/* Grid Layout for Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Roll No */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400">#</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="rollNo"
                                            value={formData.rollNo}
                                            onChange={handleInputChange}
                                            className={`input text-black input-bordered w-full pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.rollNo ? 'border-red-500' : ''}`}
                                            placeholder="Enter roll number"
                                            required
                                        />
                                    </div>
                                    {errors.rollNo && <p className="text-red-500 text-xs mt-1">{errors.rollNo}</p>}
                                </div>

                                {/* Student Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                placeholder="First Name"
                                                className={`input text-black input-bordered w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                                                required
                                            />
                                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                placeholder="Last Name"
                                                className={`input text-black input-bordered w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                                                required
                                            />
                                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Father's Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                                    <input
                                        type="text"
                                        name="fathersName"
                                        value={formData.fathersName}
                                        onChange={handleInputChange}
                                        className={`input input-bordered w-full text-black bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.fathersName ? 'border-red-500' : ''}`}
                                        placeholder="Enter father's name"
                                        required
                                    />
                                    {errors.fathersName && <p className="text-red-500 text-xs mt-1">{errors.fathersName}</p>}
                                </div>
                                
                                {/* Mother's Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
                                    <input
                                        type="text"
                                        name="mathersName"
                                        value={formData.mathersName}
                                        onChange={handleInputChange}
                                        className={`input input-bordered w-full text-black bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.mathersName ? 'border-red-500' : ''}`}
                                        placeholder="Enter mother's name"
                                        required
                                    />
                                    {errors.mathersName && <p className="text-red-500 text-xs mt-1">{errors.mathersName}</p>}
                                </div>

                                {/* DOB */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="dobDay"
                                                value={formData.dobDay}
                                                onChange={handleInputChange}
                                                placeholder="DD"
                                                className={`input input-bordered w-full text-black bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-center ${errors.dobDay ? 'border-red-500' : ''}`}
                                                maxLength="2"
                                                required
                                            />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="dobMonth"
                                                value={formData.dobMonth}
                                                onChange={handleInputChange}
                                                placeholder="MM"
                                                className={`input input-bordered w-full text-black bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-center ${errors.dobMonth ? 'border-red-500' : ''}`}
                                                maxLength="2"
                                                required
                                            />
                                        </div>
                                        <span className="text-gray-400">-</span>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="dobYear"
                                                value={formData.dobYear}
                                                onChange={handleInputChange}
                                                placeholder="YYYY"
                                                className={`input input-bordered text-black w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-center ${errors.dobYear ? 'border-red-500' : ''}`}
                                                maxLength="4"
                                                required
                                            />
                                        </div>
                                    </div>
                                    {(errors.dob || errors.dobDay || errors.dobMonth || errors.dobYear) && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.dob || errors.dobDay || errors.dobMonth || errors.dobYear}
                                        </p>
                                    )}
                                </div>

                                {/* Mobile No */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                    <div className="flex gap-3">
                                        <div className="w-24">
                                            <input
                                                type="text"
                                                value="+88"
                                                readOnly
                                                className="input input-bordered text-black w-full bg-gray-100 border-gray-200 rounded-lg text-center text-gray-600"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleInputChange}
                                                className={`input input-bordered text-black flex-1 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.mobile ? 'border-red-500' : ''}`}
                                                placeholder="Enter 10-digit mobile number"
                                                maxLength="10"
                                                required
                                            />
                                            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`input input-bordered text-black w-full pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="student@example.com"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`input input-bordered w-full text-black pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                                            placeholder="Create a strong password (min. 8 characters)"
                                            minLength="8"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                                    <div className="flex gap-6">
                                        {[
                                            { value: 'male', label: 'Male', icon: '♂' },
                                            { value: 'female', label: 'Female', icon: '♀' }
                                        ].map((gender) => (
                                            <label key={gender.value} className="flex items-center space-x-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    checked={formData.gender === gender.value}
                                                    onChange={() => handleGenderChange(gender.value)}
                                                    className="radio radio-primary border-2 group-hover:border-blue-400 transition-colors duration-300"
                                                />
                                                <span className={`text-gray-700 group-hover:text-blue-600 transition-colors duration-300 ${formData.gender === gender.value ? 'text-blue-600 font-semibold' : ''}`}>
                                                    {gender.icon} {gender.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                                </div>

                                {/* Department */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['CSE', 'IT', 'ECE', 'Civil', 'Mech', 'EEE'].map((dept) => (
                                            <label key={dept} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-300 ${formData.departments.includes(dept) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.departments.includes(dept)}
                                                    onChange={() => handleCheckbox(dept)}
                                                    className="checkbox checkbox-sm checkbox-primary rounded border-gray-300"
                                                />
                                                <span className={`text-gray-700 ${formData.departments.includes(dept) ? 'font-semibold text-blue-700' : ''}`}>
                                                    {dept}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Course */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                                    <div className="relative text-black">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                        </div>
                                        <select
                                            name="course"
                                            value={formData.course}
                                            onChange={handleInputChange}
                                            className={`select select-bordered w-full pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg appearance-none ${errors.course ? 'border-red-500' : ''}`}
                                            required
                                        >
                                            <option value="" disabled>Select your course</option>
                                            <option value="Diploma in Engineering">Diploma in Engineering</option>
                                            <option value="Diploma in Textile Engineering">Diploma in Textile Engineering</option>
                                            <option value="MCA">MCA</option>
                                            <option value="B.Sc">B.Sc</option>
                                            <option value="M.Sc">M.Sc</option>
                                        </select>
                                    </div>
                                    {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`input input-bordered w-full text-black bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg ${errors.city ? 'border-red-500' : ''}`}
                                        placeholder="Enter your city"
                                        required
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                            </div>

                            {/* Academic Qualifications Section - Dropdown Approach */}
                            <div id="academic-section" className="space-y-6">
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Academic Qualifications</h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                <span className="text-red-500 font-semibold">*</span> SSC examination is mandatory
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${isSSCFilled() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm text-gray-600">
                                                    SSC {isSSCFilled() ? '✓ Completed' : '✗ Required'}
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    onChange={(e) => {
                                                        handleExamSelect(e.target.value);
                                                        e.target.value = '';
                                                    }}
                                                    className="select select-bordered bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg appearance-none text-black pr-10"
                                                    disabled={availableExams.length === 0}
                                                >
                                                    <option value="">Add Additional Exam...</option>
                                                    {availableExams.map(exam => (
                                                        <option key={exam.id} value={exam.id}>
                                                            {exam.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Mandatory SSC Section - Always first and cannot be removed */}
                                        {academicData.selectedExams.map((examId) => {
                                            const exam = academicData.exams[examId];
                                            if (!exam) return null;

                                            const isMandatory = exam.mandatory || examId === 'ssc';
                                            const isSSC = examId === 'ssc';

                                            return (
                                                <div key={examId} className={`bg-white border ${isSSC ? 'border-blue-200 border-2' : 'border-gray-200'} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative`}>
                                                    {isMandatory && (
                                                        <div className="absolute -top-3 -left-3">
                                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                                                                <span className="mr-1">*</span> REQUIRED
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`p-2 rounded-lg ${isSSC ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                                <svg className={`w-6 h-6 ${isSSC ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h3 className={`font-bold ${isSSC ? 'text-blue-700' : 'text-gray-800'}`}>
                                                                    {exam.label}
                                                                    {isMandatory && <span className="text-red-500 ml-2">*</span>}
                                                                </h3>
                                                                <p className="text-sm text-gray-600">
                                                                    {isMandatory ? 'Complete all fields below (mandatory)' : 'Enter your details'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!isMandatory && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExam(examId)}
                                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-300"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Institute Name
                                                                {isMandatory && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exam.institute}
                                                                onChange={(e) => handleAcademicChange(examId, 'institute', e.target.value)}
                                                                className={`input input-bordered w-full text-black ${isMandatory ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-sm ${errors[`${examId}_institute`] ? 'border-red-500' : ''}`}
                                                                placeholder="Institute name"
                                                                required={isMandatory}
                                                            />
                                                            {errors[`${examId}_institute`] && (
                                                                <p className="text-red-500 text-xs mt-1">{errors[`${examId}_institute`]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Group / Subject
                                                                {isMandatory && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exam.groupSubject}
                                                                onChange={(e) => handleAcademicChange(examId, 'groupSubject', e.target.value)}
                                                                className={`input input-bordered w-full text-black ${isMandatory ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-sm ${errors[`${examId}_groupSubject`] ? 'border-red-500' : ''}`}
                                                                placeholder="Group / Subject"
                                                                required={isMandatory}
                                                            />
                                                            {errors[`${examId}_groupSubject`] && (
                                                                <p className="text-red-500 text-xs mt-1">{errors[`${examId}_groupSubject`]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Board / University
                                                                {isMandatory && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exam.boardUniversity}
                                                                onChange={(e) => handleAcademicChange(examId, 'boardUniversity', e.target.value)}
                                                                className={`input input-bordered w-full text-black ${isMandatory ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-sm ${errors[`${examId}_boardUniversity`] ? 'border-red-500' : ''}`}
                                                                placeholder="Board / University"
                                                                required={isMandatory}
                                                            />
                                                            {errors[`${examId}_boardUniversity`] && (
                                                                <p className="text-red-500 text-xs mt-1">{errors[`${examId}_boardUniversity`]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Passing Year
                                                                {isMandatory && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exam.passingYear}
                                                                onChange={(e) => handleAcademicChange(examId, 'passingYear', e.target.value)}
                                                                className={`input input-bordered w-full text-black ${isMandatory ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-sm ${errors[`${examId}_passingYear`] ? 'border-red-500' : ''}`}
                                                                placeholder="YYYY"
                                                                maxLength="4"
                                                                required={isMandatory}
                                                            />
                                                            {errors[`${examId}_passingYear`] && (
                                                                <p className="text-red-500 text-xs mt-1">{errors[`${examId}_passingYear`]}</p>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                GPA / Grade
                                                                {isMandatory && <span className="text-red-500 ml-1">*</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exam.gpa}
                                                                onChange={(e) => handleAcademicChange(examId, 'gpa', e.target.value)}
                                                                className={`input input-bordered w-full text-black ${isMandatory ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg text-sm ${errors[`${examId}_gpa`] ? 'border-red-500' : ''}`}
                                                                placeholder="GPA"
                                                                required={isMandatory}
                                                            />
                                                            {errors[`${examId}_gpa`] && (
                                                                <p className="text-red-500 text-xs mt-1">{errors[`${examId}_gpa`]}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <h4 className="font-medium text-blue-800">Important Notes:</h4>
                                                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                                    <li>• S.S.C. (Secondary School Certificate) examination details are <span className="font-bold">mandatory</span> for all applicants</li>
                                                    <li>• All fields marked with <span className="text-red-500">*</span> are required</li>
                                                    <li>• You can add additional qualifications (H.S.C., Diploma, etc.) using the dropdown above</li>
                                                    <li>• Please ensure all information matches your original certificates</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address - Full Width */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`textarea textarea-bordered text-black w-full h-32 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-lg resize-none ${errors.address ? 'border-red-500' : ''}`}
                                    placeholder="Enter your complete address..."
                                    required
                                ></textarea>
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            {/* Register Button */}
                            <div className="pt-8 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`btn w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg py-4 text-lg font-semibold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm mr-2"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Register Now
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-sm text-gray-500 mt-4">
                                    By registering, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form;