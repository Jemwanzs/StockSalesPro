import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { formatCurrency, formatNumber } from '@/lib/formatters';

export function BuyersTab() {
  const { buyers, sales } = useAppContext();
  const [filter, setFilter] = useState('');
  
  const buyersWithPurchases = buyers.map(buyer => {
    const purchases = sales.filter(sale => sale.buyer === buyer.name);
    const totalSpent = purchases.reduce((sum, sale) => sum + sale.totalAmount, 0);
    return { ...buyer, purchases: purchases.length, totalSpent };
  });

  const filteredBuyers = buyersWithPurchases.filter(buyer => 
    buyer.name.toLowerCase().includes(filter.toLowerCase()) ||
    buyer.phone.toLowerCase().includes(filter.toLowerCase()) ||
    (buyer.email && buyer.email.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Users className="w-4 sm:w-5 h-4 sm:h-5" />
          Customer Directory ({formatNumber(buyersWithPurchases.length)} customers)
        </h2>
      </div>
      
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search customers by name, phone, or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 max-w-md text-sm"
          />
        </div>
      </Card>
      
      <div className="grid gap-3 sm:gap-4">
        {filteredBuyers.map((buyer, i) => (
          <Card key={i} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-sm sm:text-lg">{buyer.name}</h3>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  {buyer.phone && <div>📞 Phone: {buyer.phone}</div>}
                  {buyer.email && <div>📧 Email: {buyer.email}</div>}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2 text-xs">
                  {formatNumber(buyer.purchases)} purchases
                </Badge>
                <div className="text-xs sm:text-sm text-gray-600">
                  Total Spent: <span className="font-semibold text-green-600">{formatCurrency(buyer.totalSpent)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredBuyers.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <Users className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">
              {filter ? 'No matching customers' : 'No customers yet'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {filter ? 'Try adjusting your search terms' : 'Customers will appear here when you record sales with buyer information'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}