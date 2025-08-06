import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Save, X, Upload, Package, DollarSign, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  is_active: boolean;
  inventory_qty: number;
  category?: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  sales_count?: number;
  created_at: string;
  updated_at: string;
}

interface EditingProduct {
  id: string;
  name: string;
  unit_price: string;
  inventory_qty: number;
  is_active: boolean;
}

const AdminStore = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProducts, setEditingProducts] = useState<{ [key: string]: EditingProduct }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    unit_price: '',
    inventory_qty: 0,
    category: '',
    stripe_price_id: ''
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      return data.data || data || [];
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        unit_price: '',
        inventory_qty: 0,
        category: '',
        stripe_price_id: ''
      });
      toast({ title: "Product added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add product", variant: "destructive" });
    }
  });

  const startEditing = (product: Product) => {
    setEditingProducts(prev => ({
      ...prev,
      [product.id]: {
        id: product.id,
        name: product.name,
        unit_price: product.unit_price,
        inventory_qty: product.inventory_qty,
        is_active: product.is_active
      }
    }));
  };

  const saveChanges = (productId: string) => {
    const edits = editingProducts[productId];
    if (edits) {
      updateProductMutation.mutate({ id: productId, updates: edits });
      setEditingProducts(prev => {
        const { [productId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const cancelEdit = (productId: string) => {
    setEditingProducts(prev => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateEdit = (productId: string, field: keyof EditingProduct, value: any) => {
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const toggleActiveStatus = (product: Product) => {
    updateProductMutation.mutate({
      id: product.id,
      updates: { is_active: !product.is_active }
    });
  };

  if (!profile?.is_admin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-1">Manage products, inventory, and pricing</p>
          </div>
          
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.unit_price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, unit_price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="inventory">Initial Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    value={newProduct.inventory_qty}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, inventory_qty: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                  <Input
                    id="stripe_price_id"
                    value={newProduct.stripe_price_id}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stripe_price_id: e.target.value }))}
                    placeholder="price_xxxxxxxxxx"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addProductMutation.mutate(newProduct)}
                    disabled={addProductMutation.isPending || !newProduct.name || !newProduct.unit_price}
                    className="flex-1"
                  >
                    {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Products</p>
                  <p className="text-2xl font-bold">{products.filter((p: Product) => p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold">{products.reduce((sum: number, p: Product) => sum + (p.sales_count || 0), 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Price</th>
                    <th className="text-left py-2">Stock</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Sales</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => {
                    const isEditing = editingProducts[product.id];
                    return (
                      <tr key={product.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              {isEditing ? (
                                <Input
                                  value={isEditing.name}
                                  onChange={(e) => updateEdit(product.id, 'name', e.target.value)}
                                  className="w-48"
                                />
                              ) : (
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  {product.description && (
                                    <p className="text-sm text-gray-600 truncate max-w-xs">{product.description}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={isEditing.unit_price}
                              onChange={(e) => updateEdit(product.id, 'unit_price', e.target.value)}
                              className="w-20"
                            />
                          ) : (
                            <span className="font-medium">${parseFloat(product.unit_price).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={isEditing.inventory_qty}
                              onChange={(e) => updateEdit(product.id, 'inventory_qty', parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          ) : (
                            <span className={product.inventory_qty < 10 ? 'text-red-600 font-medium' : ''}>
                              {product.inventory_qty}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {isEditing ? (
                            <Switch
                              checked={isEditing.is_active}
                              onCheckedChange={(checked) => updateEdit(product.id, 'is_active', checked)}
                            />
                          ) : (
                            <Badge variant={product.is_active ? 'default' : 'secondary'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="text-gray-600">{product.sales_count || 0}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => saveChanges(product.id)}
                                  disabled={updateProductMutation.isPending}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelEdit(product.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(product)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleActiveStatus(product)}
                                >
                                  {product.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStore;