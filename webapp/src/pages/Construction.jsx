import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FolderOpen, ShoppingCart, Package } from 'lucide-react';

export default function Construction() {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Construction Management</h1>
                <p className="text-gray-600 mt-1">Navigate core construction workflows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-none hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-3">View and manage all projects.</p>
                        <Link to="/projects">
                            <Button className="w-full" variant="outline">Go to Project List</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-none hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Buy Stuff
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-3">Browse products from suppliers.</p>
                        <Link to="/marketplace">
                            <Button className="w-full">Open Marketplace</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-none hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Our Store
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-3">Company inventory and stock.</p>
                        <Link to="/stock">
                            <Button className="w-full" variant="outline">Open Store</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


