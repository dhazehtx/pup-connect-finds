import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  is_active: boolean;
  inventory_qty: number;
  stripe_price_id: string | null;
}

const AdminStore = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const products = productsResponse?.data || [];

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest(`/api/products/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      unit_price: formData.get('unit_price') as string,
      image_url: formData.get('image_url') as string || null,
      is_subscription: formData.get('is_subscription') === 'on',
      is_active: formData.get('is_active') === 'on',
      inventory_qty: parseInt(formData.get('inventory_qty') as string) || 0,
      stripe_price_id: formData.get('stripe_price_id') as string || null,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      addProductMutation.mutate(productData);
    }
  };

  const ProductForm = ({ product }: { product?: Product }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description || ''} />
      </div>
      
      <div>
        <Label htmlFor="unit_price">Price ($)</Label>
        <Input 
          id="unit_price" 
          name="unit_price" 
          type="number" 
          step="0.01" 
          defaultValue={product?.unit_price} 
          required 
        />
      </div>
      
      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" name="image_url" type="url" defaultValue={product?.image_url || ''} />
      </div>
      
      <div>
        <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
        <Input id="stripe_price_id" name="stripe_price_id" defaultValue={product?.stripe_price_id || ''} />
      </div>
      
      <div>
        <Label htmlFor="inventory_qty">Inventory Quantity</Label>
        <Input 
          id="inventory_qty" 
          name="inventory_qty" 
          type="number" 
          defaultValue={product?.inventory_qty || 0} 
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="is_active" name="is_active" defaultChecked={product?.is_active ?? true} />
        <Label htmlFor="is_active">Active</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="is_subscription" name="is_subscription" defaultChecked={product?.is_subscription} />
        <Label htmlFor="is_subscription">Subscription Product</Label>
      </div>
      
      <Button type="submit" className="w-full" disabled={addProductMutation.isPending || updateProductMutation.isPending}>
        {editingProduct ? 'Update Product' : 'Add Product'}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold">Admin Store Management</h1>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${parseFloat(product.unit_price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{product.inventory_qty}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => {
                        if (!open) setEditingProduct(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <ProductForm product={editingProduct!} />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProductMutation.mutate(product.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStore;