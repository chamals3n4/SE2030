import React, { useState, useEffect } from 'react';
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
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Phone, MapPin, Calendar, Briefcase, Building2, Shield, Clock } from 'lucide-react';
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
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nic: '',
        phone: '',
        role: '',
        address: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
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
                employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            nic: employee.nic || '',
            phone: employee.phone || '',
            role: employee.role || '',
            address: employee.address || '',
            hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
            status: employee.status || 'ACTIVE'
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
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
                    <CardTitle>Employee List</CardTitle>
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
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
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
                                {filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="h-12 w-12 text-gray-400 mb-2" />
                                                <p className="text-gray-500">No employees found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow key={employee.employeeId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{employee.name || `${employee.firstName} ${employee.lastName}`}</div>
                                                    <div className="text-sm text-gray-500">{employee.firstName} {employee.lastName}</div>
                                                </div>
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
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(employee)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(employee)}
                                                    >
                                                        {employee.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete {employee.name}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteEmployee(employee.employeeId)}>
                                                                    Delete
                                                                </AlertDialogAction>
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
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateEmployee} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editFirstName">First Name</Label>
                                <Input
                                    id="editFirstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="editLastName">Last Name</Label>
                                <Input
                                    id="editLastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
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
