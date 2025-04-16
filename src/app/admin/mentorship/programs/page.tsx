"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, PencilIcon, TrashIcon, PlusCircleIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";

interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'upcoming';
  created_at: string;
  updated_at: string;
}

export default function MentorshipProgramsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [currentTab, setCurrentTab] = useState("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<MentorshipProgram | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<'active' | 'completed' | 'upcoming'>('active');
  
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
        fetchPrograms();
      } catch (error: any) {
        console.error('Error checking admin status:', error.message);
        toast.error('An error occurred while checking permissions');
      }
    }

    checkAdminStatus();
  }, [user, router, supabase]);

  // Fetch mentorship programs
  async function fetchPrograms() {
    try {
      const { data, error } = await supabase
        .from('mentorship_programs')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching programs:', error.message);
      toast.error('Failed to load mentorship programs');
    } finally {
      setIsLoading(false);
    }
  }

  // Create new program
  async function createProgram() {
    if (!title || !description || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newProgram = {
        title,
        description,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status
      };

      const { data, error } = await supabase
        .from('mentorship_programs')
        .insert(newProgram)
        .select()
        .single();

      if (error) throw error;

      setPrograms([data, ...programs]);
      toast.success('Mentorship program created successfully');
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating program:', error.message);
      toast.error('Failed to create mentorship program');
    }
  }

  // Update program
  async function updateProgram() {
    if (!selectedProgram || !title || !description || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedProgram = {
        title,
        description,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status
      };

      const { error } = await supabase
        .from('mentorship_programs')
        .update(updatedProgram)
        .eq('id', selectedProgram.id);

      if (error) throw error;

      // Update local state
      setPrograms(programs.map(program => 
        program.id === selectedProgram.id 
          ? { ...program, ...updatedProgram }
          : program
      ));

      toast.success('Mentorship program updated successfully');
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating program:', error.message);
      toast.error('Failed to update mentorship program');
    }
  }

  // Delete program
  async function deleteProgram() {
    if (!selectedProgram) return;

    try {
      const { error } = await supabase
        .from('mentorship_programs')
        .delete()
        .eq('id', selectedProgram.id);

      if (error) throw error;

      // Update local state
      setPrograms(programs.filter(program => program.id !== selectedProgram.id));
      toast.success('Mentorship program deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Error deleting program:', error.message);
      toast.error('Failed to delete mentorship program');
    }
  }

  // Reset form
  function resetForm() {
    setTitle("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus('active');
  }

  // Open edit dialog with program data
  function openEditDialog(program: MentorshipProgram) {
    setSelectedProgram(program);
    setTitle(program.title);
    setDescription(program.description);
    setStartDate(new Date(program.start_date));
    setEndDate(new Date(program.end_date));
    setStatus(program.status);
    setIsEditDialogOpen(true);
  }

  // Filter programs based on current tab
  const filteredPrograms = programs.filter(program => program.status === currentTab);

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
        <h1 className="text-3xl font-bold">Mentorship Programs Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Create New Program
        </Button>
      </div>

      <Tabs defaultValue="active" onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {renderProgramsList(filteredPrograms, "active")}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {renderProgramsList(filteredPrograms, "upcoming")}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {renderProgramsList(filteredPrograms, "completed")}
        </TabsContent>
      </Tabs>

      {/* Add Program Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Mentorship Program</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderProgramForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsAddDialogOpen(false);
            }}>Cancel</Button>
            <Button onClick={createProgram}>Create Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Mentorship Program</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderProgramForm()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>Cancel</Button>
            <Button onClick={updateProgram}>Update Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the program "{selectedProgram?.title}"?</p>
            <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteProgram}>Delete Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderProgramsList(programs: MentorshipProgram[], status: string) {
    if (programs.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No {status} mentorship programs found.</p>
          </CardContent>
        </Card>
      );
    }

    return programs.map(program => (
      <Card key={program.id} className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{program.title}</CardTitle>
              <CardDescription className="mt-2">
                <Badge>{program.status}</Badge>
                <span className="ml-4 text-sm">
                  {format(new Date(program.start_date), "MMM d, yyyy")} - {format(new Date(program.end_date), "MMM d, yyyy")}
                </span>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={() => openEditDialog(program)}>
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => {
                setSelectedProgram(program);
                setIsDeleteDialogOpen(true);
              }}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p>{program.description}</p>
        </CardContent>
      </Card>
    ));
  }

  function renderProgramForm() {
    return (
      <>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Program Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter program title" 
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter program description" 
              rows={4} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={startDate} 
                    onSelect={setStartDate} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar 
                    mode="single" 
                    selected={endDate} 
                    onSelect={setEndDate} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <select 
              id="status" 
              value={status} 
              onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'upcoming')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </>
    );
  }
} 