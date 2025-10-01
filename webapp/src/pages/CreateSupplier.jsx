import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supplierAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, Building, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateSupplier() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        specialties: [],
        hasStore: false,
        rating: 0,
        notes: ''
    });

    const [newSpecialty, setNewSpecialty] = useState('');

    const SPECIALTY_OPTIONS = [
        'Construction Materials',
        'Heavy Equipment',
        'Tools & Hardware',
        'Safety Equipment',
        'Electrical Supplies',
        'Plumbing Supplies',
        'Concrete & Cement',
        'Steel & Metal',
        'Lumber & Wood',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                companyName: formData.companyName,
                contactName: formData.contactName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
            };
            await supplierAPI.create(payload);
            toast.success('Supplier created successfully');
            navigate('/suppliers');
        } catch (error) {
            toast.error('Failed to create supplier');
            console.error('Error creating supplier:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSpecialty = () => {
        if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
            setFormData({
                ...formData,
                specialties: [...formData.specialties, newSpecialty.trim()]
            });
            setNewSpecialty('');
        }
    };

    const removeSpecialty = (specialty) => {
        setFormData({
            ...formData,
            specialties: formData.specialties.filter(s => s !== specialty)
        });
    };

    const handleSpecialtySelect = (specialty) => {
        if (!formData.specialties.includes(specialty)) {
            setFormData({
                ...formData,
                specialties: [...formData.specialties, specialty]
            });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Add New Supplier</h1>
                <p className="text-gray-600 mt-1">Create a new supplier for your construction projects</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Building className="h-5 w-5 mr-2" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="companyName">Company Name *</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="contactName">Contact Person</Label>
                                <Input
                                    id="contactName"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={3}
                                placeholder="Enter full address..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/suppliers')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Create Supplier
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
