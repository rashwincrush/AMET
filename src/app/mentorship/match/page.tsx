"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  current_position?: string;
  current_company?: string;
  bio?: string;
  graduation_year?: number;
  mentor_topics?: string[];
  industry?: string;
  years_of_experience?: number;
  match_score?: number;
}

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Consulting",
  "Engineering",
  "Design",
  "Legal",
  "Non-profit",
  "Other"
];

const MENTOR_TOPICS = [
  "Career Advancement",
  "Leadership Development",
  "Technical Skills",
  "Work-Life Balance",
  "Entrepreneurship",
  "Industry Insights",
  "Job Search",
  "Networking",
  "Graduate School",
  "Skill Development",
  "Interviewing",
  "Resume Building"
];

export default function MentorMatchPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [matchedMentors, setMatchedMentors] = useState<Mentor[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    careerStage: "",
    industry: "",
    yearsOfExperience: 0,
    goals: "",
    topics: [] as string[],
    skills: "" as string,
    experiencePreference: "any",
    communicationPreference: "any",
    availabilityImportance: 50,
    locationPreference: "any"
  });
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Check if user is logged in and get profile
  useEffect(() => {
    async function getUserProfile() {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
      }
    }

    getUserProfile();
  }, [user, router, supabase]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle topic selection
  const handleTopicChange = (topic: string) => {
    setFormData({
      ...formData,
      topics: formData.topics.includes(topic)
        ? formData.topics.filter(t => t !== topic)
        : [...formData.topics, topic]
    });
  };

  // Find matching mentors based on form data
  const findMatches = async () => {
    setIsLoadingMentors(true);
    
    try {
      // In a real implementation, this would likely be a more sophisticated algorithm
      // possibly implemented on the server-side or using a dedicated API endpoint
      
      // For this demo, we'll do a simple match based on industry and topics
      const { data: mentors, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true)
        .not('id', 'eq', user?.id);
      
      if (error) throw error;
      
      // Calculate match score for each mentor
      const matchedMentors = mentors.map((mentor: Mentor) => {
        let score = 0;
        
        // Industry match (highest weight)
        if (mentor.industry === formData.industry) {
          score += 30;
        }
        
        // Topics match
        const mentorTopics = mentor.mentor_topics || [];
        const matchingTopics = formData.topics.filter(topic => 
          mentorTopics.includes(topic)
        );
        
        score += (matchingTopics.length / formData.topics.length) * 25;
        
        // Experience match
        if (formData.experiencePreference === "more" && mentor.years_of_experience && mentor.years_of_experience > formData.yearsOfExperience) {
          score += 15;
        } else if (formData.experiencePreference === "similar" && mentor.years_of_experience && 
          Math.abs(mentor.years_of_experience - formData.yearsOfExperience) <= 2) {
          score += 15;
        } else if (formData.experiencePreference === "any") {
          score += 5;
        }
        
        // Add some randomness to break ties (in real implementation would use more factors)
        score += Math.random() * 5;
        
        return {
          ...mentor,
          match_score: Math.min(Math.round(score), 100)
        };
      });
      
      // Sort by match score
      matchedMentors.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      
      // Take top 5 matches
      setMatchedMentors(matchedMentors.slice(0, 5));
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error finding mentor matches:', error.message);
      toast.error('Failed to find mentor matches');
    } finally {
      setIsLoadingMentors(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.industry) {
      toast.error('Please select your industry');
      return;
    }
    
    if (formData.topics.length === 0) {
      toast.error('Please select at least one mentorship topic');
      return;
    }
    
    if (!formData.goals) {
      toast.error('Please describe your goals');
      return;
    }
    
    findMatches();
  };

  // Request mentorship from a mentor
  const requestMentorship = async (mentorId: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('mentorship_relationships')
        .insert({
          mentor_id: mentorId,
          mentee_id: user?.id,
          status: 'pending',
          field: formData.industry,
          goals: formData.goals
        });
        
      if (error) throw error;
      
      toast.success('Mentorship request sent successfully!');
      router.push('/mentorship/my-mentors');
    } catch (error: any) {
      console.error('Error requesting mentorship:', error.message);
      toast.error('Failed to send mentorship request');
    } finally {
      setIsLoading(false);
    }
  };

  // Get match score color based on score value
  const getMatchScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (!user) {
    return null; // Auth redirect handled in useEffect
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Smart Mentor Matching</h1>
      
      {currentStep === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Find Your Ideal Mentor</CardTitle>
            <CardDescription>
              Tell us about your preferences and goals, and we'll match you with mentors who can help you succeed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>What industry are you in or interested in?</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Years of professional experience</Label>
                  <Input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                    min="0"
                    max="50"
                  />
                </div>

                <div>
                  <Label>What are your career goals and what do you hope to achieve through mentorship?</Label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    placeholder="Describe your career goals and mentorship expectations..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">What topics would you like guidance on? (Select all that apply)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MENTOR_TOPICS.map((topic) => (
                      <div className="flex items-center space-x-2" key={topic}>
                        <Checkbox 
                          id={`topic-${topic}`}
                          checked={formData.topics.includes(topic)}
                          onCheckedChange={() => handleTopicChange(topic)}
                        />
                        <label
                          htmlFor={`topic-${topic}`}
                          className="text-sm cursor-pointer"
                        >
                          {topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>What specific skills are you looking to develop?</Label>
                  <Textarea
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    placeholder="E.g., public speaking, coding in Python, project management..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Do you prefer a mentor with:</Label>
                  <RadioGroup 
                    value={formData.experiencePreference}
                    onValueChange={(value) => handleInputChange('experiencePreference', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="more" id="exp-more" />
                      <Label htmlFor="exp-more">More experience than me</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="similar" id="exp-similar" />
                      <Label htmlFor="exp-similar">Similar experience to me</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any" id="exp-any" />
                      <Label htmlFor="exp-any">No preference</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/mentorship">Cancel</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isLoadingMentors}>
              {isLoadingMentors ? (
                <>
                  <span className="mr-2 animate-spin">⟳</span>
                  Finding Matches...
                </>
              ) : (
                "Find Mentors"
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Mentor Matches</CardTitle>
              <CardDescription>
                We've found {matchedMentors.length} potential mentors based on your preferences. Review their profiles and connect with those who can best support your goals.
              </CardDescription>
            </CardHeader>
          </Card>
          
          {matchedMentors.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="mb-4 text-lg">No matching mentors found.</p>
                <Button onClick={() => setCurrentStep(1)}>Adjust Your Preferences</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {matchedMentors.map((mentor) => (
                <Card key={mentor.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 md:w-3/4">
                      <div className="flex items-start space-x-4 mb-4">
                        {mentor.avatar_url ? (
                          <img 
                            src={mentor.avatar_url} 
                            alt={`${mentor.first_name} ${mentor.last_name}`}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xl">
                              {mentor.first_name.charAt(0)}
                              {mentor.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-lg">
                            {mentor.first_name} {mentor.last_name}
                          </h3>
                          {mentor.current_position && mentor.current_company && (
                            <p className="text-muted-foreground">
                              {mentor.current_position} at {mentor.current_company}
                            </p>
                          )}
                          {mentor.industry && (
                            <p className="text-sm text-muted-foreground">
                              {mentor.industry} • {mentor.years_of_experience || 0} years experience
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {mentor.bio && (
                        <p className="text-sm mb-4 line-clamp-3">{mentor.bio}</p>
                      )}
                      
                      {mentor.mentor_topics && mentor.mentor_topics.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm text-muted-foreground mb-1">Mentorship Topics</h4>
                          <div className="flex flex-wrap gap-1">
                            {mentor.mentor_topics.map((topic, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className={`text-xs ${formData.topics.includes(topic) ? "bg-blue-100 text-blue-800 border-blue-200" : ""}`}
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <Link href={`/profile/${mentor.id}`}>
                            View Full Profile
                          </Link>
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => requestMentorship(mentor.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Request Mentorship"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 md:w-1/4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l">
                      <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Match Score</p>
                        <Badge className={`text-lg px-3 py-1 ${getMatchScoreColor(mentor.match_score)}`}>
                          {mentor.match_score}%
                        </Badge>
                      </div>
                      
                      <div className="w-full">
                        <h4 className="text-xs text-muted-foreground mb-1 text-center">Compatibility</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Industry</span>
                              <span>{mentor.industry === formData.industry ? "Match" : "Different"}</span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${mentor.industry === formData.industry ? "bg-green-500" : "bg-gray-300"}`}
                                style={{ width: mentor.industry === formData.industry ? "100%" : "20%" }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Topics</span>
                              <span>
                                {mentor.mentor_topics
                                  ? Math.round((formData.topics.filter(t => mentor.mentor_topics?.includes(t)).length / formData.topics.length) * 100)
                                  : 0}%
                              </span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500"
                                style={{ 
                                  width: mentor.mentor_topics
                                    ? `${Math.round((formData.topics.filter(t => mentor.mentor_topics?.includes(t)).length / formData.topics.length) * 100)}%`
                                    : "0%" 
                                }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs">
                              <span>Experience</span>
                              <span>
                                {formData.experiencePreference === "more" && mentor.years_of_experience && mentor.years_of_experience > formData.yearsOfExperience
                                  ? "Ideal"
                                  : formData.experiencePreference === "similar" && mentor.years_of_experience && 
                                    Math.abs(mentor.years_of_experience - formData.yearsOfExperience) <= 2
                                    ? "Ideal"
                                    : "Partial"}
                              </span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-500"
                                style={{ 
                                  width: formData.experiencePreference === "more" && mentor.years_of_experience && mentor.years_of_experience > formData.yearsOfExperience
                                    ? "100%"
                                    : formData.experiencePreference === "similar" && mentor.years_of_experience && 
                                      Math.abs(mentor.years_of_experience - formData.yearsOfExperience) <= 2
                                      ? "100%"
                                      : "40%"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back to Preferences
                </Button>
                <Button asChild>
                  <Link href="/mentorship/mentors">
                    Browse All Mentors
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
} 