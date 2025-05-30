import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Palette, Package, Users, Truck, Edit } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { User } from './InventoryApp';

interface SettingsTabProps {
  user: User;
  setUser: (user: User) => void;
}

const colorSchemes = [
  { name: 'Blue', value: 'blue', color: '#3b82f6' },
  { name: 'Green', value: 'green', color: '#10b981' },
  { name: 'Purple', value: 'purple', color: '#8b5cf6' },
  { name: 'Orange', value: 'orange', color: '#f59e0b' },
  { name: 'Red', value: 'red', color: '#ef4444' },
];

const categories = ['Drinks','Food','Electronics','Repair','Hair','Clothes','Shoes','Motor Vehicles','General Service','Others'];
const units = ['kg','litres','pieces','boxes','grams','ml','Number','other'];

export function SettingsTab({ user, setUser }: SettingsTabProps) {
  const { toast } = useToast();
  const { products, suppliers, buyers, addProduct, updateProduct, addSupplier, addBuyer } = useAppContext();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const updateTheme = (color: string) => {
    const updatedUser = { ...user, color };
    setUser(updatedUser);
    const data = JSON.parse(localStorage.getItem('invsmgr_data') || '{}');
    data[user.id] = updatedUser;
    localStorage.setItem('invsmgr_data', JSON.stringify(data));
    
    document.documentElement.style.setProperty('--primary', colorSchemes.find(c => c.value === color)?.color || '#3b82f6');
    toast({ title: 'Theme updated!', description: 'Color scheme has been changed.' });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const product = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      sellPrice: Number(formData.get('sellPrice')),
    };
    
    if (addProduct(product)) {
      form.reset();
      toast({ title: 'Product added!', description: `${product.name} has been added.` });
    }
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const product = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
      sellPrice: Number(formData.get('sellPrice')),
    };
    
    if (editingProduct) {
      updateProduct(editingProduct, product);
      setEditingProduct(null);
      toast({ title: 'Product updated!', description: `${product.name} has been updated.` });
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const supplier = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || undefined,
    };
    
    if (addSupplier(supplier)) {
      form.reset();
      toast({ title: 'Supplier added!', description: `${supplier.name} has been added.` });
    }
  };

  const handleAddBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const buyer = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || undefined,
    };
    
    if (addBuyer(buyer)) {
      form.reset();
      toast({ title: 'Buyer added!', description: `${buyer.name} has been added.` });
    }
  };

  const editingProductData = editingProduct ? products.find(p => p.id === editingProduct) : null;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theme">🎨 Theme</TabsTrigger>
          <TabsTrigger value="products">📦 Products</TabsTrigger>
          <TabsTrigger value="suppliers">🚚 Suppliers</TabsTrigger>
          <TabsTrigger value="buyers">👤 Buyers</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Color Settings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => updateTheme(scheme.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    user.color === scheme.value ? 'border-gray-800 shadow-lg' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: scheme.color }}
                >
                  <div className="text-white font-medium">{scheme.name}</div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={editingProductData?.name} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingProductData?.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select name="unit" defaultValue={editingProductData?.unit} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sellPrice">Default Sell Price</Label>
                  <Input id="sellPrice" name="sellPrice" type="number" step="0.01" min="0" defaultValue={editingProductData?.sellPrice} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Products List ({products.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category} • {product.unit} • ${product.sellPrice}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditingProduct(product.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No products added yet</div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Add New Supplier
              </h3>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <Button type="submit" className="w-full">Add Supplier</Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Suppliers List ({suppliers.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-500">{supplier.phone}{supplier.email && ` • ${supplier.email}`}</div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No suppliers added yet</div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="buyers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Add New Buyer
              </h3>
              <form onSubmit={handleAddBuyer} className="space-y-4">
                <div>
                  <Label htmlFor="name">Buyer Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" required />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <Button type="submit" className="w-full">Add Buyer</Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Buyers List ({buyers.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {buyers.map((buyer, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">{buyer.name}</div>
                    <div className="text-sm text-gray-500">{buyer.phone}{buyer.email && ` • ${buyer.email}`}</div>
                  </div>
                ))}
                {buyers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">No buyers added yet</div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}