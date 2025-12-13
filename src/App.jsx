import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Trash2, Edit2, Save, Package } from 'lucide-react';

export default function InventoryTracker() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(p => ({
        ...p,
        sellingPrice: p.sellingPrice || p.costPrice * 1.5
      }));
    }
    return [
      { id: 1, name: 'Product A', costPrice: 1000, sellingPrice: 1500, stock: 10 },
      { id: 2, name: 'Product B', costPrice: 2500, sellingPrice: 3500, stock: 5 },
      { id: 3, name: 'Product C', costPrice: 500, sellingPrice: 800, stock: 20 }
    ];
  });
  
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [timeFilter, setTimeFilter] = useState('week');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);
  
  const [newProduct, setNewProduct] = useState({ name: '', costPrice: '', sellingPrice: '', stock: '' });
  const [saleForm, setSaleForm] = useState({ 
    productId: '', 
    quantity: '', 
    sellingPrice: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  const getFilteredSales = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (timeFilter === 'all') {
      return sales;
    }
    
    if (timeFilter === 'custom') {
      if (!customDateRange.start || !customDateRange.end) {
        return sales;
      }
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      });
    }
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      
      if (timeFilter === 'day') {
        return saleDate.getTime() === now.getTime();
      } else if (timeFilter === 'week') {
        const weekStart = new Date(now);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);
        return saleDate >= weekStart && saleDate <= now;
      } else if (timeFilter === 'month') {
        return saleDate.getMonth() === now.getMonth() && 
               saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = getFilteredSales();
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.sellingPrice * sale.quantity), 0);
  const tithe = totalProfit * 0.1;
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
  const potentialRevenue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(productSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const addProduct = () => {
    if (newProduct.name && newProduct.costPrice && newProduct.sellingPrice && newProduct.stock) {
      setProducts([...products, {
        id: Date.now(),
        name: newProduct.name,
        costPrice: parseFloat(newProduct.costPrice),
        sellingPrice: parseFloat(newProduct.sellingPrice),
        stock: parseInt(newProduct.stock)
      }]);
      setNewProduct({ name: '', costPrice: '', sellingPrice: '', stock: '' });
      setShowAddProduct(false);
    }
  };

  const updateProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      setEditingProduct(null);
    }
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addStock = () => {
    if (restockingProduct && restockAmount && parseInt(restockAmount) > 0) {
      setProducts(products.map(p => 
        p.id === restockingProduct.id 
          ? { ...p, stock: p.stock + parseInt(restockAmount) }
          : p
      ));
      setRestockingProduct(null);
      setRestockAmount('');
    }
  };

  const recordSale = () => {
    if (saleForm.productId && saleForm.quantity && saleForm.sellingPrice && saleForm.date) {
      const product = products.find(p => p.id === parseInt(saleForm.productId));
      const quantity = parseInt(saleForm.quantity);
      const sellingPrice = parseFloat(saleForm.sellingPrice);
      const selectedDate = new Date(saleForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        alert('Cannot record sales for future dates!');
        return;
      }
      
      if (product && product.stock >= quantity) {
        const totalCost = product.costPrice * quantity;
        const totalRevenue = sellingPrice * quantity;
        const profit = totalRevenue - totalCost;
        
        const saleDate = new Date(saleForm.date);
        saleDate.setHours(12, 0, 0, 0);
        
        setSales([...sales, {
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          quantity,
          sellingPrice,
          costPrice: product.costPrice,
          profit,
          date: saleDate.toISOString()
        }]);
        
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, stock: p.stock - quantity } : p
        ));
        
        setSaleForm({ productId: '', quantity: '', sellingPrice: '', date: new Date().toISOString().split('T')[0] });
        setShowSaleForm(false);
      }
    }
  };

  const deleteSale = (sale) => {
    if (window.confirm(`Delete this sale? Stock will be restored for ${sale.productName}.`)) {
      setSales(sales.filter(s => s.id !== sale.id));
      
      setProducts(products.map(p => 
        p.id === sale.productId 
          ? { ...p, stock: p.stock + sale.quantity }
          : p
      ));
    }
  };

  const getFilterLabel = () => {
    if (timeFilter === 'day') return 'Today';
    if (timeFilter === 'week') return 'This Week';
    if (timeFilter === 'month') return 'This Month';
    if (timeFilter === 'all') return 'All Time';
    if (timeFilter === 'custom') {
      if (customDateRange.start && customDateRange.end) {
        return `${new Date(customDateRange.start).toLocaleDateString()} - ${new Date(customDateRange.end).toLocaleDateString()}`;
      }
      return 'Custom Range';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Kitani Beauty Inventory</h1>
          <p className="text-gray-600 text-center">Track your products, sales, and tithe</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3 flex-wrap mb-3">
            <span className="text-gray-600 font-medium">View:</span>
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-4 py-2 rounded-lg transition ${
                timeFilter === 'day' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-4 py-2 rounded-lg transition ${
                timeFilter === 'week' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-lg transition ${
                timeFilter === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                timeFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('custom')}
              className={`px-4 py-2 rounded-lg transition ${
                timeFilter === 'custom' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Custom Range
            </button>
          </div>
          
          {timeFilter === 'custom' && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div>
                <label className="text-sm text-gray-600 block mb-1">From:</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">To:</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">{getFilterLabel()} Sales</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">₦{totalSales.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">{getFilterLabel()} Profit</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">₦{totalProfit.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100">10% Tithe</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold">₦{tithe.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Record Sale</h2>
              <button
                onClick={() => setShowSaleForm(!showSaleForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                New Sale
              </button>
            </div>

            {showSaleForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <select
                  value={saleForm.productId}
                  onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                >
                  <option value="">Select Product</option>
                  {products.filter(p => p.stock > 0).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Quantity Sold"
                  value={saleForm.quantity}
                  onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                <input
                  type="number"
                  placeholder="Selling Price per Unit (₦)"
                  value={saleForm.sellingPrice}
                  onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                <input
                  type="date"
                  value={saleForm.date}
                  onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                />
                <button
                  onClick={recordSale}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Record Sale
                </button>
              </div>
            )}

            <h3 className="font-semibold text-gray-700 mb-3">{getFilterLabel()}'s Sales</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales recorded for this period</p>
              ) : (
                filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date)).map(sale => (
                  <div key={sale.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{sale.productName}</h3>
                        <p className="text-sm text-gray-600">Qty: {sale.quantity} × ₦{sale.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            Profit: ₦{sale.profit.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteSale(sale)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Sale"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-slate-300 text-xs uppercase tracking-wide">Inventory Value</p>
                  <p className="text-2xl font-bold">₦{totalInventoryValue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-xs uppercase tracking-wide">If Sold</p>
                  <p className="text-xl font-bold">₦{potentialRevenue.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-xs uppercase tracking-wide">Profit</p>
                  <p className="text-xl font-bold text-green-400">₦{(potentialRevenue - totalInventoryValue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">Products</h2>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {products.length} items ({products.reduce((sum, p) => sum + p.stock, 0)} stock)
                  </span>
                </div>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {showAddProduct && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Cost Price (₦)"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Selling Price (₦)"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <input
                    type="number"
                    placeholder="Initial Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <button
                    onClick={addProduct}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                  >
                    Save Product
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No products found</p>
                ) : (
                  filteredProducts.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      {editingProduct?.id === product.id ? (
                        <div>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-2 py-1 border rounded mb-2"
                          />
                          <input
                            type="number"
                            placeholder="Cost Price"
                            value={editingProduct.costPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded mb-2"
                          />
                          <input
                            type="number"
                            placeholder="Selling Price"
                            value={editingProduct.sellingPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 border rounded mb-2"
                          />
                          <input
                            type="number"
                            placeholder="Stock"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                            className="w-full px-2 py-1 border rounded mb-2"
                          />
                          <button
                            onClick={updateProduct}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : restockingProduct?.id === product.id ? (
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Add Stock to {product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">Current Stock: {product.stock}</p>
                          <input
                            type="number"
                            placeholder="Enter quantity to add"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(e.target.value)}
                            className="w-full px-2 py-1 border rounded mb-2"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={addStock}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex-1"
                            >
                              Add Stock
                            </button>
                            <button
                              onClick={() => {
                                setRestockingProduct(null);
                                setRestockAmount('');
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg mb-1">{product.name}</h3>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Cost:</span>
                                  <span className="ml-1 text-gray-700">₦{product.costPrice.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Stock:</span>
                                  <span className={`ml-1 font-medium ${product.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                                    {product.stock}
                                  </span>
                                </div>
                                <div className="bg-blue-50 px-2 py-1 rounded">
                                  <span className="text-gray-500">Selling:</span>
                                  <span className="ml-1 font-bold text-blue-600">₦{product.sellingPrice.toLocaleString()}</span>
                                </div>
                                <div className="bg-green-50 px-2 py-1 rounded">
                                  <span className="text-gray-500">Profit:</span>
                                  <span className="ml-1 font-bold text-green-600">₦{(product.sellingPrice - product.costPrice).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-3">
                              <button
                                onClick={() => setRestockingProduct({ ...product })}
                                className="text-green-500 hover:text-green-700"
                                title="Add Stock"
                              >
                                <Package className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingProduct({ ...product })}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}