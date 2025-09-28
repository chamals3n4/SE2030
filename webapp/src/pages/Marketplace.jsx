import React, { useEffect, useMemo, useState } from 'react';
import { materialAPI, equipmentAPI, supplierAPI } from '../services/api';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Package, Wrench, ShoppingCart, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddToCartDialog from '../components/cart/AddToCartDialog';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function Marketplace() {
    const { addItem } = useCart();
    const [activeTab, setActiveTab] = useState('materials');
    const [materials, setMaterials] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [mRes, eRes, sRes] = await Promise.all([
                    materialAPI.getAll(),
                    equipmentAPI.getAll(),
                    supplierAPI.getAll()
                ]);
                setMaterials(mRes.data || []);
                setEquipment(eRes.data || []);
                setSuppliers(sRes.data || []);
            } catch (e) {
                toast.error('Failed to load marketplace');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const supplierMap = useMemo(() => {
        const map = new Map();
        suppliers.forEach(s => map.set(s.supplierId, s));
        return map;
    }, [suppliers]);

    const filterItems = (items, type) => {
        return items.filter(it => {
            const matchesText = (it.name || '').toLowerCase().includes(query.toLowerCase()) ||
                (it.description || '').toLowerCase().includes(query.toLowerCase());
            const matchesSupplier = supplierFilter === 'all' || (it.preferredSupplier && it.preferredSupplier.supplierId?.toString() === supplierFilter);
            const isActive = (it.status || 'ACTIVE') === 'ACTIVE';
            return matchesText && matchesSupplier && isActive;
        });
    };

    const filteredMaterials = useMemo(() => filterItems(materials, 'material'), [materials, query, supplierFilter]);
    const filteredEquipment = useMemo(() => filterItems(equipment, 'equipment'), [equipment, query, supplierFilter]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogItem, setDialogItem] = useState(null);
    const [dialogType, setDialogType] = useState('material');

    const addToCart = (item, type) => {
        try {
            if (item?.preferredSupplier?.supplierId) {
                window.localStorage.setItem('lastSupplierId', String(item.preferredSupplier.supplierId));
            }
        } catch { }
        setDialogItem(item);
        setDialogType(type);
        setDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="h-64 flex items-center justify-center">Loading marketplace...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Marketplace</h1>
                    <p className="text-gray-600 mt-1">Browse products from all suppliers</p>
                </div>
                <Link to="/suppliers">
                    <Button variant="outline">
                        <Store className="h-4 w-4 mr-2" />
                        View Suppliers
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="Filter by supplier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliers.map(s => (
                            <SelectItem key={s.supplierId} value={s.supplierId.toString()}>{s.companyName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                </TabsList>

                <TabsContent value="materials">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredMaterials.map(m => (
                            <Card key={m.resourceId} className="shadow-none hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{m.name}</CardTitle>
                                        <Badge>ACTIVE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 line-clamp-2">{m.description}</p>
                                    <div className="flex items-center justify-between mt-3 text-sm">
                                        <span>Stock: {m.currentStock || 0} {m.unitOfMeasure}</span>
                                        <span className="font-semibold">${(m.price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        {m.preferredSupplier && (
                                            <Link to={`/suppliers/${m.preferredSupplier.supplierId}/store`} className="flex-1 min-w-[8rem]">
                                                <Button className="w-full sm:w-auto" variant="outline">
                                                    <Store className="h-4 w-4 mr-2" />
                                                    View Supplier Store
                                                </Button>
                                            </Link>
                                        )}
                                        <Button variant="default" size="sm" className="flex-1 sm:flex-none w-full sm:w-auto" onClick={() => addToCart(m, 'material')}>
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Add to cart
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="equipment">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredEquipment.map(e => (
                            <Card key={e.resourceId} className="shadow-none hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{e.name}</CardTitle>
                                        <Badge>ACTIVE</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 line-clamp-2">{e.description}</p>
                                    <div className="flex items-center justify-between mt-3 text-sm">
                                        <span>{e.equipmentType}</span>
                                        <span className="font-semibold">${(e.price || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-3">
                                        {e.preferredSupplier && (
                                            <Link to={`/suppliers/${e.preferredSupplier.supplierId}/store`} className="flex-1 min-w-[8rem]">
                                                <Button className="w-full sm:w-auto" variant="outline">
                                                    <Wrench className="h-4 w-4 mr-2" />
                                                    View Supplier Store
                                                </Button>
                                            </Link>
                                        )}
                                        <Button variant="default" size="sm" className="flex-1 sm:flex-none w-full sm:w-auto" onClick={() => addToCart(e, 'equipment')}>
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            Add to cart
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
            <AddToCartDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                item={dialogItem}
                type={dialogType}
                onConfirm={(payload) => { addItem(payload); toast.success(`${payload.name} added to cart`); }}
            />
        </div>
    );
}


