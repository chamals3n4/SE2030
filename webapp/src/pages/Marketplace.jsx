import React, { useEffect, useMemo, useState } from 'react';
import { materialAPI, equipmentAPI, stockAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Wrench, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Marketplace() {
    const [materials, setMaterials] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [unitCost, setUnitCost] = useState('0');

    useEffect(() => {
        const load = async () => {
            try {
                const [mRes, eRes] = await Promise.all([
                    materialAPI.getAll(),
                    equipmentAPI.getAll()
                ]);
                setMaterials(mRes.data || []);
                setEquipment(eRes.data || []);
            } catch (e) {
                toast.error('Failed to load marketplace');
            }
        };
        load();
    }, []);

    const items = useMemo(() => {
        const mapMaterial = (m) => ({
            id: m.resourceId, kind: 'MATERIAL', name: m.name, description: m.description, supplier: m.preferredSupplier, unit: m.unitOfMeasure, price: m.price || 0
        });
        const mapEquipment = (e) => ({
            id: e.resourceId, kind: 'EQUIPMENT', name: e.name, description: e.description, supplier: e.preferredSupplier, unit: null, price: e.price || 0, model: e.model
        });
        let list = [...materials.map(mapMaterial), ...equipment.map(mapEquipment)];
        if (typeFilter !== 'ALL') list = list.filter(i => i.kind === typeFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(i => (i.name || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q) || (i.supplier?.companyName || '').toLowerCase().includes(q));
        }
        return list;
    }, [materials, equipment, search, typeFilter]);

    const openAdd = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        setUnitCost(String(item.price || '0'));
        setAddDialogOpen(true);
    };

    const addToStock = async (e) => {
        e?.preventDefault();
        if (!selectedItem) return;
        try {
            await stockAPI.addFromPurchase(
                selectedItem.supplier?.supplierId || undefined,
                selectedItem.id,
                selectedItem.kind,
                Number(quantity || 0),
                undefined,
                selectedItem.name,
                selectedItem.description || ''
            );
            toast.success('Added to company stock');
            setAddDialogOpen(false);
        } catch (err) {
            toast.error('Failed to add to stock');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Marketplace</h1>
                <p className="text-gray-600 mt-1">Browse supplier materials and equipment and add to company stock</p>
            </div>

            <div className="flex gap-3 items-center">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem>
                        <SelectItem value="MATERIAL">Materials</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <Card key={`${item.kind}-${item.id}`} className="shadow-none">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <p className="text-xs text-gray-500">{item.supplier?.companyName || 'No supplier'}</p>
                                </div>
                                {item.kind === 'MATERIAL' ? <Package className="h-5 w-5 text-gray-400" /> : <Wrench className="h-5 w-5 text-gray-400" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-sm text-gray-700">{item.unit || item.model || ''}</span>
                                <span className="text-sm font-semibold">${Number(item.price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button onClick={() => openAdd(item)}>Add to Stock</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add to Company Stock</DialogTitle>
                        <DialogDescription>
                            Specify quantity. Price defaults from the supplier item.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={addToStock}>
                        <div>
                            <Label>Item</Label>
                            <div className="text-sm text-gray-800">{selectedItem?.name}</div>
                        </div>
                        <div>
                            <Label>Quantity</Label>
                            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                        </div>
                        {/* Unit Cost now auto-derived; hidden from UI */}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Add</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}


