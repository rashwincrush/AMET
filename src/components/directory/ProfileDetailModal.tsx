'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlumniProfile } from '@/mock/alumni';
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Twitter, 
  Github,
  MessageSquare,
  Send
} from 'lucide-react';
import Link from 'next/link';

interface ProfileDetailModalProps {
  profile: AlumniProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDetailModal({ profile, isOpen, onClose }: ProfileDetailModalProps) {
  const [activeTab, setActiveTab] = useState('about');
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  
  if (!profile) return null;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, this would send the message to an API
    console.log('Sending message to', profile.firstName, profile.lastName, ':', message);
    
    // Show success state
    setMessageSent(true);
    
    // Reset after 3 seconds
    setTimeout(() => {
      setMessageSent(false);
      setMessage('');
    }, 3000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <img 
                src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                alt={`${profile.firstName} ${profile.lastName}`}
                className="object-cover"
              />
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <DialogTitle className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </DialogTitle>
                
                {profile.isVerified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Verified
                  </Badge>
                )}
                
                {profile.mentorshipStatus === 'mentor' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    Mentor
                  </Badge>
                )}
                
                {profile.mentorshipStatus === 'mentee' && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    Mentee
                  </Badge>
                )}
                
                {profile.mentorshipStatus === 'both' && (
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                    Mentor & Mentee
                  </Badge>
                )}
              </div>
              
              <DialogDescription className="text-base">
                {profile.currentPosition} at {profile.company}
              </DialogDescription>
              
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-1" />
                  {profile.location}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap size={16} className="mr-1" />
                  {profile.degree} in {profile.major}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-1" />
                  Class of {profile.graduationYear}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="about" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="message">Send Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bio</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
            
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {profile.mentorshipAreas && profile.mentorshipAreas.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Mentorship Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.mentorshipAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">{area}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <Mail className="mr-2 text-blue-600" size={18} />
                  <h3 className="font-semibold">Email</h3>
                </div>
                <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                  {profile.email}
                </a>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <Phone className="mr-2 text-blue-600" size={18} />
                  <h3 className="font-semibold">Phone</h3>
                </div>
                <a href={`tel:${profile.phoneNumber}`} className="text-blue-600 hover:underline">
                  {profile.phoneNumber}
                </a>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.socialLinks?.linkedin && (
                <a 
                  href={profile.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="mr-2 text-blue-700" size={18} />
                  LinkedIn Profile
                </a>
              )}
              
              {profile.socialLinks?.twitter && (
                <a 
                  href={profile.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Twitter className="mr-2 text-blue-400" size={18} />
                  Twitter Profile
                </a>
              )}
              
              {profile.socialLinks?.github && (
                <a 
                  href={profile.socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Github className="mr-2 text-gray-800" size={18} />
                  GitHub Profile
                </a>
              )}
              
              {profile.socialLinks?.website && (
                <a 
                  href={profile.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="mr-2 text-green-600" size={18} />
                  Personal Website
                </a>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="message" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-800 mb-1">Send a Direct Message</h3>
              <p className="text-sm text-blue-700">
                Your message will be sent directly to {profile.firstName}. They will be notified via email and can respond through the platform.
              </p>
            </div>
            
            {messageSent ? (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-green-100 p-2">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Message Sent!</h3>
                <p className="text-sm text-green-700">
                  Your message has been sent to {profile.firstName}. They will be notified shortly.
                </p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder={`Write your message to ${profile.firstName}...`}
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="flex items-center"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {activeTab !== 'message' && (
            <Button 
              onClick={() => setActiveTab('message')}
              className="flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message {profile.firstName}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
