import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

export default function SuppliersLayout({ children }) {
    return (
        <div className="min-h-screen">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <div className="font-semibold">Supplier Portal</div>
                    <nav className="flex items-center gap-1">
                        <NavLink to="/suppliers">Suppliers</NavLink>
                        <NavLink to="/suppliers/create">Add Supplier</NavLink>
                    </nav>
                    <div className="hidden md:block">
                        <Link to="/">
                            <Button variant="outline" size="sm">Back to Portal</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6">
                {children}
            </main>
        </div>
    );
}


