//TODO : make api calls and remove mock data

import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Check, ChevronsUpDown, FolderOpen, Plus } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ArrowLeft } from "lucide-react"

const mockProjects = [
    {
        id: 1,
        name: "Modern Office Complex",
        description: "A state-of-the-art office building with sustainable design and smart technology integration.",
    },
    {
        id: 2,
        name: "Residential Tower",
        description: "Luxury residential tower with 40 floors and premium amenities for urban living.",
    },
    {
        id: 3,
        name: "Shopping Mall Renovation",
        description: "Complete renovation of existing shopping mall with modern retail spaces and entertainment areas.",
    },
    {
        id: 4,
        name: "Highway Bridge Construction",
        description: "Construction of a new highway bridge to improve transportation infrastructure.",
    },
    {
        id: 5,
        name: "School Campus Expansion",
        description: "Expansion of university campus with new academic buildings and student facilities.",
    },
    {
        id: 6,
        name: "Hospital Wing Addition",
        description: "New medical wing addition with advanced equipment and patient care facilities.",
    }
]

export function ProjectSwitcher() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const currentProjectId = searchParams.get('projectId')

    const selectedProject = mockProjects.find(p => p.id === parseInt(currentProjectId)) || mockProjects[0]

    const handleProjectSelect = (projectId) => {
        if (projectId === 'add-new') {
            navigate('/')
        } else {
            navigate(`/projects?projectId=${projectId}`)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="bg-red-500 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                                <FolderOpen className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">Current Project</span>
                                <span className="text-xs truncate max-w-[120px]">{selectedProject.name}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 bg-white text-gray-900 border-gray-200"
                        align="start"
                    >
                        <DropdownMenuItem
                            key="add-new"
                            onSelect={() => handleProjectSelect('add-new')}
                            className="hover:bg-red-200 focus:bg-red-200 text-gray-900 cursor-pointer"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <div className="flex flex-col">
                                <span className="font-medium">Manage Projects</span>
                                <span className="text-xs text-gray-500">Go back to project list</span>
                            </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-200" />

                        {mockProjects.map((project) => (
                            <DropdownMenuItem
                                key={project.id}
                                onSelect={() => handleProjectSelect(project.id)}
                                className="hover:bg-red-200 focus:bg-red-200 text-gray-900 cursor-pointer p-3"
                            >
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{project.name}</span>
                                        {project.id === selectedProject.id && (
                                            <Check className="h-4 w-4 text-green-400" />
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 line-clamp-2">
                                        {project.description}
                                    </span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
