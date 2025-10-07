"use client";

console.log("🚀 ProjectList - File loaded and component starting to render");

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Edit, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { projectAPI } from "@/services/api";


const statusColors = {
  PLANNED: "bg-blue-100 text-blue-800",
  Planning: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  "In Progress": "bg-green-100 text-green-800",
  COMPLETING: "bg-yellow-100 text-yellow-800",
  Completing: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  Completed: "bg-gray-100 text-gray-800",
};

export default function ProjectList() {
  console.log("🎯 ProjectList - Function component called");
  const [projects, setProjects] = useState([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  console.log("📋 ProjectList - Component mounted");

  // No auth: load on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const projectForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      budget: "",
      startDate: "",
      endDate: "",
    },
  });

  // removed auth-gated loading

  const loadProjects = async () => {
    console.log("📋 ProjectList - loadProjects called");
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      // Wait a bit to ensure the token is set
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("📋 ProjectList - Making API call to projectAPI.getAll()");
      const res = await projectAPI.getAll();
      console.log("📋 ProjectList - API response:", res);
      setProjects(res?.data || []);
    } catch (error) {
      console.error("📋 ProjectList - Error loading projects:", error);
      console.error("📋 ProjectList - Error response:", error.response);
      console.error("📋 ProjectList - Error status:", error.response?.status);
      console.error("📋 ProjectList - Error data:", error.response?.data);
      setHasError(true);
      setErrorMessage(
        error.response?.data?.message ||
        "Failed to load projects. Please check your connection and try again."
      );
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    if (!projectId) return;
    try { window.localStorage.setItem('lastProjectId', String(projectId)); } catch { }
    navigate(`/projects/${projectId}/overview`);
  };

  const handleUpdateProject = async (data) => {
    try {
      setIsLoading(true);
      const projectData = {
        name: data.name,
        description: data.description,
        location: data.location,
        budget: Number.parseFloat(data.budget),
        startDate: data.startDate,
        plannedEndDate: data.endDate,
        client: selectedProject.client,
      };

      const res = await projectAPI.update(
        selectedProject.projectId,
        projectData
      );
      const updated = res?.data ?? res;
      const updatedProjects = projects.map((project) => {
        const pid = project.projectId ?? project.id;
        return pid === selectedProject.projectId ? updated : project;
      });

      setProjects(updatedProjects);
      setIsUpdateDialogOpen(false);
      setSelectedProject(null);
      projectForm.reset();
    } catch (error) {
      console.error("Error updating project:", error);
      setErrorMessage(
        error.response?.data?.message ||
        "Failed to update project. Please try again."
      );
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (projectToDelete) {
      try {
        setIsLoading(true);
        await projectAPI.delete(projectToDelete.projectId);
        const updatedProjects = projects.filter(
          (project) => project.projectId !== projectToDelete.projectId
        );
        setProjects(updatedProjects);
        setProjectToDelete(null);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting project:", error);
        setErrorMessage(
          error.response?.data?.message ||
          "Failed to delete project. Please try again."
        );
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const openUpdateDialog = (project) => {
    setSelectedProject(project);
    projectForm.reset({
      name: project.name,
      description: project.description,
      location: project.location,
      budget: project.budget?.toString() || "",
      startDate: project.startDate,
      endDate: project.plannedEndDate || project.endDate,
    });
    setIsUpdateDialogOpen(true);
  };

  const resetError = () => {
    setHasError(false);
    setErrorMessage("");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-medium text-gray-900 mb-2">
              Project Listing and Management
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Create, view, and manage your construction projects in one place.
            </p>
          </div>
          <Button
            className="whitespace-nowrap bg-red-500 hover:bg-red-600"
            onClick={() => navigate("/projects/create")}
          >
            Create New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <div className="text-gray-500 text-lg">Loading projects...</div>
            </div>
          ) : hasError ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Unable to load projects
              </h3>
              <p className="text-gray-500 text-center mb-8 max-w-md leading-relaxed">
                {errorMessage}
              </p>
              <Button
                onClick={loadProjects}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 bg-transparent"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </Button>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No projects yet
              </h3>
              <p className="text-gray-500 text-center mb-8 max-w-md leading-relaxed">
                Get started by creating your first construction project. Add
                client details and project information to begin managing your
                work.
              </p>
              <Button
                onClick={() => navigate("/projects/create")}
                className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-6 py-3"
              >
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.projectId || project.id}
                className="hover:cursor-pointer transition-all duration-200 border border-gray-200 hover:border-blue-300 bg-white rounded-xl group overflow-hidden shadow-none h-full"
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-gray-900 text-lg cursor-pointer group-hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                        onClick={() =>
                          handleProjectClick(project.projectId || project.id)
                        }
                      >
                        {project.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 truncate mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      {/* Budget removed as requested */}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpdateDialog(project);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(project);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Project</DialogTitle>
            <DialogDescription>
              Modify the details for {selectedProject?.name}.
            </DialogDescription>
          </DialogHeader>

          <Form {...projectForm}>
            <form
              onSubmit={projectForm.handleSubmit(handleUpdateProject)}
              className="space-y-4"
            >
              <FormField
                control={projectForm.control}
                name="name"
                rules={{ required: "Project name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="location"
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={projectForm.control}
                name="budget"
                rules={{
                  required: "Budget is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Budget must be a number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter budget amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={projectForm.control}
                  name="startDate"
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                )
                              }
                              disabled={(date) => date < new Date("1900-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={projectForm.control}
                  name="endDate"
                  rules={{ required: "End date is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) =>
                                field.onChange(
                                  date ? format(date, "yyyy-MM-dd") : ""
                                )
                              }
                              disabled={(date) => date < new Date("1900-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  Update Project
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
