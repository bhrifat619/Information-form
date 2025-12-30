import React, { useEffect, useState } from 'react'
import Form from './components/Form'
import Dashboard from './pages/Dashboard';

const App = () => {
  const [showForm, setShowForm] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch students for dashboard
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://form-backend-e1ipay46j-rifat-bhuiyans-projects.vercel.app/api/students');
      const data = await response.json();

      if (response.ok && data.success) {
        setStudents(data.data);
      } else {
        console.error('Failed to fetch students:', data.message);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = async () => {
    // Show success message
    alert('✅ Student registered successfully!');

    // Fetch updated student list
    await fetchStudents();

    // Switch to dashboard
    setShowForm(false);
    setShowDashboard(true);
  };

  // Handle navigation back to form
  const handleShowForm = () => {
    setShowDashboard(false);
    setShowForm(true);
  };

  // Handle navigation to dashboard
  const handleShowDashboard = async () => {
    await fetchStudents();
    setShowForm(false);
    setShowDashboard(true);
  };

  // Initial data fetch
  useEffect(() => {
    if (showDashboard) {
      fetchStudents();
    }
  }, [showDashboard]);

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Student Management System
              </h1>
              <div className="flex gap-4">
                {showForm ? (
                  <button
                    onClick={handleShowDashboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    View Dashboard
                  </button>
                ) : (
                  <button
                    onClick={handleShowForm}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Register New Student
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showForm && (
            <Form onRegistrationSuccess={handleRegistrationSuccess} />
          )}

          {showDashboard && (
            <Dashboard
              students={students}
              loading={loading}
              onRefresh={fetchStudents}
              onBackToForm={handleShowForm}
            />
          )}
        </div>

        {/* Status Indicator */}
        {showDashboard && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${students.length} students registered`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App