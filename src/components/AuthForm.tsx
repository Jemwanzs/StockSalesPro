import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { User } from './InventoryApp';

const themes = [
  { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
  { name: 'Green', value: 'green', color: 'bg-green-500' },
  { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
  { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
];

interface AuthFormProps {
  onLogin: (user: User) => void;
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const { toast } = useToast();

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', selectedTheme);
    
    // Apply CSS custom properties based on theme
    const themeColors = {
      blue: { primary: '#3b82f6', secondary: '#dbeafe' },
      green: { primary: '#10b981', secondary: '#d1fae5' },
      orange: { primary: '#f97316', secondary: '#fed7aa' },
      purple: { primary: '#8b5cf6', secondary: '#e9d5ff' },
    };
    
    const colors = themeColors[selectedTheme as keyof typeof themeColors];
    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--primary-foreground', '#ffffff');
    }
  }, [selectedTheme]);

  const getAppData = (): Record<string, User> => {
    return JSON.parse(localStorage.getItem('invsmgr_data') || '{}');
  };

  const setAppData = (data: Record<string, User>) => {
    localStorage.setItem('invsmgr_data', JSON.stringify(data));
  };

  const uid = () => '_' + Math.random().toString(36).slice(2, 10) + Date.now();

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const pass = formData.get('pass') as string;

    if (authMode === 'login') {
      const data = getAppData();
      const user = Object.values(data).find(u => u.email === email && u.pass === pass);
      if (user) {
        // Apply user's theme
        setSelectedTheme(user.color);
        onLogin(user);
        toast({ title: 'Welcome back!', description: `Logged in as ${user.biz}` });
      } else {
        toast({ title: 'Error', description: 'Invalid credentials', variant: 'destructive' });
      }
    } else {
      const biz = formData.get('biz') as string;
      const color = formData.get('color') as string;
      const data = getAppData();
      
      if (Object.values(data).some(u => u.email === email)) {
        toast({ title: 'Error', description: 'Email already registered', variant: 'destructive' });
        return;
      }

      const id = uid();
      const user: User = {
        id, biz, email, pass, color,
        stocks: [], sales: [], buyers: []
      };
      
      data[id] = user;
      setAppData(data);
      setSelectedTheme(color);
      onLogin(user);
      toast({ title: 'Success!', description: 'Account created successfully' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📦 Inventory Manager</h1>
          <p className="text-gray-600">Manage your business with ease</p>
        </div>
        
        <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="pass">Password</Label>
                <Input id="pass" name="pass" type="password" required />
              </div>
              <Button type="submit" className="w-full">Log In</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="biz">Business Name</Label>
                <Input id="biz" name="biz" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="pass">Password</Label>
                <Input id="pass" name="pass" type="password" required minLength={5} />
              </div>
              <div>
                <Label htmlFor="color">Theme Color</Label>
                <Select 
                  name="color" 
                  defaultValue="blue" 
                  onValueChange={setSelectedTheme}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map(theme => (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                          {theme.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}