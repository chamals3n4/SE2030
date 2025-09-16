// TODO : fetch real data

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    Building,
    Activity,
    Eye,
    FileText,
    MapPin
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Mock data for projects - should match ProjectList data
const mockProjects = [
    {
        id: 1,
        name: "Modern Office Complex",
        description: "A state-of-the-art office building with sustainable design and smart technology integration.",
        location: "Downtown Business District",
        budget: 2500000,
        startDate: "2024-01-15",
        endDate: "2024-12-30",
        status: "In Progress",
        teamSize: 25,
        progress: 65,
        spent: 1625000,
        manager: "John Smith",
        priority: "High"
    },
    {
        id: 2,
        name: "Residential Tower",
        description: "Luxury residential tower with 40 floors and premium amenities for urban living.",
        location: "Metro City Center",
        budget: 5200000,
        startDate: "2024-03-01",
        endDate: "2025-08-15",
        status: "Planning",
        teamSize: 45,
        progress: 15,
        spent: 780000,
        manager: "Sarah Johnson",
        priority: "Medium"
    },
    {
        id: 3,
        name: "Shopping Mall Renovation",
        description: "Complete renovation of existing shopping mall with modern retail spaces and entertainment areas.",
        location: "Suburban Mall District",
        budget: 1800000,
        startDate: "2023-10-01",
        endDate: "2024-06-30",
        status: "Completing",
        teamSize: 18,
        progress: 85,
        spent: 1530000,
        manager: "Mike Wilson",
        priority: "High"
    },
    {
        id: 4,
        name: "Highway Bridge Construction",
        description: "Construction of a new highway bridge to improve transportation infrastructure.",
        location: "Interstate Route 45",
        budget: 8500000,
        startDate: "2024-05-01",
        endDate: "2026-03-30",
        status: "In Progress",
        teamSize: 60,
        progress: 30,
        spent: 2550000,
        manager: "Emily Davis",
        priority: "Critical"
    },
    {
        id: 5,
        name: "School Campus Expansion",
        description: "Expansion of university campus with new academic buildings and student facilities.",
        location: "University District",
        budget: 4200000,
        startDate: "2024-02-15",
        endDate: "2025-01-30",
        status: "In Progress",
        teamSize: 35,
        progress: 45,
        spent: 1890000,
        manager: "David Brown",
        priority: "Medium"
    },
    {
        id: 6,
        name: "Hospital Wing Addition",
        description: "New medical wing addition with advanced equipment and patient care facilities.",
        location: "Medical Center",
        budget: 6800000,
        startDate: "2024-04-01",
        endDate: "2025-09-30",
        status: "Planning",
        teamSize: 42,
        progress: 10,
        spent: 680000,
        manager: "Lisa Chen",
        priority: "High"
    }
]

// Mock project-specific activities
const getProjectActivities = (projectId) => {
    const activities = {
        1: [
            { id: 1, activity: "Foundation work completed", user: "John Smith", time: "2 hours ago", type: "completion" },
            { id: 2, activity: "Concrete delivery scheduled", user: "John Smith", time: "1 day ago", type: "milestone" },
            { id: 3, activity: "Safety inspection passed", user: "Safety Inspector", time: "3 days ago", type: "completion" },
            { id: 4, activity: "Material order approved", user: "John Smith", time: "5 days ago", type: "update" },
        ],
        2: [
            { id: 1, activity: "Permit approval received", user: "Sarah Johnson", time: "1 day ago", type: "milestone" },
            { id: 2, activity: "Architectural review completed", user: "Sarah Johnson", time: "3 days ago", type: "completion" },
            { id: 3, activity: "Budget allocation approved", user: "Finance Team", time: "1 week ago", type: "update" },
        ],
        3: [
            { id: 1, activity: "Final inspection scheduled", user: "Mike Wilson", time: "4 hours ago", type: "milestone" },
            { id: 2, activity: "Electrical work completed", user: "Mike Wilson", time: "1 day ago", type: "completion" },
            { id: 3, activity: "Flooring installation finished", user: "Mike Wilson", time: "3 days ago", type: "completion" },
        ]
    }
    return activities[projectId] || []
}

