import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// authorization header for API calls
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const publicApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    getDashboard: (id) => api.get(`/projects/${id}/dashboard`),
    create: (projectData) => api.post('/projects', projectData),
    update: (id, projectData) => api.put(`/projects/${id}`, projectData),
    delete: (id) => api.delete(`/projects/${id}`),
    getByClient: (clientId) => api.get(`/projects/by-client/${clientId}`),
    getByStatus: (status) => api.get(`/projects/status/${status}`),
    search: (query) => api.get(`/projects/search?q=${encodeURIComponent(query)}`),
};

export const publicAPI = {
    health: () => publicApi.get('/public/health'),
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

export const materialAPI = {
    getAll: () => api.get('/materials'),
    getById: (id) => api.get(`/materials/${id}`),
    create: (materialData) => api.post('/materials', materialData),
    update: (id, materialData) => api.put(`/materials/${id}`, materialData),
    delete: (id) => api.delete(`/materials/${id}`),
    archive: (id) => api.put(`/materials/${id}/archive`),
    forceDelete: (id) => api.delete(`/materials/${id}/force`),
    getByUnit: (uom) => api.get(`/materials/by-unit/${uom}`),
    getBySupplier: (supplierId) => api.get(`/materials/by-supplier/${supplierId}`),
    getLowStock: () => api.get('/materials/low-stock')
};

export const equipmentAPI = {
    getAll: () => api.get('/equipment'),
    getById: (id) => api.get(`/equipment/${id}`),
    create: (equipmentData) => api.post('/equipment', equipmentData),
    update: (id, equipmentData) => api.put(`/equipment/${id}`, equipmentData),
    delete: (id) => api.delete(`/equipment/${id}`),
    archive: (id) => api.put(`/equipment/${id}/archive`),
    forceDelete: (id) => api.delete(`/equipment/${id}/force`),
    getByType: (type) => api.get(`/equipment/by-type/${type}`),
    getBySupplier: (supplierId) => api.get(`/equipment/by-supplier/${supplierId}`)
};

export const supplierAPI = {
    getAll: () => api.get('/suppliers'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (supplierData) => api.post('/suppliers', supplierData),
    update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
    delete: (id) => api.delete(`/suppliers/${id}`),
    search: (query) => api.get(`/suppliers/search?q=${encodeURIComponent(query)}`),
    getByName: (name) => api.get(`/suppliers/by-name?name=${encodeURIComponent(name)}`)
};

export const inventoryAPI = {
    receive: (resourceId, quantity, options = {}) => {
        const params = new URLSearchParams({
            quantity: quantity.toString(),
            ...(options.refType && { refType: options.refType }),
            ...(options.refId && { refId: options.refId.toString() }),
            ...(options.notes && { notes: options.notes })
        });
        return api.post(`/inventory/receive/${resourceId}?${params}`);
    },
    
    consume: (resourceId, quantity, options = {}) => {
        const params = new URLSearchParams({
            quantity: quantity.toString(),
            ...(options.refType && { refType: options.refType }),
            ...(options.refId && { refId: options.refId.toString() }),
            ...(options.notes && { notes: options.notes })
        });
        return api.post(`/inventory/consume/${resourceId}?${params}`);
    },
    
    adjust: (resourceId, quantity, notes = '') => {
        const params = new URLSearchParams({
            quantity: quantity.toString(),
            ...(notes && { notes })
        });
        return api.post(`/inventory/adjust/${resourceId}?${params}`);
    }
};

export const procurementOrderAPI = {
    getAll: () => api.get('/procurement-orders'),
    getById: (id) => api.get(`/procurement-orders/${id}`),
    create: (orderData) => api.post('/procurement-orders', orderData),
    createOrder: (resourceId, supplierId, quantity, options = {}) => {
        const params = new URLSearchParams({
            resourceId: resourceId.toString(),
            supplierId: supplierId.toString(),
            quantity: quantity.toString(),
            ...(options.unitPrice && { unitPrice: options.unitPrice.toString() }),
            ...(options.expectedDeliveryDate && { expectedDeliveryDate: options.expectedDeliveryDate }),
            ...(options.notes && { notes: options.notes }),
            ...(options.projectId && { projectId: options.projectId.toString() })
        });
        return api.post(`/procurement-orders/create-order?${params}`);
    },
    
    update: (id, orderData) => api.put(`/procurement-orders/${id}`, orderData),
    delete: (id) => api.delete(`/procurement-orders/${id}`),
    getByResource: (resourceId) => api.get(`/procurement-orders/by-resource/${resourceId}`),
    getBySupplier: (supplierId) => api.get(`/procurement-orders/by-supplier/${supplierId}`),
    getByStatus: (status) => api.get(`/procurement-orders/by-status/${status}`),
    search: (query) => api.get(`/procurement-orders/search?q=${encodeURIComponent(query)}`),
    getByOrderDateBetween: (start, end) => api.get(`/procurement-orders/by-order-date?start=${start}&end=${end}`),
    updateStatus: (id, status) => {
        const params = new URLSearchParams({ status });
        return api.put(`/procurement-orders/${id}/status?${params}`);
    }
};

export const financeAPI = {
    create: (entry) => api.post('/finance', entry),
    getByProject: (projectId) => api.get(`/finance/by-project/${projectId}`),
    getByProjectBetween: (projectId, start, end) => api.get(`/finance/by-project/${projectId}/between?start=${start}&end=${end}`),
    summary: (projectId) => api.get(`/finance/summary/${projectId}`),
    update: (id, entry) => api.put(`/finance/${id}`, entry),
    delete: (id) => api.delete(`/finance/${id}`)
};

export const supplierStoreAPI = {
    getAll: () => api.get('/supplier-stores'),
    getById: (id) => api.get(`/supplier-stores/${id}`),
    getBySupplier: (supplierId) => api.get(`/supplier-stores/supplier/${supplierId}`),
    create: (storeData) => api.post('/supplier-stores', storeData),
    createForSupplier: (supplierId, storeData) => api.post(`/supplier-stores/supplier/${supplierId}`, storeData),
    update: (id, storeData) => api.put(`/supplier-stores/${id}`, storeData),
    delete: (id) => api.delete(`/supplier-stores/${id}`),
    getActive: () => api.get('/supplier-stores/active'),
    getByStatus: (status) => api.get(`/supplier-stores/status/${status}`)
};

export const purchaseOrderAPI = {
    getAll: () => api.get('/purchase-orders'),
    getById: (id) => api.get(`/purchase-orders/${id}`),
    getBySupplier: (supplierId) => api.get(`/purchase-orders/supplier/${supplierId}`),
    getByProject: (projectId) => api.get(`/purchase-orders/project/${projectId}`),
    getByStatus: (status) => api.get(`/purchase-orders/status/${status}`),
    create: (orderData) => api.post('/purchase-orders', orderData),
    createFromCart: (supplierId, projectId, items, notes) => {
        const params = new URLSearchParams({
            supplierId: supplierId.toString(),
            ...(projectId && { projectId: projectId.toString() }),
            ...(notes && { notes })
        });
        return api.post(`/purchase-orders/from-cart?${params}`, items);
    },
    updateStatus: (id, status) => api.put(`/purchase-orders/${id}/status?status=${status}`),
    delete: (id) => api.delete(`/purchase-orders/${id}`),
    getTotalBySupplier: (supplierId) => api.get(`/purchase-orders/supplier/${supplierId}/total`)
};

export const stockAPI = {
    getAll: () => api.get('/company-stock'),
    getById: (id) => api.get(`/company-stock/${id}`),
    getByType: (resourceType) => api.get(`/company-stock/type/${resourceType}`),
    getByStatus: (status) => api.get(`/company-stock/status/${status}`),
    getBySupplier: (supplierId) => api.get(`/company-stock/supplier/${supplierId}`),
    getLowStock: () => api.get('/company-stock/low-stock'),
    search: (name) => api.get(`/company-stock/search?name=${encodeURIComponent(name)}`),
    create: (stockData) => api.post('/company-stock', stockData),
    addFromPurchase: (supplierId, resourceId, resourceType, quantity, unitCost, name, description) => {
        const params = new URLSearchParams({
            supplierId: supplierId.toString(),
            resourceId: resourceId.toString(),
            resourceType,
            quantity: quantity.toString(),
            unitCost: unitCost.toString(),
            name,
            ...(description && { description })
        });
        return api.post(`/company-stock/from-purchase?${params}`);
    },
    update: (id, stockData) => api.put(`/company-stock/${id}`, stockData),
    adjust: (id, quantityChange, notes) => {
        const params = new URLSearchParams({
            quantityChange: quantityChange.toString(),
            ...(notes && { notes })
        });
        return api.put(`/company-stock/${id}/adjust?${params}`);
    },
    delete: (id) => api.delete(`/company-stock/${id}`),
    getTotalValue: () => api.get('/company-stock/total-value'),
    getMovements: () => api.get('/stock-movements')
};

export default api;
