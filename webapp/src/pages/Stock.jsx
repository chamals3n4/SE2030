import React, { useState, useEffect } from 'react';
import { stockAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Search, Package, Wrench, TrendingUp, TrendingDown, Plus, Minus, DollarSign, Building, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Stock() {
    const [activeTab, setActiveTab] = useState('overview');

    // Data states
    const [stockItems, setStockItems] = useState([]);
    const [stockMovements, setStockMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Dialog states
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [adjustForm, setAdjustForm] = useState({
        resourceId: '',
        quantity: 0,
        notes: ''
    });

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        try {
            setLoading(true);
            const [stockRes] = await Promise.all([
                stockAPI.getAll()
            ]);
            setStockItems(stockRes.data);
            setStockMovements([]);
        } catch (error) {
            toast.error('Failed to fetch stock data');
            console.error('Error fetching stock data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async (e) => {
        e.preventDefault();
        try {
            await stockAPI.adjust(adjustForm.resourceId, adjustForm.quantity, adjustForm.notes);
            toast.success('Stock adjusted successfully');
            setIsAdjustDialogOpen(false);
            setAdjustForm({ resourceId: '', quantity: 0, notes: '' });
            fetchStockData();
        } catch (error) {
            toast.error('Failed to adjust stock');
            console.error('Error adjusting stock:', error);
        }
    };

    // Filter functions
    const filteredStockItems = stockItems.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || (item.resourceType || '').toLowerCase() === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatsCards = () => {
        const totalItems = stockItems.length;
        const activeItems = stockItems.filter(item => item.status === 'ACTIVE').length;
        const lowStockItems = stockItems.filter(item =>
            item.type === 'material' && item.currentStock <= (item.reorderLevel || 10)
        ).length;
        const totalValue = stockItems.reduce((sum, item) => {
            const qty = item.currentQuantity || 0;
            const cost = Number(item.unitCost || 0);
            return sum + (cost * qty);
        }, 0);

        return [
            {
                title: 'Total Items',
                value: totalItems,
                icon: Package,
                bgColor: 'bg-blue-50',
                color: 'text-blue-600'
            },
            {
                title: 'Active Items',
                value: activeItems,
                icon: TrendingUp,
                bgColor: 'bg-green-50',
                color: 'text-green-600'
            },
            {
                title: 'Low Stock',
                value: lowStockItems,
                icon: TrendingDown,
                bgColor: 'bg-red-50',
                color: 'text-red-600'
            },
            {
                title: 'Total Value',
                value: `$${totalValue.toLocaleString()}`,
                icon: DollarSign,
                bgColor: 'bg-purple-50',
                color: 'text-purple-600'
            }
        ];
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading stock...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Stock Management</h1>
                    <p className="text-gray-600 mt-1">Manage company inventory and stock movements</p>
                </div>
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Stock Overview</TabsTrigger>
                    <TabsTrigger value="movements">Stock Movements</TabsTrigger>
                </TabsList>

                {/* Stock Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search stock items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 shadow-none"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="material">Materials</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stock Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStockItems.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">No stock items found</p>
                            </div>
                        ) : (
                            filteredStockItems.map((item) => (
                                <Card key={item.stockId || item.resourceId} className="shadow-none hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg">{item.name}</CardTitle>
                                            <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Type:</span>
                                                    <span className="font-medium">{(item.resourceType || '').toUpperCase()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Stock:</span>
                                                    <span className="font-medium">{item.currentQuantity} {item.unitOfMeasure || ''}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Value:</span>
                                                    <span className="font-medium text-green-600">${Number((item.unitCost || 0) * (item.currentQuantity || 0)).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {item.type === 'material' && item.currentStock <= (item.reorderLevel || 10) && (
                                                <div className="bg-red-50 border border-red-200 rounded-md p-2">
                                                    <p className="text-sm text-red-600 font-medium">
                                                        Low Stock Alert
                                                    </p>
                                                    <p className="text-xs text-red-500">
                                                        Reorder level: {item.reorderLevel || 10}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex justify-end space-x-2 pt-3 border-t">
                                                <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setAdjustForm({ ...adjustForm, resourceId: item.resourceId })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Adjust
                                                        </Button>
                                                    </DialogTrigger>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Stock Movements Tab */}
                <TabsContent value="movements" className="space-y-4">
                    <div className="space-y-4">
                        {stockMovements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <TrendingUp className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">No stock movements found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stockMovements.map((movement) => (
                                    <Card key={movement.movementId} className="shadow-none">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium">{movement.resourceName}</h4>
                                                        <Badge variant={
                                                            movement.movementType === 'RECEIVE' ? 'default' :
                                                                movement.movementType === 'CONSUME' ? 'destructive' : 'secondary'
                                                        }>
                                                            {movement.movementType}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Quantity: {movement.quantity} {movement.unitOfMeasure}
                                                    </p>
                                                    {movement.notes && (
                                                        <p className="text-sm text-gray-500 mt-1">{movement.notes}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(movement.movementDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(movement.movementDate).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Stock Adjustment Dialog */}
            <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adjust Stock</DialogTitle>
                        <DialogDescription>
                            Add or remove stock for this item
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStockAdjustment} className="space-y-4">
                        <div>
                            <Label htmlFor="adjustQuantity">Quantity Change</Label>
                            <Input
                                id="adjustQuantity"
                                type="number"
                                value={adjustForm.quantity}
                                onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })}
                                placeholder="Positive to add, negative to remove"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="adjustNotes">Notes</Label>
                            <Input
                                id="adjustNotes"
                                value={adjustForm.notes}
                                onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                                placeholder="Reason for adjustment..."
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAdjustDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Adjust Stock
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
