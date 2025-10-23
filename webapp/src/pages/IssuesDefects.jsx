import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
import { Search, Plus, Edit, Trash2, Calendar, AlertTriangle, Bug, User, UserCheck, X, CheckCircle, Clock, AlertCircle, XCircle, CircleDot } from 'lucide-react';
import { toast } from 'sonner';

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const ISSUE_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function IssuesDefects() {
    const { projectId } = useParams();
    const [currentProject, setCurrentProject] = useState(null);
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

            // Fetch current project if projectId exists
            if (projectId) {
                const projectRes = await projectAPI.getById(projectId);
                setCurrentProject(projectRes.data);
            }

            const [issuesRes, projectsRes, employeesRes] = await Promise.all([
                projectId ? issueAPI.getByProject(projectId) : issueAPI.getAll(),
                projectAPI.getAll(),
                employeeAPI.getAll()
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
            if (selectedStatus === 'ACTIVE') {
                const activeSet = new Set(['OPEN', 'IN_PROGRESS']);
                filtered = filtered.filter(issue => activeSet.has(issue.status));
            } else if (selectedStatus === 'DONE') {
                const doneSet = new Set(['RESOLVED', 'CLOSED', 'COMPLETED']);
                filtered = filtered.filter(issue => doneSet.has(issue.status));
            } else {
                filtered = filtered.filter(issue => issue.status === selectedStatus);
            }
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
            // Use projectId from URL route params
            if (projectId) {
                await issueAPI.createForProject(projectId, formData);
            } else if (formData.project) {
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
            project: currentProject // Auto-set the current project
        });
    };

    const getStatsCards = () => {
        const openCount = issues.filter(i => i.status === 'OPEN').length;
        const inProgressCount = issues.filter(i => i.status === 'IN_PROGRESS').length;
        const doneStatuses = new Set(['RESOLVED', 'CLOSED', 'COMPLETED']);
        const doneCount = issues.filter(i => doneStatuses.has(i.status)).length;
        const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;

        return [
            { title: 'Open', value: openCount, icon: AlertCircle, color: 'text-green-700', bgColor: 'bg-green-50' },
            { title: 'Done', value: doneCount, icon: CheckCircle, color: 'text-gray-700', bgColor: 'bg-gray-100' },
            { title: 'In Progress', value: inProgressCount, icon: Clock, color: 'text-orange-700', bgColor: 'bg-orange-50' },
            { title: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-rose-700', bgColor: 'bg-rose-50' }
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
                                <Label htmlFor="title" className="mb-2 block">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="description" className="mb-2 block">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="severity" className="mb-2 block">Severity</Label>
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
                                    <Label htmlFor="status" className="mb-2 block">Status</Label>
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
                                <Label htmlFor="attachmentUrl" className="mb-2 block">Attachment URL (Optional)</Label>
                                <Input
                                    id="attachmentUrl"
                                    value={formData.attachmentUrl}
                                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                    placeholder="URL to screenshot or document"
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
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <button onClick={() => setSelectedStatus('OPEN')} className={`px-2 py-1 rounded ${selectedStatus === 'OPEN' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    Open {issues.filter(i => i.status === 'OPEN').length}
                                </button>
                                <button onClick={() => setSelectedStatus('CLOSED')} className={`px-2 py-1 rounded ${selectedStatus === 'CLOSED' ? 'bg-gray-100 text-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}>
                                    Closed {issues.filter(i => i.status === 'CLOSED').length}
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setIsCreateDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />New issue</Button>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input className="pl-9 shadow-none" placeholder="Search issues" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
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
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredIssues.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No issues match your filters.</div>
                    ) : (
                        <div className="divide-y border rounded-md">
                            {filteredIssues.map(issue => (
                                <div key={issue.issueId} className="flex items-start justify-between p-4 hover:bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        {issue.status === 'CLOSED' ? (
                                            <CheckCircle className="h-4 w-4 text-gray-500 mt-1" />
                                        ) : (
                                            <CircleDot className="h-4 w-4 text-green-600 mt-1" />
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-900">{issue.title}</div>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                <Badge variant={issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? 'destructive' : 'default'}>{issue.severity}</Badge>
                                                <span>{issue.project?.name || 'No Project'}</span>
                                                <span>•</span>
                                                <span>Reported {issue.reportedDate ? new Date(issue.reportedDate).toLocaleDateString() : 'N/A'}</span>
                                                {issue.assignedTo && (<><span>•</span><span className="flex items-center"><User className="h-3 w-3 mr-1" />{issue.assignedTo.name}</span></>)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(issue)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(issue)}><UserCheck className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to delete "{issue.title}"?</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteIssue(issue.issueId)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Issue</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateIssue} className="space-y-4">
                        <div>
                            <Label htmlFor="editTitle" className="mb-2 block">Title</Label>
                            <Input
                                id="editTitle"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editDescription" className="mb-2 block">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editSeverity" className="mb-2 block">Severity</Label>
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
                                <Label htmlFor="editStatus" className="mb-2 block">Status</Label>
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
                            <Label htmlFor="editAttachmentUrl" className="mb-2 block">Attachment URL (Optional)</Label>
                            <Input
                                id="editAttachmentUrl"
                                value={formData.attachmentUrl}
                                onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                placeholder="URL to screenshot or document"
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
                            <Label htmlFor="assignEmployee" className="mb-2 block">Assign To</Label>
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
