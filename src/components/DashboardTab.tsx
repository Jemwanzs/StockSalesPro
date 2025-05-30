import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, Package, DollarSign, AlertTriangle, Users, ShoppingCart, Calendar, CreditCard } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { useState, useMemo } from 'react';

export function DashboardTab() {
  const { stock, sales, buyers, getUniqueProducts, getTotalStockValue } = useAppContext();
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= new Date(dateFrom) && saleDate <= new Date(dateTo);
    });
  }, [sales, dateFrom, dateTo]);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => {
    const stockItem = stock.find(s => s.productName === sale.productName);
    const profit = stockItem ? (sale.sellPrice - stockItem.buyPrice) * sale.quantity : 0;
    return sum + profit;
  }, 0);

  const uniqueProducts = getUniqueProducts();
  const lowStockProducts = uniqueProducts.filter(p => p.available <= 5 && p.available > 0);
  const outOfStockProducts = uniqueProducts.filter(p => p.available === 0);
  const totalStockValue = getTotalStockValue();

  const highestSale = filteredSales.reduce((max, sale) => 
    sale.totalAmount > (max?.totalAmount || 0) ? sale : max, null as typeof filteredSales[0] | null);

  const bestPerformingProducts = useMemo(() => {
    const productSales = filteredSales.reduce((acc, sale) => {
      acc[sale.productName] = (acc[sale.productName] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  }, [filteredSales]);

  const paymentModes = useMemo(() => {
    const modes = filteredSales.reduce((acc, sale) => {
      acc[sale.paymentMode] = (acc[sale.paymentMode] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(modes).filter(([,amount]) => amount > 0);
  }, [filteredSales]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-auto text-xs sm:text-sm" />
          <span className="text-xs sm:text-sm">to</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-auto text-xs sm:text-sm" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <DollarSign className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Profit</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
            </div>
            <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Stock Value</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{formatCurrency(totalStockValue)}</p>
            </div>
            <Package className="w-6 sm:w-8 h-6 sm:h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Highest Sale</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">{formatCurrency(highestSale?.totalAmount || 0)}</p>
              {highestSale && <p className="text-xs text-gray-500 truncate">{highestSale.productName}</p>}
            </div>
            <ShoppingCart className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-red-500" />
            Stock Alerts ({lowStockProducts.length + outOfStockProducts.length})
          </h3>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {outOfStockProducts.map((product) => (
              <div key={product.name} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                <div>
                  <div className="text-sm font-medium text-red-800">{product.name}</div>
                  <div className="text-xs text-red-600">{product.category}</div>
                </div>
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              </div>
            ))}
            {lowStockProducts.map((product) => (
              <div key={product.name} className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                <div>
                  <div className="text-sm font-medium text-yellow-800">{product.name}</div>
                  <div className="text-xs text-yellow-600">{product.category} • {formatNumber(product.available)} {product.unit}</div>
                </div>
                <Badge variant="destructive" className="text-xs">Low Stock</Badge>
              </div>
            ))}
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">No available stock!</div>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
            Best Performing Products
          </h3>
          <div className="space-y-2">
            {bestPerformingProducts.map(([productName, quantity], index) => (
              <div key={productName} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium">#{index + 1} {productName}</div>
                  <div className="text-xs text-gray-600">Sold: {formatNumber(quantity)} units</div>
                </div>
              </div>
            ))}
            {bestPerformingProducts.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">No sales recorded yet</div>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
            Payment Analytics
          </h3>
          <div className="space-y-2">
            {paymentModes.map(([mode, amount]) => (
              <div key={mode} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium">{mode}</div>
                <div className="text-sm font-bold text-green-600">{formatCurrency(amount)}</div>
              </div>
            ))}
            {paymentModes.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">No payments recorded</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatNumber(uniqueProducts.length)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Unique Products</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{formatNumber(buyers.length)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Registered Buyers</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{formatNumber(stock.length)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Stock Entries</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{formatNumber(filteredSales.length)}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Sales</div>
          </div>
        </div>
      </Card>
    </div>
  );
}