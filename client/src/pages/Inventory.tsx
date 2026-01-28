import { useState } from "react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { type Product } from "@shared/schema";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/ProductForm";
import { Search, Filter, Plus, Pencil, Trash2, Package, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useProducts({ 
    search, 
    category: categoryFilter 
  });
  
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const { toast } = useToast();

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        toast({ title: "Product created", description: "Successfully added new product to inventory." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleUpdate = (data: any) => {
    if (!editingProduct) return;
    updateMutation.mutate({ id: editingProduct.id, ...data }, {
      onSuccess: () => {
        setEditingProduct(null);
        toast({ title: "Product updated", description: "Changes saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Product deleted", description: "Product removed from inventory." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string, quantity: number) => {
    // Override status based on logic requested: 0=Out, <10=Low, >=10=In
    let computedStatus = status;
    if (quantity === 0) computedStatus = "out_of_stock";
    else if (quantity < 10) computedStatus = "low_stock";
    else computedStatus = "in_stock";

    switch(computedStatus) {
      case "in_stock":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">In Stock</Badge>;
      case "low_stock":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-display">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your products and stock levels.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Add New Product</DialogTitle>
              <DialogDescription>
                Create a new item in your inventory. SKU must be unique.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, SKU..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Home">Home & Garden</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Office">Office Supplies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading Skeleton
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="w-10 h-10 rounded-md bg-slate-100 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                  <TableCell><div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                      <Package className="w-12 h-12 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {products?.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                    className="group hover:bg-slate-50/50 transition-colors border-b last:border-0"
                  >
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg border bg-slate-50 flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal bg-slate-100 hover:bg-slate-200">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.quantity}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product.status, product.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog open={!!editingProduct && editingProduct.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-white hover:text-primary hover:shadow-sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] rounded-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm 
                              defaultValues={product} 
                              onSubmit={handleUpdate} 
                              isLoading={updateMutation.isPending}
                              submitLabel="Update Product"
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:text-destructive hover:shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{product.name}</strong> from your inventory.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(product.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
