import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, MapPin, Edit, Trash2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { projectAPI } from "@/services/api"


const statusColors = {
    "PLANNED": "bg-blue-100 text-blue-800",
    "Planning": "bg-blue-100 text-blue-800",
    "IN_PROGRESS": "bg-green-100 text-green-800",
    "In Progress": "bg-green-100 text-green-800",
    "COMPLETING": "bg-yellow-100 text-yellow-800",
    "Completing": "bg-yellow-100 text-yellow-800",
    "COMPLETED": "bg-gray-100 text-gray-800",
    "Completed": "bg-gray-100 text-gray-800"
}

export default function ProjectList() {
    const [projects, setProjects] = useState([])
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState(null)
    const [projectToDelete, setProjectToDelete] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const navigate = useNavigate()

    const projectForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            location: "",
            budget: "",
            startDate: "",
            endDate: ""
        }
    })

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage("")
            const response = await projectAPI.getAll()
            setProjects(response.data || [])
        } catch (error) {
            console.error('Error loading projects:', error)
            setHasError(true)
            setErrorMessage(error.response?.data?.message || "Failed to load projects. Please check your connection and try again.")
            setProjects([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleProjectClick = (projectId) => {
        navigate(`/projects?projectId=${projectId}`)
    }

    const handleUpdateProject = async (data) => {
        try {
            setIsLoading(true)
            const projectData = {
                name: data.name,
                description: data.description,
                location: data.location,
                budget: parseFloat(data.budget),
                startDate: data.startDate,
                plannedEndDate: data.endDate,
                client: selectedProject.client
            }

            const response = await projectAPI.update(selectedProject.projectId, projectData)
            const updatedProjects = projects.map(project =>
                project.projectId === selectedProject.projectId ? response.data : project
            )

            setProjects(updatedProjects)
            setIsUpdateDialogOpen(false)
            setSelectedProject(null)
            projectForm.reset()
        } catch (error) {
            console.error('Error updating project:', error)
            setErrorMessage(error.response?.data?.message || "Failed to update project. Please try again.")
            setHasError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteProject = async () => {
        if (projectToDelete) {
            try {
                setIsLoading(true)
                await projectAPI.delete(projectToDelete.projectId)
                const updatedProjects = projects.filter(project =>
                    project.projectId !== projectToDelete.projectId
                )
                setProjects(updatedProjects)
                setProjectToDelete(null)
                setIsDeleteDialogOpen(false)
            } catch (error) {
                console.error('Error deleting project:', error)
                setErrorMessage(error.response?.data?.message || "Failed to delete project. Please try again.")
                setHasError(true)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const openDeleteDialog = (project) => {
        setProjectToDelete(project)
        setIsDeleteDialogOpen(true)
    }

    const openUpdateDialog = (project) => {
        setSelectedProject(project)
        projectForm.reset({
            name: project.name,
            description: project.description,
            location: project.location,
            budget: project.budget?.toString() || "",
            startDate: project.startDate,
            endDate: project.plannedEndDate || project.endDate
        })
        setIsUpdateDialogOpen(true)
    }

    const resetError = () => {
        setHasError(false)
        setErrorMessage("")
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen flex flex-col">
            <div className="w-full px-22 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Your Projects</h1>
                    </div>

                    <Button
                        className="flex items-center gap-2 text-white"
                        onClick={() => navigate('/create-project')}
                    >
                        <Plus className="h-4 w-4" />
                        New project
                    </Button>

                    <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Update Project</DialogTitle>
                                <DialogDescription>
                                    Modify the details for {selectedProject?.name}.
                                </DialogDescription>
                            </DialogHeader>

                            <Form {...projectForm}>
                                <form onSubmit={projectForm.handleSubmit(handleUpdateProject)} className="space-y-4">
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
                                                    <Textarea placeholder="Enter project description" {...field} />
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
                                                message: "Budget must be a number"
                                            }
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
                                                                    className="w-full justify-start text-left font-normal"
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
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
                                                                    className="w-full justify-start text-left font-normal"
                                                                >
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {field.value ? format(new Date(field.value), "PPP") : "Pick a date"}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <CalendarComponent
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
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
                                        <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Update Project</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                            <div className="text-gray-500">Loading projects...</div>
                        </div>
                    ) : hasError ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load projects</h3>
                            <p className="text-gray-500 text-center mb-6 max-w-sm">
                                {errorMessage}
                            </p>
                            <Button
                                onClick={loadProjects}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Again
                            </Button>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                            <p className="text-gray-500 text-center mb-6 max-w-sm">
                                Get started by creating your first construction project. Add client details and project information to begin managing your work.
                            </p>
                            <Button
                                onClick={() => navigate('/create-project')}
                                className="flex items-center gap-2 text-white"
                            >
                                <Plus className="h-4 w-4" />
                                Create First Project
                            </Button>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Card
                                key={project.projectId || project.id}
                                className="hover:cursor-pointer transition-all border hover:border-red-400 shadow-none duration-800 bg-white rounded-lg group"
                            >
                                <CardContent className="px-4 ">
                                    {/* Icon and Title */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg
                                                className="w-5 h-5 text-gray-600"
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
                                            <h3 className="font-semibold text-gray-900 text-base mb-1 cursor-pointer group-hover:text-red-600 transition-colors duration-800 text-left"
                                                onClick={() => handleProjectClick(project.projectId || project.id)}>
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                                                    {project.status}
                                                </span>
                                                <span className="text-xs text-gray-500">• {formatDate(project.startDate)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {project.location}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons - always visible */}
                                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-xs h-7 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => handleProjectClick(project.id)}
                                        >
                                            Open Dashboard
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openUpdateDialog(project)
                                            }}
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openDeleteDialog(project)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )))}
                </div>
            </div>
        </div>
    )
}
