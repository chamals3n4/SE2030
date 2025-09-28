import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supplierAPI, materialAPI, equipmentAPI, stockAPI } from '../services/api';
import AddToCartDialog from '../components/cart/AddToCartDialog';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ShoppingCart, Package, Wrench, Search, Plus, Minus, Building, Phone, Mail, Star, DollarSign, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function SupplierStore() {
    const { addItem } = useCart();
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

    // Cart states
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Purchase dialog states
    const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState({
        projectId: '',
        notes: ''
    });

    useEffect(() => {
        fetchStoreData();
    }, [id]);

    const fetchStoreData = async () => {
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
            toast.error('Failed to fetch store data');
            console.error('Error fetching store data:', error);
        } finally {
            setLoading(false);
        }
    };

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogItem, setDialogItem] = useState(null);
    const [dialogType, setDialogType] = useState('material');

    const addToCart = (item, type) => {
        try { window.localStorage.setItem('lastSupplierId', String(id)); } catch { }
        setDialogItem(item);
        setDialogType(type);
        setDialogOpen(true);
    };

    const updateCartQuantity = (itemId, quantity) => {
        setCart(prevCart =>
            prevCart.map(cartItem =>
                cartItem.id === itemId
                    ? { ...cartItem, quantity: Math.max(0, Math.min(quantity, cartItem.maxQuantity)) }
                    : cartItem
            ).filter(cartItem => cartItem.quantity > 0)
        );
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== itemId));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handlePurchase = async () => {
        try {
            // Create Purchase Order from cart
            const items = cart.map(item => ({
                quantity: item.quantity,
                unitPrice: item.price,
                resourceType: item.type === 'material' ? 'MATERIAL' : 'EQUIPMENT',
                resource: { resourceId: item.id }
            }));

            await purchaseOrderAPI.createFromCart(
                parseInt(id, 10),
                purchaseForm.projectId || undefined,
                items,
                purchaseForm.notes || undefined
            );

            // Optionally also reflect in company stock
            for (const item of cart) {
                await stockAPI.addFromPurchase(
                    parseInt(id, 10),
                    item.id,
                    item.type === 'material' ? 'MATERIAL' : 'EQUIPMENT',
                    item.quantity,
                    item.price,
                    item.name,
                    ''
                );
            }
            toast.success('Purchase completed successfully');
            setIsPurchaseDialogOpen(false);
            setCart([]);
            setPurchaseForm({ projectId: '', notes: '' });
        } catch (error) {
            toast.error('Failed to complete purchase');
            console.error('Error completing purchase:', error);
        }
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
                    <div className="text-lg">Loading store...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/suppliers')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Suppliers
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{supplier?.companyName} Store</h1>
                        <p className="text-gray-600 mt-1">Browse and purchase construction materials and equipment</p>
                    </div>
                </div>

                {/* Cart Button */}
                <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <DialogTrigger asChild>
                        <Button className="relative">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Cart ({cart.length})
                            {cart.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </Badge>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Shopping Cart</DialogTitle>
                            <DialogDescription>
                                Review your items before purchasing
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                            ) : (
                                <>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {cart.map((item) => (
                                            <Card key={item.id} className="shadow-none">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{item.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {item.type === 'material' ? 'Material' : 'Equipment'}
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                ${item.price.toFixed(2)} per {item.unit}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center">{item.quantity}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                                disabled={item.quantity >= item.maxQuantity}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeFromCart(item.id)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Total:</span>
                                            <span>${getCartTotal().toFixed(2)}</span>
                                        </div>
                                        <Button
                                            className="w-full mt-4"
                                            onClick={() => {
                                                setIsCartOpen(false);
                                                setIsPurchaseDialogOpen(true);
                                            }}
                                        >
                                            <Truck className="h-4 w-4 mr-2" />
                                            Proceed to Purchase
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Supplier Info */}
            <Card className="shadow-none">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{supplier?.companyName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {supplier?.email && (
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {supplier.email}
                                        </div>
                                    )}
                                    {supplier?.phone && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {supplier.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {supplier?.rating && (
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 font-medium">{supplier.rating}</span>
                                </div>
                            )}
                            <Badge variant="default">Store Available</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment ({equipment.length})</TabsTrigger>
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
                    </div>

                    {/* Materials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredMaterials.map((material) => (
                            <Card key={material.resourceId} className="shadow-none hover:shadow-lg transition-all duration-200 group">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                            {material.name}
                                        </CardTitle>
                                        <Badge variant={material.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {material.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Stock: {material.currentStock} {material.unitOfMeasure}
                                            </div>
                                            <div className="text-lg font-bold text-green-600">
                                                ${material.price?.toFixed(2) || '0.00'}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={() => addToCart(material, 'material')}
                                            disabled={material.status !== 'ACTIVE' || material.currentStock <= 0}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {material.currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
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
                    </div>

                    {/* Equipment Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredEquipment.map((equipment) => (
                            <Card key={equipment.resourceId} className="shadow-none hover:shadow-lg transition-all duration-200 group">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                            {equipment.name}
                                        </CardTitle>
                                        <Badge variant={equipment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {equipment.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 line-clamp-2">{equipment.description}</p>

                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-500">
                                                Type: {equipment.equipmentType}
                                            </div>
                                            {equipment.model && (
                                                <div className="text-sm text-gray-500">
                                                    Model: {equipment.model}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Available
                                            </div>
                                            <div className="text-lg font-bold text-green-600">
                                                ${equipment.price?.toFixed(2) || '0.00'}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={() => addToCart(equipment, 'equipment')}
                                            disabled={equipment.status !== 'ACTIVE'}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Purchase Dialog */}
            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Purchase</DialogTitle>
                        <DialogDescription>
                            Finalize your purchase and add items to company stock
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="projectId">Project (Optional)</Label>
                            <Select
                                value={purchaseForm.projectId}
                                onValueChange={(value) => setPurchaseForm({ ...purchaseForm, projectId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No specific project</SelectItem>
                                    <SelectItem value="project1">Project Alpha</SelectItem>
                                    <SelectItem value="project2">Project Beta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                                id="notes"
                                value={purchaseForm.notes}
                                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                                placeholder="Additional notes for this purchase..."
                            />
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount:</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsPurchaseDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handlePurchase}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Complete Purchase
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add to cart dialog */}
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
