import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Receipt, AlertTriangle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { User } from './InventoryApp';

const paymentModes = ['m-pesa', 'cash', 'bank', 'debt', 'other'] as const;

interface SalesTabProps {
  user: User;
  setUser: (user: User) => void;
}

export function SalesTab({ user, setUser }: SalesTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('');
  const [stockWarning, setStockWarning] = useState('');
  const [availableStock, setAvailableStock] = useState(0);
  const { toast } = useToast();
  const { products, buyers, sales, addSale, updateSale, getAvailableStock } = useAppContext();

  const [formData, setFormData] = useState({
    category: '',
    unit: '',
    pricePerUnit: '',
    buyerPhone: '',
    buyerEmail: '',
    total: ''
  });

  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.name === selectedProduct);
      if (product) {
        const available = getAvailableStock(selectedProduct);
        setAvailableStock(available);
        setFormData(prev => ({
          ...prev,
          category: product.category,
          unit: product.unit,
          pricePerUnit: product.sellPrice.toString()
        }));
        setStockWarning(`${available} ${product.unit} available`);
      }
    }
  }, [selectedProduct, products, getAvailableStock]);

  useEffect(() => {
    if (selectedBuyer) {
      const buyer = buyers.find(b => b.name === selectedBuyer);
      if (buyer) {
        setFormData(prev => ({
          ...prev,
          buyerPhone: buyer.phone,
          buyerEmail: buyer.email || ''
        }));
      }
    }
  }, [selectedBuyer, buyers]);

  const calculateTotal = (qty: number, price: number) => {
    const total = (qty * price).toFixed(2);
    setFormData(prev => ({ ...prev, total }));
    return total;
  };

  const addOrUpdateSale = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataObj = new FormData(form);
    
    const saleDate = formDataObj.get('date') as string;
    const today = new Date().toISOString().split('T')[0];
    
    if (saleDate > today) {
      toast({ title: 'Invalid Date', description: 'Sales cannot be recorded for future dates', variant: 'destructive' });
      return;
    }

    const quantity = Number(formDataObj.get('quantity'));
    if (quantity > availableStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${availableStock} units available. Cannot sell ${quantity} units.`,
        variant: 'destructive'
      });
      return;
    }
    
    const saleData = {
      productName: formDataObj.get('productName') as string,
      category: formDataObj.get('category') as string,
      unit: formDataObj.get('unit') as string,
      quantity: quantity,
      sellPrice: Number(formDataObj.get('sellPrice')),
      totalAmount: Number(formDataObj.get('totalAmount')),
      buyer: formDataObj.get('buyer') as string,
      paymentMode: formDataObj.get('paymentMode') as string,
      date: saleDate,
    };

    if (editingSale) {
      updateSale(editingSale.id, saleData);
      toast({ title: 'Success!', description: 'Sale updated successfully' });
    } else {
      if (addSale(saleData)) {
        toast({ title: 'Success!', description: 'Sale recorded successfully' });
      }
    }
    
    setShowAddForm(false);
    setEditingSale(null);
    setSelectedProduct('');
    setSelectedBuyer('');
    setStockWarning('');
    setAvailableStock(0);
    setFormData({ category: '', unit: '', pricePerUnit: '', buyerPhone: '', buyerEmail: '', total: '' });
  };

  const filteredSales = sales.filter(sale => 
    sale.productName.toLowerCase().includes(filter.toLowerCase()) ||
    sale.category.toLowerCase().includes(filter.toLowerCase()) ||
    sale.buyer.toLowerCase().includes(filter.toLowerCase())
  );

  if (showAddForm || editingSale) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{editingSale ? 'Edit Sale' : 'Record New Sale'}</h2>
          <Button variant="outline" onClick={() => { 
            setShowAddForm(false); 
            setEditingSale(null);
            setSelectedProduct('');
            setSelectedBuyer('');
            setStockWarning('');
            setAvailableStock(0);
            setFormData({ category: '', unit: '', pricePerUnit: '', buyerPhone: '', buyerEmail: '', total: '' });
          }}>Cancel</Button>
        </div>
        
        <form onSubmit={addOrUpdateSale} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input 
                name="date" 
                type="date" 
                defaultValue={editingSale?.date || new Date().toISOString().split('T')[0]} 
                max={new Date().toISOString().split('T')[0]} 
                required 
              />
            </div>
            <div>
              <Label>Product</Label>
              <Select 
                name="productName" 
                value={selectedProduct || editingSale?.productName || ''}
                onValueChange={setSelectedProduct}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>{product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {stockWarning && (
                <div className={`text-sm mt-1 flex items-center gap-1 ${
                  availableStock <= 5 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {availableStock <= 5 && <AlertTriangle className="w-4 h-4" />}
                  {stockWarning}
                </div>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <Input 
                name="category" 
                value={formData.category || editingSale?.category || ''}
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input 
                name="unit" 
                value={formData.unit || editingSale?.unit || ''}
                readOnly 
                className="bg-gray-50" 
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input 
                name="quantity" 
                type="number" 
                min="0" 
                max={availableStock}
                step="1" 
                defaultValue={editingSale?.quantity} 
                required 
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  const price = Number(formData.pricePerUnit || editingSale?.sellPrice || 0);
                  calculateTotal(qty, price);
                }}
              />
            </div>
            <div>
              <Label>Price per Unit</Label>
              <Input 
                name="sellPrice" 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.pricePerUnit || editingSale?.sellPrice || ''}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setFormData(prev => ({ ...prev, pricePerUnit: e.target.value }));
                  const qtyInput = document.querySelector('input[name="quantity"]') as HTMLInputElement;
                  const qty = Number(qtyInput?.value || 0);
                  calculateTotal(qty, price);
                }}
                required 
              />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input 
                name="totalAmount" 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.total || editingSale?.totalAmount || ''}
                readOnly 
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select name="paymentMode" defaultValue={editingSale?.paymentMode} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map(mode => (
                    <SelectItem key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buyer</Label>
              {buyers.length > 0 ? (
                <Select 
                  name="buyer" 
                  value={selectedBuyer || editingSale?.buyer || ''}
                  onValueChange={setSelectedBuyer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select buyer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer, index) => (
                      <SelectItem key={index} value={buyer.name}>{buyer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input name="buyer" defaultValue={editingSale?.buyer} placeholder="Buyer name (optional)" />
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">
            {editingSale ? 'Update Sale' : 'Record Sale'}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Sales Records
        </h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Sale
        </Button>
      </div>
      
      <Card className="p-4">
        <Input 
          placeholder="Search sales..." 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="max-w-md" 
        />
      </Card>

      <div className="grid gap-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{sale.productName}</h3>
                  <Badge variant="secondary">{sale.category}</Badge>
                  <Badge variant="outline">${sale.totalAmount}</Badge>
                  <Badge variant="default">{sale.paymentMode}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>Date: {sale.date}</div>
                  <div>Qty: {sale.quantity} {sale.unit}</div>
                  <div>Price: ${sale.sellPrice}</div>
                  <div>Buyer: {sale.buyer || 'Walk-in'}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingSale(sale)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
        
        {filteredSales.length === 0 && (
          <Card className="p-8 text-center">
            <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter ? 'No matching sales' : 'No sales recorded yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {filter ? 'Try adjusting your search terms' : 'Record your first sale to get started'}
            </p>
            {!filter && (
              <Button onClick={() => setShowAddForm(true)}>
                Record Sale
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}