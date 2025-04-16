'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

type Mentor = {
  id: string;
  first_name: string;
  last_name: string;
  graduation_year: number;
  current_position: string;
  current_company: string;
  mentor_topics: string[];
  avatar_url: string | null;
  bio: string;
  industry: string;
  compatibility_score?: number;
};

export default function MentorMatchingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [matchingPreferences, setMatchingPreferences] = useState({
    career_goals: '',
    skills_to_develop: '',
    industries_interested: '',
    preferred_communication: 'email',
    experience_level_preference: 'any',
    mentorship_duration: '3_months',
    topics: [] as string[]
  });
  
  const [recommendedMentors, setRecommendedMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const topicOptions = [
    "Career Guidance", "Leadership", "Technical Skills", "Entrepreneurship", 
    "Work-Life Balance", "Industry Insights", "Networking", "Personal Growth",
    "Communication Skills", "Project Management"
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMatchingPreferences({
      ...matchingPreferences,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setMatchingPreferences({
      ...matchingPreferences,
      [name]: value
    });
  };
  
  const handleTopicChange = (topic: string) => {
    const currentTopics = [...matchingPreferences.topics];
    if (currentTopics.includes(topic)) {
      setMatchingPreferences({
        ...matchingPreferences,
        topics: currentTopics.filter(t => t !== topic)
      });
    } else {
      setMatchingPreferences({
        ...matchingPreferences,
        topics: [...currentTopics, topic]
      });
    }
  };
  
  const findMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all mentors from the database
      const { data: mentors, error: mentorsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true);
      
      if (mentorsError) throw mentorsError;
      
      // Calculate compatibility score based on matching preferences
      const mentorsWithScores = mentors.map((mentor: Mentor) => {
        let score = 0;
        
        // Score based on industry match
        if (mentor.industry && matchingPreferences.industries_interested.includes(mentor.industry)) {
          score += 30;
        }
        
        // Score based on mentorship topics
        if (mentor.mentor_topics) {
          const matchingTopics = mentor.mentor_topics.filter(
            topic => matchingPreferences.topics.includes(topic)
          );
          score += matchingTopics.length * 15;
        }
        
        // Basic score for all mentors
        score += 10;
        
        return {
          ...mentor,
          compatibility_score: score
        };
      });
      
      // Sort by compatibility score (highest first)
      const sortedMentors = mentorsWithScores.sort(
        (a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0)
      );
      
      // Take top 5 matches
      setRecommendedMentors(sortedMentors.slice(0, 5));
      setSubmitted(true);
    } catch (error: any) {
      setError(error.message || 'Failed to find mentor matches');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Smart Mentor Matching</h1>
          <p className="text-muted-foreground mt-2">
            Fill out your preferences to get matched with mentors who can help you achieve your goals
          </p>
        </div>
        
        {!submitted ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Your Mentorship Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={findMatches} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="career_goals">Career Goals</Label>
                  <Textarea 
                    id="career_goals"
                    name="career_goals"
                    placeholder="Describe your short and long-term career goals"
                    value={matchingPreferences.career_goals}
                    onChange={handleChange}
                    className="min-h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills_to_develop">Skills You Want to Develop</Label>
                  <Textarea 
                    id="skills_to_develop"
                    name="skills_to_develop"
                    placeholder="What specific skills are you looking to improve?"
                    value={matchingPreferences.skills_to_develop}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industries_interested">Industries You're Interested In</Label>
                  <Input 
                    id="industries_interested"
                    name="industries_interested"
                    placeholder="e.g., Technology, Finance, Education, Healthcare"
                    value={matchingPreferences.industries_interested}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Mentorship Topics (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {topicOptions.map(topic => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`topic-${topic}`}
                          checked={matchingPreferences.topics.includes(topic)}
                          onCheckedChange={() => handleTopicChange(topic)}
                        />
                        <label 
                          htmlFor={`topic-${topic}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_communication">Preferred Communication Method</Label>
                    <Select 
                      value={matchingPreferences.preferred_communication}
                      onValueChange={(value) => handleSelectChange('preferred_communication', value)}
                    >
                      <SelectTrigger id="preferred_communication">
                        <SelectValue placeholder="Select communication method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="video">Video Calls</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="messaging">Messaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience_level_preference">Preferred Mentor Experience</Label>
                    <Select 
                      value={matchingPreferences.experience_level_preference}
                      onValueChange={(value) => handleSelectChange('experience_level_preference', value)}
                    >
                      <SelectTrigger id="experience_level_preference">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Experience Level</SelectItem>
                        <SelectItem value="early_career">Early Career (1-5 years)</SelectItem>
                        <SelectItem value="mid_career">Mid Career (5-10 years)</SelectItem>
                        <SelectItem value="senior">Senior (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mentorship_duration">Preferred Mentorship Duration</Label>
                  <Select 
                    value={matchingPreferences.mentorship_duration}
                    onValueChange={(value) => handleSelectChange('mentorship_duration', value)}
                  >
                    <SelectTrigger id="mentorship_duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1_month">1 Month</SelectItem>
                      <SelectItem value="3_months">3 Months</SelectItem>
                      <SelectItem value="6_months">6 Months</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <CardFooter className="px-0 pt-6 flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Find My Mentor Matches
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Top Mentor Matches</h2>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Adjust Preferences
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-800">
                {error}
              </div>
            )}
            
            {recommendedMentors.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No mentor matches found. Try adjusting your preferences.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendedMentors.map((mentor) => (
                  <Card key={mentor.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3" />
                      <div className="p-6 pb-3 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                          {mentor.avatar_url ? (
                            <img
                              src={mentor.avatar_url}
                              alt={`${mentor.first_name} ${mentor.last_name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xl font-bold">
                              {mentor.first_name[0]}{mentor.last_name[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {mentor.first_name} {mentor.last_name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {mentor.current_position} at {mentor.current_company}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="mb-3">
                        <span className="text-sm font-medium">Industry:</span>{" "}
                        <span className="text-sm">{mentor.industry}</span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium">Graduation Year:</span>{" "}
                        <span className="text-sm">{mentor.graduation_year}</span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium">Mentorship Topics:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mentor.mentor_topics?.map((topic) => (
                            <span
                              key={topic}
                              className="inline-block px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm font-medium">Match Score:</span>{" "}
                        <span className="text-sm font-semibold text-green-600">
                          {mentor.compatibility_score}% Compatible
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                        {mentor.bio}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/mentorship/mentors/${mentor.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm">Request Mentorship</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 