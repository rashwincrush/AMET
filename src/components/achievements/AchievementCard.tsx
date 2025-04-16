"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, LinkIcon, MoreVertical, Edit, Trash, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from '@/lib/auth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string | null;
  url: string | null;
  image_url: string | null;
  is_approved: boolean;
  user_id: string;
  created_at: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showControls?: boolean;
  showApprovalControls?: boolean;
}

export default function AchievementCard({
  achievement,
  onDelete,
  onApprove,
  onReject,
  showControls = false,
  showApprovalControls = false
}: AchievementCardProps) {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if user is admin or moderator
  const isAdminOrModerator = userRoles?.some((role: string) => ['super_admin', 'admin', 'moderator'].includes(role));
  
  // Fetch user roles when component mounts
  useEffect(() => {
    async function fetchUserRoles() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/auth/user-roles');
        if (response.ok) {
          const data = await response.json();
          setUserRoles(data.roles || []);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    }
    
    fetchUserRoles();
  }, [user]);
  
  // Check if user is the owner of this achievement
  const isOwner = user?.id === achievement.user_id;
  
  // Determine if the user can edit/delete this achievement
  const canManage = isOwner || isAdminOrModerator;
  
  // Format date if available
  const formattedDate = achievement.date ? format(new Date(achievement.date), 'MMMM d, yyyy') : null;
  
  // Handle delete achievement
  const handleDelete = async () => {
    if (!achievement.id) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/achievements/${achievement.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete achievement');
      }
      
      toast.success('Achievement deleted successfully');
      
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete(achievement.id);
      }
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Handle approve achievement
  const handleApprove = async () => {
    if (!achievement.id || !onApprove) return;
    
    try {
      const response = await fetch(`/api/achievements/${achievement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...achievement,
          is_approved: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve achievement');
      }
      
      toast.success('Achievement approved successfully');
      
      // Call onApprove callback
      onApprove(achievement.id);
    } catch (error: any) {
      console.error('Error approving achievement:', error);
      toast.error(error.message);
    }
  };
  
  // Handle reject achievement
  const handleReject = async () => {
    if (!achievement.id || !onReject) return;
    
    try {
      const response = await fetch(`/api/achievements/${achievement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...achievement,
          is_approved: false
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject achievement');
      }
      
      toast.success('Achievement rejected');
      
      // Call onReject callback
      onReject(achievement.id);
    } catch (error: any) {
      console.error('Error rejecting achievement:', error);
      toast.error(error.message);
    }
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{achievement.title}</CardTitle>
            
            {/* Status badge and actions dropdown */}
            <div className="flex items-center space-x-2">
              {!achievement.is_approved && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending Approval
                </Badge>
              )}
              
              {showControls && canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/achievements/edit/${achievement.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {/* Achievement image */}
          {achievement.image_url && (
            <div className="mb-4">
              <img
                src={achievement.image_url}
                alt={achievement.title}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
          
          {/* Achievement description */}
          <p className="text-gray-700 mb-4">{achievement.description}</p>
          
          {/* Date and URL */}
          <div className="flex flex-col space-y-2 text-sm text-gray-500">
            {formattedDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
            )}
            
            {achievement.url && (
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                <a
                  href={achievement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Related Link
                </a>
              </div>
            )}
          </div>
        </CardContent>
        
        {/* Approval controls for admins/moderators */}
        {showApprovalControls && isAdminOrModerator && !achievement.is_approved && (
          <CardFooter className="border-t pt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Achievement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this achievement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
