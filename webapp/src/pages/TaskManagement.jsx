import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { taskAPI, projectAPI, employeeAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Progress } from '../components/ui/progress';
import { Search, Plus, Edit, Trash2, Calendar, Flag, Users, User, CheckSquare, CheckCircle, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const ASSIGNMENT_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

export default function TaskManagement() {
    const { projectId } = useParams();
    const [currentProject, setCurrentProject] = useState(null);
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

    // Validation states
    const [formErrors, setFormErrors] = useState({});
    const [assignmentErrors, setAssignmentErrors] = useState({});

    useEffect(() => {
        if (projectId) {
            fetchCurrentProject();
        }
        fetchTasks();
        fetchProjects();
        fetchEmployees();
    }, [projectId]);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedProject]);

    const fetchCurrentProject = async () => {
        try {
            const response = await projectAPI.getById(projectId);
            setCurrentProject(response.data);
        } catch (error) {
            toast.error('Failed to fetch project details');
            console.error('Error fetching project:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            // If we have a projectId, fetch tasks for that project only
            if (projectId) {
                const response = await taskAPI.getByProject(projectId);
                setTasks(response.data);
            } else {
                const response = await taskAPI.getAll();
                setTasks(response.data);
            }
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

        if (!validateTaskForm()) {
            return;
        }

        try {
            // Use projectId from URL route params
            if (projectId) {
                await taskAPI.createForProject(projectId, formData);
            } else if (formData.project) {
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

        if (!validateTaskForm()) {
            return;
        }

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
            project: currentProject // Auto-set the current project
        });
        setFormErrors({});
    };

    const resetAssignmentForm = () => {
        setAssignmentData({
            employeeId: '',
            status: 'ASSIGNED',
            dueDate: '',
            notes: ''
        });
        setAssignmentErrors({});
    };

    // Validation functions
    const validateTaskForm = () => {
        const errors = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }

        // Project is now auto-set from context, no validation needed
        // if (!formData.project) {
        //     errors.project = 'Project is required';
        // }

        if (formData.dueDate && formData.startDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
            errors.dueDate = 'Due date must be after start date';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateAssignmentForm = () => {
        const errors = {};

        if (!assignmentData.employeeId) {
            errors.employeeId = 'Employee is required';
        }

        // Check if employee is already assigned to this task
        if (assignmentData.employeeId && taskAssignments.some(ta => ta.employee?.employeeId === parseInt(assignmentData.employeeId))) {
            errors.employeeId = 'This employee is already assigned to this task';
        }

        if (assignmentData.notes && assignmentData.notes.length > 500) {
            errors.notes = 'Notes must be less than 500 characters';
        }

        setAssignmentErrors(errors);
        return Object.keys(errors).length === 0;
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

        if (!validateAssignmentForm()) {
            return;
        }

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
                        <h1 className="text-3xl font-semibold">Tasks Assignment and Management</h1>
                        {loading && (
                            <span className="inline-flex items-center text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Syncing
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 mt-1">

                        Plan and track tasks in a board view

                    </p>
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
                        <Button onClick={resetForm} className="hover:cursor-pointer">
                            Add New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <Label htmlFor="title" className="mb-2 block">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={formErrors.title ? 'border-red-500' : ''}
                                />
                                {formErrors.title && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="description" className="mb-2 block">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="priority" className="mb-2 block">Priority</Label>
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
                                    <Label htmlFor="status" className="mb-2 block">Status</Label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate" className="mb-2 block">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dueDate" className="mb-2 block">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className={formErrors.dueDate ? 'border-red-500' : ''}
                                    />
                                    {formErrors.dueDate && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" className="hover:cursor-pointer" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="hover:cursor-pointer">Create Task</Button>
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
                            <Label htmlFor="editTitle" className="mb-2 block">Title</Label>
                            <Input
                                id="editTitle"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={formErrors.title ? 'border-red-500' : ''}
                            />
                            {formErrors.title && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="editDescription" className="mb-2 block">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editPriority" className="mb-2 block">Priority</Label>
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
                                <Label htmlFor="editStatus" className="mb-2 block">Status</Label>
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
                            <Label htmlFor="editProgress" className="mb-2 block">Progress (%)</Label>
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
                                <Label htmlFor="editStartDate" className="mb-2 block">Start Date</Label>
                                <Input
                                    id="editStartDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="editDueDate" className="mb-2 block">Due Date</Label>
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

            <Sheet open={isAssignDialogOpen} onOpenChange={(open) => {
                setIsAssignDialogOpen(open);
                if (!open) resetAssignmentForm();
            }}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <SheetHeader className="px-6 pt-5 pb-4 border-b">
                        <SheetTitle className="text-xl">Manage Team Assignment</SheetTitle>
                        <SheetDescription>
                            Task: <span className="font-medium">{assigningTask?.title}</span>
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-5 px-6 py-5">
                        {/* Assigned Team Members */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Assigned Team ({taskAssignments.length})
                                </h4>
                            </div>

                            {taskAssignments.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No team members assigned yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Assign employees below to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {taskAssignments.map((assignment) => (
                                        <div key={assignment.assignmentId} className="group flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="mt-0.5">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                                                        {assignment.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-gray-900">{assignment.employee?.name || 'Unknown'}</p>
                                                        <Badge
                                                            variant={
                                                                assignment.assignmentStatus === 'COMPLETED' ? 'default' :
                                                                    assignment.assignmentStatus === 'IN_PROGRESS' ? 'secondary' :
                                                                        'outline'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {assignment.assignmentStatus?.replace('_', ' ') || 'ASSIGNED'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {assignment.employee?.role || 'No role specified'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                        {assignment.assignedDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {assignment.dueDate && (
                                                            <span className="flex items-center gap-1">
                                                                <Flag className="h-3 w-3" />
                                                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {assignment.notes && (
                                                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded border">
                                                            {assignment.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveAssignment(assigningTask.taskId, assignment.assignmentId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Add New Assignment</span>
                            </div>
                        </div>

                        {/* Add New Assignment Form */}
                        <form onSubmit={handleAssignEmployee} className="space-y-4">
                            {/* Employee and Date in one row */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label htmlFor="employee" className="text-sm font-semibold mb-1.5 block">
                                        Select Employee <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={assignmentData.employeeId}
                                        onValueChange={(value) => setAssignmentData({ ...assignmentData, employeeId: value })}
                                    >
                                        <SelectTrigger className={assignmentErrors.employeeId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Choose an employee to assign..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees
                                                .filter(emp => !taskAssignments.some(ta => ta.employee?.employeeId === emp.employeeId))
                                                .map(employee => (
                                                    <SelectItem key={employee.employeeId} value={employee.employeeId.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{employee.name}</span>
                                                            <span className="text-xs text-gray-500">• {employee.role}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            {employees.filter(emp => !taskAssignments.some(ta => ta.employee?.employeeId === emp.employeeId)).length === 0 && (
                                                <SelectItem value="no-employees" disabled>
                                                    All employees are already assigned
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {assignmentErrors.employeeId && (
                                        <p className="text-red-500 text-sm mt-1">{assignmentErrors.employeeId}</p>
                                    )}
                                </div>

                                <div className="w-52">
                                    <Label className="text-sm font-semibold mb-1.5 block">
                                        Due Date (Optional)
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!assignmentData.dueDate && 'text-muted-foreground'} ${assignmentErrors.dueDate ? 'border-red-500' : ''}`}
                                            >
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {assignmentData.dueDate ? (
                                                    format(new Date(assignmentData.dueDate), 'PPP')
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={assignmentData.dueDate ? new Date(assignmentData.dueDate) : undefined}
                                                onSelect={(date) => {
                                                    setAssignmentData({
                                                        ...assignmentData,
                                                        dueDate: date ? format(date, 'yyyy-MM-dd') : ''
                                                    });
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {assignmentErrors.dueDate && (
                                        <p className="text-red-500 text-sm mt-1">{assignmentErrors.dueDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Assignment Status - Full width with increased size */}
                            <div className="max-w-md">
                                <Label htmlFor="assignStatus" className="text-sm font-semibold mb-1.5 block">
                                    Initial Status
                                </Label>
                                <Select
                                    value={assignmentData.status}
                                    onValueChange={(value) => setAssignmentData({ ...assignmentData, status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ASSIGNMENT_STATUSES.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {status.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <Label htmlFor="assignNotes" className="text-sm font-semibold mb-1.5 block">
                                    Notes (Optional)
                                </Label>
                                <Textarea
                                    id="assignNotes"
                                    value={assignmentData.notes}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Add any special instructions or notes for this assignment..."
                                    className={assignmentErrors.notes ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {(assignmentData.notes || '').length}/500 characters
                                </p>
                                {assignmentErrors.notes && (
                                    <p className="text-red-500 text-sm mt-1">{assignmentErrors.notes}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4 mt-1 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAssignDialogOpen(false);
                                        resetAssignmentForm();
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!assignmentData.employeeId || employees.filter(emp => !taskAssignments.some(ta => ta.employee?.employeeId === emp.employeeId)).length === 0}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Assign Employee
                                </Button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
