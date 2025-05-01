'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ResumesDatabasePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    desired_job_titles: '',
    desired_industries: '',
    preferred_locations: '',
    willing_to_relocate: false,
    job_alert_frequency: 'weekly'
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [coverLetterFileName, setCoverLetterFileName] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [linkedInProfile, setLinkedInProfile] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  
  const alertFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'none', label: 'No alerts' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };
  
  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverLetterFile(file);
      setCoverLetterFileName(file.name);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!resumeFile || !formData.desired_job_titles) {
        setError('Please upload your resume and specify desired job titles.');
        return;
      }
      
      let resumeUrl = '';
      let coverLetterUrl = '';
      
      // Upload resume
      if (resumeFile) {
        const resumeExt = resumeFile.name.split('.').pop();
        const resumeFileName = `${user.id}-resume-${Date.now()}.${resumeExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('resumes')
          .upload(resumeFileName, resumeFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(resumeFileName);
          
        resumeUrl = urlData.publicUrl;
      }
      
      // Upload cover letter if provided
      if (coverLetterFile) {
        const coverLetterExt = coverLetterFile.name.split('.').pop();
        const coverLetterFileName = `${user.id}-coverletter-${Date.now()}.${coverLetterExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('coverletters')
          .upload(coverLetterFileName, coverLetterFile, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('coverletters')
          .getPublicUrl(coverLetterFileName);
          
        coverLetterUrl = urlData.publicUrl;
      }
      
      // Save resume info to database
      const { error: dbError } = await supabase
        .from('job_seeker_profiles')
        .upsert({
          user_id: user.id,
          resume_url: resumeUrl,
          cover_letter_url: coverLetterUrl || null,
          portfolio_link: portfolioLink || null,
          linkedin_profile: linkedInProfile || null,
          desired_job_titles: formData.desired_job_titles,
          desired_industries: formData.desired_industries,
          preferred_locations: formData.preferred_locations,
          willing_to_relocate: formData.willing_to_relocate,
          job_alert_frequency: formData.job_alert_frequency,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (dbError) throw dbError;
      
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        router.push('/jobs');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      setError(err.message || 'An error occurred while uploading your resume.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Resume Database</h1>
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your resume and preferences have been successfully uploaded!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Resume Upload Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resume & Documents</h2>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV Upload <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        id="resume"
                        ref={resumeInputRef}
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        Select File
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {resumeFileName || "No file selected"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        id="coverLetter"
                        ref={coverLetterInputRef}
                        accept=".pdf,.doc,.docx"
                        onChange={handleCoverLetterChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => coverLetterInputRef.current?.click()}
                      >
                        Select File
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {coverLetterFileName || "No file selected"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                  </div>
                  
                  <div>
                    <label htmlFor="portfolioLink" className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Link (Optional)
                    </label>
                    <input
                      type="url"
                      id="portfolioLink"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://your-portfolio.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="linkedInProfile" className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile (Optional)
                    </label>
                    <input
                      type="url"
                      id="linkedInProfile"
                      value={linkedInProfile}
                      onChange={(e) => setLinkedInProfile(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                </div>
              </div>
              
              {/* Job Preferences Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Preferences</h2>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="desired_job_titles" className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Job Titles <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="desired_job_titles"
                      name="desired_job_titles"
                      rows={2}
                      required
                      value={formData.desired_job_titles}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple job titles with commas</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="desired_industries" className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Industries
                    </label>
                    <textarea
                      id="desired_industries"
                      name="desired_industries"
                      rows={2}
                      value={formData.desired_industries}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple industries with commas</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="preferred_locations" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Locations
                    </label>
                    <textarea
                      id="preferred_locations"
                      name="preferred_locations"
                      rows={2}
                      value={formData.preferred_locations}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., New York, Remote, London"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple locations with commas</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <input
                        id="willing_to_relocate"
                        name="willing_to_relocate"
                        type="checkbox"
                        checked={formData.willing_to_relocate}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="willing_to_relocate" className="ml-2 block text-sm text-gray-700">
                        Willing to relocate
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Job Alerts Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Alerts</h2>
                
                <div>
                  <label htmlFor="job_alert_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Alert Frequency
                  </label>
                  <select
                    id="job_alert_frequency"
                    name="job_alert_frequency"
                    value={formData.job_alert_frequency}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {alertFrequencies.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Receive notifications about new job postings matching your preferences
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <Link href="/jobs">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Resume'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}