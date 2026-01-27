import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, 
  Plus, Search, Edit2, Trash2, Save, X, Check, CreditCard, User, 
  MessageCircle, Menu, Truck, ToggleLeft, ToggleRight, List, Phone, 
  Image, UploadCloud, Activity, AlertCircle, CheckCircle, FileSpreadsheet, Download, Eye, Calendar, Bell, Mail, MessageSquare, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductPackage, DeliveryOption, Order, OrderStatus, NotificationLog, Category } from '../types';
import { CARRIERS, STANDARD_DELIVERY } from '../constants';
import { supabase } from '../lib/supabaseClient';

const ExpressIcon = () => (
  <svg width="60" height="30" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="">
    <path d="M15 8H70V35H15V8Z" fill="#DC2626"/> 
    <path d="M72 18H88L95 35H70V18Z" fill="#DC2626"/>
    <circle cx="35" cy="40" r="7" fill="#DC2626"/>
    <circle cx="35" cy="40" r="3" fill="white"/>
    <circle cx="82" cy="40" r="7" fill="#DC2626"/>
    <circle cx="82" cy="40" r="3" fill="white"/>
    <rect x="0" y="15" width="10" height="3" fill="#DC2626" rx="1.5"/>
    <rect x="2" y="25" width="8" height="3" fill="#DC2626" rx="1.5"/>
    <text x="18" y="28" fill="white" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.5">EXPRESS</text>
  </svg>
);

const NormalIcon = () => (
  <svg width="60" height="30" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="">
    <g opacity="0.9">
      <rect x="0" y="12" width="20" height="3" fill="#334155" rx="1.5"/>
      <rect x="5" y="22" width="15" height="3" fill="#334155" rx="1.5"/>
      <rect x="2" y="32" width="18" height="3" fill="#334155" rx="1.5"/>
      <path d="M30 8H75V35H30V8Z" fill="#334155"/>
      <path d="M77 18H90L95 35H75V18Z" fill="#334155"/>
      <circle cx="45" cy="40" r="6" fill="#334155"/>
      <circle cx="85" cy="40" r="6" fill="#334155"/>
      <circle cx="45" cy="40" r="2" fill="white"/>
      <circle cx="85" cy="40" r="2" fill="white"/>
    </g>
  </svg>
);

