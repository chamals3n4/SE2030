import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';

function NavLink({ to, children }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link to={to} className={`px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            {children}
        </Link>
    );
}

export default function ConstructionLayout({ children }) {
    const { items, setIsOpen } = useCart();
    return (
        <div className="min-h-screen">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <div className="font-semibold">Construction Management</div>
                    <nav className="flex items-center gap-1">
                        <NavLink to="/construction">Home</NavLink>
                        <NavLink to="/projects">Projects</NavLink>
                        <NavLink to="/marketplace">Buy Stuff</NavLink>
                        <NavLink to="/stock">Our Store</NavLink>
                    </nav>
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/projects/create">
                            <Button size="sm">New Project</Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                            Cart {items.length > 0 ? `(${items.reduce((s, i) => s + i.quantity, 0)})` : ''}
                        </Button>
                        <Link to="/">
                            <Button variant="outline" size="sm">Back to Portal</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">
                {children}
            </main>
            <CartDrawer />
        </div>
    );
}


