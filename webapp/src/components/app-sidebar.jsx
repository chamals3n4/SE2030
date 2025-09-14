import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import {
    FolderOpen,
    Users,
    Package,
    ShoppingCart,
    CheckSquare,
    AlertTriangle
} from "lucide-react"

import { VersionSwitcher } from "@/components/version-switcher"
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

// This is sample data.
const data = {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
        { title: "Projects", url: "/projects", icon: FolderOpen },
        { title: "Workforce", url: "/workforce", icon: Users },
        { title: "Materials & Equipment", url: "/materials-equipment", icon: Package },
        { title: "Suppliers & Procurement", url: "/suppliers-procurement", icon: ShoppingCart },
        { title: "Task Management", url: "/task-management", icon: CheckSquare },
        { title: "Issues & Defects", url: "/issues-defects", icon: AlertTriangle },
    ],
}

export function AppSidebar({ ...props }) {
    const location = useLocation()

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <VersionSwitcher
                    versions={data.versions}
                    defaultVersion={data.versions[0]}
                />
            </SidebarHeader>
            <SidebarContent className="mt-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navMain.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.url
                                console.log(`${item.title}: ${location.pathname} === ${item.url} = ${isActive}`)
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                to={item.url}
                                                className={`flex items-center gap-3 w-full p-2 rounded-md !important ${isActive
                                                    ? "!bg-red-500 !text-white hover:!bg-red-600"
                                                    : "!text-gray-700 hover:!bg-gray-100 hover:!text-gray-900"
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
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
