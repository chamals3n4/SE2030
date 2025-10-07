import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supplierAPI, materialAPI, equipmentAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
// Using custom divs instead of Card for a consistent compact style
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Plus, Edit, Trash2, Package, Wrench, Building, Search, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const MATERIAL_UNITS = ['KG', 'L', 'UNIT', 'M3', 'M2', 'M'];
const EQUIPMENT_TYPES = ['Excavator', 'Crane', 'Bulldozer', 'Truck', 'Generator', 'Compressor', 'Drill', 'Other'];

export default function SupplierAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('materials');

    // Data states
    const [supplier, setSupplier] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [materialSearch, setMaterialSearch] = useState('');
    const [equipmentSearch, setEquipmentSearch] = useState('');

    // Dialog states
    const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
    const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
    const [isEditMaterialDialogOpen, setIsEditMaterialDialogOpen] = useState(false);
    const [isEditEquipmentDialogOpen, setIsEditEquipmentDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [materialForm, setMaterialForm] = useState({
        name: '',
        description: '',
        unitOfMeasure: '',
        currentStock: 0,
        price: 0,
        status: 'ACTIVE'
    });

    const [equipmentForm, setEquipmentForm] = useState({
        name: '',
        description: '',
        equipmentType: '',
        model: '',
        price: 0,
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchSupplierData();
    }, [id]);

    const fetchSupplierData = async () => {
        try {
            setLoading(true);
            const [suppliersRes, materialsRes, equipmentRes] = await Promise.all([
                supplierAPI.getAll(),
                materialAPI.getAll(),
                equipmentAPI.getAll()
            ]);

            // Find the specific supplier
            const foundSupplier = suppliersRes.data.find(s => s.supplierId == id);
            setSupplier(foundSupplier);

            // Filter materials and equipment by supplier (if they have preferredSupplier)
            const supplierMaterials = materialsRes.data.filter(m =>
                m.preferredSupplier && m.preferredSupplier.supplierId == id
            );
            const supplierEquipment = equipmentRes.data.filter(e =>
                e.preferredSupplier && e.preferredSupplier.supplierId == id
            );

            setMaterials(supplierMaterials);
            setEquipment(supplierEquipment);
        } catch (error) {
            toast.error('Failed to fetch supplier data');
            console.error('Error fetching supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        try {
            await materialAPI.create({
                ...materialForm,
                preferredSupplier: { supplierId: parseInt(id, 10) }
            });
            toast.success('Material added to store');
            setIsMaterialDialogOpen(false);
            resetMaterialForm();
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to add material');
            console.error('Error adding material:', error);
        }
    };

    const handleCreateEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.create({
                ...equipmentForm,
                preferredSupplier: { supplierId: parseInt(id, 10) }
            });
            toast.success('Equipment added to store');
            setIsEquipmentDialogOpen(false);
            resetEquipmentForm();
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to add equipment');
            console.error('Error adding equipment:', error);
        }
    };

    const handleUpdateMaterial = async (e) => {
        e.preventDefault();
        try {
            await materialAPI.update(editingItem.resourceId, {
                ...materialForm,
                preferredSupplier: { supplierId: parseInt(id, 10) }
            });
            toast.success('Material updated');
            setIsEditMaterialDialogOpen(false);
            setEditingItem(null);
            resetMaterialForm();
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to update material');
            console.error('Error updating material:', error);
        }
    };

    const handleUpdateEquipment = async (e) => {
        e.preventDefault();
        try {
            await equipmentAPI.update(editingItem.resourceId, {
                ...equipmentForm,
                preferredSupplier: { supplierId: parseInt(id, 10) }
            });
            toast.success('Equipment updated');
            setIsEditEquipmentDialogOpen(false);
            setEditingItem(null);
            resetEquipmentForm();
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to update equipment');
            console.error('Error updating equipment:', error);
        }
    };

    const handleDeleteMaterial = async (id) => {
        try {
            await materialAPI.delete(id);
            toast.success('Material deleted');
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to delete material');
            console.error('Error deleting material:', error);
        }
    };

    const handleDeleteEquipment = async (id) => {
        try {
            await equipmentAPI.delete(id);
            toast.success('Equipment deleted');
            fetchSupplierData();
        } catch (error) {
            toast.error('Failed to delete equipment');
            console.error('Error deleting equipment:', error);
        }
    };

    const openEditMaterial = (material) => {
        setEditingItem(material);
        setMaterialForm({
            name: material.name,
            description: material.description,
            unitOfMeasure: material.unitOfMeasure,
            currentStock: material.currentStock,
            price: material.price || 0,
            status: material.status
        });
        setIsEditMaterialDialogOpen(true);
    };

    const openEditEquipment = (equipment) => {
        setEditingItem(equipment);
        setEquipmentForm({
            name: equipment.name,
            description: equipment.description,
            equipmentType: equipment.equipmentType,
            model: equipment.model || '',
            price: equipment.price || 0,
            status: equipment.status
        });
        setIsEditEquipmentDialogOpen(true);
    };

    const resetMaterialForm = () => {
        setMaterialForm({
            name: '',
            description: '',
            unitOfMeasure: '',
            currentStock: 0,
            price: 0,
            status: 'ACTIVE'
        });
    };

    const resetEquipmentForm = () => {
        setEquipmentForm({
            name: '',
            description: '',
            equipmentType: '',
            model: '',
            price: 0,
            status: 'ACTIVE'
        });
    };

    // Filter functions
    const filteredMaterials = materials.filter(material =>
        material.name?.toLowerCase().includes(materialSearch.toLowerCase()) ||
        material.description?.toLowerCase().includes(materialSearch.toLowerCase())
    );

    const filteredEquipment = equipment.filter(equipment =>
        equipment.name?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        equipment.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading supplier admin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-medium">{supplier?.companyName}</h1>
                    <p className="text-gray-600 mt-1">Store management dashboard</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setActiveTab('materials')}>Add Material</Button>
                    <Button variant="outline" onClick={() => setActiveTab('equipment')}>Add Equipment</Button>
                </div>
            </div>

            {/* Stats Cards - compact size same as other pages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[{
                    icon: <Package className="h-4 w-4 text-blue-600" />, bg: 'bg-blue-50', title: 'Materials', value: materials.length
                }, {
                    icon: <Wrench className="h-4 w-4 text-green-600" />, bg: 'bg-green-50', title: 'Equipment', value: equipment.length
                }, {
                    icon: <DollarSign className="h-4 w-4 text-purple-600" />, bg: 'bg-purple-50', title: 'Total Value', value: (materials.reduce((s, m) => s + (m.price * m.currentStock), 0) + equipment.reduce((s, e) => s + e.price, 0)).toLocaleString()
                }, {
                    icon: <TrendingUp className="h-4 w-4 text-orange-600" />, bg: 'bg-orange-50', title: 'Active Items', value: materials.filter(m => m.status === 'ACTIVE').length + equipment.filter(e => e.status === 'ACTIVE').length
                }].map((stat, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                            <div className={`p-1 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                <p className="text-base font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                {/* Materials Tab */}
                <TabsContent value="materials" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search materials..."
                                value={materialSearch}
                                onChange={(e) => setMaterialSearch(e.target.value)}
                                className="pl-9 shadow-none"
                            />
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
                                    <DialogTitle>Add New Material</DialogTitle>
                                    <DialogDescription>
                                        Add a new material to your store inventory
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateMaterial} className="space-y-4">
                                    <div>
                                        <Label htmlFor="materialName">Name *</Label>
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
                                            <Label htmlFor="materialUnit">Unit of Measure</Label>
                                            <Select
                                                value={materialForm.unitOfMeasure}
                                                onValueChange={(value) => setMaterialForm({ ...materialForm, unitOfMeasure: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MATERIAL_UNITS.map((unit) => (
                                                        <SelectItem key={unit} value={unit}>
                                                            {unit}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="materialStock">Current Stock</Label>
                                            <Input
                                                id="materialStock"
                                                type="number"
                                                value={materialForm.currentStock}
                                                onChange={(e) => setMaterialForm({ ...materialForm, currentStock: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="materialPrice">Price per Unit ($)</Label>
                                        <Input
                                            id="materialPrice"
                                            type="number"
                                            step="0.01"
                                            value={materialForm.price}
                                            onChange={(e) => setMaterialForm({ ...materialForm, price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Material</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Materials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMaterials.map((material) => (
                            <div key={material.resourceId} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium">{material.name}</h3>
                                    <Badge variant={material.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {material.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm text-gray-600">{material.description}</p>
                                    <div className="flex justify-between text-sm">
                                        <span>Stock: {material.currentStock} {material.unitOfMeasure}</span>
                                        <span className="font-medium">${material.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 mt-3">
                                    <Button variant="outline" size="sm" onClick={() => openEditMaterial(material)}>
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
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Equipment Tab */}
                <TabsContent value="equipment" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search equipment..."
                                value={equipmentSearch}
                                onChange={(e) => setEquipmentSearch(e.target.value)}
                                className="pl-9 shadow-none"
                            />
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
                                    <DialogTitle>Add New Equipment</DialogTitle>
                                    <DialogDescription>
                                        Add new equipment to your store inventory
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateEquipment} className="space-y-4">
                                    <div>
                                        <Label htmlFor="equipmentName">Name *</Label>
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
                                            <Label htmlFor="equipmentType">Type</Label>
                                            <Select
                                                value={equipmentForm.equipmentType}
                                                onValueChange={(value) => setEquipmentForm({ ...equipmentForm, equipmentType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EQUIPMENT_TYPES.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="equipmentModel">Model</Label>
                                            <Input
                                                id="equipmentModel"
                                                value={equipmentForm.model}
                                                onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="equipmentPrice">Price ($)</Label>
                                        <Input
                                            id="equipmentPrice"
                                            type="number"
                                            step="0.01"
                                            value={equipmentForm.price}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Equipment</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEquipment.map((equipment) => (
                            <div key={equipment.resourceId} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium">{equipment.name}</h3>
                                    <Badge variant={equipment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {equipment.status}
                                    </Badge>
                                </div>
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm text-gray-600">{equipment.description}</p>
                                    <div className="flex justify-between text-sm">
                                        <span>{equipment.equipmentType}</span>
                                        <span className="font-medium">${equipment.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    {equipment.model && (
                                        <p className="text-xs text-gray-500">Model: {equipment.model}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-2 mt-3">
                                    <Button variant="outline" size="sm" onClick={() => openEditEquipment(equipment)}>
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
                                                    Are you sure you want to delete "{equipment.name}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteEquipment(equipment.resourceId)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Material Dialog */}
            <Dialog open={isEditMaterialDialogOpen} onOpenChange={setIsEditMaterialDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Material</DialogTitle>
                        <DialogDescription>
                            Update material information
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateMaterial} className="space-y-4">
                        <div>
                            <Label htmlFor="editMaterialName">Name *</Label>
                            <Input
                                id="editMaterialName"
                                value={materialForm.name}
                                onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editMaterialDescription">Description</Label>
                            <Textarea
                                id="editMaterialDescription"
                                value={materialForm.description}
                                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editMaterialUnit">Unit of Measure</Label>
                                <Select
                                    value={materialForm.unitOfMeasure}
                                    onValueChange={(value) => setMaterialForm({ ...materialForm, unitOfMeasure: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MATERIAL_UNITS.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="editMaterialStock">Current Stock</Label>
                                <Input
                                    id="editMaterialStock"
                                    type="number"
                                    value={materialForm.currentStock}
                                    onChange={(e) => setMaterialForm({ ...materialForm, currentStock: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="editMaterialPrice">Price per Unit ($)</Label>
                            <Input
                                id="editMaterialPrice"
                                type="number"
                                step="0.01"
                                value={materialForm.price}
                                onChange={(e) => setMaterialForm({ ...materialForm, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditMaterialDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Material</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Equipment Dialog */}
            <Dialog open={isEditEquipmentDialogOpen} onOpenChange={setIsEditEquipmentDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Equipment</DialogTitle>
                        <DialogDescription>
                            Update equipment information
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateEquipment} className="space-y-4">
                        <div>
                            <Label htmlFor="editEquipmentName">Name *</Label>
                            <Input
                                id="editEquipmentName"
                                value={equipmentForm.name}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editEquipmentDescription">Description</Label>
                            <Textarea
                                id="editEquipmentDescription"
                                value={equipmentForm.description}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editEquipmentType">Type</Label>
                                <Select
                                    value={equipmentForm.equipmentType}
                                    onValueChange={(value) => setEquipmentForm({ ...equipmentForm, equipmentType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EQUIPMENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="editEquipmentModel">Model</Label>
                                <Input
                                    id="editEquipmentModel"
                                    value={equipmentForm.model}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="editEquipmentPrice">Price ($)</Label>
                            <Input
                                id="editEquipmentPrice"
                                type="number"
                                step="0.01"
                                value={equipmentForm.price}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditEquipmentDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Equipment</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
