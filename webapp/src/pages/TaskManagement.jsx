import React, { useState, useEffect } from 'react';
import { taskAPI, projectAPI, employeeAPI } from '../services/api';
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
import { Progress } from '../components/ui/progress';
import { Search, Plus, Edit, Trash2, Calendar, Flag, Users, User, CheckSquare, CheckCircle, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const ASSIGNMENT_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedPriority, setSelectedPriority] = useState('ALL');
    const [selectedProject, setSelectedProject] = useState('ALL');
    const [boardView, setBoardView] = useState(true);
    const [draggingTaskId, setDraggingTaskId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [assigningTask, setAssigningTask] = useState(null);
    const [taskAssignments, setTaskAssignments] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'TODO',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        progressPercent: 0,
        project: null
    });

    const [assignmentData, setAssignmentData] = useState({
        employeeId: '',
        status: 'ASSIGNED',
        dueDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchTasks();
        fetchProjects();
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedProject]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskAPI.getAll();
            setTasks(response.data);
        } catch (error) {
            toast.error('Failed to fetch tasks');
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await projectAPI.getAll();
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll();
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const filterTasks = () => {
        let filtered = tasks;

        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(task => task.status === selectedStatus);
        }

        if (selectedPriority !== 'ALL') {
            filtered = filtered.filter(task => task.priority === selectedPriority);
        }

        if (selectedProject !== 'ALL') {
            filtered = filtered.filter(task => task.project?.projectId === parseInt(selectedProject));
        }

        setFilteredTasks(filtered);
    };

    const tasksByStatus = {
        TODO: filteredTasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
        DONE: filteredTasks.filter(t => t.status === 'DONE'),
    };

    const onDragStart = (ev, task) => {
        ev.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.taskId }));
        setDraggingTaskId(task.taskId);
    };

    const onDropTo = async (ev, status) => {
        ev.preventDefault();
        try {
            const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
            const task = tasks.find(t => t.taskId === data.taskId);
            if (!task || task.status === status) return;
            await taskAPI.update(task.taskId, { ...task, status });
            await fetchTasks();
        } catch (e) { }
        setDraggingTaskId(null);
        setDragOverCol(null);
    };

    const allowDrop = (ev) => ev.preventDefault();
    const allowDropColumn = (col) => (ev) => { ev.preventDefault(); setDragOverCol(col); };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            if (formData.project) {
                await taskAPI.createForProject(formData.project.projectId, formData);
            } else {
                await taskAPI.create(formData);
            }
            toast.success('Task created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchTasks();
        } catch (error) {
            toast.error('Failed to create task');
            console.error('Error creating task:', error);
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await taskAPI.update(editingTask.taskId, formData);
            toast.success('Task updated successfully');
            setIsEditDialogOpen(false);
            setEditingTask(null);
            resetForm();
            fetchTasks();
        } catch (error) {
            toast.error('Failed to update task');
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await taskAPI.delete(taskId);
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            toast.error('Failed to delete task');
            console.error('Error deleting task:', error);
        }
    };

    const openEditDialog = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'MEDIUM',
            status: task.status || 'TODO',
            startDate: task.startDate || new Date().toISOString().split('T')[0],
            dueDate: task.dueDate || '',
            progressPercent: task.progressPercent || 0,
            project: task.project || null
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'MEDIUM',
            status: 'TODO',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            progressPercent: 0,
            project: null
        });
    };

    const resetAssignmentForm = () => {
        setAssignmentData({
            employeeId: '',
            status: 'ASSIGNED',
            dueDate: '',
            notes: ''
        });
    };

    const fetchTaskAssignments = async (taskId) => {
        try {
            const response = await taskAPI.assignments.getByTask(taskId);
            setTaskAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setTaskAssignments([]);
        }
    };

    const handleAssignEmployee = async (e) => {
        e.preventDefault();
        try {
            await taskAPI.assignments.create(
                assigningTask.taskId,
                assignmentData.employeeId,
                {
                    status: assignmentData.status,
                    dueDate: assignmentData.dueDate,
                    notes: assignmentData.notes
                }
            );
            toast.success('Employee assigned successfully');
            resetAssignmentForm();
            fetchTaskAssignments(assigningTask.taskId);
        } catch (error) {
            toast.error('Failed to assign employee');
            console.error('Error assigning employee:', error);
        }
    };

    const handleRemoveAssignment = async (taskId, assignmentId) => {
        try {
            await taskAPI.assignments.delete(taskId, assignmentId);
            toast.success('Assignment removed');
            fetchTaskAssignments(taskId);
        } catch (error) {
            toast.error('Failed to remove assignment');
            console.error('Error removing assignment:', error);
        }
    };

    const openAssignDialog = async (task) => {
        setAssigningTask(task);
        await fetchTaskAssignments(task.taskId);
        setIsAssignDialogOpen(true);
    };

    const getStatsCards = () => {
        const todoCount = tasks.filter(t => t.status === 'TODO').length;
        const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
        const doneCount = tasks.filter(t => t.status === 'DONE').length;

        return [
            { title: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
            { title: 'To Do', value: todoCount, icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
            { title: 'In Progress', value: inProgressCount, icon: PlayCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
            { title: 'Completed', value: doneCount, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' }
        ];
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">Tasks Board</h1>
                        {loading && (
                            <span className="inline-flex items-center text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Syncing
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 mt-1">Plan and track tasks in a board view</p>
                    <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search tasks (title or description)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 shadow-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-2.5 text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="h-10 min-w-[140px] px-4 rounded-full bg-slate-50 text-slate-700 inline-flex items-center justify-center">Total: <span className="ml-1 font-semibold">{tasks.length}</span></span>
                            <span className="h-10 min-w-[140px] px-4 rounded-full bg-blue-50 text-blue-700 inline-flex items-center justify-center">To Do: <span className="ml-1 font-semibold">{tasks.filter(t => t.status === 'TODO').length}</span></span>
                            <span className="h-10 min-w-[140px] px-4 rounded-full bg-orange-50 text-orange-700 inline-flex items-center justify-center">In Progress: <span className="ml-1 font-semibold">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span></span>
                            <span className="h-10 min-w-[140px] px-4 rounded-full bg-green-50 text-green-700 inline-flex items-center justify-center">Completed: <span className="ml-1 font-semibold">{tasks.filter(t => t.status === 'DONE').length}</span></span>
                        </div>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4">
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
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TASK_PRIORITIES.map(priority => (
                                                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
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
                                            {TASK_STATUSES.map(status => (
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Task</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary cards removed per request */}

            {/* Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
                {['TODO', 'IN_PROGRESS', 'DONE'].map((col) => (
                    <div
                        key={col}
                        className={`rounded-md border p-3 bg-gray-50 flex flex-col ${dragOverCol === col ? 'border-red-400' : ''}`}
                        onDragOver={allowDropColumn(col)}
                        onDragLeave={() => setDragOverCol(null)}
                        onDrop={(ev) => onDropTo(ev, col)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{col.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500">{tasksByStatus[col].length}</div>
                        </div>
                        <div className="space-y-3 overflow-auto pr-1">
                            {tasksByStatus[col].map(task => (
                                <div
                                    key={task.taskId}
                                    draggable
                                    onDragStart={(ev) => onDragStart(ev, task)}
                                    onDragEnd={() => setDraggingTaskId(null)}
                                    className={`bg-white rounded-md border p-3 cursor-grab ${draggingTaskId === task.taskId ? 'border-red-400' : 'hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        <Badge variant={task.priority === 'HIGH' ? 'destructive' : task.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                                            <Flag className="h-3 w-3 mr-1" />{task.priority}
                                        </Badge>
                                    </div>
                                    {task.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</div>}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-xs text-gray-500">{task.project?.name || 'No Project'}</div>
                                        <div className="flex items-center text-xs text-gray-500"><Calendar className="h-3 w-3 mr-1" />{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(task)}><Users className="h-4 w-4" /></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                                    <AlertDialogDescription>Are you sure you want to delete "{task.title}"?</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTask(task.taskId)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                            {tasksByStatus[col].length === 0 && (
                                <div className="text-xs text-gray-400">No tasks in this column.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTask} className="space-y-4">
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
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editPriority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TASK_PRIORITIES.map(priority => (
                                            <SelectItem key={priority} value={priority}>{priority}</SelectItem>
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
                                        {TASK_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="editProgress">Progress (%)</Label>
                            <Input
                                id="editProgress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.progressPercent}
                                onChange={(e) => setFormData({ ...formData, progressPercent: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editStartDate">Start Date</Label>
                                <Input
                                    id="editStartDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editDueDate">Due Date</Label>
                                <Input
                                    id="editDueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Task</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manage Task Assignments - {assigningTask?.title}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Current Assignments */}
                        <div>
                            <h4 className="font-medium mb-3">Current Assignments</h4>
                            {taskAssignments.length === 0 ? (
                                <p className="text-gray-500 text-sm">No employees assigned to this task.</p>
                            ) : (
                                <div className="space-y-2">
                                    {taskAssignments.map((assignment) => (
                                        <div key={assignment.assignmentId} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{assignment.employee?.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Status: {assignment.assignmentStatus}
                                                        {assignment.dueDate && ` • Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                                                    </p>
                                                    {assignment.notes && (
                                                        <p className="text-sm text-gray-400 mt-1">{assignment.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveAssignment(assigningTask.taskId, assignment.assignmentId)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-medium mb-3">Assign Employee</h4>
                            <form onSubmit={handleAssignEmployee} className="space-y-4">
                                <div>
                                    <Label htmlFor="employee">Employee</Label>
                                    <Select value={assignmentData.employeeId} onValueChange={(value) => setAssignmentData({ ...assignmentData, employeeId: value })}>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="assignStatus">Status</Label>
                                        <Select value={assignmentData.status} onValueChange={(value) => setAssignmentData({ ...assignmentData, status: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ASSIGNMENT_STATUSES.map(status => (
                                                    <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="assignDueDate">Due Date</Label>
                                        <Input
                                            id="assignDueDate"
                                            type="date"
                                            value={assignmentData.dueDate}
                                            onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="assignNotes">Notes</Label>
                                    <Textarea
                                        id="assignNotes"
                                        value={assignmentData.notes}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, notes: e.target.value })}
                                        rows={2}
                                        placeholder="Additional notes for this assignment..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                        Close
                                    </Button>
                                    <Button type="submit" disabled={!assignmentData.employeeId}>
                                        Assign Employee
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
