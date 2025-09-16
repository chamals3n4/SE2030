import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (projectData) => api.post('/projects', projectData),
    update: (id, projectData) => api.put(`/projects/${id}`, projectData),
    delete: (id) => api.delete(`/projects/${id}`),
    getByClient: (clientId) => api.get(`/projects/by-client/${clientId}`),
    getByStatus: (status) => api.get(`/projects/status/${status}`),
    search: (query) => api.get(`/projects/search?q=${encodeURIComponent(query)}`),
};

export const clientAPI = {
    getAll: () => api.get('/clients'),
    getById: (id) => api.get(`/clients/${id}`),
    create: (clientData) => api.post('/clients', clientData),
    update: (id, clientData) => api.put(`/clients/${id}`, clientData),
    delete: (id) => api.delete(`/clients/${id}`),
    search: (query) => api.get(`/clients/search?q=${encodeURIComponent(query)}`),
};

export const employeeAPI = {
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    create: (employeeData) => api.post('/employees', employeeData),
    update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
    delete: (id) => api.delete(`/employees/${id}`),
    getByStatus: (status) => api.get(`/employees/status/${status}`),
    getActive: () => api.get('/employees/active'),
    getByRole: (role) => api.get(`/employees/role/${role}`),
    search: (query) => api.get(`/employees/search?q=${encodeURIComponent(query)}`),
    activate: (id) => api.post(`/employees/${id}/activate`),
    deactivate: (id) => api.post(`/employees/${id}/deactivate`),
};

export const taskAPI = {
    getAll: () => api.get('/tasks'),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (taskData) => api.post('/tasks', taskData),
    createForProject: (projectId, taskData) => api.post(`/tasks/create?projectId=${projectId}`, taskData),
    update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
    delete: (id) => api.delete(`/tasks/${id}`),
    getByProject: (projectId) => api.get(`/tasks/by-project/${projectId}`),
    getByStatus: (status) => api.get(`/tasks/status/${status}`),
    getByPriority: (priority) => api.get(`/tasks/priority/${priority}`),
    getStartedBetween: (start, end) => api.get(`/tasks/started-between?start=${start}&end=${end}`),
    getDueBetween: (start, end) => api.get(`/tasks/due-between?start=${start}&end=${end}`),
    search: (query) => api.get(`/tasks/search?q=${encodeURIComponent(query)}`),
    updateProgress: (id, percent) => api.post(`/tasks/${id}/progress?percent=${percent}`),
    
    assignments: {
        getByTask: (taskId) => api.get(`/tasks/${taskId}/assignments`),
        create: (taskId, employeeId, assignmentData = {}) => {
            const params = new URLSearchParams({
                employeeId: employeeId.toString(),
                ...(assignmentData.status && { status: assignmentData.status }),
                ...(assignmentData.dueDate && { dueDate: assignmentData.dueDate }),
                ...(assignmentData.notes && { notes: assignmentData.notes })
            });
            return api.post(`/tasks/${taskId}/assignments?${params}`);
        },
        
        getById: (taskId, assignmentId) => api.get(`/tasks/${taskId}/assignments/${assignmentId}`),
        
        update: (taskId, assignmentId, assignmentData) => api.put(`/tasks/${taskId}/assignments/${assignmentId}`, assignmentData),
        
        delete: (taskId, assignmentId) => api.delete(`/tasks/${taskId}/assignments/${assignmentId}`)
    }
};

export const issueAPI = {
    getAll: () => api.get('/issues'),
    getById: (id) => api.get(`/issues/${id}`),
    create: (issueData) => api.post('/issues', issueData),
    createForProject: (projectId, issueData) => api.post(`/issues/create?projectId=${projectId}`, issueData),
    update: (id, issueData) => api.put(`/issues/${id}`, issueData),
    delete: (id) => api.delete(`/issues/${id}`),
    getByProject: (projectId) => api.get(`/issues/by-project/${projectId}`),
    getByStatus: (status) => api.get(`/issues/status/${status}`),
    getBySeverity: (severity) => api.get(`/issues/severity/${severity}`),
    getReportedBetween: (start, end) => api.get(`/issues/reported-between?start=${start}&end=${end}`),
    getResolvedBetween: (start, end) => api.get(`/issues/resolved-between?start=${start}&end=${end}`),
    search: (query) => api.get(`/issues/search?q=${encodeURIComponent(query)}`),
    
    assign: (id, employeeId) => api.post(`/issues/${id}/assign?employeeId=${employeeId}`),
    
    close: (id, employeeId, notes = '') => {
        const params = new URLSearchParams({
            employeeId: employeeId.toString(),
            ...(notes && { notes })
        });
        return api.post(`/issues/${id}/close?${params}`);
    }
};

export default api;
