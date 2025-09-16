import React, { useState, useEffect } from 'react';
import { issueAPI, projectAPI, employeeAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, Edit, Trash2, Calendar, AlertTriangle, Bug, User, UserCheck, X, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function IssuesDefects() {
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredIssues, setFilteredIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedSeverity, setSelectedSeverity] = useState('ALL');
    const [selectedProject, setSelectedProject] = useState('ALL');

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [editingIssue, setEditingIssue] = useState(null);
    const [assigningIssue, setAssigningIssue] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'MEDIUM',
        status: 'OPEN',
        reportedDate: new Date().toISOString().split('T')[0],
        resolvedDate: '',
        attachmentUrl: '',
        project: null
    });

    const [assignData, setAssignData] = useState({
        employeeId: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        filterIssues();
    }, [issues, searchTerm, selectedStatus, selectedSeverity, selectedProject]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [issuesRes, projectsRes, employeesRes] = await Promise.all([
                issueAPI.getAll(),
                projectAPI.getAll(),
                employeeAPI.getActive()
            ]);
            setIssues(issuesRes.data);
            setProjects(projectsRes.data);
            setEmployees(employeesRes.data);
            setFilteredIssues(issuesRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterIssues = () => {
        let filtered = issues;

        if (searchTerm) {
            filtered = filtered.filter(issue =>
                issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(issue => issue.status === selectedStatus);
        }

        if (selectedSeverity !== 'ALL') {
            filtered = filtered.filter(issue => issue.severity === selectedSeverity);
        }

        if (selectedProject !== 'ALL') {
            filtered = filtered.filter(issue => issue.project?.projectId === parseInt(selectedProject));
        }

        setFilteredIssues(filtered);
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        try {
            if (formData.project) {
                await issueAPI.createForProject(formData.project.projectId, formData);
            } else {
                await issueAPI.create(formData);
            }
            toast.success('Issue created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to create issue');
            console.error('Error creating issue:', error);
        }
    };

    const handleUpdateIssue = async (e) => {
        e.preventDefault();
        try {
            await issueAPI.update(editingIssue.issueId, formData);
            toast.success('Issue updated successfully');
            setIsEditDialogOpen(false);
            setEditingIssue(null);
            resetForm();
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to update issue');
            console.error('Error updating issue:', error);
        }
    };

    const handleDeleteIssue = async (issueId) => {
        try {
            await issueAPI.delete(issueId);
            toast.success('Issue deleted successfully');
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to delete issue');
            console.error('Error deleting issue:', error);
        }
    };

    const handleAssignIssue = async (e) => {
        e.preventDefault();
        try {
            await issueAPI.assign(assigningIssue.issueId, assignData.employeeId);
            toast.success('Issue assigned successfully');
            setIsAssignDialogOpen(false);
            setAssigningIssue(null);
            setAssignData({ employeeId: '' });
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to assign issue');
            console.error('Error assigning issue:', error);
        }
    };

    const openEditDialog = (issue) => {
        setEditingIssue(issue);
        setFormData({
            title: issue.title || '',
            description: issue.description || '',
            severity: issue.severity || 'MEDIUM',
            status: issue.status || 'OPEN',
            reportedDate: issue.reportedDate || new Date().toISOString().split('T')[0],
            resolvedDate: issue.resolvedDate || '',
            attachmentUrl: issue.attachmentUrl || '',
            project: issue.project || null
        });
        setIsEditDialogOpen(true);
    };

    const openAssignDialog = (issue) => {
        setAssigningIssue(issue);
        setAssignData({ employeeId: issue.assignedTo?.employeeId || '' });
        setIsAssignDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            severity: 'MEDIUM',
            status: 'OPEN',
            reportedDate: new Date().toISOString().split('T')[0],
            resolvedDate: '',
            attachmentUrl: '',
            project: null
        });
    };

    const getStatsCards = () => {
        const openCount = issues.filter(i => i.status === 'OPEN').length;
        const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS').length;
        const resolvedCount = issues.filter(i => i.status === 'RESOLVED').length;
        const criticalCount = issues.filter(i => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length;

        return [
            { title: 'Total Issues', value: issues.length, icon: Bug, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { title: 'Open', value: openCount, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
            { title: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { title: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-purple-600', bgColor: 'bg-purple-50' }
        ];
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading issues...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Issues & Defects</h1>
                    <p className="text-gray-600 mt-1">Track and manage project issues and defects</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Report Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Report New Issue</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateIssue} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="severity">Severity</Label>
                                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ISSUE_SEVERITIES.map(severity => (
                                                <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ISSUE_STATUSES.map(status => (
                                                <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="project">Project</Label>
                                <Select value={formData.project?.projectId || ''} onValueChange={(value) => {
                                    const project = projects.find(p => p.projectId === parseInt(value));
                                    setFormData({ ...formData, project });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project.projectId} value={project.projectId.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="attachmentUrl">Attachment URL</Label>
                                <Input
                                    id="attachmentUrl"
                                    value={formData.attachmentUrl}
                                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                    placeholder="Optional: URL to screenshot or document"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Report Issue</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

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
                    <CardTitle>Issue List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search issues..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 shadow-none"
                                />
                            </div>
                        </div>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full shadow-none md:w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                {ISSUE_STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                            <SelectTrigger className="w-full shadow-none md:w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Severity</SelectItem>
                                {ISSUE_SEVERITIES.map(severity => (
                                    <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger className="w-full shadow-none md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Projects</SelectItem>
                                {projects.map(project => (
                                    <SelectItem key={project.projectId} value={project.projectId.toString()}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Reported Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIssues.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <Bug className="h-12 w-12 text-gray-400 mb-2" />
                                                <p className="text-gray-500">No issues found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredIssues.map((issue) => (
                                        <TableRow key={issue.issueId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{issue.title}</div>
                                                    {issue.description && (
                                                        <div className="text-sm text-gray-500">
                                                            {issue.description.length > 50 ?
                                                                `${issue.description.substring(0, 50)}...` :
                                                                issue.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {issue.project?.name || 'No Project'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'destructive' : issue.severity === 'MEDIUM' ? 'default' : 'secondary'}>
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    {issue.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={issue.status === 'OPEN' ? 'destructive' : issue.status === 'IN_PROGRESS' ? 'default' : 'outline'}>
                                                    {issue.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {issue.assignedTo ? (
                                                        <>
                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                            {issue.assignedTo.name}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500">Unassigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {issue.reportedDate ? new Date(issue.reportedDate).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(issue)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openAssignDialog(issue)}
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{issue.title}"? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteIssue(issue.issueId)}>
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
                        <DialogTitle>Edit Issue</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateIssue} className="space-y-4">
                        <div>
                            <Label htmlFor="editTitle">Title</Label>
                            <Input
                                id="editTitle"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editSeverity">Severity</Label>
                                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ISSUE_SEVERITIES.map(severity => (
                                            <SelectItem key={severity} value={severity}>{severity}</SelectItem>
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
                                        {ISSUE_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="editAttachmentUrl">Attachment URL</Label>
                            <Input
                                id="editAttachmentUrl"
                                value={formData.attachmentUrl}
                                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                placeholder="Optional: URL to screenshot or document"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Issue</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Issue - {assigningIssue?.title}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAssignIssue} className="space-y-4">
                        <div>
                            <Label htmlFor="assignEmployee">Assign To</Label>
                            <Select value={assignData.employeeId} onValueChange={(value) => setAssignData({ ...assignData, employeeId: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(employee => (
                                        <SelectItem key={employee.employeeId} value={employee.employeeId.toString()}>
                                            {employee.name} - {employee.role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!assignData.employeeId}>
                                Assign Issue
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