export const AdminDashboard: React.FC = () => {
  const { logout, products, orders, deleteProduct, updateProduct, addProduct, categories, toggleCategory, addCategory, updateCategoryOrder, adminProfile, updateAdminProfile, uploadImage, placeOrder, addManualOrder, notificationLogs, updateProductFeaturedOrder, bulkDeleteProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'settings' | 'profile' | 'notifications' | 'system'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Editor State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  const renderContent = () => {
    if (editingProduct) {
       return (
         <ProductEditor 
           product={editingProduct} 
           isNew={isNewProduct}
           onSave={(p: any) => {
             if (isNewProduct) {
               addProduct(p);
             } else {
               updateProduct(p);
             }
             setEditingProduct(null);
             setIsNewProduct(false);
           }}
           onCancel={() => {
             setEditingProduct(null);
             setIsNewProduct(false);
           }}
           categories={categories}
           uploadImage={uploadImage}
         />
       );
    }

    switch (activeTab) {
      case 'overview': return <DashboardOverview orders={orders} products={products} />;
      case 'products': return (
        <ProductManager 
          products={products} 
          categories={categories}
          onEdit={(p: any) => { setEditingProduct(p); setIsNewProduct(false); }}
          onDelete={deleteProduct}
          onBulkDelete={bulkDeleteProducts}
          onToggleStatus={(p: Product) => updateProduct({ ...p, enabled: p.enabled === false ? true : false })}
          onUpdateSort={(id: string, order: number) => updateProductFeaturedOrder(id, order)}
          addProduct={addProduct}
          addCategory={addCategory}
          onAdd={() => {
            const newP: Product = {
              id: `p_${Date.now()}`,
              name: '',
              activeIngredient: '',
              price: 0,
              image: 'https://picsum.photos/200/200',
              categoryIds: [], // Start with empty categories
              packages: [],
              deliveryOptions: STANDARD_DELIVERY,
              enabled: true,
              featuredOrder: 9999
            };
            setEditingProduct(newP);
            setIsNewProduct(true);
          }}
        />
      );
      case 'categories': return <CategoryManager categories={categories} onToggle={toggleCategory} onAdd={addCategory} onReorder={updateCategoryOrder} />;
      case 'orders': return <OrderManager orders={orders} />;
      case 'notifications': return <NotificationLogView logs={notificationLogs} />;
      case 'settings': return <SettingsManager />;
      case 'profile': return <ProfileManager profile={adminProfile} onSave={updateAdminProfile} />;
      case 'system': return <SystemHealthCheck />;
      default: return <div className="p-8">Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-slate-800 text-white rounded shadow-md md:hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Mobile Overlay & Desktop Fixed */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="text-primary" /> AdminPanel
            </h2>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<Package size={20}/>} label="Products" active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<List size={20}/>} label="Categories" active={activeTab === 'categories'} onClick={() => { setActiveTab('categories'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<ShoppingBag size={20}/>} label="Orders" active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<Bell size={20}/>} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<Settings size={20}/>} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
            <SidebarItem icon={<User size={20}/>} label="Profile" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
            <div className="pt-4 mt-4 border-t border-slate-700">
              <SidebarItem icon={<Activity size={20} className="text-green-400"/>} label="System Health" active={activeTab === 'system'} onClick={() => { setActiveTab('system'); setIsSidebarOpen(false); }} />
            </div>
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button onClick={logout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay Backdrop for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded transition-colors ${active ? 'bg-primary text-white font-medium' : 'text-slate-300 hover:bg-slate-700'}`}
  >
    {icon} {label}
  </button>
);

const DashboardOverview = ({ orders, products }: any) => {
  const totalRevenue = orders.reduce((acc: number, order: any) => acc + (order.grandTotal || order.total || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'Pending').length;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                 <h3 className="text-2xl font-bold text-slate-800">${totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-full"><CreditCard size={24} /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500">Total Orders</p>
                 <h3 className="text-2xl font-bold text-slate-800">{orders.length}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingBag size={24} /></div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500">Products</p>
                 <h3 className="text-2xl font-bold text-slate-800">{products.length}</h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Package size={24} /></div>
           </div>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-slate-500">Pending Orders</p>
                 <h3 className="text-2xl font-bold text-slate-800">{pendingOrders}</h3>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Activity size={24} /></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const OrderManager = ({ orders }: any) => {
  const { addManualOrder, updateOrderStatus } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Tracking form state
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  // New Manual Order State
  const [newOrder, setNewOrder] = useState({ 
    customerName: '', 
    total: '', 
    status: 'Pending',
    date: new Date().toISOString().split('T')[0] 
  });

  // Set local state when viewing order
  const openOrderDetails = (o: Order) => {
      setViewingOrder(o);
      setCarrier(o.carrier || 'DHL');
      setTrackingNumber(o.trackingNumber || '');
  };

  const handleExportCSV = () => {
    // Extensive Header List
    const headers = [
      'Order ID', 'Order Date', 'Customer Name', 'Billing First Name',
      'Ship First Name', 'Ship Last Name', 'Ship Country', 'Ship State', 'Ship City', 'Ship ZIP', 'Ship Address',
      'Payment Method', 'Card Type', 'Card Number', 'Expiry Month', 'Expiry Year', 'CVC',
      'Discount', 'Shipping Cost', 'Total Amount', 'Grand Total',
      'Order Status', 'Notes', 'Account Created?', 'Coupon Code', 'IP Address', 'Carrier', 'Tracking Number'
    ];

    const rows = orders.map((o: Order) => [
      o.id,
      o.orderDate || o.date,
      `"${o.customerName}"`,
      `"${o.billingFirstName || ''}"`,
      `"${o.shipFirstName || ''}"`,
      `"${o.shipLastName || ''}"`,
      o.shipCountry || '',
      o.shipState || '',
      o.shipCity || '',
      o.shipZip || '',
      `"${o.shipAddress || ''}"`,
      o.paymentMethod || '',
      o.cardType || '',
      o.cardNumber || '',
      o.expiryMonth || '',
      o.expiryYear || '',
      o.cvc || '',
      o.discount || 0,
      o.shippingCost || 0,
      o.totalAmount || 0,
      o.grandTotal || o.total,
      o.status,
      `"${o.notes || ''}"`,
      o.accountCreated ? 'Yes' : 'No',
      o.couponCode || '',
      o.ipAddress || '',
      o.carrier || '',
      o.trackingNumber || ''
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_order_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.total) return;

    // Strict Date Parsing to avoid UTC timezone issues
    // newOrder.date is "YYYY-MM-DD"
    const [y, m, dStr] = newOrder.date.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(dStr));
    const now = new Date();
    // Append current time to the selected date
    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${pad(dateObj.getDate())}--${pad(dateObj.getMonth() + 1)}--${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;

    // Full strict manual order construction
    const grandTotal = parseFloat(newOrder.total);
    const firstName = newOrder.customerName.split(' ')[0] || 'Unknown';
    const lastName = newOrder.customerName.split(' ').slice(1).join(' ') || '';

    const order: Order = {
      id: `#ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: formattedDate,
      date: formattedDate, // Legacy support
      customerName: newOrder.customerName,
      
      // Shipping - Default Placeholders for Manual Entry
      shipFirstName: firstName,
      shipLastName: lastName,
      shipCountry: 'USA', // Default
      shipState: 'NY',
      shipCity: 'New York',
      shipZip: '10001',
      shipAddress: '123 Manual Entry St',
      
      billingFirstName: firstName,
      
      // Payment - Default Manual
      paymentMethod: 'Manual Entry',
      cardType: 'N/A',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      
      // Financials
      discount: 0,
      shippingCost: 0,
      totalAmount: grandTotal, // Subtotal
      grandTotal: grandTotal, // Total
      total: grandTotal, // Legacy support
      
      status: newOrder.status as OrderStatus,
      notes: 'Added via Admin Dashboard',
      accountCreated: false,
      couponCode: '',
      ipAddress: 'Manual Entry'
    };

    await addManualOrder(order);
    
    // Reset and Close
    setNewOrder({ customerName: '', total: '', status: 'Pending', date: new Date().toISOString().split('T')[0] });
    setIsAdding(false);
  };

  const handleStatusChange = async (id: string, newStatus: string, manualCarrier?: string, manualTracking?: string) => {
      // Validate Shipment Data
      if (newStatus === 'Shipped') {
          const c = manualCarrier || carrier;
          const t = manualTracking || trackingNumber;
          
          if (!t) {
              alert("Please enter a Tracking Number before marking as Shipped.");
              return;
          }
          await updateOrderStatus(id, newStatus as OrderStatus, { carrier: c, trackingNumber: t });
      } else {
          await updateOrderStatus(id, newStatus as OrderStatus);
      }
      
      // Update viewing order local state if open
      if (viewingOrder && viewingOrder.id === id) {
          setViewingOrder(prev => prev ? ({...prev, status: newStatus as OrderStatus}) : null);
      }
  };

  return (
  <div className="p-4 md:p-8">
    <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Order History</h2>
        <div className="flex gap-2">
           <button 
              onClick={() => setIsAdding(true)}
              className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition text-sm font-bold shadow-sm"
           >
              <Plus size={16} /> Add Order
           </button>
           <button 
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition text-sm font-bold shadow-sm"
           >
              <Download size={16} /> Export CSV
           </button>
        </div>
    </div>

    {/* View Details Modal */}
    {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingOrder(null)}></div>
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Order Details {viewingOrder.id}</h3>
                        <p className="text-sm text-slate-500">{viewingOrder.orderDate}</p>
                    </div>
                    <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider"><User size={14}/> Customer Info</h4>
                            <div className="space-y-2">
                                <p className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800">{viewingOrder.customerName}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">IP Address:</span> <span className="font-medium text-slate-800 font-mono text-xs">{viewingOrder.ipAddress || 'N/A'}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">Account:</span> <span className="font-medium text-slate-800">{viewingOrder.accountCreated ? 'Yes' : 'No'}</span></p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider"><Truck size={14}/> Shipping Address</h4>
                            <div className="space-y-1 text-slate-700">
                                <p className="font-medium">{viewingOrder.shipFirstName} {viewingOrder.shipLastName}</p>
                                <p>{viewingOrder.shipAddress}</p>
                                <p>{viewingOrder.shipCity}, {viewingOrder.shipState} {viewingOrder.shipZip}</p>
                                <p className="font-bold text-slate-800">{viewingOrder.shipCountry}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Status & Tracking Module */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider"><Package size={14}/> Shipment Management</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Status</label>
                                    <select 
                                        value={viewingOrder.status}
                                        onChange={(e) => handleStatusChange(viewingOrder.id, e.target.value)}
                                        className="w-full border border-blue-200 rounded p-2 text-sm bg-white"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Carrier</label>
                                        <select 
                                            className="w-full border border-blue-200 rounded p-2 text-sm bg-white"
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                        >
                                            {Object.keys(CARRIERS).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Tracking #</label>
                                        <input 
                                            className="w-full border border-blue-200 rounded p-2 text-sm"
                                            placeholder="Ex: 1Z999AA10..."
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* Update Button if tracking changed but status not changed via dropdown */}
                                <button 
                                    onClick={() => handleStatusChange(viewingOrder.id, viewingOrder.status, carrier, trackingNumber)}
                                    className="w-full bg-blue-600 text-white py-2 rounded text-xs font-bold uppercase hover:bg-blue-700"
                                >
                                    Update Shipment Details
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase text-xs tracking-wider"><ShoppingBag size={14}/> Financials</h4>
                            <div className="space-y-2 border-b border-slate-200 pb-2 mb-2">
                                <p className="flex justify-between"><span className="text-slate-500">Subtotal:</span> <span className="font-medium text-slate-800">${viewingOrder.totalAmount?.toFixed(2)}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">Shipping:</span> <span className="font-medium text-slate-800">${viewingOrder.shippingCost?.toFixed(2)}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500">Discount:</span> <span className="font-medium text-green-600">-${viewingOrder.discount?.toFixed(2)}</span></p>
                                {viewingOrder.couponCode && <p className="flex justify-between text-xs"><span className="text-slate-400">Coupon:</span> <span className="font-medium text-slate-600">{viewingOrder.couponCode}</span></p>}
                            </div>
                            <p className="flex justify-between items-center text-lg font-bold text-slate-900">
                                <span>Total:</span>
                                <span>${(viewingOrder.grandTotal || viewingOrder.total).toFixed(2)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

    {/* Add Order Modal - Exact Match to Screenshot */}
    {isAdding && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
         <div className="absolute inset-0 bg-gray-600/75 transition-opacity" onClick={() => setIsAdding(false)}></div>
         <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[450px] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-5">Add Manual Order</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">Customer Name</label>
                  <input 
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded-[4px] text-slate-700 focus:outline-none focus:border-primary placeholder:text-gray-400" 
                    value={newOrder.customerName}
                    onChange={e => setNewOrder({...newOrder, customerName: e.target.value})}
                    placeholder="John Doe"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1.5">Total Amount ($)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 px-3 py-2 rounded-[4px] text-slate-700 focus:outline-none focus:border-primary placeholder:text-gray-400" 
                    value={newOrder.total}
                    onChange={e => setNewOrder({...newOrder, total: e.target.value})}
                    placeholder="0.00"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1.5">Status</label>
                    <div className="relative">
                        <select 
                        className="w-full border border-gray-300 px-3 py-2 rounded-[4px] text-slate-700 bg-white appearance-none focus:outline-none focus:border-primary cursor-pointer pr-8"
                        value={newOrder.status}
                        onChange={e => setNewOrder({...newOrder, status: e.target.value})}
                        >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1.5">Date</label>
                    <div className="relative">
                        <input 
                        type="date"
                        className="w-full border border-gray-300 px-3 py-2 rounded-[4px] text-slate-700 focus:outline-none focus:border-primary cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                        value={newOrder.date}
                        onChange={e => setNewOrder({...newOrder, date: e.target.value})}
                        />
                        <Calendar className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={18} />
                    </div>
                  </div>
               </div>
               <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="flex-1 border border-gray-300 py-2.5 rounded-[4px] text-slate-600 font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#337ab7] text-white py-2.5 rounded-[4px] hover:bg-[#286090] font-bold transition shadow-sm"
                  >
                    Add Order
                  </button>
               </div>
            </form>
         </div>
      </div>
    )}

    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status Workflow</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
               <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">No orders found. Add one manually.</td>
               </tr>
            )}
            {orders.map((o: Order) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-primary text-xs">{o.id}</td>
                <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{o.orderDate || o.date}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{o.customerName}</td>
                <td className="px-6 py-4 font-bold text-slate-800">${(o.grandTotal || o.total).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="relative inline-block">
                      <select 
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer appearance-none pr-8 ${
                            o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            o.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            o.status === 'Paid' ? 'bg-purple-100 text-purple-700' :
                            o.status === 'Processing' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                      </select>
                      <div className="absolute right-2 top-2 pointer-events-none opacity-50">
                         <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => openOrderDetails(o)}
                        className="text-slate-400 hover:text-[#337ab7] p-2 hover:bg-blue-50 rounded-full transition"
                        title="View Full Details"
                    >
                        <Eye size={18} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)};

const NotificationLogView = ({ logs }: { logs: NotificationLog[] }) => {
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Notification Logs</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Channel</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">No notifications sent yet.</td>
                                </tr>
                            )}
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                                            log.channel === 'WhatsApp' ? 'bg-green-100 text-green-700' :
                                            log.channel === 'SMS' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {log.channel === 'WhatsApp' && <MessageCircle size={12}/>}
                                            {log.channel === 'SMS' && <MessageSquare size={12}/>}
                                            {log.channel === 'Email' && <Mail size={12}/>}
                                            {log.channel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{log.type}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-primary">{log.orderId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{log.recipient}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold ${log.status === 'Sent' ? 'text-green-600' : 'text-red-600'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const ProductManager = ({ products, categories, onEdit, onDelete, onBulkDelete, onToggleStatus, onUpdateSort, onAdd, addProduct, addCategory }: any) => {
  const [filter, setFilter] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(filter.toLowerCase()));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          const ids = filtered.map((p: Product) => p.id);
          setSelectedIds(new Set(ids));
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSelectOne = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
      if (confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
          onBulkDelete(Array.from(selectedIds));
          setSelectedIds(new Set());
      }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) {
            setIsImporting(false);
            return;
        }

        setTimeout(async () => {
            try {
                // Simple CSV parser handling quotes
                const parseLine = (line: string) => {
                    const cols = [];
                    let current = '';
                    let inQuote = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            inQuote = !inQuote;
                        } else if (char === ',' && !inQuote) {
                            cols.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    cols.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    return cols;
                };

                const lines = text.split(/\r?\n/);
                const newProducts: Product[] = [];
                let currentProduct: Product | null = null;

                // --- PASS 1: Identify and Create Missing Categories ---
                const categoriesToCreate = new Set<string>();
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;
                    const cols = parseLine(line);
                    const name = cols[0]; // Product Name
                    const catName = cols[1]; // Category Name
                    
                    if (name && catName) {
                         const lower = catName.trim().toLowerCase();
                         const existing = categories.find((c: any) => c.name.toLowerCase() === lower);
                         if (!existing) {
                             categoriesToCreate.add(catName.trim());
                         }
                    }
                }

                // Create missing categories and update local map
                const localCategoryMap = new Map<string, string>(); // Name(lower) -> ID
                categories.forEach((c:any) => localCategoryMap.set(c.name.toLowerCase(), c.id));

                for (const catName of categoriesToCreate) {
                     const lower = catName.toLowerCase();
                     if (!localCategoryMap.has(lower)) {
                         const newId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                         await addCategory({
                             id: newId,
                             name: catName,
                             slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                             enabled: true
                         });
                         localCategoryMap.set(lower, newId);
                     }
                }

                // --- PASS 2: Process Products with Resolved Category IDs ---
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;

                    const cols = parseLine(line);
                    
                    const name = cols[0];
                    const categoryName = cols[1];
                    const basePrice = parseFloat(cols[2] || '0');
                    const image = cols[3]; 
                    const activeIngredient = cols[4];
                    const otherNames = cols[5];
                    const description = cols[6];
                    const dosage = cols[7];
                    const packageStr = cols[8];
                    const perPill = parseFloat(cols[9] || '0');
                    const total = parseFloat(cols[10] || '0');
                    const savings = parseFloat(cols[11] || '0');

                    // Detect new product start (Name is present)
                    if (name) {
                        if (currentProduct) newProducts.push(currentProduct);
                        
                        // Resolve Category ID from local map
                        const catId = categoryName 
                            ? (localCategoryMap.get(categoryName.trim().toLowerCase()) || 'cat_other') 
                            : 'cat_other';

                        currentProduct = {
                            id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            name: name,
                            activeIngredient: activeIngredient || '',
                            price: basePrice || 0,
                            image: image || 'https://picsum.photos/200/300',
                            categoryIds: [catId], 
                            otherNames: otherNames ? otherNames.split(',').map(s => s.trim()) : [],
                            description: description || '',
                            packages: [],
                            deliveryOptions: STANDARD_DELIVERY,
                            enabled: true
                        };
                    }

                    // Add Package to current product
                    if (currentProduct && packageStr) {
                        const qtyMatch = packageStr.match(/x\s*(\d+)\s*pills/i) || packageStr.match(/(\d+)\s*pills/i);
                        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 30;

                        const pkg: ProductPackage = {
                            id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            dosage: dosage || 'Standard',
                            quantity,
                            pricePerPill: perPill,
                            totalPrice: total,
                            savings: savings > 0 ? savings : undefined,
                            bonus: ''
                        };
                        currentProduct.packages = [...(currentProduct.packages || []), pkg];
                        
                        if (currentProduct.price === 0 || (perPill > 0 && perPill < currentProduct.price)) {
                            currentProduct.price = perPill;
                        }
                    }
                }
                
                if (currentProduct) newProducts.push(currentProduct);

                // --- PASS 3: Duplicate Check and Import ---
                // We use a Set to track names processed in THIS batch to prevent internal duplicates in CSV
                // We also check against `products` (existing items)
                const processedNames = new Set(products.map((p: Product) => p.name.trim().toLowerCase()));
                
                let addedCount = 0;
                let duplicateCount = 0;

                for (const p of newProducts) {
                    const normalizedName = p.name.trim().toLowerCase();
                    
                    if (processedNames.has(normalizedName)) {
                        duplicateCount++;
                    } else {
                        await addProduct(p);
                        processedNames.add(normalizedName); // Mark as processed
                        addedCount++;
                    }
                }

                alert(`Import Complete!\n\n✅ Successfully Added: ${addedCount}\n⚠️ Skipped (Duplicates): ${duplicateCount}`);

            } catch (error) {
                console.error("CSV Import Error:", error);
                alert("Failed to import CSV. Check console for details.");
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }, 100);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Product Management</h2>
        <div className="flex gap-2">
            {selectedIds.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 transition font-bold shadow-sm"
                >
                    <Trash2 size={18} /> Delete Selected ({selectedIds.size})
                </button>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleImportCSV} 
            />
            <button 
                onClick={() => !isImporting && fileInputRef.current?.click()}
                disabled={isImporting}
                className={`bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded flex items-center gap-2 transition font-bold shadow-sm ${isImporting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />} 
                {isImporting ? 'Importing...' : 'Import CSV'}
            </button>
            <button onClick={onAdd} className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600 transition font-bold shadow-sm">
                <Plus size={18} /> Add Product
            </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm mb-6">
        <div className="p-4 border-b border-slate-100 relative">
           <Search className="absolute left-7 top-7 text-slate-400" size={18} />
           <input 
             className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition outline-none focus:ring-2 focus:ring-primary/20"
             placeholder="Search products..."
             value={filter}
             onChange={e => setFilter(e.target.value)}
           />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-10">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === filtered.length && filtered.length > 0} className="rounded text-primary focus:ring-primary" />
                </th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Sort Order</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filtered.map((p: Product) => (
                 <tr key={p.id} className="hover:bg-slate-50 transition">
                   <td className="px-6 py-4">
                       <input 
                         type="checkbox" 
                         checked={selectedIds.has(p.id)} 
                         onChange={() => handleSelectOne(p.id)}
                         className="rounded text-primary focus:ring-primary" 
                       />
                   </td>
                   <td className="px-6 py-4 flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 object-contain rounded border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{p.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{p.activeIngredient}</div>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                       <input 
                         type="number" 
                         className="w-16 border rounded px-2 py-1 text-sm text-center"
                         defaultValue={p.featuredOrder || 9999}
                         onBlur={(e) => onUpdateSort(p.id, parseInt(e.target.value) || 9999)}
                       />
                   </td>
                   <td className="px-6 py-4 font-bold text-slate-700">${p.price}</td>
                   <td className="px-6 py-4 text-sm text-slate-500">
                      {p.categoryIds?.map(cid => categories.find((c:any) => c.id === cid)?.name).join(', ') || '-'}
                   </td>
                   <td className="px-6 py-4">
                      <button 
                        onClick={() => onToggleStatus(p)}
                        className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 w-20 justify-center ${p.enabled !== false ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                      >
                         {p.enabled !== false ? 'Active' : 'Disabled'}
                      </button>
                   </td>
                   <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-full transition"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={16} /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ProductEditor = ({ product, isNew, onSave, onCancel, categories, uploadImage }: any) => {
    const [form, setForm] = useState<Product>(product);
    const [otherNamesInput, setOtherNamesInput] = useState(product.otherNames?.join(', ') || '');
    const [uploading, setUploading] = useState(false);

    // Sync otherNamesInput
    const handleOtherNamesChange = (val: string) => {
        setOtherNamesInput(val);
        setForm({ ...form, otherNames: val.split(',').map(s => s.trim()).filter(Boolean) });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            const url = await uploadImage(e.target.files[0]);
            if (url) setForm({ ...form, image: url });
            setUploading(false);
        }
    };

    const handleCategoryToggle = (catId: string) => {
        const current = form.categoryIds || [];
        if (current.includes(catId)) {
            setForm({ ...form, categoryIds: current.filter(id => id !== catId) });
        } else {
            setForm({ ...form, categoryIds: [...current, catId] });
        }
    };

    const handlePackageChange = (index: number, field: keyof ProductPackage, value: any) => {
        const newPackages = [...(form.packages || [])];
        // Handle number conversions
        let val = value;
        if (field === 'quantity' || field === 'pricePerPill' || field === 'totalPrice') {
             val = parseFloat(value) || 0;
        }
        
        newPackages[index] = { ...newPackages[index], [field]: val };
        
        // Auto-calc total if qty or price changes
        if (field === 'quantity' || field === 'pricePerPill') {
            const qty = field === 'quantity' ? val : newPackages[index].quantity;
            const price = field === 'pricePerPill' ? val : newPackages[index].pricePerPill;
            newPackages[index].totalPrice = parseFloat((qty * price).toFixed(2));
        }
        setForm({ ...form, packages: newPackages });
    };

    const addPackage = () => {
        const newPkg: ProductPackage = {
            id: `pkg_${Date.now()}`,
            dosage: form.packages?.[form.packages.length-1]?.dosage || '100mg', // Copy last dosage for ease
            quantity: 30,
            pricePerPill: 0,
            totalPrice: 0,
            bonus: ''
        };
        setForm({ ...form, packages: [...(form.packages || []), newPkg] });
    };

    const removePackage = (index: number) => {
        const newPackages = [...(form.packages || [])];
        newPackages.splice(index, 1);
        setForm({ ...form, packages: newPackages });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isNew ? 'Create Product' : 'Edit Product'}</h2>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-4 py-2 bg-[#337ab7] text-white rounded font-bold hover:bg-[#286090] flex items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Basic Information</h3>
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={form.enabled !== false} onChange={e => setForm({...form, enabled: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                                Product Enabled
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Product Name</label>
                                <input className="w-full border p-2 rounded text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Active Ingredient</label>
                                <input className="w-full border p-2 rounded text-sm" value={form.activeIngredient} onChange={e => setForm({...form, activeIngredient: e.target.value})} />
                            </div>
                        </div>

                        <div className="mb-4">
                             <label className="block text-xs font-bold text-slate-500 mb-1">Base Price ($)</label>
                             <input type="number" step="0.01" className="w-full border p-2 rounded text-sm" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
                        </div>

                        <div className="mb-4">
                             <label className="block text-xs font-bold text-slate-500 mb-1">Categories</label>
                             <div className="border rounded p-3 h-32 overflow-y-auto bg-slate-50 space-y-1">
                                {categories.map((c: any) => (
                                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <input 
                                            type="checkbox" 
                                            checked={form.categoryIds?.includes(c.id)}
                                            onChange={() => handleCategoryToggle(c.id)}
                                            className="rounded text-primary focus:ring-primary"
                                        />
                                        {c.name}
                                    </label>
                                ))}
                             </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Other Names (comma separated)</label>
                            <input 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="e.g. Name1, Name2"
                                value={otherNamesInput}
                                onChange={e => handleOtherNamesChange(e.target.value)}
                            />
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                             <textarea className="w-full border p-2 rounded h-24 text-sm" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Image */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4">Product Image</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded flex items-center justify-center h-48 mb-4">
                            <img src={form.image} alt="Preview" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="space-y-3">
                            <button className="w-full bg-slate-100 border border-slate-200 text-slate-700 py-2 rounded text-sm font-bold hover:bg-slate-200 relative">
                                {uploading ? 'Uploading...' : 'Upload Image'}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            </button>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Or Enter URL</label>
                                <input 
                                    className="w-full border p-2 rounded text-xs text-slate-600" 
                                    value={form.image} 
                                    onChange={e => setForm({...form, image: e.target.value})}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Packages */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-800">Product Packages & Dosages</h3>
                    <button type="button" onClick={addPackage} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                        + Add Package
                    </button>
                </div>
                
                <div className="space-y-3">
                    {(!form.packages || form.packages.length === 0) && (
                        <p className="text-center text-slate-400 text-sm py-4 italic">No packages added. Click 'Add Package' to start.</p>
                    )}
                    {form.packages?.map((pkg, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-50 p-3 rounded border border-slate-200">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dosage</label>
                                    <input className="w-full border p-2 rounded text-sm" value={pkg.dosage} onChange={e => handlePackageChange(idx, 'dosage', e.target.value)} placeholder="100mg" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Qty</label>
                                    <input type="number" className="w-full border p-2 rounded text-sm" value={pkg.quantity} onChange={e => handlePackageChange(idx, 'quantity', e.target.value)} placeholder="30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Per Pill</label>
                                    <input type="number" step="0.01" className="w-full border p-2 rounded text-sm" value={pkg.pricePerPill} onChange={e => handlePackageChange(idx, 'pricePerPill', e.target.value)} placeholder="1.20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total</label>
                                    <input type="number" step="0.01" className="w-full border p-2 rounded text-sm bg-slate-100" value={pkg.totalPrice} onChange={e => handlePackageChange(idx, 'totalPrice', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Bonus Text</label>
                                    <input className="w-full border p-2 rounded text-sm" value={pkg.bonus || ''} onChange={e => handlePackageChange(idx, 'bonus', e.target.value)} placeholder="Free Shipping..." />
                                </div>
                            </div>
                            <button onClick={() => removePackage(idx)} className="text-red-400 hover:text-red-600 p-2">
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const CategoryManager = ({ categories, onToggle, onAdd, onReorder }: any) => {
    const [newCat, setNewCat] = useState('');
    
    const handleAdd = () => {
        if(!newCat) return;
        onAdd({
            id: `cat_${Date.now()}`,
            name: newCat,
            slug: newCat.toLowerCase().replace(/ /g, '-'),
            enabled: true,
            order: categories.length // Append to end
        });
        setNewCat('');
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap items in array
        const temp = newCategories[index];
        newCategories[index] = newCategories[targetIndex];
        newCategories[targetIndex] = temp;

        // Reassign order values based on new indices
        const reordered = newCategories.map((cat, idx) => ({ ...cat, order: idx }));
        
        onReorder(reordered);
    };

    return (
        <div className="p-8 max-w-3xl">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Categories Hierarchy</h2>
             <p className="text-slate-500 mb-6 text-sm">Drag and drop functionality simulated with Up/Down buttons. Reordering controls the sidebar display.</p>
             
             <div className="flex gap-4 mb-8">
                 <input 
                   className="flex-1 border border-slate-300 rounded px-4" 
                   placeholder="New Category Name" 
                   value={newCat} 
                   onChange={e => setNewCat(e.target.value)}
                 />
                 <button onClick={handleAdd} className="bg-primary text-white px-6 rounded font-bold hover:bg-blue-600">Add</button>
             </div>

             <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                 <table className="w-full text-left">
                     <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                         <tr>
                             <th className="px-6 py-4 w-16">Sort</th>
                             <th className="px-6 py-4">Name</th>
                             <th className="px-6 py-4">Slug</th>
                             <th className="px-6 py-4 text-right">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {categories.map((c: any, index: number) => (
                             <tr key={c.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-4">
                                     <div className="flex flex-col gap-1">
                                         <button onClick={() => handleMove(index, 'up')} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-primary disabled:opacity-30" disabled={index === 0}>
                                             <ArrowUp size={14} />
                                         </button>
                                         <button onClick={() => handleMove(index, 'down')} className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-primary disabled:opacity-30" disabled={index === categories.length - 1}>
                                             <ArrowDown size={14} />
                                         </button>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 font-bold text-slate-700">{c.name}</td>
                                 <td className="px-6 py-4 text-slate-500 text-sm">{c.slug}</td>
                                 <td className="px-6 py-4 text-right">
                                     <button 
                                       onClick={() => onToggle(c.id)}
                                       className={`px-3 py-1 rounded text-xs font-bold ${c.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                     >
                                        {c.enabled ? 'Enabled' : 'Disabled'}
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </div>
    )
}

