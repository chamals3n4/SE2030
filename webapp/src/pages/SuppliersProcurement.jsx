import React, { useState, useEffect } from 'react';
import { supplierAPI, materialAPI, equipmentAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Search, Plus, Edit, Trash2, Building, Phone, Mail, MapPin, Package, Wrench, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function SuppliersProcurement() {
    // Data states
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSuppliesDialogOpen, setIsSuppliesDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [viewingSupplier, setViewingSupplier] = useState(null);
    const [supplierMaterials, setSupplierMaterials] = useState([]);
    const [supplierEquipment, setSupplierEquipment] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await supplierAPI.getAll();
            setSuppliers(response.data);
        } catch (error) {
            toast.error('Failed to fetch suppliers');
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        try {
            await supplierAPI.create(formData);
            toast.success('Supplier created successfully');
            setIsCreateDialogOpen(false);
            resetForm();
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to create supplier');
            console.error('Error creating supplier:', error);
        }
    };

    const handleUpdateSupplier = async (e) => {
        e.preventDefault();
        try {
            await supplierAPI.update(editingSupplier.supplierId, formData);
            toast.success('Supplier updated successfully');
            setIsEditDialogOpen(false);
            setEditingSupplier(null);
            resetForm();
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to update supplier');
            console.error('Error updating supplier:', error);
        }
    };

    const handleDeleteSupplier = async (id) => {
        try {
            await supplierAPI.delete(id);
            toast.success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
            console.error('Error deleting supplier:', error);
        }
    };

    const openEditDialog = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            companyName: supplier.companyName || '',
            contactName: supplier.contactName || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || ''
        });
        setIsEditDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            contactName: '',
            email: '',
            phone: '',
            address: ''
        });
    };

    const viewSupplierSupplies = async (supplier) => {
        try {
            setViewingSupplier(supplier);
            const [materialsRes, equipmentRes] = await Promise.all([
                materialAPI.getAll(),
                equipmentAPI.getAll()
            ]);

            // Filter materials and equipment by supplier
            const supplierMaterials = materialsRes.data.filter(m =>
                m.preferredSupplier && m.preferredSupplier.supplierId == supplier.supplierId
            );
            const supplierEquipment = equipmentRes.data.filter(e =>
                e.preferredSupplier && e.preferredSupplier.supplierId == supplier.supplierId
            );

            setSupplierMaterials(supplierMaterials);
            setSupplierEquipment(supplierEquipment);
            setIsSuppliesDialogOpen(true);
        } catch (error) {
            toast.error('Failed to fetch supplier supplies');
            console.error('Error fetching supplier supplies:', error);
        }
    };

    const getStatsCards = () => {
        const totalSuppliers = suppliers.length;
        const withEmail = suppliers.filter(s => s.email).length;
        const withPhone = suppliers.filter(s => s.phone).length;
        const withAddress = suppliers.filter(s => s.address).length;

        return [
            {
                title: 'Total Suppliers',
                value: totalSuppliers,
                icon: Building,
                bgColor: 'bg-blue-50',
                color: 'text-blue-600'
            },
            {
                title: 'With Email',
                value: withEmail,
                icon: Mail,
                bgColor: 'bg-green-50',
                color: 'text-green-600'
            },
            {
                title: 'With Phone',
                value: withPhone,
                icon: Phone,
                bgColor: 'bg-purple-50',
                color: 'text-purple-600'
            },
            {
                title: 'With Address',
                value: withAddress,
                icon: MapPin,
                bgColor: 'bg-orange-50',
                color: 'text-orange-600'
            }
        ];
    };

    // Filter suppliers based on search term
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading suppliers...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Suppliers & Procurement</h1>
                    <p className="text-gray-600 mt-1">Manage suppliers and procurement processes</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Supplier
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Supplier</DialogTitle>
                            <DialogDescription>
                                Create a new supplier with contact information for procurement management
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSupplier} className="space-y-4">
                            <div>
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactName">Contact Name</Label>
                                <Input
                                    id="contactName"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Supplier</Button>
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

            {/* Search */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 shadow-none"
                    />
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuppliers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <Building className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No suppliers found</p>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <Card key={supplier.supplierId} className="shadow-none hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                                        {supplier.contactName && (
                                            <p className="text-sm text-gray-600 mt-1">{supplier.contactName}</p>
                                        )}
                                    </div>
                                    <Building className="h-5 w-5 text-gray-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {supplier.email && (
                                        <div className="flex items-center text-sm">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{supplier.email}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center text-sm">
                                            <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    )}
                                    {supplier.address && (
                                        <div className="flex items-start text-sm">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="flex-1 line-clamp-2">{supplier.address}</span>
                                        </div>
                                    )}

                                    {/* Quick Action Buttons */}
                                    <div className="flex items-center space-x-2 pt-2">
                                        {supplier.email && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`mailto:${supplier.email}`, '_blank')}
                                                className="flex-1"
                                            >
                                                <Mail className="h-3 w-3 mr-1" />
                                                Email
                                            </Button>
                                        )}
                                        {supplier.phone && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`tel:${supplier.phone}`, '_blank')}
                                                className="flex-1"
                                            >
                                                <Phone className="h-3 w-3 mr-1" />
                                                Call
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Management Actions */}
                                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewSupplierSupplies(supplier)}
                                        className="flex-1"
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Supplies
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(supplier)}
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
                                                <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete "{supplier.companyName}"? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSupplier(supplier.supplierId)}>
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

            {/* Edit Supplier Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Update supplier contact information and details
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSupplier} className="space-y-4">
                        <div>
                            <Label htmlFor="editCompanyName">Company Name</Label>
                            <Input
                                id="editCompanyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="editContactName">Contact Name</Label>
                            <Input
                                id="editContactName"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        </div>
                        <div>
                            <Label htmlFor="editAddress">Address</Label>
                            <Textarea
                                id="editAddress"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => {
                                setIsEditDialogOpen(false);
                                setEditingSupplier(null);
                                resetForm();
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Supplier</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Supplies Dialog */}
            <Dialog open={isSuppliesDialogOpen} onOpenChange={setIsSuppliesDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Supplies from {viewingSupplier?.companyName}</DialogTitle>
                        <DialogDescription>
                            View all materials and equipment sourced from this supplier
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Materials Section */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Materials ({supplierMaterials.length})
                            </h4>
                            {supplierMaterials.length === 0 ? (
                                <p className="text-gray-500 text-sm">No materials from this supplier.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {supplierMaterials.map((material) => (
                                        <Card key={material.resourceId} className="shadow-sm">
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{material.name}</p>
                                                        <p className="text-sm text-gray-600">{material.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                            <span>Stock: {material.currentStock} {material.unitOfMeasure}</span>
                                                            <span>Status: {material.status}</span>
                                                        </div>
                                                    </div>
                                                    <Package className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Equipment Section */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center">
                                <Wrench className="h-4 w-4 mr-2" />
                                Equipment ({supplierEquipment.length})
                            </h4>
                            {supplierEquipment.length === 0 ? (
                                <p className="text-gray-500 text-sm">No equipment from this supplier.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {supplierEquipment.map((equipment) => (
                                        <Card key={equipment.resourceId} className="shadow-sm">
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{equipment.name}</p>
                                                        <p className="text-sm text-gray-600">{equipment.description}</p>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                            <span>Type: {equipment.equipmentType}</span>
                                                            {equipment.model && <span>Model: {equipment.model}</span>}
                                                            <span>Status: {equipment.status}</span>
                                                        </div>
                                                    </div>
                                                    <Wrench className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => setIsSuppliesDialogOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
