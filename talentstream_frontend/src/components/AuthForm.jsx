import React, { useState } from 'react';
import { authAPI, decodeToken } from '../api';

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'job_seeker' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authAPI.login({ username: formData.username, password: formData.password });
        const { access, refresh } = res.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        // Decode role directly from JWT payload — no extra request needed
        const payload = decodeToken(access);
        const role = payload?.role;
        if (!role) throw new Error('Token missing role claim. Check CustomTokenObtainPairSerializer.');

        localStorage.setItem('username', formData.username);
        localStorage.setItem('role', role);
        onAuthSuccess({ username: formData.username, role });
      } else {
        await authAPI.register(formData);
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-xl shadow-sm mt-12">
      <h3 className="text-xl font-bold mb-6 text-center">{isLogin ? 'Login to Account' : 'Create an Account'}</h3>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Username</label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={e => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Account Role</label>
              <select
                className="w-full border border-gray-300 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="job_seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-medium p-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-center text-xs text-indigo-600 font-medium mt-4 hover:underline"
      >
        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
      </button>
    </div>
  );
}