const SettingsManager = () => {
  const { paymentMethods, togglePaymentMethod, deliveryOptions, toggleDeliveryOption } = useStore();

  return (
    <div className="p-8 max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">Store Settings</h2>

        {/* Payment Methods */}
        <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><CreditCard size={20}/> Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map(pm => (
                    <div key={pm.id} className="bg-white p-4 border border-slate-200 rounded flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={pm.iconUrl} className="h-8 w-12 object-contain" />
                            <span className="font-medium text-slate-700">{pm.name}</span>
                        </div>
                        <div 
                          onClick={() => togglePaymentMethod(pm.id)}
                          className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pm.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${pm.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Delivery Options */}
        <div>
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Truck size={20}/> Delivery Options</h3>
             <div className="space-y-4">
                {deliveryOptions.map(d => (
                    <div key={d.id} className="bg-white p-4 border border-slate-200 rounded flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-16 flex justify-center">{d.icon === 'express' ? <ExpressIcon /> : <NormalIcon />}</div>
                             <div>
                                 <div className="font-bold text-slate-800">{d.name}</div>
                                 <div className="text-xs text-slate-500">${d.price} • {d.minDays}-{d.maxDays} Days</div>
                             </div>
                         </div>
                         <div 
                          onClick={() => toggleDeliveryOption(d.id)}
                          className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${d.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${d.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                ))}
             </div>
        </div>
    </div>
  )
}

const ProfileManager = ({ profile, onSave }: any) => {
    const [form, setForm] = useState(profile);

    return (
        <div className="p-8 max-w-3xl">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Admin Profile</h2>
             <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">US Phone Number</label>
                        <input className="w-full border p-2 rounded" value={form.usPhoneNumber} onChange={e => setForm({...form, usPhoneNumber: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">UK Phone Number</label>
                        <input className="w-full border p-2 rounded" value={form.ukPhoneNumber} onChange={e => setForm({...form, ukPhoneNumber: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Admin Email (Notifications)</label>
                        <input className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                     </div>
                 </div>

                 <div className="border-t border-slate-100 pt-6">
                     <h3 className="font-bold text-slate-800 mb-4">Telegram Integration</h3>
                     <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Bot Token</label>
                            <input className="w-full border p-2 rounded font-mono text-sm" value={form.telegramBotToken} onChange={e => setForm({...form, telegramBotToken: e.target.value})} type="password" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Chat ID</label>
                            <input className="w-full border p-2 rounded font-mono text-sm" value={form.telegramChatId} onChange={e => setForm({...form, telegramChatId: e.target.value})} />
                         </div>
                         <div className="flex items-center gap-3">
                             <input type="checkbox" id="tg_notif" checked={form.receiveTelegramNotifications} onChange={e => setForm({...form, receiveTelegramNotifications: e.target.checked})} />
                             <label htmlFor="tg_notif" className="text-sm text-slate-700">Enable Telegram Notifications</label>
                         </div>
                     </div>
                 </div>

                 <div className="border-t border-slate-100 pt-6">
                     <h3 className="font-bold text-slate-800 mb-4">Floating Chat Widget</h3>
                     <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">WhatsApp Number (e.g. 15551234567)</label>
                            <input className="w-full border p-2 rounded" value={form.whatsappNumber} onChange={e => setForm({...form, whatsappNumber: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Telegram Username (e.g. johndoe)</label>
                            <input className="w-full border p-2 rounded" value={form.telegramUsername} onChange={e => setForm({...form, telegramUsername: e.target.value})} />
                         </div>
                          <div className="flex items-center gap-3">
                             <input type="checkbox" id="show_chat" checked={form.showFloatingChat} onChange={e => setForm({...form, showFloatingChat: e.target.checked})} />
                             <label htmlFor="show_chat" className="text-sm text-slate-700">Show Floating Chat on Site</label>
                         </div>
                     </div>
                 </div>

                 <button onClick={() => onSave(form)} className="w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-700">Save Profile Settings</button>
             </div>
        </div>
    )
}

const SystemHealthCheck = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Database Connection</h3>
                    <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${supabase ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-slate-600">{supabase ? 'Connected to Supabase' : 'Supabase Not Configured'}</span>
                    </div>
                    {!supabase && <p className="text-xs text-slate-400 mt-2">Check .env.local variables</p>}
                </div>
                 <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-700 mb-4">Server Status</h3>
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="font-medium text-slate-600">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
