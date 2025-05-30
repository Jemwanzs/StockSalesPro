import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  sellPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Buyer {
  name: string;
  phone: string;
  email?: string;
}

export interface Stock {
  id: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  supplier: string;
  date: string;
}

export interface Sale {
  id: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  sellPrice: number;
  totalAmount: number;
  buyer: string;
  paymentMode: string;
  date: string;
}

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  products: Product[];
  suppliers: Supplier[];
  buyers: Buyer[];
  stock: Stock[];
  sales: Sale[];
  addProduct: (product: Omit<Product, 'id'>) => boolean;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => boolean;
  addBuyer: (buyer: Buyer) => boolean;
  addStock: (stock: Omit<Stock, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id'>) => boolean;
  updateStock: (id: string, stock: Omit<Stock, 'id'>) => void;
  updateSale: (id: string, sale: Omit<Sale, 'id'>) => void;
  getAvailableStock: (productName: string) => number;
  getUniqueProducts: () => { name: string; available: number; category: string; unit: string }[];
  getTotalStockValue: () => number;
  userId: string;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  products: [],
  suppliers: [],
  buyers: [],
  stock: [],
  sales: [],
  addProduct: () => false,
  updateProduct: () => {},
  addSupplier: () => false,
  addBuyer: () => false,
  addStock: () => {},
  addSale: () => false,
  updateStock: () => {},
  updateSale: () => {},
  getAvailableStock: () => 0,
  getUniqueProducts: () => [],
  getTotalStockValue: () => 0,
  userId: '',
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode; userId: string }> = ({ children, userId }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem(`products_${userId}`);
    const savedSuppliers = localStorage.getItem(`suppliers_${userId}`);
    const savedBuyers = localStorage.getItem(`buyers_${userId}`);
    const savedStock = localStorage.getItem(`stock_${userId}`);
    const savedSales = localStorage.getItem(`sales_${userId}`);

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    if (savedBuyers) setBuyers(JSON.parse(savedBuyers));
    if (savedStock) setStock(JSON.parse(savedStock));
    if (savedSales) setSales(JSON.parse(savedSales));
  }, [userId]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const addProduct = (product: Omit<Product, 'id'>): boolean => {
    const exists = products.some(p => p.name.toLowerCase() === product.name.toLowerCase());
    if (exists) {
      toast({ title: 'Duplicate Product', description: `Product "${product.name}" already exists!`, variant: 'destructive' });
      return false;
    }
    const newProduct = { ...product, id: uuidv4() };
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    localStorage.setItem(`products_${userId}`, JSON.stringify(newProducts));
    return true;
  };

  const updateProduct = (id: string, product: Omit<Product, 'id'>) => {
    const newProducts = products.map(p => p.id === id ? { ...product, id } : p);
    setProducts(newProducts);
    localStorage.setItem(`products_${userId}`, JSON.stringify(newProducts));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>): boolean => {
    const exists = suppliers.some(s => s.phone === supplier.phone || (supplier.email && s.email === supplier.email));
    if (exists) {
      const existing = suppliers.find(s => s.phone === supplier.phone || (supplier.email && s.email === supplier.email));
      toast({ title: 'Duplicate Supplier', description: `Phone/Email belongs to "${existing?.name}"!`, variant: 'destructive' });
      return false;
    }
    const newSupplier = { ...supplier, id: uuidv4() };
    const newSuppliers = [...suppliers, newSupplier];
    setSuppliers(newSuppliers);
    localStorage.setItem(`suppliers_${userId}`, JSON.stringify(newSuppliers));
    return true;
  };

  const addBuyer = (buyer: Buyer): boolean => {
    const exists = buyers.some(b => b.phone === buyer.phone || (buyer.email && b.email === buyer.email));
    if (exists) {
      const existing = buyers.find(b => b.phone === buyer.phone || (buyer.email && b.email === buyer.email));
      toast({ title: 'Duplicate Buyer', description: `Phone/Email belongs to "${existing?.name}"!`, variant: 'destructive' });
      return false;
    }
    const newBuyers = [...buyers, buyer];
    setBuyers(newBuyers);
    localStorage.setItem(`buyers_${userId}`, JSON.stringify(newBuyers));
    return true;
  };

  const addStock = (stockItem: Omit<Stock, 'id'>) => {
    const newStock = { ...stockItem, id: uuidv4() };
    const newStockList = [...stock, newStock];
    setStock(newStockList);
    localStorage.setItem(`stock_${userId}`, JSON.stringify(newStockList));
  };

  const getAvailableStock = (productName: string): number => {
    const totalStock = stock.filter(s => s.productName === productName).reduce((sum, s) => sum + s.quantity, 0);
    const totalSold = sales.filter(s => s.productName === productName).reduce((sum, s) => sum + s.quantity, 0);
    return totalStock - totalSold;
  };

  const getUniqueProducts = () => {
    const uniqueProducts = new Map();
    stock.forEach(item => {
      if (!uniqueProducts.has(item.productName)) {
        uniqueProducts.set(item.productName, {
          name: item.productName,
          category: item.category,
          unit: item.unit,
          available: getAvailableStock(item.productName)
        });
      }
    });
    return Array.from(uniqueProducts.values());
  };

  const getTotalStockValue = (): number => {
    return getUniqueProducts().reduce((total, product) => {
      const latestStock = stock.filter(s => s.productName === product.name).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return total + (product.available * (latestStock?.sellPrice || 0));
    }, 0);
  };

  const addSale = (sale: Omit<Sale, 'id'>): boolean => {
    const available = getAvailableStock(sale.productName);
    if (sale.quantity > available) {
      toast({ title: 'Insufficient Stock', description: `Only ${available} units available for ${sale.productName}`, variant: 'destructive' });
      return false;
    }
    const newSale = { ...sale, id: uuidv4() };
    const newSales = [...sales, newSale];
    setSales(newSales);
    localStorage.setItem(`sales_${userId}`, JSON.stringify(newSales));
    return true;
  };

  const updateStock = (id: string, stockItem: Omit<Stock, 'id'>) => {
    const newStock = stock.map(s => s.id === id ? { ...stockItem, id } : s);
    setStock(newStock);
    localStorage.setItem(`stock_${userId}`, JSON.stringify(newStock));
  };

  const updateSale = (id: string, sale: Omit<Sale, 'id'>) => {
    const newSales = sales.map(s => s.id === id ? { ...sale, id } : s);
    setSales(newSales);
    localStorage.setItem(`sales_${userId}`, JSON.stringify(newSales));
  };

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar, products, suppliers, buyers, stock, sales,
      addProduct, updateProduct, addSupplier, addBuyer, addStock, addSale,
      updateStock, updateSale, getAvailableStock, getUniqueProducts, getTotalStockValue, userId
    }}>
      {children}
    </AppContext.Provider>
  );
};