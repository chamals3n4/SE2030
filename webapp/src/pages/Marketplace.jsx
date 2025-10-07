import React, { useEffect, useMemo, useState } from 'react';
import { materialAPI, equipmentAPI, supplierAPI, stockAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Replaced Card with lightweight custom div container
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
    const [supplierMap, setSupplierMap] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [mRes, eRes, sRes] = await Promise.all([
                    materialAPI.getAll(),
                    equipmentAPI.getAll(),
                    supplierAPI.getAll().catch(() => ({ data: [] }))
                ]);
                setMaterials(mRes.data || []);
                setEquipment(eRes.data || []);
                const map = {};
                (sRes.data || []).forEach(s => { map[s.supplierId] = s.companyName || s.name || ''; });
                setSupplierMap(map);
            } catch (e) {
                toast.error('Failed to load marketplace');
            }
        };
        load();
    }, []);

    const items = useMemo(() => {
        const mapMaterial = (m) => {
            const supplierId = m.preferredSupplierId || m.preferredSupplier?.supplierId || m.preferredSupplier;
            const supplierName = m.preferredSupplier?.companyName || m.preferredSupplier?.name || supplierMap[supplierId] || m.supplierName || '';
            return {
                id: m.resourceId,
                kind: 'MATERIAL',
                name: m.name,
                description: m.description,
                supplier: m.preferredSupplier,
                supplierName,
                unit: m.unitOfMeasure,
                price: m.price || 0
            };
        };
        const mapEquipment = (e) => {
            const supplierId = e.preferredSupplierId || e.preferredSupplier?.supplierId || e.preferredSupplier;
            const supplierName = e.preferredSupplier?.companyName || e.preferredSupplier?.name || supplierMap[supplierId] || e.supplierName || '';
            return {
                id: e.resourceId,
                kind: 'EQUIPMENT',
                name: e.name,
                description: e.description,
                supplier: e.preferredSupplier,
                supplierName,
                unit: null,
                price: e.price || 0,
                model: e.model
            };
        };
        let list = [...materials.map(mapMaterial), ...equipment.map(mapEquipment)];
        if (typeFilter !== 'ALL') list = list.filter(i => i.kind === typeFilter);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(i => (i.name || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q) || (i.supplierName || '').toLowerCase().includes(q));
        }
        return list;
    }, [materials, equipment, search, typeFilter, supplierMap]);

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
                    <Input className="pl-9 shadow-none" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40 shadow-none">
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
                    <div key={`${item.kind}-${item.id}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium leading-tight">{item.name}</h3>
                                <p className="text-xs text-gray-500">{item.supplierName || '—'}</p>
                            </div>
                            {item.kind === 'MATERIAL' ? <Package className="h-4 w-4 text-gray-400" /> : <Wrench className="h-4 w-4 text-gray-400" />}
                        </div>
                        {item.description && (
                            <p className="mt-2 text-sm text-gray-600 leading-snug line-clamp-1">{item.description}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-700">{item.unit || item.model || ''}</span>
                            <span className="text-sm font-semibold">${Number(item.price || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end mt-2">
                            <Button size="sm" onClick={() => openAdd(item)}>Add to Stock</Button>
                        </div>
                    </div>
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


