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
import { MessageCircleIcon, UserPlusIcon, CalendarIcon, XIcon } from "lucide-react";
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
  mentor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    current_position?: string;
    current_company?: string;
    bio?: string;
    mentor_topics?: string[];
    industry?: string;
  };
}

export default function MyMentorsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<MentorshipRelationship | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Fetch mentorship relationships
  useEffect(() => {
    async function fetchMentorshipRelationships() {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('mentorship_relationships')
          .select(`
            *,
            mentor:mentor_id(
              id, 
              first_name, 
              last_name, 
              avatar_url, 
              current_position, 
              current_company,
              bio,
              mentor_topics,
              industry
            )
          `)
          .eq('mentee_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRelationships(data || []);
      } catch (error: any) {
        console.error('Error fetching mentorship relationships:', error.message);
        toast.error('Failed to load your mentor relationships');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMentorshipRelationships();
  }, [user, router, supabase]);

  // Cancel mentorship request
  async function cancelRequest(id: string) {
    try {
      const { error } = await supabase
        .from('mentorship_relationships')
        .delete()
        .eq('id', id)
        .eq('status', 'pending');

      if (error) throw error;

      // Remove from local state
      setRelationships(relationships.filter(relationship => relationship.id !== id));
      setIsDetailsDialogOpen(false);
      toast.success('Mentorship request cancelled');
    } catch (error: any) {
      console.error('Error cancelling request:', error.message);
      toast.error('Failed to cancel mentorship request');
    }
  }

  // End active mentorship
  async function endMentorship(id: string) {
    try {
      const { error } = await supabase
        .from('mentorship_relationships')
        .update({ status: 'completed' })
        .eq('id', id)
        .eq('status', 'accepted');

      if (error) throw error;

      // Update in local state
      setRelationships(relationships.map(relationship => 
        relationship.id === id 
          ? { ...relationship, status: 'completed' } 
          : relationship
      ));
      
      setIsDetailsDialogOpen(false);
      toast.success('Mentorship marked as completed');
    } catch (error: any) {
      console.error('Error ending mentorship:', error.message);
      toast.error('Failed to end mentorship');
    }
  }

  // Filter relationships based on current tab
  const filteredRelationships = currentTab === 'all' 
    ? relationships 
    : relationships.filter(relationship => relationship.status === currentTab);

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Mentors</h1>
        <Button asChild>
          <Link href="/mentorship/mentors">
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Find New Mentors
          </Link>
        </Button>
      </div>

      {relationships.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center py-12">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <UserPlusIcon className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Mentor Relationships</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven't connected with any mentors yet. Find a mentor to help guide your career journey.
            </p>
            <Button size="lg" asChild>
              <Link href="/mentorship/mentors">
                Browse Mentors
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="all" onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({relationships.length})</TabsTrigger>
              <TabsTrigger value="accepted">Active ({relationships.filter(r => r.status === 'accepted').length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({relationships.filter(r => r.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({relationships.filter(r => r.status === 'completed').length})</TabsTrigger>
              <TabsTrigger value="rejected">Declined ({relationships.filter(r => r.status === 'rejected').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {renderRelationshipsList(filteredRelationships)}
            </TabsContent>
            
            <TabsContent value="accepted" className="space-y-4">
              {renderRelationshipsList(filteredRelationships)}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {renderRelationshipsList(filteredRelationships)}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {renderRelationshipsList(filteredRelationships)}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {renderRelationshipsList(filteredRelationships)}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Relationship Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mentorship Details</DialogTitle>
          </DialogHeader>
          {selectedRelationship && (
            <div className="py-4">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4">
                  {selectedRelationship.mentor.avatar_url ? (
                    <img 
                      src={selectedRelationship.mentor.avatar_url} 
                      alt={`${selectedRelationship.mentor.first_name} ${selectedRelationship.mentor.last_name}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xl">
                        {selectedRelationship.mentor.first_name.charAt(0)}
                        {selectedRelationship.mentor.last_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">
                      {selectedRelationship.mentor.first_name} {selectedRelationship.mentor.last_name}
                    </h3>
                    {selectedRelationship.mentor.current_position && selectedRelationship.mentor.current_company && (
                      <p className="text-muted-foreground">
                        {selectedRelationship.mentor.current_position} at {selectedRelationship.mentor.current_company}
                      </p>
                    )}
                    {selectedRelationship.mentor.industry && (
                      <p className="text-sm text-muted-foreground">
                        {selectedRelationship.mentor.industry}
                      </p>
                    )}
                    <div className="flex space-x-4 mt-1">
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/profile/${selectedRelationship.mentor.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedRelationship.mentor.mentor_topics && selectedRelationship.mentor.mentor_topics.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Mentorship Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRelationship.mentor.mentor_topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Mentorship Field</h3>
                  <p>{selectedRelationship.field}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Your Goals</h3>
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
                  <Button 
                    variant="outline" 
                    onClick={() => cancelRequest(selectedRelationship.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Cancel Request
                  </Button>
                )}
                
                {selectedRelationship.status === "accepted" && (
                  <div className="space-x-2">
                    <Button asChild variant="outline">
                      <Link href={`/messages?recipient=${selectedRelationship.mentor.id}`}>
                        <MessageCircleIcon className="mr-2 h-4 w-4" />
                        Message Mentor
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => endMentorship(selectedRelationship.id)}
                    >
                      Complete Mentorship
                    </Button>
                  </div>
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

  function renderRelationshipsList(relationships: MentorshipRelationship[]) {
    if (relationships.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              No mentor relationships to display in this category.
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
              {relationship.mentor.avatar_url ? (
                <img 
                  src={relationship.mentor.avatar_url} 
                  alt={`${relationship.mentor.first_name} ${relationship.mentor.last_name}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">
                    {relationship.mentor.first_name.charAt(0)}
                    {relationship.mentor.last_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <CardTitle className="text-base">
                  {relationship.mentor.first_name} {relationship.mentor.last_name}
                </CardTitle>
                {relationship.mentor.current_position && relationship.mentor.current_company && (
                  <CardDescription>
                    {relationship.mentor.current_position} at {relationship.mentor.current_company}
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
          {relationship.mentor.mentor_topics && relationship.mentor.mentor_topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {relationship.mentor.mentor_topics.slice(0, 3).map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {relationship.mentor.mentor_topics.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{relationship.mentor.mentor_topics.length - 3} more
                </Badge>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Requested:</span> {format(new Date(relationship.created_at), "MMM d, yyyy")}
          </p>
          
          <div className="flex justify-between items-center mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link href={`/profile/${relationship.mentor.id}`}>
                View Profile
              </Link>
            </Button>
            
            <div className="space-x-2">
              {relationship.status === "accepted" && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/messages?recipient=${relationship.mentor.id}`}>
                    <MessageCircleIcon className="mr-1 h-4 w-4" />
                    Message
                  </Link>
                </Button>
              )}
              <Button 
                onClick={() => {
                  setSelectedRelationship(relationship);
                  setIsDetailsDialogOpen(true);
                }}
                size="sm"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }
} 