import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Construction } from "lucide-react";

export default function Analytics() {
  // Mock data for visualizations
  const salesData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
    { month: 'Jul', revenue: 3490, expenses: 4300 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
       <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-display">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into inventory trends and valuation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>6-month comparison trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" stroke="#ec4899" fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Monthly Stock Turnover</CardTitle>
            <CardDescription>Items in vs items out</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}/>
                  <Legend />
                  <Bar dataKey="revenue" name="In Stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Sold" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <Construction className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">More Analytics Coming Soon</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            We are working on predictive stock analysis and detailed category breakdowns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
