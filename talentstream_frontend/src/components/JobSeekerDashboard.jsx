// components/JobSeekerDashboard.jsx
import React, { useEffect, useState } from 'react';
import { applicationsAPI } from '../api';

export default function JobSeekerDashboard() {
  const [myApps, setMyApps] = useState([]);

  useEffect(() => {
    applicationsAPI.getJobSeekerApps() //
      .then(res => setMyApps(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Track Application Statuses</h2>
      <div className="space-y-4">
        {myApps.map(app => (
          <div key={app.id} className="border p-4 rounded-xl flex justify-between items-center bg-gray-50/50">
            <div>
              <h4 className="font-bold text-gray-900">{app.job_title}</h4>
              <p className="text-xs text-gray-500 font-medium">{app.company_name}</p>
              <span className="text-[11px] text-gray-400 block mt-1">Applied on: {new Date(app.applied_at).toLocaleDateString()}</span>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs uppercase tracking-wide">
              {app.status}
            </span>
          </div>
        ))}
        {myApps.length === 0 && <p className="text-sm text-gray-400 text-center py-6">You haven't applied to any jobs yet.</p>}
      </div>
    </div>
  );
}