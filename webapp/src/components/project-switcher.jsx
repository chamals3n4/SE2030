//TODO : make api calls and remove mock data

import * as React from "react"
import { Reorder, motion, AnimatePresence } from "motion/react"
import { projectAPI } from "@/services/api"
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

// removed mock; will fetch live

export function ProjectSwitcher() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const currentProjectId = searchParams.get('projectId')
    const [projects, setProjects] = React.useState([])
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await projectAPI.getAll()
                if (!mounted) return
                setProjects(res?.data || [])
            } catch { }
        }
        load()
        return () => { mounted = false }
    }, [])

    const selectedProject = React.useMemo(() => {
        if (!projects.length) return { projectId: 0, name: 'Loading...', description: '' }
        return projects.find(p => p.projectId === parseInt(currentProjectId)) || projects[0]
    }, [projects, currentProjectId])

    const handleProjectSelect = (projectId) => {
        if (projectId === 'add-new') {
            navigate('/')
        } else {
            navigate(`/projects?projectId=${projectId}`)
            setIsOpen(false)
        }
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
                        className="w-64 bg-white text-gray-900 border-gray-200 overflow-hidden"
                        align="start"
                        asChild
                    >
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
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

                            {projects.map((project) => (
                                <DropdownMenuItem
                                    key={project.projectId}
                                    onSelect={() => handleProjectSelect(project.projectId)}
                                    className="hover:bg-red-200 focus:bg-red-200 text-gray-900 cursor-pointer p-3"
                                >
                                    <div className="flex flex-col gap-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{project.name}</span>
                                            {project.projectId === selectedProject.projectId && (
                                                <Check className="h-4 w-4 text-green-400" />
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 line-clamp-2">
                                            {project.description}
                                        </span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </motion.div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
