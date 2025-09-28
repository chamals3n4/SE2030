import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddToCartDialog({ open, onOpenChange, item, type, onConfirm }) {
    const [quantity, setQuantity] = useState(1);

    const handleConfirm = () => {
        if (!item) return;
        onConfirm({ id: item.resourceId, name: item.name, type, price: item.price || 0, quantity });
        onOpenChange(false);
        setQuantity(1);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQuantity(1); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add to Cart</DialogTitle>
                    <DialogDescription>
                        {item ? `Add ${item.name} to your cart.` : ''}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="text-sm text-gray-600">Price: ${((item?.price) || 0).toFixed(2)}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Quantity</span>
                        <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-24" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


