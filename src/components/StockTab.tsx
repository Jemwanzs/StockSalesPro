import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Package, Search } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { User } from './InventoryApp';

interface StockTabProps {
  user: User;
  setUser: (user: User) => void;
}

const colorSchemes = {
  blue: '#3b82f6',
  green: '#10b981',
  purple: '#8b5cf6',
  orange: '#f59e0b',
  red: '#ef4444',
};

export function StockTab({ user, setUser }: StockTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const { toast } = useToast();
  const { products, suppliers, stock, addStock, updateStock, getAvailableStock, getUniqueProducts } = useAppContext();
  const brandColor = colorSchemes[user.color as keyof typeof colorSchemes] || colorSchemes.blue;

  const [formData, setFormData] = useState({
    category: '',
    unit: '',
    sellPrice: '',
    supplierPhone: '',
    supplierEmail: ''
  });

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.name === selectedProduct);
      if (product) {
        setFormData(prev => ({
          ...prev,
          category: product.category,
          unit: product.unit,
          sellPrice: product.sellPrice.toString()
        }));
      }
    }
  }, [selectedProduct, products]);

  useEffect(() => {
    if (selectedSupplier) {
      const supplier = suppliers.find(s => s.name === selectedSupplier);
      if (supplier) {
        setFormData(prev => ({
          ...prev,
          supplierPhone: supplier.phone,
          supplierEmail: supplier.email || ''
        }));
      }
    }
  }, [selectedSupplier, suppliers]);

  const addOrUpdateStock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    
    const stockDate = formDataObj.get('date') as string;
    const today = new Date().toISOString().split('T')[0];
    
    if (stockDate > today) {
      toast({ 
        title: 'Invalid Date', 
        description: 'Stock cannot be added for future dates',
        variant: 'destructive'
      });
      return;
    }
    
    const stockData = {
      productName: formDataObj.get('productName') as string,
      category: formDataObj.get('category') as string,
      unit: formDataObj.get('unit') as string,
      quantity: Number(formDataObj.get('quantity')),
      buyPrice: Number(formDataObj.get('buyPrice')),
      sellPrice: Number(formDataObj.get('sellPrice')),
      supplier: formDataObj.get('supplier') as string,
      date: stockDate,
    };

    if (editingStock) {
      updateStock(editingStock.id, stockData);
      toast({ title: 'Success!', description: 'Stock updated successfully' });
    } else {
      addStock(stockData);
      toast({ title: 'Success!', description: 'Stock added successfully' });
    }
    
    setShowAddForm(false);
    setEditingStock(null);
    setSelectedProduct('');
    setSelectedSupplier('');
    setFormData({ category: '', unit: '', sellPrice: '', supplierPhone: '', supplierEmail: '' });
  };

  const uniqueProducts = getUniqueProducts();
  const filteredProducts = uniqueProducts.filter(product => 
    product.name.toLowerCase().includes(filter.toLowerCase()) ||
    product.category.toLowerCase().includes(filter.toLowerCase())
  );

  if (showAddForm || editingStock) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            {editingStock ? 'Edit Stock' : 'Add New Stock'}
          </h2>
          <EnhancedButton variant="outline" onClick={() => { 
            setShowAddForm(false); 
            setEditingStock(null);
            setSelectedProduct('');
            setSelectedSupplier('');
            setFormData({ category: '', unit: '', sellPrice: '', supplierPhone: '', supplierEmail: '' });
          }}>
            Cancel
          </EnhancedButton>
        </div>
        
        <form onSubmit={addOrUpdateStock} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm">Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                defaultValue={editingStock?.date || new Date().toISOString().split('T')[0]} 
                max={new Date().toISOString().split('T')[0]}
                className="text-sm"
                required 
              />
            </div>
            <div>
              <Label htmlFor="productName" className="text-sm">Product Name</Label>
              {products.length > 0 ? (
                <Select 
                  name="productName" 
                  value={selectedProduct || editingStock?.productName || ''}
                  onValueChange={setSelectedProduct}
                  required
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.name} className="text-sm">{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="productName" name="productName" defaultValue={editingStock?.productName} className="text-sm" required />
              )}
            </div>
            <div>
              <Label htmlFor="category" className="text-sm">Category</Label>
              <Input 
                id="category" 
                name="category" 
                value={formData.category || editingStock?.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="text-sm"
                required 
              />
            </div>
            <div>
              <Label htmlFor="unit" className="text-sm">Unit</Label>
              <Input 
                id="unit" 
                name="unit" 
                value={formData.unit || editingStock?.unit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="text-sm"
                required 
              />
            </div>
            <div>
              <Label htmlFor="supplier" className="text-sm">Supplier Name</Label>
              {suppliers.length > 0 ? (
                <Select 
                  name="supplier" 
                  value={selectedSupplier || editingStock?.supplier || ''}
                  onValueChange={setSelectedSupplier}
                  required
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name} className="text-sm">{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="supplier" name="supplier" defaultValue={editingStock?.supplier} className="text-sm" required />
              )}
            </div>
            <div>
              <Label htmlFor="quantity" className="text-sm">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="0" step="1" defaultValue={editingStock?.quantity} className="text-sm" required />
            </div>
            <div>
              <Label htmlFor="buyPrice" className="text-sm">Buy Price</Label>
              <Input id="buyPrice" name="buyPrice" type="number" min="0" step="0.01" defaultValue={editingStock?.buyPrice} className="text-sm" required />
            </div>
            <div>
              <Label htmlFor="sellPrice" className="text-sm">Sell Price</Label>
              <Input 
                id="sellPrice" 
                name="sellPrice" 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.sellPrice || editingStock?.sellPrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: e.target.value }))}
                className="text-sm"
                required 
              />
            </div>
          </div>
          
          <EnhancedButton type="submit" className="w-full text-sm" brandColor={brandColor}>
            {editingStock ? 'Update Stock' : 'Add Stock Item'}
          </EnhancedButton>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Package className="w-4 sm:w-5 h-4 sm:h-5" />
          Stock Management
        </h2>
        <EnhancedButton onClick={() => setShowAddForm(true)} className="flex items-center gap-2 text-sm" brandColor={brandColor}>
          <Plus className="w-4 h-4" />
          Add Stock
        </EnhancedButton>
      </div>
      
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products, categories..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 max-w-md text-sm"
          />
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4">
        {filteredProducts.map((product) => {
          const stockColor = product.available === 0 ? 'bg-red-50 border-red-200' : 
                           product.available <= 5 ? 'bg-yellow-50 border-yellow-200' : 
                           'bg-green-50 border-green-200';
          
          return (
            <Card key={product.name} className={`p-3 sm:p-4 ${stockColor}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-lg">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    {product.available === 0 && (
                      <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                    )}
                    {product.available > 0 && product.available <= 5 && (
                      <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600">
                    <div>Available: <span className="font-medium">{formatNumber(product.available)} {product.unit}</span></div>
                    <div>Unit: {product.unit}</div>
                    <div>Category: {product.category}</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        
        {filteredProducts.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <Package className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">
              {filter ? 'No matching products' : 'No stock items yet'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-4">
              {filter ? 'Try adjusting your search terms' : 'Add your first stock item to get started'}
            </p>
            {!filter && (
              <EnhancedButton onClick={() => setShowAddForm(true)} brandColor={brandColor} className="text-sm">
                Add Stock Item
              </EnhancedButton>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}