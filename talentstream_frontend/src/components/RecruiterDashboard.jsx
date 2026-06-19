import React, { useEffect, useState } from 'react';
import { applicationsAPI } from '../api';

export default function RecruiterDashboard() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
  applicationsAPI.getRecruiterApps()
    .then(res => {
      console.log('STATUS:', res.status);
      console.log('DATA:', res.data);
      setApps(res.data);
    })
    .catch(err => {
      console.error('ERROR STATUS:', err.response?.status);
      console.error('ERROR DATA:', err.response?.data);
    });
}, []);

  const handleDownloadResume = async (id, applicantUsername) => {
    try {
      // Fetch via axios with Authorization header — never pass token as query param
      const res = await applicationsAPI.downloadResume(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${applicantUsername}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Resume download failed:', err);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Received Applications</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-500 font-semibold">
              <th className="p-3">Job Position</th>
              <th className="p-3">Applicant</th>
              <th className="p-3">Cover Letter</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-gray-400">No applications received yet.</td>
              </tr>
            )}
            {apps.map(app => (
              <tr key={app.id} className="border-b hover:bg-gray-50/50">
                <td className="p-3 font-medium">{app.job_title}</td>
                <td className="p-3 font-mono text-xs">{app.applicant_username}</td>
                <td className="p-3 max-w-xs truncate text-gray-600">{app.cover_letter || 'N/A'}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {app.status}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDownloadResume(app.id, app.applicant_username)}
                    className="text-indigo-600 hover:underline font-semibold text-xs cursor-pointer"
                  >
                    Download Resume
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
