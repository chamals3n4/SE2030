import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { useAuth } from '@/hooks/use-auth';
import { employeeAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Phone, MapPin, Calendar, Briefcase, Building2, Shield, Clock, LayoutGrid, List, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
    'Project Manager',
    'Construction Engineer',
    'Site Supervisor',
    'Safety Officer',
    'Quality Controller',
    'Equipment Operator',
    'Technician',
    'Laborer',
    'Architect',
    'Surveyor',
    'Administrative Assistant',
    'HR Officer',
    'Accountant',
    'Other'
];

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];

export default function Workforce() {
    const { state } = useAuthContext();
    useAuth();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileEmployee, setProfileEmployee] = useState(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nic: '',
        phone: '',
        role: '',
        address: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    useEffect(() => {
        const init = async () => {
            try {
                if (state.isLoading || !state.isAuthenticated) return;
                // small delay to ensure token is applied by useAuth()
                await new Promise(res => setTimeout(res, 100));
                await fetchEmployees();
            } finally {
                // keep loading state driven by fetchEmployees
            }
        };
        init();
    }, [state.isLoading, state.isAuthenticated]);

    useEffect(() => {
        filterEmployees();
        setPage(1);
        setSelectedIds(new Set());
    }, [employees, searchTerm, selectedStatus, selectedRole]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            toast.error('Failed to fetch employees');
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(employee =>
                employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(employee => employee.status === selectedStatus);
        }

        if (selectedRole !== 'ALL') {
            filtered = filtered.filter(employee => employee.role === selectedRole);
        }

        setFilteredEmployees(filtered);
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try {
            await employeeAPI.create(formData);
            toast.success('Employee created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to create employee');
            console.error('Error creating employee:', error);
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        try {
            await employeeAPI.update(editingEmployee.employeeId, formData);
            toast.success('Employee updated successfully');
            setIsEditDialogOpen(false);
            setEditingEmployee(null);
            resetForm();
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to update employee');
            console.error('Error updating employee:', error);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            await employeeAPI.delete(employeeId);
            toast.success('Employee deleted successfully');
            setIsProfileOpen(false);
            setProfileEmployee(null);
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to delete employee');
            console.error('Error deleting employee:', error);
        }
    };

    const handleToggleStatus = async (employee) => {
        try {
            if (employee.status === 'ACTIVE') {
                await employeeAPI.deactivate(employee.employeeId);
                toast.success('Employee deactivated');
            } else {
                await employeeAPI.activate(employee.employeeId);
                toast.success('Employee activated');
            }
            fetchEmployees();
        } catch (error) {
            toast.error('Failed to update employee status');
            console.error('Error updating status:', error);
        }
    };

    const openEditDialog = (employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name || '',
            nic: employee.nic || '',
            phone: employee.phone || '',
            role: employee.role || '',
            address: employee.address || '',
            hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
            status: employee.status || 'ACTIVE'
        });
        setIsEditDialogOpen(true);
    };

    const openProfile = (employee) => {
        setProfileEmployee(employee);
        setIsProfileOpen(true);
    };

    const toggleSelected = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAllCurrentPage = (ids) => {
        const allSelected = ids.every(id => selectedIds.has(id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => {
                if (allSelected) next.delete(id); else next.add(id);
            });
            return next;
        });
    };

    const performBulk = async (action) => {
        try {
            const ids = Array.from(selectedIds);
            if (ids.length === 0) return;
            if (action === 'delete') {
                await Promise.all(ids.map(id => employeeAPI.delete(id)));
                toast.success('Selected employees deleted');
            } else if (action === 'activate') {
                await Promise.all(ids.map(id => employeeAPI.activate(id)));
                toast.success('Selected employees activated');
            } else if (action === 'deactivate') {
                await Promise.all(ids.map(id => employeeAPI.deactivate(id)));
                toast.success('Selected employees deactivated');
            }
            setSelectedIds(new Set());
            fetchEmployees();
        } catch (e) {
            toast.error('Bulk action failed');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            nic: '',
            phone: '',
            role: '',
            address: '',
            hireDate: new Date().toISOString().split('T')[0],
            status: 'ACTIVE'
        });
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'default';
            case 'INACTIVE': return 'secondary';
            case 'ON_LEAVE': return 'outline';
            case 'TERMINATED': return 'destructive';
            default: return 'secondary';
        }
    };

    const getStatsCards = () => {
        const activeCount = employees.filter(e => e.status === 'ACTIVE').length;
        const inactiveCount = employees.filter(e => e.status === 'INACTIVE').length;
        const onLeaveCount = employees.filter(e => e.status === 'ON_LEAVE').length;

        return [
            { title: 'Total Employees', value: employees.length, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { title: 'Active', value: activeCount, icon: Shield, color: 'text-green-600', bgColor: 'bg-green-50' },
            { title: 'Inactive', value: inactiveCount, icon: UserX, color: 'text-red-600', bgColor: 'bg-red-50' },
            { title: 'On Leave', value: onLeaveCount, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' }
        ];
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading employees...</div>
                </div>
            </div>
        );
    }

    // sort, paginate derived data
    const sorted = [...filteredEmployees].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        const av = (a[sortBy] || '').toString().toLowerCase();
        const bv = (b[sortBy] || '').toString().toLowerCase();
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
    });
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);
    const currentIds = pageItems.map(e => e.employeeId);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Workforce Management</h1>
                    <p className="text-gray-600 mt-1">Manage your team members and workforce</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="nic">NIC</Label>
                                <Input
                                    id="nic"
                                    value={formData.nic}
                                    onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="hireDate">Hire Date</Label>
                                <Input
                                    id="hireDate"
                                    type="date"
                                    value={formData.hireDate}
                                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Employee</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getStatsCards().map((stat, index) => (
                    <Card key={index} className="shadow-none">
                        <CardContent className="px-3 py-1">
                            <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-none">
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle>Employee Directory</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
                                <LayoutGrid className="h-4 w-4 mr-1" /> Grid
                            </Button>
                            <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
                                <List className="h-4 w-4 mr-1" /> Table
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 shadow-none"
                                />
                            </div>
                        </div>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full shadow-none md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                {STATUS_OPTIONS.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full shadow-none md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full shadow-none md:w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Sort: Name</SelectItem>
                                    <SelectItem value="role">Sort: Role</SelectItem>
                                    <SelectItem value="status">Sort: Status</SelectItem>
                                    <SelectItem value="hireDate">Sort: Hire Date</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                                {sortDir === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Bulk actions and pagination header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {selectedIds.size > 0 && (
                                <>
                                    <span className="text-sm text-gray-600">Selected: {selectedIds.size}</span>
                                    <Button size="sm" variant="outline" onClick={() => performBulk('activate')}>Activate</Button>
                                    <Button size="sm" variant="outline" onClick={() => performBulk('deactivate')}>Deactivate</Button>
                                    <Button size="sm" variant="outline" onClick={() => performBulk('delete')}>Delete</Button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">{start + 1}-{Math.min(start + pageSize, total)} of {total}</span>
                            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[8, 12, 24, 48].map(n => (
                                        <SelectItem key={n} value={n.toString()}>{n} / page</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pageItems.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-500">No employees match your filters.</div>
                            ) : (
                                pageItems.map((employee) => (
                                    <div key={employee.employeeId} className="border rounded-lg p-4 hover:shadow-sm transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                                                    {(employee.name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{employee.name}</div>
                                                    <div className="text-xs text-gray-500">{employee.nic}</div>
                                                </div>
                                            </div>
                                            <input type="checkbox" checked={selectedIds.has(employee.employeeId)} onChange={(e) => { e.stopPropagation(); toggleSelected(employee.employeeId); }} />
                                        </div>
                                        <div className="mt-3 flex items-center text-sm text-gray-600"><Briefcase className="h-3.5 w-3.5 mr-2 text-gray-400" />{employee.role || '—'}</div>
                                        <div className="mt-1 flex items-center text-sm text-gray-600"><Phone className="h-3.5 w-3.5 mr-2 text-gray-400" />{employee.phone || '—'}</div>
                                        {employee.address && (
                                            <div className="mt-1 flex items-center text-xs text-gray-500"><MapPin className="h-3 w-3 mr-1 text-gray-400" />{employee.address.length > 40 ? `${employee.address.substring(0, 40)}...` : employee.address}</div>
                                        )}
                                        <div className="mt-3 flex items-center justify-between">
                                            <Badge variant={getStatusBadgeVariant(employee.status)}>{employee.status}</Badge>
                                            <div className="flex items-center text-xs text-gray-500"><Calendar className="h-3 w-3 mr-1" />{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}</div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openProfile(employee)}>View</Button>
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="outline" size="sm" onClick={() => handleToggleStatus(employee)}>{employee.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                                        <AlertDialogDescription>Are you sure you want to delete {employee.name}? This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteEmployee(employee.employeeId)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input type="checkbox" checked={currentIds.every(id => selectedIds.has(id)) && currentIds.length > 0} onChange={() => toggleSelectAllCurrentPage(currentIds)} />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>NIC</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Hire Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pageItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users className="h-12 w-12 text-gray-400 mb-2" />
                                                    <p className="text-gray-500">No employees found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pageItems.map((employee) => (
                                            <TableRow key={employee.employeeId} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <input type="checkbox" checked={selectedIds.has(employee.employeeId)} onChange={(e) => { e.stopPropagation(); toggleSelected(employee.employeeId); }} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{employee.name}</div>
                                                </TableCell>
                                                <TableCell>{employee.nic}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                                        {employee.role}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {employee.phone && (
                                                            <div className="flex items-center text-sm">
                                                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                                {employee.phone}
                                                            </div>
                                                        )}
                                                        {employee.address && (
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                                {employee.address.length > 30 ? `${employee.address.substring(0, 30)}...` : employee.address}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                        {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(employee.status)}>
                                                        {employee.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button variant="outline" size="sm" onClick={() => openProfile(employee)}>View</Button>
                                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(employee)}>{employee.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                                                    <AlertDialogDescription>Are you sure you want to delete {employee.name}? This action cannot be undone.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteEmployee(employee.employeeId)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Employee Profile</DialogTitle>
                    </DialogHeader>
                    {profileEmployee && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-base font-semibold text-gray-700">
                                    {(profileEmployee.name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-semibold">{profileEmployee.name}</div>
                                            <div className="text-sm text-gray-500">{profileEmployee.nic}</div>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(profileEmployee.status)}>{profileEmployee.status}</Badge>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center text-gray-700"><Briefcase className="h-4 w-4 mr-2 text-gray-400" />{profileEmployee.role || '—'}</div>
                                        <div className="flex items-center text-gray-700"><Phone className="h-4 w-4 mr-2 text-gray-400" />{profileEmployee.phone || '—'}</div>
                                        <div className="flex items-center text-gray-700"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{profileEmployee.hireDate ? new Date(profileEmployee.hireDate).toLocaleDateString() : 'N/A'}</div>
                                        {profileEmployee.address && <div className="flex items-center text-gray-700"><MapPin className="h-4 w-4 mr-2 text-gray-400" />{profileEmployee.address}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setIsProfileOpen(false); openEditDialog(profileEmployee); }}>Edit</Button>
                                <Button variant="outline" onClick={() => handleToggleStatus(profileEmployee)}>{profileEmployee.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateEmployee} className="space-y-4">
                        <div>
                            <Label htmlFor="editName">Full Name</Label>
                            <Input
                                id="editName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editNic">NIC</Label>
                            <Input
                                id="editNic"
                                value={formData.nic}
                                onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editPhone">Phone</Label>
                            <Input
                                id="editPhone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="editRole">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="editStatus">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="editAddress">Address</Label>
                            <Textarea
                                id="editAddress"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="editHireDate">Hire Date</Label>
                            <Input
                                id="editHireDate"
                                type="date"
                                value={formData.hireDate}
                                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Employee</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
