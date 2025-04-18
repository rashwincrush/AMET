'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import SocialLogin from '@/components/auth/SocialLogin';
import { AuthError } from '@supabase/supabase-js';
import { assignDefaultRole } from '@/lib/roles/roleAssignment';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    graduationYear: '',
    degree: '',
    securityQuestion: '',
    securityAnswer: '',
    mentorshipRole: 'none' // 'none', 'mentor', 'mentee', 'both'
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.email || !formData.password || !formData.confirmPassword || !formData.studentId || !formData.graduationYear || !formData.degree || !formData.securityQuestion || !formData.securityAnswer) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phoneNumber,
            student_id: formData.studentId,
            graduation_year: formData.graduationYear,
            degree: formData.degree,
            security_question: formData.securityQuestion,
            security_answer: formData.securityAnswer,
            mentorship_role: formData.mentorshipRole
          }
        }
      });
      
      if (signUpError) {
        throw signUpError;
      }

      try {
        // Assign alumni role by default - ensures user has basic access
        if (data?.user?.id) {
          await assignDefaultRole(data.user.id);
          console.log('Successfully assigned alumni role to user');
          
          // Set initial mentorship role if selected
          if (formData.mentorshipRole !== 'none') {
            const updateData: any = {};
            
            if (formData.mentorshipRole === 'mentor' || formData.mentorshipRole === 'both') {
              updateData.is_mentor = true;
            }
            
            if (formData.mentorshipRole === 'mentee' || formData.mentorshipRole === 'both') {
              updateData.is_mentee = true;
            }
            
            const { error: profileError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', data.user.id);
              
            if (profileError) {
              console.error('Error updating mentorship role:', profileError);
            }
          }
        } else {
          console.error('Cannot assign role: user data is missing');
        }
      } catch (roleError) {
        console.error('Error assigning default role:', roleError);
        // Continue with signup process even if role assignment fails
        // Role can be assigned later by admin
      }
      
      setSuccess(true);
      
      // If email confirmation is required
      if (data?.user?.identities?.length === 0) {
        // Show success message but don't redirect
      } else {
        // Redirect to profile completion or appropriate mentorship page
        setTimeout(() => {
          if (formData.mentorshipRole === 'mentor') {
            router.push('/mentorship/become-mentor');
          } else if (formData.mentorshipRole === 'mentee') {
            router.push('/mentorship/become-mentee');
          } else if (formData.mentorshipRole === 'both') {
            router.push('/mentorship/become-mentor?become_mentee=true');
          } else {
            router.push('/profile/complete');
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Account created successfully! Please check your email for confirmation instructions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                id="phone-number"
                name="phone-number"
                type="tel"
                autoComplete="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="student-id" className="block text-sm font-medium text-gray-700">
                Student ID (for verification)
              </label>
              <input
                id="student-id"
                name="student-id"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="graduation-year" className="block text-sm font-medium text-gray-700">
                  Graduation Year
                </label>
                <select
                  id="graduation-year"
                  name="graduation-year"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                >
                  <option value="">Select year</option>
                  {Array.from({length: 70}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                  Degree/Program
                </label>
                <input
                  id="degree"
                  name="degree"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  value={formData.degree}
                  onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="security-question" className="block text-sm font-medium text-gray-700">
                Security Question (for password recovery)
              </label>
              <select
                id="security-question"
                name="security-question"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.securityQuestion}
                onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
              >
                <option value="">Select a security question</option>
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                <option value="What was the name of your first school?">What was the name of your first school?</option>
                <option value="What was your childhood nickname?">What was your childhood nickname?</option>
                <option value="In what city were you born?">In what city were you born?</option>
              </select>
            </div>
            <div>
              <label htmlFor="security-answer" className="block text-sm font-medium text-gray-700">
                Security Answer
              </label>
              <input
                id="security-answer"
                name="security-answer"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                value={formData.securityAnswer}
                onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Mentorship Role (Optional)</legend>
              <div className="mt-1 space-y-2">
                <div className="flex items-center">
                  <input
                    id="mentorship-none"
                    name="mentorship-role"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.mentorshipRole === 'none'}
                    onChange={() => setFormData({...formData, mentorshipRole: 'none'})}
                  />
                  <label htmlFor="mentorship-none" className="ml-3 block text-sm font-medium text-gray-700">
                    No mentorship role (browse the platform first)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="mentorship-mentor"
                    name="mentorship-role"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.mentorshipRole === 'mentor'}
                    onChange={() => setFormData({...formData, mentorshipRole: 'mentor'})}
                  />
                  <label htmlFor="mentorship-mentor" className="ml-3 block text-sm font-medium text-gray-700">
                    I want to be a mentor (help others in their career)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="mentorship-mentee"
                    name="mentorship-role"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.mentorshipRole === 'mentee'}
                    onChange={() => setFormData({...formData, mentorshipRole: 'mentee'})}
                  />
                  <label htmlFor="mentorship-mentee" className="ml-3 block text-sm font-medium text-gray-700">
                    I want to be a mentee (receive guidance and support)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="mentorship-both"
                    name="mentorship-role"
                    type="radio"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    checked={formData.mentorshipRole === 'both'}
                    onChange={() => setFormData({...formData, mentorshipRole: 'both'})}
                  />
                  <label htmlFor="mentorship-both" className="ml-3 block text-sm font-medium text-gray-700">
                    I want to be both a mentor and a mentee
                  </label>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can change this later in your profile settings. Selecting a role now will take you through the appropriate registration process after signup.
              </p>
            </fieldset>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <SocialLogin 
            redirectTo="/auth/role-selection"
            onSuccess={() => {
              // Redirect will be handled by the OAuth provider
            }}
            onError={(error) => {
              setError(error);
            }}
          />
        </div>
      </div>
    </div>
  );
}