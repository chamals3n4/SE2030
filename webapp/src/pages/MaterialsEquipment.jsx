import React, { useState, useEffect } from 'react';
import { materialAPI, equipmentAPI, inventoryAPI, supplierAPI, procurementOrderAPI } from '../services/api';
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
import { Search, Plus, Edit, Trash2, Package, Wrench, TrendingUp, TrendingDown, RotateCcw, Calendar, AlertTriangle, Building, Phone, Mail, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const MATERIAL_UNITS = ['KG', 'L', 'UNIT', 'M3', 'M2', 'M'];
const EQUIPMENT_TYPES = ['Excavator', 'Crane', 'Bulldozer', 'Truck', 'Generator', 'Compressor', 'Drill', 'Other'];
const RESOURCE_STATUSES = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export default function MaterialsEquipment() {
    const [activeTab, setActiveTab] = useState('materials');

    // Data states
    const [materials, setMaterials] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [materialSearch, setMaterialSearch] = useState('');
    const [equipmentSearch, setEquipmentSearch] = useState('');

    // Dialog states
    const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
    const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
    const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
    const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inventoryItem, setInventoryItem] = useState(null);
    const [reorderItem, setReorderItem] = useState(null);

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

    const [reorderForm, setReorderForm] = useState({
        quantity: 0,
        unitPrice: '',
        expectedDeliveryDate: '',
        notes: ''
    });


    const [inventoryForm, setInventoryForm] = useState({
        action: 'receive',
        quantity: 0,
        notes: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

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


    // Inventory handlers
    const handleInventoryAction = async (e) => {
        e.preventDefault();
        try {
            const { action, quantity, notes } = inventoryForm;
            const options = { notes };

            if (action === 'receive') {
                await inventoryAPI.receive(inventoryItem.resourceId, quantity, options);
                toast.success('Stock received successfully');
            } else if (action === 'consume') {
                await inventoryAPI.consume(inventoryItem.resourceId, quantity, options);
                toast.success('Stock consumed successfully');
            } else if (action === 'adjust') {
                await inventoryAPI.adjust(inventoryItem.resourceId, quantity, notes);
                toast.success('Stock adjusted successfully');
            }

            setIsInventoryDialogOpen(false);
            setInventoryItem(null);
            resetInventoryForm();
            fetchAllData();
        } catch (error) {
            toast.error('Failed to update inventory');
            console.error('Error updating inventory:', error);
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


    const resetInventoryForm = () => {
        setInventoryForm({
            action: 'receive',
            quantity: 0,
            notes: ''
        });
    };

    const resetReorderForm = () => {
        setReorderForm({
            quantity: 0,
            unitPrice: '',
            expectedDeliveryDate: '',
            notes: ''
        });
    };

    // Reorder handlers
    const handleReorderItem = async (e) => {
        e.preventDefault();
        try {
            const options = {
                unitPrice: reorderForm.unitPrice ? parseFloat(reorderForm.unitPrice) : undefined,
                expectedDeliveryDate: reorderForm.expectedDeliveryDate || undefined,
                notes: reorderForm.notes || undefined
            };

            await procurementOrderAPI.createOrder(
                reorderItem.resourceId,
                reorderItem.preferredSupplier.supplierId,
                reorderForm.quantity,
                options
            );

            toast.success('Reorder placed successfully');
            setIsReorderDialogOpen(false);
            setReorderItem(null);
            resetReorderForm();
        } catch (error) {
            toast.error('Failed to place reorder');
            console.error('Error placing reorder:', error);
        }
    };

    const openReorderDialog = (item) => {
        if (!item.preferredSupplier) {
            toast.error('No preferred supplier set for this item');
            return;
        }
        setReorderItem(item);
        setReorderForm({
            quantity: item.reorderQuantity || 10,
            unitPrice: '',
            expectedDeliveryDate: '',
            notes: ''
        });
        setIsReorderDialogOpen(true);
    };

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
                <p className="text-gray-600 mt-1">Manage construction materials and equipment inventory</p>
            </div>

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
                                        {material.preferredSupplier && (
                                            <div className="flex items-center space-x-2 pt-3 border-t mt-3">
                                                {material.preferredSupplier.email && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`mailto:${material.preferredSupplier.email}`, '_blank')}
                                                        className="flex-1"
                                                    >
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        Email
                                                    </Button>
                                                )}
                                                {material.preferredSupplier.phone && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`tel:${material.preferredSupplier.phone}`, '_blank')}
                                                        className="flex-1"
                                                    >
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        Call
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openReorderDialog(material)}
                                                    className="flex-1"
                                                >
                                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                                    Reorder
                                                </Button>
                                            </div>
                                        )}
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setInventoryItem(material);
                                                    resetInventoryForm();
                                                    setIsInventoryDialogOpen(true);
                                                }}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
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
                                        {item.preferredSupplier && (
                                            <div className="flex items-center space-x-2 pt-3 border-t mt-3">
                                                {item.preferredSupplier.email && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`mailto:${item.preferredSupplier.email}`, '_blank')}
                                                        className="flex-1"
                                                    >
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        Email
                                                    </Button>
                                                )}
                                                {item.preferredSupplier.phone && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`tel:${item.preferredSupplier.phone}`, '_blank')}
                                                        className="flex-1"
                                                    >
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        Call
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openReorderDialog(item)}
                                                    className="flex-1"
                                                >
                                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                                    Reorder
                                                </Button>
                                            </div>
                                        )}
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

            {/* Inventory Management Dialog */}
            <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Inventory Management - {inventoryItem?.name}</DialogTitle>
                        <DialogDescription>
                            Record stock movements for this item (receive, consume, or adjust quantities)
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInventoryAction} className="space-y-4">
                        <div>
                            <Label htmlFor="action">Action</Label>
                            <Select value={inventoryForm.action} onValueChange={(value) => setInventoryForm({ ...inventoryForm, action: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="receive">
                                        <div className="flex items-center">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Receive Stock
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="consume">
                                        <div className="flex items-center">
                                            <TrendingDown className="h-4 w-4 mr-2" />
                                            Consume Stock
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="adjust">
                                        <div className="flex items-center">
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Adjust Stock
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={inventoryForm.quantity}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={inventoryForm.notes}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                                rows={3}
                                placeholder="Optional notes about this inventory action..."
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => {
                                setIsInventoryDialogOpen(false);
                                setInventoryItem(null);
                                resetInventoryForm();
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit">Apply Action</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reorder Dialog */}
            <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reorder {reorderItem?.name}</DialogTitle>
                        <DialogDescription>
                            Place a new procurement order for this item from the preferred supplier
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-medium">Supplier: {reorderItem?.preferredSupplier?.companyName}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                {reorderItem?.preferredSupplier?.email && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`mailto:${reorderItem.preferredSupplier.email}`, '_blank')}
                                    >
                                        <Mail className="h-3 w-3 mr-1" />
                                        Email
                                    </Button>
                                )}
                                {reorderItem?.preferredSupplier?.phone && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`tel:${reorderItem.preferredSupplier.phone}`, '_blank')}
                                    >
                                        <Phone className="h-3 w-3 mr-1" />
                                        Call
                                    </Button>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleReorderItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="reorderQuantity">Quantity</Label>
                                    <Input
                                        id="reorderQuantity"
                                        type="number"
                                        min="1"
                                        value={reorderForm.quantity}
                                        onChange={(e) => setReorderForm({ ...reorderForm, quantity: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="unitPrice">Unit Price</Label>
                                    <Input
                                        id="unitPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={reorderForm.unitPrice}
                                        onChange={(e) => setReorderForm({ ...reorderForm, unitPrice: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="expectedDeliveryDate">Expected Delivery</Label>
                                <Input
                                    id="expectedDeliveryDate"
                                    type="date"
                                    value={reorderForm.expectedDeliveryDate}
                                    onChange={(e) => setReorderForm({ ...reorderForm, expectedDeliveryDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="reorderNotes">Notes</Label>
                                <Textarea
                                    id="reorderNotes"
                                    value={reorderForm.notes}
                                    onChange={(e) => setReorderForm({ ...reorderForm, notes: e.target.value })}
                                    rows={3}
                                    placeholder="Order notes..."
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => {
                                    setIsReorderDialogOpen(false);
                                    setReorderItem(null);
                                    resetReorderForm();
                                }}>
                                    Cancel
                                </Button>
                                <Button type="submit">Place Order</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
