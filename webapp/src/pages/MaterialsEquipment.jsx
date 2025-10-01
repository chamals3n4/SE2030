import React, { useState, useEffect } from 'react';
import { materialAPI, equipmentAPI, inventoryAPI, supplierAPI, stockAPI, projectAllocationAPI } from '../services/api';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Search, Plus, Edit, Trash2, Package, Wrench, Calendar, AlertTriangle, Building } from 'lucide-react';
import { toast } from 'sonner';

const MATERIAL_UNITS = ['KG', 'L', 'UNIT', 'M3', 'M2', 'M'];
const EQUIPMENT_TYPES = ['Excavator', 'Crane', 'Bulldozer', 'Truck', 'Generator', 'Compressor', 'Drill', 'Other'];
const RESOURCE_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export default function MaterialsEquipment() {
    const { projectId } = useParams();
    const [activeTab, setActiveTab] = useState('materials');

    // Data states
    const [materials, setMaterials] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companyStock, setCompanyStock] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [listFilter, setListFilter] = useState('ALL');

    // Filter states
    const [materialSearch, setMaterialSearch] = useState('');
    const [equipmentSearch, setEquipmentSearch] = useState('');

    // Dialog states
    const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
    const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
    const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
    const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false);
    const [isDeleteStockConfirmOpen, setIsDeleteStockConfirmOpen] = useState(false);
    const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [addStockItem, setAddStockItem] = useState(null);
    const [adjustStockItem, setAdjustStockItem] = useState(null);
    const [allocateItem, setAllocateItem] = useState(null);

    // Form states
    const [materialForm, setMaterialForm] = useState({
        name: '',
        description: '',
        unitOfMeasure: 'UNIT',
        currentStock: 0,
        status: 'ACTIVE',
        preferredSupplier: null,
        reorderLevel: 0,
        reorderQuantity: 0
    });

    const [equipmentForm, setEquipmentForm] = useState({
        name: '',
        description: '',
        model: '',
        equipmentType: 'Other',
        warrantyExpiry: '',
        status: 'ACTIVE',
        preferredSupplier: null,
        reorderLevel: 0,
        reorderQuantity: 0
    });

    const [addStockForm, setAddStockForm] = useState({ supplierId: 'none', quantity: 0, unitCost: '' });
    const [allocateForm, setAllocateForm] = useState({ projectId: '', quantity: 0 });
    const [adjustStockForm, setAdjustStockForm] = useState({ quantityChange: 0, notes: '' });

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        const loadAllocData = async () => {
            if (!projectId) return;
            try {
                const [stockRes, allocRes] = await Promise.all([
                    stockAPI.getAll(),
                    projectAllocationAPI.listByProject(projectId)
                ]);
                setCompanyStock(stockRes.data || []);
                setAllocations(allocRes.data || []);
            } catch (e) {
                // ignore
            }
        };
        loadAllocData();
    }, [projectId]);

    const addToProject = async (stockId) => {
        const qtyStr = window.prompt('Quantity to allocate to project:', '1');
        const qty = parseInt(qtyStr || '0');
        if (!qty || qty <= 0) return;
        try {
            await projectAllocationAPI.add(projectId, stockId, qty);
            const [stockRes, allocRes] = await Promise.all([
                stockAPI.getAll(),
                projectAllocationAPI.listByProject(projectId)
            ]);
            setCompanyStock(stockRes.data || []);
            setAllocations(allocRes.data || []);
            toast.success('Allocated to project');
        } catch (e) {
            const backendMsg = e?.response?.data?.message || e?.response?.data;
            const msg = typeof backendMsg === 'string' && backendMsg.trim().length > 0 ? backendMsg : 'Failed to allocate';
            toast.error(msg);
        }
    };

    const removeAllocation = async (allocationId) => {
        if (!projectId) return;
        try {
            await projectAllocationAPI.remove(projectId, allocationId);
            const allocRes = await projectAllocationAPI.listByProject(projectId);
            setAllocations(allocRes.data || []);
            toast.success('Allocation removed');
        } catch (e) {
            toast.error('Failed to remove allocation');
        }
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [materialsRes, equipmentRes, suppliersRes] = await Promise.all([
                materialAPI.getAll(),
                equipmentAPI.getAll(),
                supplierAPI.getAll()
            ]);
            setMaterials(materialsRes.data);
            setEquipment(equipmentRes.data);
            setSuppliers(suppliersRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Material handlers
    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        try {
            await materialAPI.create(materialForm);
            toast.success('Material created successfully');
            setIsMaterialDialogOpen(false);
            resetMaterialForm();
            fetchAllData();
        } catch (error) {
            toast.error('Failed to create material');
            console.error('Error creating material:', error);
        }
    };

    const handleUpdateMaterial = async (e) => {
        e.preventDefault();
        try {
            await materialAPI.update(editingItem.resourceId, materialForm);
            toast.success('Material updated successfully');
            setIsMaterialDialogOpen(false);
            setEditingItem(null);
            resetMaterialForm();
            fetchAllData();
        } catch (error) {
            toast.error('Failed to update material');
            console.error('Error updating material:', error);
        }
    };

    const handleDeleteMaterial = async (id) => {
        try {
            await materialAPI.delete(id);
            toast.success('Material deleted successfully');
            fetchAllData();
        } catch (error) {
            console.error('Error deleting material:', error);

            // Check if it's a foreign key constraint error
            if (error.response?.status === 400 || error.response?.data?.includes?.('stock movement') || error.response?.data?.includes?.('procurement order')) {
                // Show archive option instead
                toast.error('Cannot delete material: Active stock movements or orders exist', {
                    action: {
                        label: 'Archive Instead',
                        onClick: () => handleArchiveMaterial(id)
                    }
                });
            } else {
                toast.error('Failed to delete material');
            }
        }
    };

    const handleArchiveMaterial = async (id) => {
        try {
            await materialAPI.archive(id);
            toast.success('Material archived successfully');
            fetchAllData(); // Refresh the data
        } catch (error) {
            toast.error('Failed to archive material');
            console.error('Error archiving material:', error);
        }
    };

    // Equipment handlers
    const handleCreateEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.create(equipmentForm);
            toast.success('Equipment created successfully');
            setIsEquipmentDialogOpen(false);
            resetEquipmentForm();
            fetchAllData();
        } catch (error) {
            toast.error('Failed to create equipment');
            console.error('Error creating equipment:', error);
        }
    };

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.update(editingItem.resourceId, equipmentForm);
            toast.success('Equipment updated successfully');
            setIsEquipmentDialogOpen(false);
            setEditingItem(null);
            resetEquipmentForm();
            fetchAllData();
        } catch (error) {
            toast.error('Failed to update equipment');
            console.error('Error updating equipment:', error);
        }
    };

    const handleDeleteEquipment = async (id) => {
        try {
            await equipmentAPI.delete(id);
            toast.success('Equipment deleted successfully');
            fetchAllData();
        } catch (error) {
            console.error('Error deleting equipment:', error);

            // Check if it's a foreign key constraint error
            if (error.response?.status === 400 || error.response?.data?.includes?.('stock movement') || error.response?.data?.includes?.('procurement order')) {
                // Show archive option instead
                toast.error('Cannot delete equipment: Active stock movements or orders exist', {
                    action: {
                        label: 'Archive Instead',
                        onClick: () => handleArchiveEquipment(id)
                    }
                });
            } else {
                toast.error('Failed to delete equipment');
            }
        }
    };

    const handleArchiveEquipment = async (id) => {
        try {
            await equipmentAPI.archive(id);
            toast.success('Equipment archived successfully');
            fetchAllData(); // Refresh the data
        } catch (error) {
            toast.error('Failed to archive equipment');
            console.error('Error archiving equipment:', error);
        }
    };


    // New inventory actions
    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            const resource = addStockItem;
            const resourceType = resource.model !== undefined ? 'EQUIPMENT' : 'MATERIAL';
            await stockAPI.addFromPurchase(
                addStockForm.supplierId && addStockForm.supplierId !== 'none' ? parseInt(addStockForm.supplierId) : 0,
                resource.resourceId,
                resourceType,
                parseInt(addStockForm.quantity),
                parseFloat(addStockForm.unitCost),
                resource.name,
                resource.description || ''
            );
            toast.success('Stock added successfully');
            setIsAddStockDialogOpen(false);
            setAddStockItem(null);
            setAddStockForm({ supplierId: 'none', quantity: 0, unitCost: '' });
            fetchAllData();
        } catch (error) {
            toast.error('Failed to add stock');
            console.error('Error adding stock:', error);
        }
    };

    const handleAdjustStock = async (e) => {
        e.preventDefault();
        try {
            await stockAPI.adjust(
                adjustStockItem.stockId,
                parseInt(adjustStockForm.quantityChange),
                adjustStockForm.notes
            );
            toast.success('Stock adjusted');
            setIsAdjustStockDialogOpen(false);
            setAdjustStockItem(null);
            setAdjustStockForm({ quantityChange: 0, notes: '' });
            const stockRes = await stockAPI.getAll();
            setCompanyStock(stockRes.data || []);
        } catch (error) {
            toast.error('Failed to adjust stock');
        }
    };

    const handleDeleteStock = async () => {
        try {
            await stockAPI.delete(adjustStockItem.stockId);
            toast.success('Stock deleted');
            setIsDeleteStockConfirmOpen(false);
            setAdjustStockItem(null);
            const stockRes = await stockAPI.getAll();
            setCompanyStock(stockRes.data || []);
        } catch (error) {
            toast.error('Failed to delete stock');
        }
    };

    const handleAllocate = async (e) => {
        e.preventDefault();
        try {
            await inventoryAPI.consume(
                allocateItem.resourceId,
                parseInt(allocateForm.quantity),
                { refType: 'PROJECT', refId: allocateForm.projectId, notes: 'Allocation' }
            );
            toast.success('Allocated to project');
            setIsAllocateDialogOpen(false);
            setAllocateItem(null);
            setAllocateForm({ projectId: '', quantity: 0 });
            fetchAllData();
        } catch (error) {
            toast.error('Failed to allocate');
            console.error('Error allocating to project:', error);
        }
    };

    // Helper functions
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'ACTIVE': return 'default';
            case 'INACTIVE': return 'secondary';
            case 'MAINTENANCE': return 'outline';
            default: return 'secondary';
        }
    };

    const resetMaterialForm = () => {
        setMaterialForm({
            name: '',
            description: '',
            unitOfMeasure: 'UNIT',
            currentStock: 0,
            status: 'ACTIVE',
            preferredSupplier: null,
            reorderLevel: 0,
            reorderQuantity: 0
        });
    };

    const resetEquipmentForm = () => {
        setEquipmentForm({
            name: '',
            description: '',
            model: '',
            equipmentType: 'Other',
            warrantyExpiry: '',
            status: 'ACTIVE',
            preferredSupplier: null,
            reorderLevel: 0,
            reorderQuantity: 0
        });
    };


    const resetAddStockForm = () => setAddStockForm({ supplierId: '', quantity: 0, unitCost: '' });
    const resetAllocateForm = () => setAllocateForm({ projectId: '', quantity: 0 });

    // Filter functions
    const filteredMaterials = materials.filter(material =>
        material.name?.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.description?.toLowerCase().includes(materialSearch.toLowerCase())
    );

    const filteredEquipment = equipment.filter(item =>
        item.name?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        item.model?.toLowerCase().includes(equipmentSearch.toLowerCase())
    );


    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading resources...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Materials & Equipment</h1>
                <p className="text-gray-600 mt-1">Manage inventory and allocate company stock to this project</p>
            </div>

            {projectId && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="space-y-4 lg:col-span-5">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">Available Company Stock</div>
                            <div className="flex items-center gap-2">
                                <Button variant={listFilter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setListFilter('ALL')}>All</Button>
                                <Button variant={listFilter === 'MATERIAL' ? 'default' : 'outline'} size="sm" onClick={() => setListFilter('MATERIAL')}>Materials</Button>
                                <Button variant={listFilter === 'EQUIPMENT' ? 'default' : 'outline'} size="sm" onClick={() => setListFilter('EQUIPMENT')}>Equipment</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {companyStock
                                .filter(s => listFilter === 'ALL' || s.resourceType === listFilter)
                                .map(item => (
                                    <div key={item.stockId} className="border rounded-md p-3 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500">Qty: {item.currentQuantity} {item.unitOfMeasure || ''} • {item.resourceType}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => { setAdjustStockItem(item); setAdjustStockForm({ quantityChange: 0, notes: '' }); setIsAdjustStockDialogOpen(true); }}>Adjust</Button>
                                            <Button variant="destructive" size="sm" onClick={() => { setAdjustStockItem(item); setIsDeleteStockConfirmOpen(true); }}>Delete</Button>
                                            <Button size="sm" onClick={() => addToProject(item.stockId)}>Add to Project</Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="hidden lg:flex lg:col-span-1 items-stretch justify-center">
                        <Separator orientation="vertical" className="h-full" />
                    </div>
                    <div className="space-y-4 lg:col-span-6">
                        <div className="font-semibold">Allocated to Project</div>
                        <div className="grid grid-cols-1 gap-3">
                            {allocations.map(a => (
                                <div key={a.allocationId} className="border rounded-md p-3 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{a.name}</div>
                                        <div className="text-xs text-gray-500">{a.quantity} {a.unitOfMeasure || ''} • {a.resourceType}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    await projectAllocationAPI.remove(projectId, a.allocationId);
                                                    const [stockRes, allocRes] = await Promise.all([
                                                        stockAPI.getAll(),
                                                        projectAllocationAPI.listByProject(projectId)
                                                    ]);
                                                    setCompanyStock(stockRes.data || []);
                                                    setAllocations(allocRes.data || []);
                                                    toast.success('Removed from project');
                                                } catch (e) {
                                                    toast.error('Failed to remove');
                                                }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!projectId && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="materials">Materials</TabsTrigger>
                        <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search materials..."
                                        value={materialSearch}
                                        onChange={(e) => setMaterialSearch(e.target.value)}
                                        className="pl-9 w-80 shadow-none"
                                    />
                                </div>
                            </div>
                            <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={resetMaterialForm}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Material
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? 'Edit Material' : 'Add New Material'}</DialogTitle>
                                        <DialogDescription>
                                            {editingItem ? 'Update the material information and supplier details' : 'Create a new material with supplier and reorder settings'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={editingItem ? handleUpdateMaterial : handleCreateMaterial} className="space-y-4">
                                        <div>
                                            <Label htmlFor="materialName">Name</Label>
                                            <Input
                                                id="materialName"
                                                value={materialForm.name}
                                                onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="materialDescription">Description</Label>
                                            <Textarea
                                                id="materialDescription"
                                                value={materialForm.description}
                                                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="unitOfMeasure">Unit</Label>
                                                <Select value={materialForm.unitOfMeasure} onValueChange={(value) => setMaterialForm({ ...materialForm, unitOfMeasure: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MATERIAL_UNITS.map(unit => (
                                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="currentStock">Current Stock</Label>
                                                <Input
                                                    id="currentStock"
                                                    type="number"
                                                    min="0"
                                                    value={materialForm.currentStock}
                                                    onChange={(e) => setMaterialForm({ ...materialForm, currentStock: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="preferredSupplier">Preferred Supplier</Label>
                                            <Select value={materialForm.preferredSupplier?.supplierId?.toString() || 'none'} onValueChange={(value) => {
                                                if (value === 'none') {
                                                    setMaterialForm({ ...materialForm, preferredSupplier: null });
                                                } else {
                                                    const supplier = suppliers.find(s => s.supplierId === parseInt(value));
                                                    setMaterialForm({ ...materialForm, preferredSupplier: supplier || null });
                                                }
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No supplier</SelectItem>
                                                    {suppliers.map(supplier => (
                                                        <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                                                            {supplier.companyName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="reorderLevel">Reorder Level</Label>
                                                <Input
                                                    id="reorderLevel"
                                                    type="number"
                                                    min="0"
                                                    value={materialForm.reorderLevel}
                                                    onChange={(e) => setMaterialForm({ ...materialForm, reorderLevel: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                                                <Input
                                                    id="reorderQuantity"
                                                    type="number"
                                                    min="0"
                                                    value={materialForm.reorderQuantity}
                                                    onChange={(e) => setMaterialForm({ ...materialForm, reorderQuantity: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="materialStatus">Status</Label>
                                            <Select value={materialForm.status} onValueChange={(value) => setMaterialForm({ ...materialForm, status: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RESOURCE_STATUSES.map(status => (
                                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => {
                                                setIsMaterialDialogOpen(false);
                                                setEditingItem(null);
                                                resetMaterialForm();
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">{editingItem ? 'Update' : 'Create'} Material</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMaterials.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-12">
                                    <Package className="h-12 w-12 text-gray-400 mb-2" />
                                    <p className="text-gray-500">No materials found</p>
                                </div>
                            ) : (
                                filteredMaterials.map((material) => (
                                    <Card key={material.resourceId} className="shadow-none">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{material.name}</CardTitle>
                                                    <Badge variant={getStatusBadgeVariant(material.status)} className="mt-1">
                                                        {material.status}
                                                    </Badge>
                                                </div>
                                                <Package className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">{material.description}</p>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Stock:</span>
                                                    <div className="flex items-center">
                                                        <span className="font-medium">{material.currentStock} {material.unitOfMeasure}</span>
                                                        {material.reorderLevel && material.currentStock <= material.reorderLevel && (
                                                            <AlertTriangle className="h-3 w-3 ml-2 text-orange-500" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Unit:</span>
                                                    <span>{material.unitOfMeasure}</span>
                                                </div>
                                                {material.preferredSupplier && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Supplier:</span>
                                                        <span className="flex items-center">
                                                            <Building className="h-3 w-3 mr-1" />
                                                            {material.preferredSupplier.companyName}
                                                        </span>
                                                    </div>
                                                )}
                                                {material.reorderLevel && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Reorder Level:</span>
                                                        <span>{material.reorderLevel} {material.unitOfMeasure}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Action Buttons */}
                                            <div className="flex items-center space-x-2 pt-3 border-t mt-3">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAddStockItem(material); setIsAddStockDialogOpen(true); }}>Add to Stock</Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAllocateItem(material); setIsAllocateDialogOpen(true); }}>Allocate to Project</Button>
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-4">

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingItem(material);
                                                        setMaterialForm({
                                                            name: material.name || '',
                                                            description: material.description || '',
                                                            unitOfMeasure: material.unitOfMeasure || 'UNIT',
                                                            currentStock: material.currentStock || 0,
                                                            status: material.status || 'ACTIVE',
                                                            preferredSupplier: material.preferredSupplier || null,
                                                            reorderLevel: material.reorderLevel || 0,
                                                            reorderQuantity: material.reorderQuantity || 0
                                                        });
                                                        setIsMaterialDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Material</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{material.name}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteMaterial(material.resourceId)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="equipment" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search equipment..."
                                        value={equipmentSearch}
                                        onChange={(e) => setEquipmentSearch(e.target.value)}
                                        className="pl-9 w-80 shadow-none"
                                    />
                                </div>
                            </div>
                            <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={resetEquipmentForm}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Equipment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{editingItem ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
                                        <DialogDescription>
                                            {editingItem ? 'Update the equipment information and supplier details' : 'Create a new equipment with supplier and reorder settings'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={editingItem ? handleUpdateEquipment : handleCreateEquipment} className="space-y-4">
                                        <div>
                                            <Label htmlFor="equipmentName">Name</Label>
                                            <Input
                                                id="equipmentName"
                                                value={equipmentForm.name}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="equipmentDescription">Description</Label>
                                            <Textarea
                                                id="equipmentDescription"
                                                value={equipmentForm.description}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="model">Model</Label>
                                                <Input
                                                    id="model"
                                                    value={equipmentForm.model}
                                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="equipmentType">Type</Label>
                                                <Select value={equipmentForm.equipmentType} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, equipmentType: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {EQUIPMENT_TYPES.map(type => (
                                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                                                <Input
                                                    id="warrantyExpiry"
                                                    type="date"
                                                    value={equipmentForm.warrantyExpiry}
                                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, warrantyExpiry: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="preferredSupplierEquipment">Preferred Supplier</Label>
                                                <Select value={equipmentForm.preferredSupplier?.supplierId?.toString() || 'none'} onValueChange={(value) => {
                                                    if (value === 'none') {
                                                        setEquipmentForm({ ...equipmentForm, preferredSupplier: null });
                                                    } else {
                                                        const supplier = suppliers.find(s => s.supplierId === parseInt(value));
                                                        setEquipmentForm({ ...equipmentForm, preferredSupplier: supplier || null });
                                                    }
                                                }}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select supplier" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No supplier</SelectItem>
                                                        {suppliers.map(supplier => (
                                                            <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                                                                {supplier.companyName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="reorderLevelEquipment">Reorder Level</Label>
                                                    <Input
                                                        id="reorderLevelEquipment"
                                                        type="number"
                                                        min="0"
                                                        value={equipmentForm.reorderLevel}
                                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, reorderLevel: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="reorderQuantityEquipment">Reorder Quantity</Label>
                                                    <Input
                                                        id="reorderQuantityEquipment"
                                                        type="number"
                                                        min="0"
                                                        value={equipmentForm.reorderQuantity}
                                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, reorderQuantity: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="equipmentStatus">Status</Label>
                                                <Select value={equipmentForm.status} onValueChange={(value) => setEquipmentForm({ ...equipmentForm, status: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {RESOURCE_STATUSES.map(status => (
                                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => {
                                                setIsEquipmentDialogOpen(false);
                                                setEditingItem(null);
                                                resetEquipmentForm();
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">{editingItem ? 'Update' : 'Create'} Equipment</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEquipment.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-12">
                                    <Wrench className="h-12 w-12 text-gray-400 mb-2" />
                                    <p className="text-gray-500">No equipment found</p>
                                </div>
                            ) : (
                                filteredEquipment.map((item) => (
                                    <Card key={item.resourceId} className="shadow-none">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                                    <Badge variant={getStatusBadgeVariant(item.status)} className="mt-1">
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <Wrench className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Type:</span>
                                                    <span>{item.equipmentType}</span>
                                                </div>
                                                {item.model && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Model:</span>
                                                        <span>{item.model}</span>
                                                    </div>
                                                )}
                                                {item.warrantyExpiry && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Warranty:</span>
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {new Date(item.warrantyExpiry).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.preferredSupplier && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Supplier:</span>
                                                        <span className="flex items-center">
                                                            <Building className="h-3 w-3 mr-1" />
                                                            {item.preferredSupplier.companyName}
                                                        </span>
                                                    </div>
                                                )}
                                                {item.reorderLevel && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Reorder Level:</span>
                                                        <span>{item.reorderLevel}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Action Buttons */}
                                            <div className="flex items-center space-x-2 pt-3 border-t mt-3">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAddStockItem(item); setIsAddStockDialogOpen(true); }}>Add to Stock</Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setAllocateItem(item); setIsAllocateDialogOpen(true); }}>Allocate to Project</Button>
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setEquipmentForm({
                                                            name: item.name || '',
                                                            description: item.description || '',
                                                            model: item.model || '',
                                                            equipmentType: item.equipmentType || 'Other',
                                                            warrantyExpiry: item.warrantyExpiry || '',
                                                            status: item.status || 'ACTIVE'
                                                        });
                                                        setIsEquipmentDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteEquipment(item.resourceId)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                </Tabs>
            )}

            {/* Add to Stock Dialog */}
            <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to Stock - {addStockItem?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStock} className="space-y-4">
                        <div>
                            <Label>Supplier (optional)</Label>
                            <Select value={addStockForm.supplierId} onValueChange={(v) => setAddStockForm({ ...addStockForm, supplierId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.supplierId} value={s.supplierId.toString()}>{s.companyName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Quantity</Label>
                                <Input type="number" min="1" value={addStockForm.quantity} onChange={(e) => setAddStockForm({ ...addStockForm, quantity: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Unit Cost</Label>
                                <Input type="number" step="0.01" min="0" value={addStockForm.unitCost} onChange={(e) => setAddStockForm({ ...addStockForm, unitCost: e.target.value })} required />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Add</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Adjust Stock Dialog */}
            <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock - {adjustStockItem?.name}</DialogTitle>
                        <DialogDescription>Increase or decrease quantity. Use negative numbers to decrease.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdjustStock} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Quantity Change</Label>
                                <Input type="number" value={adjustStockForm.quantityChange} onChange={(e) => setAdjustStockForm({ ...adjustStockForm, quantityChange: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input value={adjustStockForm.notes} onChange={(e) => setAdjustStockForm({ ...adjustStockForm, notes: e.target.value })} placeholder="Optional" />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAdjustStockDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Apply</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Stock Confirm */}
            <AlertDialog open={isDeleteStockConfirmOpen} onOpenChange={setIsDeleteStockConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stock</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{adjustStockItem?.name}" from company stock? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStock}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Allocate to Project Dialog */}
            <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Allocate to Project - {allocateItem?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAllocate} className="space-y-4">
                        <div>
                            <Label>Project ID</Label>
                            <Input value={allocateForm.projectId} onChange={(e) => setAllocateForm({ ...allocateForm, projectId: e.target.value })} placeholder="Enter project ID" required />
                        </div>
                        <div>
                            <Label>Quantity</Label>
                            <Input type="number" min="1" value={allocateForm.quantity} onChange={(e) => setAllocateForm({ ...allocateForm, quantity: e.target.value })} required />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Allocate</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
