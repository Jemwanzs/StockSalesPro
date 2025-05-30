import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AppProvider } from '@/contexts/AppContext';
import { AuthForm } from './AuthForm';
import { DashboardTab } from './DashboardTab';
import { StockTab } from './StockTab';
import { SalesTab } from './SalesTab';
import { BuyersTab } from './BuyersTab';
import { SettingsTab } from './SettingsTab';

export type User = {
  id: string;
  biz: string;
  email: string;
  pass: string;
  color: string;
  stocks: Stock[];
  sales: Sale[];
  buyers: Buyer[];
};

export type Stock = {
  id: string;
  date: string;
  prod: string;
  cat: string;
  suppName: string;
  suppPhone: string;
  buyPrice: number;
  sellPrice: number;
  qty: number;
  unit: string;
};

export type Sale = {
  id: string;
  date: string;
  prod: string;
  cat: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  buyerName?: string;
  buyerPhone?: string;
  paymentMode: 'mpesa' | 'cash' | 'bank' | 'debt' | 'other';
};

export type Buyer = {
  name: string;
  phone?: string;
  email?: string;
};

export default function InventoryApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    toast({ title: 'Logged out', description: 'See you next time!' });
  };

  if (!currentUser) {
    return <AuthForm onLogin={setCurrentUser} />;
  }

  return (
    <AppProvider userId={currentUser.id}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📦</div>
                <div>
                  <h1 className="font-bold text-lg">{currentUser.biz}</h1>
                  <p className="text-xs text-gray-500">Inventory Manager</p>
                </div>
              </div>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
              <TabsTrigger value="stock">📦 Stock</TabsTrigger>
              <TabsTrigger value="sales">🧾 Sales</TabsTrigger>
              <TabsTrigger value="buyers">👤 Buyers</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="stock">
              <StockTab user={currentUser} setUser={setCurrentUser} />
            </TabsContent>
            
            <TabsContent value="sales">
              <SalesTab user={currentUser} setUser={setCurrentUser} />
            </TabsContent>
            
            <TabsContent value="buyers">
              <BuyersTab />
            </TabsContent>
            
            <TabsContent value="settings">
              <SettingsTab user={currentUser} setUser={setCurrentUser} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppProvider>
  );
}