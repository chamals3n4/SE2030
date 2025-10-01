import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supplierAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Building, Phone, Mail, MapPin, Store, Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
                    <h1 className="text-3xl font-bold">Suppliers</h1>
                    <p className="text-gray-600 mt-1">Browse and manage construction suppliers</p>
                </div>
                <Link to="/suppliers/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Supplier
                    </Button>
                </Link>
            </div>

            {/* Simple search bar only */}

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

            {/* Compact suppliers grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSuppliers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                        <Building className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">No suppliers found</p>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <Card key={supplier.supplierId} className="shadow-none hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <div className="font-medium leading-tight line-clamp-2">{supplier.companyName}</div>
                                    <div className="text-xs text-gray-600 truncate">{supplier.email || supplier.phone || '—'}</div>
                                    {supplier.address && (
                                        <div className="text-xs text-gray-500 line-clamp-2">{supplier.address}</div>
                                    )}
                                    <div className="flex items-center gap-2 pt-1">
                                        <Link to={`/suppliers/${supplier.supplierId}/store`} className="flex-1">
                                            <Button size="sm" variant="outline" className="w-full">Visit Store</Button>
                                        </Link>
                                        <Link to={`/suppliers/${supplier.supplierId}/admin`}>
                                            <Button size="sm">Manage</Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
