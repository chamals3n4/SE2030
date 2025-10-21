import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import { supplierAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Search, Plus, Building, Phone, Mail, MapPin, Store, Star, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Suppliers() {
    const { state } = useAuthContext();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        // Only fetch suppliers when authentication is confirmed
        if (state.isAuthenticated && !state.isLoading) {
            fetchSuppliers();
        }
    }, [state.isAuthenticated, state.isLoading]);

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
            {/* Header Section */}
            <div className="space-y-4">
                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight">
                    Suppliers Management
                </h1>

                {/* Search Bar and Add Button in One Line */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Search Bar - Flexible Width */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers by name, contact, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 text-base w-full"
                        />
                    </div>

                    {/* Add Button */}
                    <div className="flex-shrink-0">
                        <Link to="/suppliers/create">
                            <Button size="lg" className="w-full sm:w-auto">
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Supplier
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSuppliers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                        <Building className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            {searchTerm ? 'No suppliers found' : 'No suppliers yet'}
                        </p>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <Card 
                            key={supplier.supplierId} 
                            className="group border-red-400 transition-all duration-300"
                        >
                            <CardContent className="p-5 space-y-4">
                                {/* Header */}
                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Building className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold line-clamp-1">{supplier.companyName}</h3>
                                        {supplier.contactName && (
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {supplier.contactName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {supplier.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{supplier.email}</span>
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 flex-shrink-0" />
                                            <span>{supplier.phone}</span>
                                        </div>
                                    )}
                                    {supplier.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{supplier.address}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Link to={`/suppliers/${supplier.supplierId}/store`} className="flex-1">
                                        <Button size="sm" variant="outline" className="w-full text-sm">
                                            <Store className="h-4 w-4 mr-1" />
                                            Store
                                        </Button>
                                    </Link>
                                    <Link to={`/suppliers/${supplier.supplierId}/admin`} className="flex-1">
                                        <Button size="sm" className="w-full text-sm">
                                            Manage
                                        </Button>
                                    </Link>
                                </div>

                                {/* Edit & Delete Actions */}
                                <div className="flex gap-2 pt-2 border-t mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-sm"
                                        onClick={() => openEditDialog(supplier)}
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="flex-1 text-sm text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
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
                        <div className="space-y-2">
                            <Label htmlFor="editCompanyName">Company Name *</Label>
                            <Input
                                id="editCompanyName"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editContactName">Contact Name</Label>
                            <Input
                                id="editContactName"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editPhone">Phone</Label>
                                <Input
                                    id="editPhone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editAddress">Address</Label>
                            <Textarea
                                id="editAddress"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
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
        </div>
    );
}
