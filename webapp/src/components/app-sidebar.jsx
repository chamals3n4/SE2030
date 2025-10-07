import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
    FolderOpen,
    Users,
    Package,
    CheckSquare,
    AlertTriangle,
    Banknote
} from "lucide-react"

import { ProjectSwitcher } from "@/components/project-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import WeatherCard from "@/components/WeatherCard"

function buildNav(locationPathname) {
    const match = locationPathname.match(/^\/projects\/([^\/]+)/)
    const currentProjectId = match ? match[1] : null
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('lastProjectId') : null
    const projectId = currentProjectId || stored
    const withPid = (suffix) => projectId ? `/projects/${projectId}${suffix}` : "/projects"

    return [
        { title: "Overview", url: withPid("/overview"), icon: FolderOpen, dynamic: true, requiresProject: true },
        // Workforce moved under Construction; removing from per-project nav
        { title: "Tasks", url: withPid("/tasks"), icon: CheckSquare, dynamic: true, requiresProject: true },
        { title: "Issues", url: withPid("/issues"), icon: AlertTriangle, dynamic: true, requiresProject: true },
        { title: "Finance", url: withPid("/finance"), icon: Banknote, dynamic: true, requiresProject: true },
        { title: "Materials & Equipment", url: withPid("/materials"), icon: Package, dynamic: true, requiresProject: true },
    ]
}

export function AppSidebar({ ...props }) {
    const location = useLocation()

    const navItems = buildNav(location.pathname)

    React.useEffect(() => {
        const match = location.pathname.match(/^\/projects\/([^\/]+)/)
        if (match) {
            try { window.localStorage.setItem('lastProjectId', match[1]) } catch { /* ignore */ }
        }
    }, [location.pathname])

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <ProjectSwitcher />
            </SidebarHeader>
            <SidebarContent className="mt-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const Icon = item.icon
                                let isActive = location.pathname === item.url
                                if (!isActive && item.dynamic) {
                                    const suffix = item.url.replace(/^\/projects\/[^/]+/, "")
                                    if (suffix && location.pathname.endsWith(suffix) && location.pathname.includes("/projects/")) {
                                        isActive = true
                                    }
                                }
                                const hasProject = !!location.pathname.match(/^\/projects\/([^\/]+)/)
                                const disabled = item.dynamic && item.requiresProject && !hasProject
                                console.log(`${item.title}: ${location.pathname} === ${item.url} = ${isActive}`)
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                to={disabled ? '#' : item.url}
                                                onClick={(e) => { if (disabled) e.preventDefault() }}
                                                className={`flex items-center gap-3 w-full p-2 rounded-md !important ${isActive
                                                    ? "!bg-red-500 !text-white hover:!bg-red-600"
                                                    : disabled ? "!text-gray-400 cursor-not-allowed" : "!text-gray-700 hover:!bg-gray-100 hover:!text-gray-900"
                                                    }`}
                                                style={isActive ? {
                                                    backgroundColor: '#ef4444',
                                                    color: 'white'
                                                } : {}}
                                                data-active={isActive}
                                            >
                                                <Icon className={`size-4 ${isActive ? '!text-white' : '!text-gray-600'
                                                    }`}
                                                    style={isActive ? { color: 'white' } : {}} />
                                                {item.title}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                        <WeatherCard />
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
