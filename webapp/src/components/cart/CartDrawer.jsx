import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { purchaseOrderAPI, stockAPI } from '@/services/api';
import { toast } from 'sonner';

export default function CartDrawer() {
    const { items, total, isOpen, setIsOpen, updateItem, removeItem, clear } = useCart();

    const checkout = async () => {
        try {
            if (items.length === 0) return;
            // Group items by supplier not tracked here; assume single supplier per checkout for simplicity
            // If needed, extend CartItem with supplierId to support multi-supplier batching
            const supplierId = window.localStorage.getItem('lastSupplierId') ? parseInt(window.localStorage.getItem('lastSupplierId')) : null;
            const projectId = window.localStorage.getItem('lastProjectId') ? parseInt(window.localStorage.getItem('lastProjectId')) : null;
            if (!supplierId) {
                // fallback: require purchase via supplier store or marketplace item click that sets supplier
                setIsOpen(false);
                return;
            }

            // Backend expects DTO: { resourceId, resourceType, quantity, unitPrice }
            const payloadItems = items.map(i => ({
                resourceId: i.id,
                resourceType: i.type === 'material' ? 'MATERIAL' : 'EQUIPMENT',
                quantity: i.quantity,
                unitPrice: i.price
            }));

            console.log('Creating purchase order with:', { supplierId, projectId, payloadItems });
            const purchaseOrder = await purchaseOrderAPI.createFromCart(supplierId, projectId || undefined, payloadItems, 'Cart checkout');
            console.log('Purchase order created:', purchaseOrder);

            // Show success message
            toast.success('Purchase order created successfully!');

            // Add items to stock
            for (const i of items) {
                try {
                    console.log('Adding to stock:', { supplierId, resourceId: i.id, resourceType: i.type === 'material' ? 'MATERIAL' : 'EQUIPMENT', quantity: i.quantity, unitCost: i.price, name: i.name });
                    await stockAPI.addFromPurchase(
                        supplierId,
                        i.id,
                        i.type === 'material' ? 'MATERIAL' : 'EQUIPMENT',
                        i.quantity,
                        i.price,
                        i.name,
                        ''
                    );
                    console.log('Stock added for item:', i.name);
                } catch (stockError) {
                    console.error('Failed to add stock for item:', i.name, stockError);
                    toast.error(`Failed to add ${i.name} to stock: ${stockError.message}`);
                    // Continue with other items even if one fails
                }
            }
            toast.success('Checkout completed! Items added to company stock.');
            clear();
            setIsOpen(false);
        } catch (e) {
            // leave drawer open for user to retry
            console.error('Checkout failed', e);
            toast.error(`Checkout failed: ${e.message}`);
        }
    }
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>Review items before purchasing.</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                    {items.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">Your cart is empty</div>
                    ) : (
                        items.map((i) => (
                            <div key={`${i.type}-${i.id}`} className="border rounded-md p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{i.name}</div>
                                        <div className="text-xs text-gray-500">{i.type === 'material' ? 'Material' : 'Equipment'}</div>
                                        <div className="text-sm mt-1">${i.price.toFixed(2)} each</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Qty</span>
                                        <Input type="number" min={1} value={i.quantity} onChange={(e) => updateItem(i.id, i.type, Math.max(1, parseInt(e.target.value) || 1))} className="w-20" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">${(i.price * i.quantity).toFixed(2)}</div>
                                        <Button variant="outline" size="sm" onClick={() => removeItem(i.id, i.type)}>Remove</Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <SheetFooter className="mt-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Total</div>
                        <div className="text-lg font-semibold">${total.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={clear}>Clear</Button>
                        <Button className="flex-1" onClick={checkout}>Checkout</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}


