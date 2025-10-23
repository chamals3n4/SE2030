"use client";

console.log("🚀 ProjectList - File loaded and component starting to render");

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Edit, Trash2, CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [projects, setProjects] = useState([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


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


  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await projectAPI.getAll();
      setProjects(res?.data || []);
    } catch (error) {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8 sm:mb-6 space-y-6">
          <h1 className="text-3xl mb-4 font-semibold tracking-tight">
            Projects Management
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search projects by name, location, or client..."
                className="pl-12 h-12 text-base w-full"
              />
            </div>

            <div className="flex-shrink-0">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 hover:cursor-pointer text-white"
                onClick={() => navigate("/projects/create")}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Project
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                Get started by creating your first construction project.
              </p>
              <Button
                onClick={() => navigate("/projects/create")}
                className="flex items-center gap-2 text-white hover:cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-3"
              >
                <Plus className="h-4 w-4" />
                Create First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.projectId || project.id}
                className="hover:cursor-pointer transition-all duration-200 border-2 border-red-400 hover:border-red-500 hover:shadow-lg bg-white rounded-lg group overflow-hidden"
                onClick={() => handleProjectClick(project.projectId || project.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-red-600 transition-colors duration-200 line-clamp-2 flex-1">
                      {project.name}
                    </h3>
                    {project.status && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[project.status] || "bg-gray-100 text-gray-800"}`}>
                        {project.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-4">
                    {project.client?.name && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Client:</span> {project.client.name}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{project.location || "No location"}</span>
                    </div>

                    {project.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">{formatCurrency(project.budget)}</span>
                      </div>
                    )}

                    {(project.startDate || project.plannedEndDate) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {project.startDate ? formatDate(project.startDate) : "N/A"} → {project.plannedEndDate ? formatDate(project.plannedEndDate) : "N/A"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-sm bg-transparent hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUpdateDialog(project);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(project);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
                  <FormItem className="space-y-2">
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
                  <FormItem className="space-y-2">
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
                  <FormItem className="space-y-2">
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
                  <FormItem className="space-y-2">
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
                    <FormItem className="space-y-2">
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
                    <FormItem className="space-y-2">
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
                <Button type="submit" className="bg-blue-500 hover:cursor-pointer hover:bg-blue-600">
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
