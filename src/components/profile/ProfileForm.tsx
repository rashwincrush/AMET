'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { User, Briefcase, MapPin, GraduationCap, Mail, Phone, Globe, Linkedin, Twitter, Calendar, Upload, X, Check } from 'lucide-react';

type ProfileFormProps = {
  initialData?: {
    first_name?: string;
    last_name?: string;
    graduation_year?: number;
    degree?: string;
    major?: string;
    current_company?: string;
    current_position?: string;
    location?: string;
    bio?: string;
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
    phone_number?: string;
    email?: string;
    current_address?: string;
    permanent_address?: string;
    shipping_address?: string;
    avatar_url?: string;
    profile_url?: string;
    industry?: string;
    years_of_experience?: number;
    awards?: string;
    publications?: string;
    patents?: string;
    certifications?: string;
    privacy_settings?: {
      show_email?: boolean;
      show_phone?: boolean;
      show_location?: boolean;
      show_education?: boolean;
      show_experience?: boolean;
      show_achievements?: boolean;
      profile_visibility?: string;
    };
  };
  isEditing?: boolean;
};

export default function ProfileForm({ initialData = {}, isEditing = false }: ProfileFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: initialData.first_name || '',
    last_name: initialData.last_name || '',
    graduation_year: initialData.graduation_year || undefined,
    degree: initialData.degree || '',
    major: initialData.major || '',
    current_company: initialData.current_company || '',
    current_position: initialData.current_position || '',
    location: initialData.location || '',
    bio: initialData.bio || '',
    linkedin_url: initialData.linkedin_url || '',
    twitter_url: initialData.twitter_url || '',
    website_url: initialData.website_url || '',
    phone_number: initialData.phone_number || '',
    email: initialData.email || user?.email || '',
    current_address: initialData.current_address || '',
    permanent_address: initialData.permanent_address || '',
    shipping_address: initialData.shipping_address || '',
    avatar_url: initialData.avatar_url || '',
    profile_url: initialData.profile_url || '',
    industry: initialData.industry || '',
    years_of_experience: initialData.years_of_experience || undefined,
    awards: initialData.awards || '',
    publications: initialData.publications || '',
    patents: initialData.patents || '',
    certifications: initialData.certifications || '',
    privacy_settings: initialData.privacy_settings || {
      show_email: false,
      show_phone: false,
      show_location: true,
      show_education: true,
      show_experience: true,
      show_achievements: true,
      profile_visibility: 'alumni'
    }
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    initialData.avatar_url || null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const generateProfileUrl = useCallback((firstName: string, lastName: string, userId: string) => {
    const baseUrl = firstName && lastName 
      ? `${firstName.toLowerCase()}-${lastName.toLowerCase()}`
      : `user-${userId.slice(0, 8)}`;
    
    return baseUrl
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const validateField = useCallback((name: string, value: any) => {
    let error = '';
    
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value?.trim()) {
          error = `${name === 'first_name' ? 'First' : 'Last'} name is required`;
        }
        break;
      case 'email':
        if (!value?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Valid email is required';
        }
        break;
      case 'graduation_year':
        if (value === undefined || value === null || value === '') {
          error = 'Graduation year is required';
        } else if (typeof value === 'string' && !/^[0-9]+$/.test(value)) {
          error = 'Please enter a valid year (numbers only)';
        }
        break;
      case 'profile_url':
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          error = 'URL can only contain lowercase letters, numbers, and hyphens';
        }
        break;
      case 'phone_number':
        if (value && value.trim() !== '' && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'linkedin_url':
      case 'twitter_url':
      case 'website_url':
        if (value && value.trim() !== '' && !/^https?:\/\/.+/.test(value)) {
          error = 'Please enter a valid URL starting with http:// or https://';
        }
        break;
    }
    
    return error;
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'graduation_year' ? (value ? parseInt(value) : undefined) : value
      };
      
      // Auto-generate profile URL when first or last name changes
      if ((name === 'first_name' || name === 'last_name') && user?.id) {
        const firstName = name === 'first_name' ? value : prev.first_name;
        const lastName = name === 'last_name' ? value : prev.last_name;
        
        if (firstName && lastName) {
          newData.profile_url = generateProfileUrl(firstName, lastName, user.id);
        }
      }
      
      return newData;
    });

    // Validate the field
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [generateProfileUrl, validateField, user?.id]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Mark all fields as touched
    const allFields = {
      ...formData,
      profile_url: formData.profile_url || generateProfileUrl(formData.first_name || '', formData.last_name || '', user?.id || '')
    };
    
    // Validate all fields
    const errors: Record<string, string> = {};
    let hasErrors = false;

    // Required fields
    const requiredFields = ['first_name', 'last_name', 'graduation_year'] as const;
    requiredFields.forEach(field => {
      const value = allFields[field];
      const error = validateField(field, value);
      
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    // Optional fields that need validation if present
    const optionalFields = ['profile_url', 'phone_number', 'linkedin_url', 'twitter_url', 'website_url'] as const;
    optionalFields.forEach(field => {
      const value = allFields[field];
      
      if (value && value.trim() !== '') {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
          hasErrors = true;
        }
      }
    });

    setValidationErrors(errors);
    // Mark fields with errors as touched
    const touchedFields: Record<string, boolean> = {};
    Object.keys(errors).forEach(key => {
      touchedFields[key] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedFields }));

    if (hasErrors) {
      setError('Please correct the errors before submitting.');
      return;
    }

    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }

    try {
      setLoading(true);
      let updatedFormData = { ...formData };

      // Generate profile URL if not provided
      if (!formData.profile_url) {
        updatedFormData.profile_url = generateProfileUrl(
          formData.first_name || '',
          formData.last_name || '',
          user.id
        );
      }

      // Upload profile picture if one was selected
      if (profilePicture) {
        setUploading(true);
        
        try {
          const fileName = `${user.id}-profile-${Date.now()}.${profilePicture.name.split('.').pop()}`;
          
          // Upload the profile picture using regular supabase client instead of admin
          const { data, error: uploadError } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, profilePicture, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);
          
          updatedFormData = {
            ...updatedFormData,
            avatar_url: publicUrlData.publicUrl
          };
        } catch (error: any) {
          console.error('Error uploading profile picture:', error);
          setError('Failed to upload profile picture. Please try again.');
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updatedFormData,
          updated_at: new Date().toISOString()
        });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        setError('Failed to update profile. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Clear form errors after successful submission
      setValidationErrors({});
      setTouched({});
      
      // Reset form if it's a new profile
      if (!isEditing) {
        setFormData({
          first_name: '',
          last_name: '',
          graduation_year: undefined,
          degree: '',
          major: '',
          current_company: '',
          current_position: '',
          location: '',
          bio: '',
          linkedin_url: '',
          twitter_url: '',
          website_url: '',
          phone_number: '',
          email: '',
          current_address: '',
          permanent_address: '',
          shipping_address: '',
          avatar_url: '',
          profile_url: '',
          industry: '',
          years_of_experience: undefined,
          awards: '',
          publications: '',
          patents: '',
          certifications: '',
          privacy_settings: {
            show_email: false,
            show_phone: false,
            show_location: true,
            show_education: true,
            show_experience: true,
            show_achievements: true,
            profile_visibility: 'alumni'
          }
        });
      }

      // Redirect to profile page after successful update
      if (isEditing) {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 70 }, (_, i) => currentYear - i);

  const calculateCompletionPercentage = () => {
    const requiredFields: (keyof typeof formData)[] = ['first_name', 'last_name', 'graduation_year', 'email'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field];
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      return value !== undefined && value !== null;
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
        {isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Profile {isEditing ? 'updated' : 'created'} successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" id="profile-form">
        {/* Profile Picture Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="profile_picture"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="text-sm"
              >
                {profilePicture ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {profilePicture && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeProfilePicture}
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            {profilePicturePreview ? (
              <div className="relative">
                <img 
                  src={profilePicturePreview} 
                  alt="Profile preview" 
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                <Upload className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.first_name) && validationErrors.first_name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.first_name) && validationErrors.first_name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.first_name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                id="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.last_name) && validationErrors.last_name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.last_name) && validationErrors.last_name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.last_name}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="profile_url" className="block text-sm font-medium text-gray-700">
                Profile URL*
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /profile/
                </span>
                <input
                  type="text"
                  name="profile_url"
                  id="profile_url"
                  value={formData.profile_url}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 px-3 py-2 text-sm focus:ring-1 transition-all duration-200 ${
                    Boolean(touched.profile_url) && validationErrors.profile_url 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : ''
                  }`}
                  placeholder="Your unique profile URL"
                  disabled={Boolean(formData.first_name) && Boolean(formData.last_name)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your profile URL is automatically generated based on your name. It can only contain lowercase letters, numbers, and hyphens.
              </p>
              {Boolean(touched.profile_url) && validationErrors.profile_url && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.profile_url}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700">
                Graduation Year <span className="text-red-500">*</span>
              </label>
              <select
                name="graduation_year"
                id="graduation_year"
                value={formData.graduation_year || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.graduation_year) && validationErrors.graduation_year 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {Boolean(touched.graduation_year) && validationErrors.graduation_year && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.graduation_year}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                readOnly
                disabled
                className={`mt-1 block w-full rounded-md border ${
                  touched.email && validationErrors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {touched.email && validationErrors.email && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                id="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.phone_number) && validationErrors.phone_number 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="e.g., +1 (555) 123-4567"
              />
              {Boolean(touched.phone_number) && validationErrors.phone_number && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.phone_number}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.location) && validationErrors.location 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="City, Country"
              />
              {Boolean(touched.location) && validationErrors.location && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="current_position" className="block text-sm font-medium text-gray-700">
                Current Position
              </label>
              <input
                type="text"
                name="current_position"
                id="current_position"
                value={formData.current_position}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.current_position) && validationErrors.current_position 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.current_position) && validationErrors.current_position && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.current_position}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="current_company" className="block text-sm font-medium text-gray-700">
                Current Company
              </label>
              <input
                type="text"
                name="current_company"
                id="current_company"
                value={formData.current_company}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.current_company) && validationErrors.current_company 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.current_company) && validationErrors.current_company && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.current_company}</p>
              )}
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.industry) && validationErrors.industry 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.industry) && validationErrors.industry && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.industry}</p>
              )}
            </div>

            <div>
              <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                name="years_of_experience"
                id="years_of_experience"
                min="0"
                max="70"
                value={formData.years_of_experience || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.years_of_experience) && validationErrors.years_of_experience 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              />
              {Boolean(touched.years_of_experience) && validationErrors.years_of_experience && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.years_of_experience}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Achievements Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Achievements</h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="awards" className="block text-sm font-medium text-gray-700">
                Awards and Recognitions
              </label>
              <textarea
                name="awards"
                id="awards"
                rows={3}
                value={formData.awards}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.awards) && validationErrors.awards 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="List any awards or recognitions you've received"
              />
              {Boolean(touched.awards) && validationErrors.awards && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.awards}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="publications" className="block text-sm font-medium text-gray-700">
                Publications
              </label>
              <textarea
                name="publications"
                id="publications"
                rows={3}
                value={formData.publications}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.publications) && validationErrors.publications 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="List your publications"
              />
              {Boolean(touched.publications) && validationErrors.publications && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.publications}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="patents" className="block text-sm font-medium text-gray-700">
                Patents
              </label>
              <textarea
                name="patents"
                id="patents"
                rows={3}
                value={formData.patents}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.patents) && validationErrors.patents 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="List any patents you hold"
              />
              {Boolean(touched.patents) && validationErrors.patents && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.patents}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700">
                Certifications
              </label>
              <textarea
                name="certifications"
                id="certifications"
                rows={3}
                value={formData.certifications}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.certifications) && validationErrors.certifications 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="List your professional certifications"
              />
              {Boolean(touched.certifications) && validationErrors.certifications && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.certifications}</p>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                id="profile_visibility"
                name="privacy_settings.profile_visibility"
                value={formData.privacy_settings.profile_visibility}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    privacy_settings: {
                      ...formData.privacy_settings,
                      profile_visibility: e.target.value
                    }
                  });
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="alumni">Alumni Only - Visible to other alumni</option>
                <option value="connections">Connections Only - Visible to your connections</option>
                <option value="private">Private - Visible only to you and admins</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <p className="block text-sm font-medium text-gray-700 mb-1">Information Sharing</p>
              
              <div className="flex items-center">
                <input
                  id="show_email"
                  name="show_email"
                  type="checkbox"
                  checked={formData.privacy_settings.show_email}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_email: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_email" className="ml-2 block text-sm text-gray-700">
                  Show email to other users
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="show_phone"
                  name="show_phone"
                  type="checkbox"
                  checked={formData.privacy_settings.show_phone}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_phone: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_phone" className="ml-2 block text-sm text-gray-700">
                  Show phone number to other users
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="show_location"
                  name="show_location"
                  type="checkbox"
                  checked={formData.privacy_settings.show_location}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_location: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_location" className="ml-2 block text-sm text-gray-700">
                  Show location information
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="show_education"
                  name="show_education"
                  type="checkbox"
                  checked={formData.privacy_settings.show_education}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_education: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_education" className="ml-2 block text-sm text-gray-700">
                  Show education information
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="show_experience"
                  name="show_experience"
                  type="checkbox"
                  checked={formData.privacy_settings.show_experience}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_experience: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_experience" className="ml-2 block text-sm text-gray-700">
                  Show professional experience
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="show_achievements"
                  name="show_achievements"
                  type="checkbox"
                  checked={formData.privacy_settings.show_achievements}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      privacy_settings: {
                        ...formData.privacy_settings,
                        show_achievements: e.target.checked
                      }
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="show_achievements" className="ml-2 block text-sm text-gray-700">
                  Show professional achievements
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin_url"
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.linkedin_url) && validationErrors.linkedin_url 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="https://linkedin.com/in/username"
              />
              {Boolean(touched.linkedin_url) && validationErrors.linkedin_url && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.linkedin_url}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="twitter_url" className="block text-sm font-medium text-gray-700">
                Twitter URL
              </label>
              <input
                type="url"
                name="twitter_url"
                id="twitter_url"
                value={formData.twitter_url}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.twitter_url) && validationErrors.twitter_url 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="https://twitter.com/username"
              />
              {Boolean(touched.twitter_url) && validationErrors.twitter_url && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.twitter_url}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                Personal Website
              </label>
              <input
                type="url"
                name="website_url"
                id="website_url"
                value={formData.website_url}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full rounded-md border ${
                  Boolean(touched.website_url) && validationErrors.website_url 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
                placeholder="https://yourwebsite.com"
              />
              {Boolean(touched.website_url) && validationErrors.website_url && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.website_url}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About You</h3>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full rounded-md border ${
                Boolean(touched.bio) && validationErrors.bio 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              } px-3 py-2 text-sm shadow-sm focus:ring-1 transition-all duration-200`}
              placeholder="Tell us about yourself..."
            />
            {Boolean(touched.bio) && validationErrors.bio && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.bio}</p>
            )}
          </div>
        </div>

        {/* Profile Completion Progress */}
        <div className="mt-6 mb-2 px-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Profile Completion</h3>
              <p className="text-xs text-gray-500">
                Complete required fields to finish your profile
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-indigo-600"
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-medium text-indigo-600">
                {calculateCompletionPercentage()}%
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-70 transition-all duration-200 shadow-sm"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              console.log('Submit button clicked');
              handleSubmit(e);
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEditing ? 'Update Profile' : 'Create Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}