// Mock project-specific tasks
const getProjectTasks = (projectId) => {
    const tasks = {
        1: [
            { id: 1, name: "Foundation work", status: "Completed", assignee: "Construction Team A", dueDate: "2024-02-15", priority: "High" },
            { id: 2, name: "Steel framework", status: "In Progress", assignee: "Construction Team B", dueDate: "2024-03-20", priority: "High" },
            { id: 3, name: "Electrical wiring", status: "Pending", assignee: "Electrical Team", dueDate: "2024-04-10", priority: "Medium" },
            { id: 4, name: "Plumbing installation", status: "Pending", assignee: "Plumbing Team", dueDate: "2024-04-15", priority: "Medium" },
        ],
        2: [
            { id: 1, name: "Site preparation", status: "Completed", assignee: "Site Team", dueDate: "2024-03-10", priority: "High" },
            { id: 2, name: "Permit processing", status: "In Progress", assignee: "Legal Team", dueDate: "2024-04-01", priority: "Critical" },
            { id: 3, name: "Design finalization", status: "In Progress", assignee: "Design Team", dueDate: "2024-04-15", priority: "High" },
        ],
        3: [
            { id: 1, name: "Interior renovation", status: "Completed", assignee: "Interior Team", dueDate: "2024-05-20", priority: "High" },
            { id: 2, name: "HVAC installation", status: "Completed", assignee: "HVAC Team", dueDate: "2024-05-25", priority: "Medium" },
            { id: 3, name: "Final inspection", status: "In Progress", assignee: "Quality Team", dueDate: "2024-06-01", priority: "Critical" },
        ]
    }
    return tasks[projectId] || []
}

const statusColors = {
    "Planning": "bg-blue-100 text-blue-800",
    "In Progress": "bg-green-100 text-green-800",
    "Completing": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-gray-100 text-gray-800",
    "On Hold": "bg-red-100 text-red-800"
}

const priorityColors = {
    "Low": "bg-gray-100 text-gray-800",
    "Medium": "bg-blue-100 text-blue-800",
    "High": "bg-orange-100 text-orange-800",
    "Critical": "bg-red-100 text-red-800"
}

export default function Projects() {
    const [searchParams] = useSearchParams()
    const [selectedProject, setSelectedProject] = useState(null)

    useEffect(() => {
        const projectId = searchParams.get('projectId')
        if (projectId) {
            const project = mockProjects.find(p => p.id === parseInt(projectId))
            setSelectedProject(project)
        } else {
            // Default to first project if no ID specified
            setSelectedProject(mockProjects[0])
        }
    }, [searchParams])

    if (!selectedProject) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-900">No Project Selected</h2>
                    <p className="text-gray-600 mt-2">Please select a project from the project list.</p>
                    <Link to="/">
                        <Button className="mt-4 bg-red-500 hover:bg-red-600">
                            Go to Project List
                        </Button>
                    </Link>
                </div>
            </div>
        )
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
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getActivityIcon = (type) => {
        switch (type) {
            case 'completion':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'issue':
                return <AlertTriangle className="h-4 w-4 text-red-500" />
            case 'milestone':
                return <Calendar className="h-4 w-4 text-blue-500" />
            default:
                return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    const calculateDaysRemaining = () => {
        const endDate = new Date(selectedProject.endDate)
        const today = new Date()
        const diffTime = endDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    const projectActivities = getProjectActivities(selectedProject.id)
    const projectTasks = getProjectTasks(selectedProject.id)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h1>
                    <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[selectedProject.status]}`}>
                        {selectedProject.status}
                    </span>
                    <Button className="bg-red-500 hover:bg-red-600">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Project Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{selectedProject.progress}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${selectedProject.progress}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(selectedProject.budget)}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(selectedProject.spent)} spent ({Math.round((selectedProject.spent / selectedProject.budget) * 100)}%)
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{selectedProject.teamSize}</div>
                        <p className="text-xs text-muted-foreground">
                            Active members
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{calculateDaysRemaining()}</div>
                        <p className="text-xs text-muted-foreground">
                            Until completion
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Project Details and Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Information */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-gray-600">{selectedProject.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-gray-600">
                                    {formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Project Manager</p>
                                <p className="text-sm text-gray-600">{selectedProject.manager}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Activity className="h-5 w-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium">Priority</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedProject.priority]}`}>
                                    {selectedProject.priority}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates for this project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {projectActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.activity}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {activity.user}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Overview */}
                <Card className="shadow-none">
                    <CardHeader>
                        <CardTitle>Budget Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Budget</span>
                            <span className="text-sm font-bold">{formatCurrency(selectedProject.budget)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Amount Spent</span>
                            <span className="text-sm">{formatCurrency(selectedProject.spent)}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.round((selectedProject.spent / selectedProject.budget) * 100)}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Remaining</span>
                            <span className="text-sm font-bold text-green-600">
                                {formatCurrency(selectedProject.budget - selectedProject.spent)}
                            </span>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">
                                    {Math.round((selectedProject.spent / selectedProject.budget) * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">Budget Utilized</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Table */}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>Current tasks and their status for {selectedProject.name}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Priority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projectTasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.name}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm">{task.assignee}</TableCell>
                                    <TableCell className="text-sm">{formatDate(task.dueDate)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                                            {task.priority}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
