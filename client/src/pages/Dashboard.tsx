import { useProductStats } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, XCircle, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useProductStats();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Mock chart data - in a real app, this would come from the API
  const chartData = [
    { name: 'Electronics', value: 45, color: '#4f46e5' },
    { name: 'Clothing', value: 32, color: '#8b5cf6' },
    { name: 'Home', value: 28, color: '#ec4899' },
    { name: 'Accessories', value: 19, color: '#06b6d4' },
    { name: 'Office', value: 15, color: '#10b981' },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Inventory Value",
      value: stats ? formatCurrency(stats.totalValue) : "$0.00",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      desc: "+12.5% from last month"
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      desc: "4 new items added"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      desc: "Needs attention"
    },
    {
      title: "Categories",
      value: stats?.categoriesCount || 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
      desc: "Active categories"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your inventory performance.</p>
        </div>
        <div className="flex gap-2">
          <div className="text-sm bg-white border px-3 py-1 rounded-full shadow-sm text-muted-foreground">
            Updated: Just now
          </div>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, i) => (
          <motion.div variants={item} key={i}>
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                <stat.icon className="w-24 h-24 -mr-8 -mt-8 rotate-12" />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                    <ArrowUpRight className="w-3 h-3 mr-1" /> 2.4%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <div className="text-2xl font-bold font-display tracking-tight">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-primary/90 to-primary text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full text-left bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-colors flex items-center gap-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">Add New Product</div>
                <div className="text-xs text-white/70">Create a new SKU entry</div>
              </div>
            </button>
            
            <button className="w-full text-left bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-colors flex items-center gap-3 group">
              <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm">Download Report</div>
                <div className="text-xs text-white/70">Export PDF summary</div>
              </div>
            </button>
            
            <div className="pt-4 border-t border-white/20">
              <div className="text-xs font-medium text-white/80 mb-2">System Status</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                All systems operational
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
