import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowRight, User, Mail, Phone, Building, MapPin, DollarSign, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { projectAPI, clientAPI } from "@/services/api"

export default function CreateProject() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [createdClient, setCreatedClient] = useState(null)
    const navigate = useNavigate()

    const clientForm = useForm({
        defaultValues: {
            name: "",
            email: "",
            phone: ""
        }
    })

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

    const resetError = () => {
        setHasError(false)
        setErrorMessage("")
    }

    useEffect(() => {
        if (currentStep === 2) {
            setTimeout(() => {
                projectForm.reset({
                    name: "",
                    description: "",
                    location: "",
                    budget: "",
                    startDate: "",
                    endDate: ""
                })
            }, 100)
        }
    }, [currentStep, projectForm])

    const handleCreateClient = async (data) => {
        try {
            setIsLoading(true)
            resetError()

            const name = (data.name || "").trim()
            const email = (data.email || "").trim().toLowerCase()
            const phone = (data.phone || "").trim()

            if (!name) {
                setHasError(true)
                setErrorMessage("Client name is required")
                return
            }

            if (email) {
                try {
                    const existing = await clientAPI.search(email)
                    const matches = Array.isArray(existing.data) ? existing.data : []
                    const duplicate = matches.find(c => (c.email || "").toLowerCase() === email)
                    if (duplicate) {
                        setCreatedClient(duplicate)

                        projectForm.reset({
                            name: "",
                            description: "",
                            location: "",
                            budget: "",
                            startDate: "",
                            endDate: ""
                        })

                        setCurrentStep(2)
                        return
                    }
                } catch (e) {
                    console.warn('Client search failed, proceeding to create', e)
                }
            }

            const response = await clientAPI.create({ name, email, phone })
            setCreatedClient(response.data)

            projectForm.reset({
                name: "",
                description: "",
                location: "",
                budget: "",
                startDate: "",
                endDate: ""
            })

            setCurrentStep(2)
        } catch (error) {
            console.error('Error creating client:', error)
            const msg = error.response?.data?.message || error.response?.data || "Failed to create client. Please check inputs."
            setErrorMessage(msg)
            setHasError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateProject = async (data) => {
        try {
            setIsLoading(true)
            resetError()

            const projectData = {
                name: data.name,
                description: data.description,
                location: data.location,
                budget: parseFloat(data.budget),
                startDate: data.startDate,
                plannedEndDate: data.endDate,
                status: "PLANNED",
                client: {
                    clientId: createdClient.clientId
                }
            }

            await projectAPI.create(projectData)

            navigate('/projects-list')
        } catch (error) {
            console.error('Error creating project:', error)
            setErrorMessage(error.response?.data?.message || "Failed to create project. Please try again.")
            setHasError(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        if (currentStep === 1) {
            navigate('/projects-list')
        } else {
            setCurrentStep(1)
            resetError()
        }
    }

    const handleNextStep = () => {
        setCurrentStep(2)
        resetError()
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Create New Project
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Step {currentStep} of 2: {currentStep === 1 ? 'Client Information' : 'Project Details'}
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {currentStep === 1 ? (
                                <>
                                    <User className="h-5 w-5" />
                                    Client Information
                                </>
                            ) : (
                                <>
                                    <Building className="h-5 w-5" />
                                    Project Details
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1
                                ? "First, let's add the client information for this project."
                                : `Creating project for: ${createdClient?.name}`
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {hasError && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 ? (
                            <Form {...clientForm}>
                                <form onSubmit={clientForm.handleSubmit(handleCreateClient)} className="space-y-4" name="client-form">
                                    <FormField
                                        control={clientForm.control}
                                        name="name"
                                        rules={{ required: "Client name is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Client Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter client name"
                                                            autoComplete="organization"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={clientForm.control}
                                        name="email"
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address"
                                            }
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter email address"
                                                            type="email"
                                                            autoComplete="email"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={clientForm.control}
                                        name="phone"
                                        rules={{ required: "Phone number is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter phone number"
                                                            type="tel"
                                                            autoComplete="tel"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Creating Client..." : "Next"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                            <Form {...projectForm} key={`project-form-${currentStep}`}>
                                <form onSubmit={projectForm.handleSubmit(handleCreateProject)} className="space-y-4" name="project-form" autoComplete="off">
                                    <FormField
                                        control={projectForm.control}
                                        name="name"
                                        rules={{ required: "Project name is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter project name"
                                                            autoComplete="off"
                                                            name="project-name"
                                                            data-form-type="other"
                                                            key={`project-name-${currentStep}`}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={projectForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter project description"
                                                        autoComplete="off"
                                                        name="project-description"
                                                        data-form-type="other"
                                                        key={`project-description-${currentStep}`}
                                                        rows={3}
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
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Location</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter project location"
                                                            autoComplete="off"
                                                            name="project-location"
                                                            data-form-type="other"
                                                            key={`project-location-${currentStep}`}
                                                            {...field}
                                                        />
                                                    </div>
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
                                                value: /^\d+(\.\d{1,2})?$/,
                                                message: "Budget must be a valid number"
                                            }
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget ($)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            className="pl-10"
                                                            placeholder="Enter budget amount"
                                                            type="number"
                                                            autoComplete="off"
                                                            name="project-budget"
                                                            data-form-type="other"
                                                            key={`project-budget-${currentStep}`}
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={projectForm.control}
                                            name="startDate"
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
                                                                    {field.value ? format(new Date(field.value), "PPP") : "Pick start date"}
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
                                                                    {field.value ? format(new Date(field.value), "PPP") : "Pick end date"}
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

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Creating Project..." : "Create Project"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
