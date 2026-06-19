import React, { useState } from 'react';
import { jobsAPI } from '../api';
import NotificationModal from './NotificationModal';

export default function JobList({ jobs, user, onActionComplete }) {
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company_name: '', description: '', location: 'Remote', max_salary: '' });
  
  // Notification Modal State Configuration
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: 'error', 
    title: '', 
    message: '' 
  });

  const handleApplySubmit = async (e, jobId) => {
    e.preventDefault();
    if (!resumeFile) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Missing Document',
        message: 'Please upload your resume file in PDF format to complete your application.'
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('job', jobId);
    formData.append('cover_letter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      await jobsAPI.apply(formData);
      
      // Success Notification Modal Trigger
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Application Submitted!',
        message: 'Your application materials were uploaded successfully. The hiring team has been notified.'
      });

      // Clear applying form states
      setApplyingJobId(null);
      setCoverLetter('');
      setResumeFile(null);
    } catch (err) {
      // Safely check for standard Django ValidationError fields or detail errors
      const backendError = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0];
      
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Already applied',
        message: backendError || 'A conflict occurred. You may have already submitted an application for this vacancy.'
      });
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await jobsAPI.create(newJob);
      
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Job Opening Published',
        message: `The position for "${newJob.title}" is now open for applicants.`
      });

      setShowCreateModal(false);
      setNewJob({ title: '', company_name: '', description: '', location: 'Remote', max_salary: '' });
      onActionComplete();
    } catch (err) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Failed to Post Job',
        message: 'An error occurred while validating the position parameters. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {user?.role === 'recruiter' && (
        <button onClick={() => setShowCreateModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-xs transition cursor-pointer">
          + Add New Job Posting
        </button>
      )}

      {/* Creation Modal View Context */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateJob} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Post an Opening</h3>
            
            <div className="space-y-3 text-sm">
              <input type="text" placeholder="Job Title" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
              <input type="text" placeholder="Company Name" required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newJob.company_name} onChange={e => setNewJob({...newJob, company_name: e.target.value})} />
              <input type="text" placeholder="Location (e.g. Remote, NY)" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
              <input type="number" placeholder="Max Salary (Optional)" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newJob.max_salary} onChange={e => setNewJob({...newJob, max_salary: e.target.value})} />
              <textarea placeholder="Job Description" required className="w-full border border-gray-300 p-2.5 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
            </div>

            <div className="flex justify-end gap-2 text-sm font-medium">
              <button type="button" onClick={() => setShowCreateModal(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer">Publish</button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs Rendering Loop */}
      {jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm font-medium">No job postings available yet.</p>
          {user?.role === 'recruiter' && (
            <p className="text-xs mt-1">Click <span className="font-semibold">+ Add New Job Posting</span> to get started.</p>
          )}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-6 border border-gray-200 rounded-xl shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{job.title}</h3>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">{job.location}</span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-3">{job.company_name}</p>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{job.description}</p>
              {job.max_salary && <p className="text-sm font-semibold text-emerald-600 mb-4">Up to {'\u20B9'}{parseFloat(job.max_salary).toLocaleString()}</p>}
            </div>

            {user?.role === 'job_seeker' && (
              <div className="border-t border-gray-50 pt-4 mt-2">
                {applyingJobId === job.id ? (
                  <form onSubmit={(e) => handleApplySubmit(e, job.id)} className="space-y-4">
                    <textarea placeholder="Write a short, engaging cover letter..." value={coverLetter} className="w-full text-sm border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                      onChange={e => setCoverLetter(e.target.value)} />
                    
                    <div className="bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
                      <label className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1.5">Resume File (PDF Only)</label>
                      <input type="file" accept=".pdf" required className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition cursor-pointer" onChange={e => setResumeFile(e.target.files[0])} />
                    </div>

                    <div className="flex gap-2 text-xs font-semibold">
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-xs">Submit Application</button>
                      <button type="button" onClick={() => setApplyingJobId(null)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition cursor-pointer">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setApplyingJobId(job.id)} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm py-2.5 rounded-lg transition cursor-pointer text-center">
                    Apply Now
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Embedded Global Application Notification Manager Overlay */}
      <NotificationModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}