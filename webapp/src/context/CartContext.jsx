import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        try {
            const raw = window.localStorage.getItem('cartItems');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    });
    const [isOpen, setIsOpen] = useState(false);

    const addItem = (item) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id && i.type === item.type);
            if (existing) {
                return prev.map((i) => (i.id === item.id && i.type === item.type)
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i);
            }
            return [...prev, item];
        });
        setIsOpen(true);
    };

    const updateItem = (id, type, quantity) => {
        setItems((prev) => prev.map((i) => (i.id === id && i.type === type) ? { ...i, quantity } : i));
    };

    const removeItem = (id, type) => {
        setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
    };

    const clear = () => setItems([]);

    const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

    const value = { items, total, isOpen, setIsOpen, addItem, updateItem, removeItem, clear };
    React.useEffect(() => {
        try { window.localStorage.setItem('cartItems', JSON.stringify(items)); } catch { }
    }, [items]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}


