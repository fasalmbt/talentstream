import React, { useState, useEffect } from 'react';
import { jobsAPI, decodeToken } from './api';
import AuthForm from './components/AuthForm';
import JobList from './components/JobList';
import RecruiterDashboard from './components/RecruiterDashboard';
import JobSeekerDashboard from './components/JobSeekerDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('jobs');
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = decodeToken(token);
      if (payload) {
        const username = localStorage.getItem('username');
        setUser({ username, role: payload.role });
      } else {
        localStorage.clear();
      }
    }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.list();
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setView('jobs');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1
          className="text-xl font-bold text-indigo-600 tracking-tight cursor-pointer"
          onClick={() => setView('jobs')}
        >
          TalentStream Portal
        </h1>
        <div className="flex gap-4 items-center">

          {user ? (
            <>
              <button onClick={() => setView('dashboard')} className="text-sm font-medium hover:text-indigo-600 transition">
                {user.role === 'recruiter' ? 'Recruiter Console' : 'My Applications'}
              </button>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">
                {user.username} ({user.role})
              </span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium transition">
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('auth')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'auth' && (
          <AuthForm
            onAuthSuccess={(userData) => {
  setUser(userData);
  setView(userData.role === 'recruiter' ? 'dashboard' : 'jobs');
}}
          />
        )}

        {view === 'jobs' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Available Positions</h2>
            </div>
            <JobList jobs={jobs} user={user} onActionComplete={fetchJobs} />
          </div>
        )}

        {view === 'dashboard' && user?.role === 'recruiter' && <RecruiterDashboard />}
        {view === 'dashboard' && user?.role === 'job_seeker' && <JobSeekerDashboard />}
      </main>
    </div>
  );
}

export default App;
