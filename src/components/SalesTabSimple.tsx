import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Receipt, AlertCircle } from 'lucide-react';
import type { User, Sale } from './InventoryApp';

const paymentModes = ['mpesa', 'cash', 'bank', 'debt', 'other'] as const;

interface SalesTabProps {
  user: User;
  setUser: (user: User) => void;
}

export function SalesTab({ user, setUser }: SalesTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [stockWarning, setStockWarning] = useState('');
  const { toast } = useToast();

  const getProducts = () => {
    const saved = localStorage.getItem(`products_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  };

  const products = getProducts();

  const addOrUpdateSale = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const saleDate = formData.get('date') as string;
    const today = new Date().toISOString().split('T')[0];
    
    if (saleDate > today) {
      toast({ title: 'Invalid Date', description: 'Sales cannot be recorded for future dates', variant: 'destructive' });
      return;
    }
    
    const saleData: Sale = {
      id: editingSale?.id || '_' + Math.random().toString(36).slice(2, 10) + Date.now(),
      date: saleDate,
      prod: formData.get('prod') as string,
      cat: formData.get('cat') as string,
      qty: Number(formData.get('qty')),
      unit: formData.get('unit') as string,
      pricePerUnit: Number(formData.get('pricePerUnit')),
      total: Number(formData.get('total')),
      buyerName: formData.get('buyerName') as string || undefined,
      buyerPhone: formData.get('buyerPhone') as string || undefined,
      paymentMode: formData.get('paymentMode') as any
    };

    let updatedSales;
    if (editingSale) {
      updatedSales = user.sales.map(s => s.id === editingSale.id ? saleData : s);
    } else {
      updatedSales = [...user.sales, saleData];
    }

    const updatedUser = { ...user, sales: updatedSales };
    
    if (saleData.buyerName && saleData.buyerPhone) {
      const existingBuyer = user.buyers.find(b => b.phone === saleData.buyerPhone);
      if (!existingBuyer) {
        updatedUser.buyers = [...user.buyers, { name: saleData.buyerName, phone: saleData.buyerPhone }];
      }
    }
    
    setUser(updatedUser);
    const data = JSON.parse(localStorage.getItem('invsmgr_data') || '{}');
    data[user.id] = updatedUser;
    localStorage.setItem('invsmgr_data', JSON.stringify(data));
    
    setShowAddForm(false);
    setEditingSale(null);
    setSelectedProduct('');
    setDuplicateWarning('');
    setStockWarning('');
    toast({ title: 'Success!', description: editingSale ? 'Sale updated successfully' : 'Sale recorded successfully' });
  };

  const handleProductSelect = (productName: string) => {
    setSelectedProduct(productName);
    const stock = user.stocks.find(s => s.prod === productName);
    if (stock) {
      const form = document.getElementById('saleForm') as HTMLFormElement;
      if (form) {
        (form.cat as any).value = stock.cat;
        (form.unit as any).value = stock.unit;
        (form.pricePerUnit as any).value = stock.sellPrice;
        
        const soldQty = user.sales.filter(sale => sale.prod === productName).reduce((sum, sale) => sum + sale.qty, 0);
        const available = stock.qty - soldQty;
        
        if (available <= 0) {
          setStockWarning(`No stock available`);
        } else if (available <= 5) {
          setStockWarning(`Only ${available} ${stock.unit} available`);
        } else {
          setStockWarning(`${available} ${stock.unit} available`);
        }
        calculateTotal();
      }
    }
  };

  const handlePhoneChange = (phone: string) => {
    if (phone.length >= 3) {
      const existingBuyer = user.buyers.find(b => b.phone === phone);
      if (existingBuyer) {
        setDuplicateWarning(`This number belongs to ${existingBuyer.name}`);
        const form = document.getElementById('saleForm') as HTMLFormElement;
        if (form && form.buyerName) {
          (form.buyerName as any).value = existingBuyer.name;
        }
      } else {
        setDuplicateWarning('');
      }
    } else {
      setDuplicateWarning('');
    }
  };

  const calculateTotal = () => {
    const form = document.getElementById('saleForm') as HTMLFormElement;
    if (form) {
      const qty = Number((form.qty as any).value) || 0;
      const price = Number((form.pricePerUnit as any).value) || 0;
      (form.total as any).value = (qty * price).toFixed(2);
    }
  };

  const filteredSales = user.sales.filter(sale => 
    sale.prod.toLowerCase().includes(filter.toLowerCase()) ||
    sale.cat.toLowerCase().includes(filter.toLowerCase()) ||
    (sale.buyerName && sale.buyerName.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5" />Sales Records
        </h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />Record Sale
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
                  <h3 className="font-semibold text-lg">{sale.prod}</h3>
                  <Badge variant="secondary">{sale.cat}</Badge>
                  <Badge variant="outline">${sale.total}</Badge>
                  <Badge variant="default">{sale.paymentMode}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>Date: {sale.date}</div>
                  <div>Qty: {sale.qty} {sale.unit}</div>
                  <div>Price: ${sale.pricePerUnit}</div>
                  {sale.buyerName && <div>Buyer: {sale.buyerName}</div>}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSale(sale)}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}