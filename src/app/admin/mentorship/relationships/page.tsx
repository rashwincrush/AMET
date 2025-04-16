"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarIcon, CheckIcon, XIcon } from "lucide-react";
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
  };
  mentee: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export default function MentorshipRelationshipsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
  const [currentTab, setCurrentTab] = useState("pending");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<MentorshipRelationship | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Check if user is admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!profile || !profile.is_admin) {
          toast.error('You do not have permission to access this page');
          router.push('/mentorship');
          return;
        }

        setIsAdmin(true);
        fetchRelationships();
      } catch (error: any) {
        console.error('Error checking admin status:', error.message);
        toast.error('An error occurred while checking permissions');
      }
    }

    checkAdminStatus();
  }, [user, router, supabase]);

  // Fetch mentorship relationships
  async function fetchRelationships() {
    try {
      const { data, error } = await supabase
        .from('mentorship_relationships')
        .select(`
          *,
          mentor:mentor_id(id, first_name, last_name, avatar_url),
          mentee:mentee_id(id, first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRelationships(data || []);
    } catch (error: any) {
      console.error('Error fetching relationships:', error.message);
      toast.error('Failed to load mentorship relationships');
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

      toast.success(`Mentorship status updated to ${status}`);
      setIsDetailsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating status:', error.message);
      toast.error('Failed to update mentorship status');
    }
  }

  // Delete relationship
  async function deleteRelationship() {
    if (!selectedRelationship) return;

    try {
      const { error } = await supabase
        .from('mentorship_relationships')
        .delete()
        .eq('id', selectedRelationship.id);

      if (error) throw error;

      // Update local state
      setRelationships(relationships.filter(relationship => relationship.id !== selectedRelationship.id));
      toast.success('Mentorship relationship deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting relationship:', error.message);
      toast.error('Failed to delete mentorship relationship');
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

  if (!isAdmin) {
    return null; // Don't render anything if not admin (will redirect)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mentorship Relationships Management</h1>
        <div className="space-x-4">
          <Link href="/admin/mentorship/programs">
            <Button variant="outline">
              Manage Programs
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "pending")}
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "accepted")}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "rejected")}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {renderRelationshipsList(filteredRelationships, "completed")}
        </TabsContent>
      </Tabs>

      {/* Relationship Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mentorship Relationship Details</DialogTitle>
          </DialogHeader>
          {selectedRelationship && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Mentor</h3>
                  <div className="flex items-center">
                    {selectedRelationship.mentor.avatar_url ? (
                      <img 
                        src={selectedRelationship.mentor.avatar_url} 
                        alt={`${selectedRelationship.mentor.first_name} ${selectedRelationship.mentor.last_name}`}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-sm">
                          {selectedRelationship.mentor.first_name.charAt(0)}
                          {selectedRelationship.mentor.last_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedRelationship.mentor.first_name} {selectedRelationship.mentor.last_name}
                      </p>
                      <Link href={`/mentorship/mentors/${selectedRelationship.mentor.id}`}>
                        <Button variant="link" className="p-0 h-auto">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Mentee</h3>
                  <div className="flex items-center">
                    {selectedRelationship.mentee.avatar_url ? (
                      <img 
                        src={selectedRelationship.mentee.avatar_url} 
                        alt={`${selectedRelationship.mentee.first_name} ${selectedRelationship.mentee.last_name}`}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500 text-sm">
                          {selectedRelationship.mentee.first_name.charAt(0)}
                          {selectedRelationship.mentee.last_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {selectedRelationship.mentee.first_name} {selectedRelationship.mentee.last_name}
                      </p>
                      <Link href={`/profile/${selectedRelationship.mentee.id}`}>
                        <Button variant="link" className="p-0 h-auto">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
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
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => updateStatus(selectedRelationship.id, "rejected")}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
                {selectedRelationship.status === "accepted" && (
                  <Button onClick={() => updateStatus(selectedRelationship.id, "completed")}>
                    Mark as Completed
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => {
                    setIsDetailsDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Delete Relationship
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this mentorship relationship?</p>
            {selectedRelationship && (
              <p className="text-sm mt-2">
                Between mentor {selectedRelationship.mentor.first_name} {selectedRelationship.mentor.last_name} and 
                mentee {selectedRelationship.mentee.first_name} {selectedRelationship.mentee.last_name}
              </p>
            )}
            <p className="text-sm text-red-500 mt-4">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteRelationship}>Delete Relationship</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderRelationshipsList(relationships: MentorshipRelationship[], status: string) {
    if (relationships.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No {status} mentorship relationships found.</p>
          </CardContent>
        </Card>
      );
    }

    return relationships.map(relationship => (
      <Card key={relationship.id} className="mb-4">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {relationship.mentor.first_name} {relationship.mentor.last_name} → {relationship.mentee.first_name} {relationship.mentee.last_name}
            </CardTitle>
            <Badge className={statusColors[relationship.status]}>
              {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Field: {relationship.field}</p>
              <p className="text-sm text-muted-foreground">
                Requested: {format(new Date(relationship.created_at), "MMM d, yyyy")}
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectedRelationship(relationship);
                setIsDetailsDialogOpen(true);
              }}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  }
} 