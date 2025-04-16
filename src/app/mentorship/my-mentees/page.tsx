"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageCircleIcon, CalendarIcon, CheckIcon, XIcon, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  field: string;
  goals: string;
  mentee: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    email?: string;
    current_position?: string;
    current_company?: string;
  };
}

export default function MyMenteesPage() {
  const [isMentor, setIsMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
  const [currentTab, setCurrentTab] = useState("pending");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<MentorshipRelationship | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Check if user is a mentor and fetch relationships
  useEffect(() => {
    async function checkMentorStatusAndFetch() {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Check if user is a mentor
        const { data: mentor, error: mentorError } = await supabase
          .from('profiles')
          .select('is_mentor')
          .eq('id', user.id)
          .single();

        if (mentorError) throw mentorError;

        if (!mentor || !mentor.is_mentor) {
          toast.error('You are not registered as a mentor');
          router.push('/mentorship/become-mentor');
          return;
        }

        setIsMentor(true);
        fetchMentorshipRelationships();
      } catch (error: any) {
        console.error('Error checking mentor status:', error.message);
        toast.error('An error occurred while checking your mentor status');
      }
    }

    checkMentorStatusAndFetch();
  }, [user, router, supabase]);

  // Fetch mentorship relationships
  async function fetchMentorshipRelationships() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mentorship_relationships')
        .select(`
          *,
          mentee:mentee_id(
            id, 
            first_name, 
            last_name, 
            avatar_url, 
            email, 
            current_position, 
            current_company
          )
        `)
        .eq('mentor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRelationships(data || []);
    } catch (error: any) {
      console.error('Error fetching mentorship relationships:', error.message);
      toast.error('Failed to load your mentee relationships');
    } finally {
      setIsLoading(false);
    }
  }

  // Update relationship status
  async function updateStatus(id: string, status: 'accepted' | 'rejected' | 'completed') {
    try {
      const { error } = await supabase
        .from('mentorship_relationships')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setRelationships(relationships.map(relationship => 
        relationship.id === id 
          ? { ...relationship, status } 
          : relationship
      ));

      toast.success(`Mentorship request ${status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'marked as completed'}`);
      setIsDetailsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating status:', error.message);
      toast.error('Failed to update mentorship status');
    }
  }

  // Filter relationships based on current tab
  const filteredRelationships = relationships.filter(relationship => relationship.status === currentTab);

  // Status badge color mapping
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isMentor) {
    return null; // Don't render anything if not a mentor (will redirect)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Mentees</h1>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/mentorship/my-availability">
              Manage Availability
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <ClockIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Tips for Effective Mentoring</h3>
              <p className="text-muted-foreground">
                Set clear expectations, listen actively, provide constructive feedback, and maintain regular communication with your mentees.
                Remember to schedule regular check-ins and help them set achievable goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending Requests ({relationships.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="accepted">Active Mentees ({relationships.filter(r => r.status === 'accepted').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({relationships.filter(r => r.status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({relationships.filter(r => r.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "pending")}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "accepted")}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "completed")}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "rejected")}
        </TabsContent>
      </Tabs>

      {/* Relationship Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mentorship Request Details</DialogTitle>
          </DialogHeader>
          {selectedRelationship && (
            <div className="py-4">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4">
                  {selectedRelationship.mentee.avatar_url ? (
                    <img 
                      src={selectedRelationship.mentee.avatar_url} 
                      alt={`${selectedRelationship.mentee.first_name} ${selectedRelationship.mentee.last_name}`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">
                        {selectedRelationship.mentee.first_name.charAt(0)}
                        {selectedRelationship.mentee.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {selectedRelationship.mentee.first_name} {selectedRelationship.mentee.last_name}
                    </h3>
                    {selectedRelationship.mentee.current_position && selectedRelationship.mentee.current_company && (
                      <p className="text-sm text-muted-foreground">
                        {selectedRelationship.mentee.current_position} at {selectedRelationship.mentee.current_company}
                      </p>
                    )}
                    <div className="flex space-x-4 mt-1">
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/profile/${selectedRelationship.mentee.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Mentorship Field</h3>
                  <p>{selectedRelationship.field}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Goals</h3>
                  <p className="text-sm whitespace-pre-line">{selectedRelationship.goals}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                    <Badge className={statusColors[selectedRelationship.status]}>
                      {selectedRelationship.status.charAt(0).toUpperCase() + selectedRelationship.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Requested On</h3>
                    <p className="text-sm">
                      {format(new Date(selectedRelationship.created_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                {selectedRelationship.status === "pending" && (
                  <div className="space-x-2">
                    <Button 
                      onClick={() => updateStatus(selectedRelationship.id, "accepted")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Accept Request
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => updateStatus(selectedRelationship.id, "rejected")}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )}
                
                {selectedRelationship.status === "accepted" && (
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/messages?recipient=${selectedRelationship.mentee.id}`}>
                        <MessageCircleIcon className="mr-2 h-4 w-4" />
                        Message Mentee
                      </Link>
                    </Button>
                    <Button onClick={() => updateStatus(selectedRelationship.id, "completed")}>
                      Mark as Completed
                    </Button>
                  </>
                )}
                
                {(selectedRelationship.status === "rejected" || selectedRelationship.status === "completed") && (
                  <div></div> // Empty div for flex alignment
                )}
                
                <Button 
                  variant="link"
                  onClick={() => setIsDetailsDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderRelationshipsList(relationships: MentorshipRelationship[], status: string) {
    if (relationships.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              {status === "pending" 
                ? "No pending mentorship requests." 
                : status === "accepted" 
                  ? "You don't have any active mentees." 
                  : status === "completed"
                    ? "You don't have any completed mentorship relationships."
                    : "No rejected mentorship requests."}
            </p>
          </CardContent>
        </Card>
      );
    }

    return relationships.map(relationship => (
      <Card key={relationship.id} className="mb-4 overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {relationship.mentee.avatar_url ? (
                <img 
                  src={relationship.mentee.avatar_url} 
                  alt={`${relationship.mentee.first_name} ${relationship.mentee.last_name}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">
                    {relationship.mentee.first_name.charAt(0)}
                    {relationship.mentee.last_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-base">
                  {relationship.mentee.first_name} {relationship.mentee.last_name}
                </CardTitle>
                {relationship.mentee.current_position && relationship.mentee.current_company && (
                  <CardDescription>
                    {relationship.mentee.current_position} at {relationship.mentee.current_company}
                  </CardDescription>
                )}
              </div>
            </div>
            <Badge className={statusColors[relationship.status]}>
              {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Field:</span> {relationship.field}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            <span className="font-medium">Requested:</span> {format(new Date(relationship.created_at), "MMM d, yyyy")}
          </p>
          
          <div className="flex justify-between items-center mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link href={`/profile/${relationship.mentee.id}`}>
                View Profile
              </Link>
            </Button>
            
            <Button 
              onClick={() => {
                setSelectedRelationship(relationship);
                setIsDetailsDialogOpen(true);
              }}
              size="sm"
            >
              {status === "pending" ? "Review Request" : "View Details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  }
} 