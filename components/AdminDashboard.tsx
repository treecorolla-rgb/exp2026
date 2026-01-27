import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, 
  Plus, Search, Edit2, Trash2, Save, X, Check, CreditCard, User, 
  MessageCircle, Menu, Truck, ToggleLeft, ToggleRight, List, Phone, 
  Image, UploadCloud, Activity, AlertCircle, CheckCircle, FileSpreadsheet, Download, Eye, Calendar, Bell, Mail, MessageSquare, Loader2, ArrowUp, ArrowDown, HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductPackage, DeliveryOption, Order, OrderStatus, NotificationLog, Category, PaymentMethod, AdminProfile } from '../types';
import { CARRIERS, STANDARD_DELIVERY } from '../constants';
import { supabase } from '../lib/supabaseClient';

// --- ICONS ---
const ExpressIcon = () => (
  <svg width="60" height="30" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  <svg width="60" height="30" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const { logout, products, orders, deleteProduct, updateProduct, addProduct, categories, toggleCategory, addCategory, updateCategory, deleteCategory, updateCategoryOrder, adminProfile, updateAdminProfile, uploadImage, placeOrder, addManualOrder, notificationLogs, updateProductFeaturedOrder, bulkDeleteProducts, paymentMethods, deliveryOptions, addPaymentMethod, removePaymentMethod, togglePaymentMethod, addDeliveryOption, removeDeliveryOption, toggleDeliveryOption, updateOrderStatus } = useStore();
  
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
              categoryIds: [],
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
      case 'categories': return (
        <CategoryManager 
            categories={categories} 
            onToggle={toggleCategory} 
            onAdd={addCategory} 
            onReorder={updateCategoryOrder}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
        />
      );
      case 'orders': return <OrderManager orders={orders} onUpdateStatus={updateOrderStatus} />;
      case 'notifications': return <NotificationLogView logs={notificationLogs} />;
      case 'settings': return (
        <SettingsManager 
           paymentMethods={paymentMethods}
           deliveryOptions={deliveryOptions}
           onAddPayment={addPaymentMethod}
           onRemovePayment={removePaymentMethod}
           onTogglePayment={togglePaymentMethod}
           onAddDelivery={addDeliveryOption}
           onRemoveDelivery={removeDeliveryOption}
           onToggleDelivery={toggleDeliveryOption}
        />
      );
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

// --- 1. OVERVIEW ---
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

// --- HELPER FOR CSV PARSING ---
const parseCSVLine = (text: string) => {
    const result = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cell.trim());
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell.trim());
    return result.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
};

// --- 2. PRODUCT MANAGER ---
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

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);

    try {
        const text = await file.text();
        const rows = text.split(/\r?\n/);
        
        if (rows.length < 2) {
            alert("CSV file appears to be empty. Please ensure it has a header row and data.");
            setIsImporting(false);
            return;
        }

        let importedCount = 0;
        let currentProduct: Product | null = null;
        
        // Track categories seen in this session to prevent duplicate creation
        const categoryMap = new Map<string, Category>();
        // Populate with existing categories
        categories.forEach((c: Category) => categoryMap.set(c.name.toLowerCase(), c));

        for (let i = 1; i < rows.length; i++) {
            const line = rows[i].trim();
            if (!line) continue;
            
            const cols = parseCSVLine(line);
            
            // Extract fields
            const name = cols[0];
            const categoryRaw = cols[1];
            const basePrice = parseFloat(cols[2] || '0');
            const productLink = cols[3];
            const activeIngredient = cols[4];
            const otherNamesRaw = cols[5];
            const details = cols[6];
            const dosage = cols[7];
            const packageRaw = cols[8];
            const perPillPrice = parseFloat(cols[9] || '0');
            const totalPrice = parseFloat(cols[10] || '0');
            const savings = parseFloat(cols[11] || '0');

            if (name) {
                if (currentProduct) {
                    await addProduct(currentProduct);
                    importedCount++;
                }

                currentProduct = {
                    id: `p_imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: name,
                    activeIngredient: activeIngredient || '',
                    price: basePrice,
                    image: productLink && productLink.startsWith('http') ? productLink : 'https://picsum.photos/400/400',
                    categoryIds: [],
                    description: details || '',
                    isPopular: false,
                    enabled: true,
                    featuredOrder: 9999 + i,
                    otherNames: otherNamesRaw ? otherNamesRaw.split(',').map(s => s.trim()) : [],
                    packages: [],
                    deliveryOptions: STANDARD_DELIVERY
                };

                if (categoryRaw) {
                    const catName = categoryRaw.trim();
                    const catKey = catName.toLowerCase();
                    
                    if (categoryMap.has(catKey)) {
                         const existing = categoryMap.get(catKey);
                         if(existing) currentProduct.categoryIds.push(existing.id);
                    } else {
                        const newCatId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                        const newCategory: Category = {
                            id: newCatId,
                            name: catName,
                            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            enabled: true,
                            order: 999 + categoryMap.size
                        };
                        
                        // Optimistically update local map immediately to prevent re-creation in next loop
                        categoryMap.set(catKey, newCategory);
                        await addCategory(newCategory);
                        
                        currentProduct.categoryIds.push(newCatId);
                    }
                } else {
                     if (categories.length > 0) currentProduct.categoryIds.push(categories[0].id);
                }
            }

            if (currentProduct && (packageRaw || dosage)) {
                let quantity = 30; 
                let finalDosage = dosage || 'Standard';

                if (packageRaw) {
                    const match = packageRaw.toLowerCase().match(/x\s*(\d+)/);
                    if (match && match[1]) {
                        quantity = parseInt(match[1]);
                    }
                    if (!dosage || !dosage.trim()) {
                       const parts = packageRaw.split('x');
                       if (parts.length > 0) finalDosage = parts[0].trim();
                    }
                }

                currentProduct.packages?.push({
                    id: `${currentProduct.id}_pkg_${currentProduct.packages.length + 1}`,
                    dosage: finalDosage,
                    quantity: quantity,
                    pricePerPill: perPillPrice || (totalPrice / quantity) || 0,
                    totalPrice: totalPrice || (perPillPrice * quantity) || 0,
                    savings: savings > 0 ? savings : undefined,
                    bonus: undefined 
                });
            }
        }

        if (currentProduct) {
            await addProduct(currentProduct);
            importedCount++;
        }

        alert(`Successfully imported ${importedCount} products with packages!`);

    } catch (err) {
        console.error("Import failed", err);
        alert("Failed to parse CSV file. Please check format.");
    } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
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
                        <div className="text-[10px] text-slate-400">{p.packages?.length || 0} packages</div>
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

// --- 3. PRODUCT EDITOR ---
const ProductEditor = ({ product, isNew, onSave, onCancel, categories, uploadImage }: any) => {
    const [form, setForm] = useState<Product>(product);
    const [otherNamesInput, setOtherNamesInput] = useState(product.otherNames?.join(', ') || '');
    const [uploading, setUploading] = useState(false);
    
    // Handlers
    const handleOtherNamesChange = (val: string) => { setOtherNamesInput(val); setForm({ ...form, otherNames: val.split(',').map(s => s.trim()).filter(Boolean) }); };
    
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;
        setUploading(true);
        const url = await uploadImage(file);
        setUploading(false);
        if(url) setForm({ ...form, image: url });
    };

    const handleCategoryToggle = (catId: string) => {
        const current = form.categoryIds || [];
        if (current.includes(catId)) {
            setForm({ ...form, categoryIds: current.filter(id => id !== catId) });
        } else {
            setForm({ ...form, categoryIds: [...current, catId] });
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isNew ? 'Create Product' : 'Edit Product'}</h2>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                    <button onClick={() => onSave(form)} className="px-4 py-2 bg-[#337ab7] text-white rounded font-bold hover:bg-[#286090] flex items-center gap-2"><Save size={18} /> Save Changes</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Product Name</label>
                            <input className="w-full border p-2 rounded text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Active Ingredient</label>
                                <input className="w-full border p-2 rounded text-sm" value={form.activeIngredient} onChange={e => setForm({...form, activeIngredient: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Base Price (Display)</label>
                                <input type="number" step="0.01" className="w-full border p-2 rounded text-sm" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                        <div className="mb-4">
                             <label className="block text-xs font-bold text-slate-500 mb-1">Other Names (Comma separated)</label>
                             <input className="w-full border p-2 rounded text-sm" value={otherNamesInput} onChange={e => handleOtherNamesChange(e.target.value)} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                            <textarea className="w-full border p-2 rounded text-sm h-32" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                    </div>
                    
                    {/* Packages Editor */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-700 mb-4">Packages & Pricing</h3>
                        <p className="text-sm text-slate-500 mb-4">Define specific package sizes (e.g. 30 pills, 60 pills) and their bulk prices.</p>
                        
                        <div className="space-y-3">
                           {form.packages?.map((pkg, idx) => (
                               <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded border border-slate-200">
                                   <div className="flex flex-col flex-1">
                                       <label className="text-[9px] text-slate-400 font-bold uppercase">Dosage</label>
                                       <input placeholder="100mg" className="w-full border p-1 rounded text-sm" value={pkg.dosage} onChange={e => {
                                           const newPkgs = [...(form.packages||[])]; newPkgs[idx] = {...pkg, dosage: e.target.value}; setForm({...form, packages: newPkgs});
                                       }}/>
                                   </div>
                                   <div className="flex flex-col w-20">
                                       <label className="text-[9px] text-slate-400 font-bold uppercase">Qty</label>
                                       <input type="number" placeholder="30" className="w-full border p-1 rounded text-sm" value={pkg.quantity} onChange={e => {
                                           const newPkgs = [...(form.packages||[])]; newPkgs[idx] = {...pkg, quantity: parseInt(e.target.value)}; setForm({...form, packages: newPkgs});
                                       }}/>
                                   </div>
                                   <div className="flex flex-col w-24">
                                       <label className="text-[9px] text-slate-400 font-bold uppercase">Total $</label>
                                       <input type="number" step="0.01" placeholder="0.00" className="w-full border p-1 rounded text-sm" value={pkg.totalPrice} onChange={e => {
                                           const newPkgs = [...(form.packages||[])]; newPkgs[idx] = {...pkg, totalPrice: parseFloat(e.target.value), pricePerPill: parseFloat(e.target.value) / pkg.quantity}; setForm({...form, packages: newPkgs});
                                       }}/>
                                   </div>
                                   <div className="flex flex-col w-20">
                                       <label className="text-[9px] text-slate-400 font-bold uppercase">Savings</label>
                                       <input type="number" step="0.01" className="w-full border p-1 rounded text-sm" value={pkg.savings || 0} onChange={e => {
                                            const newPkgs = [...(form.packages||[])]; newPkgs[idx] = {...pkg, savings: parseFloat(e.target.value)}; setForm({...form, packages: newPkgs});
                                       }}/>
                                   </div>
                                   <div className="flex flex-col justify-end pb-1">
                                       <button onClick={() => {
                                           const newPkgs = [...(form.packages||[])]; newPkgs.splice(idx, 1); setForm({...form, packages: newPkgs});
                                       }} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 size={16}/></button>
                                   </div>
                               </div>
                           ))}
                           <button onClick={() => {
                               const newPkg: ProductPackage = { id: `${form.id}_pkg_${Date.now()}`, dosage: '100 MG', quantity: 30, pricePerPill: 0, totalPrice: 0 };
                               setForm({ ...form, packages: [...(form.packages||[]), newPkg] });
                           }} className="text-primary font-bold text-sm flex items-center gap-1 mt-2 hover:underline"><Plus size={16}/> Add Package</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-2">Product Image</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition relative">
                            {form.image ? (
                                <img src={form.image} className="h-40 object-contain mb-2" />
                            ) : (
                                <Image size={40} className="text-slate-300 mb-2" />
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                            <span className="text-xs text-primary font-bold">{uploading ? 'Uploading...' : 'Click to Upload'}</span>
                        </div>
                        <div className="mt-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Or Image URL</label>
                            <input className="w-full border p-2 rounded text-xs" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 mb-3">Categories</label>
                        <div className="max-h-60 overflow-y-auto space-y-2 border p-2 rounded">
                            {categories.map((cat: Category) => (
                                <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input type="checkbox" checked={form.categoryIds?.includes(cat.id)} onChange={() => handleCategoryToggle(cat.id)} className="rounded text-primary" />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.enabled !== false} onChange={e => setForm({...form, enabled: e.target.checked})} className="w-5 h-5 text-primary rounded" />
                            <span className="font-bold text-slate-700">Product Enabled</span>
                        </label>
                        <p className="text-xs text-slate-500 mt-2 pl-8">If disabled, this product will be hidden from the storefront.</p>
                        
                         <label className="flex items-center gap-3 cursor-pointer mt-4">
                            <input type="checkbox" checked={form.isPopular} onChange={e => setForm({...form, isPopular: e.target.checked})} className="w-5 h-5 text-primary rounded" />
                            <span className="font-bold text-slate-700">Mark as Popular</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 4. CATEGORY MANAGER ---
const CategoryManager = ({ categories, onToggle, onAdd, onReorder, onUpdate, onDelete }: any) => {
    const [newCat, setNewCat] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    
    const handleAdd = () => {
        if(!newCat) return;
        onAdd({
            id: `cat_${Date.now()}`,
            name: newCat,
            slug: newCat.toLowerCase().replace(/ /g, '-'),
            enabled: true,
            order: categories.length
        });
        setNewCat('');
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === categories.length - 1) return;

        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newCategories[index];
        newCategories[index] = newCategories[targetIndex];
        newCategories[targetIndex] = temp;
        const reordered = newCategories.map((cat, idx) => ({ ...cat, order: idx }));
        onReorder(reordered);
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const saveEdit = (id: string) => {
        onUpdate(id, editName);
        setEditingId(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Categories</h2>
            <div className="flex gap-2 mb-8">
                <input 
                    className="flex-1 border p-3 rounded"
                    placeholder="New Category Name"
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd} className="bg-primary text-white px-6 rounded font-bold">Add</button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                {categories.map((cat: Category, idx: number) => (
                    <div key={cat.id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col gap-1">
                                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-primary disabled:opacity-30"><ArrowUp size={14}/></button>
                                <button onClick={() => handleMove(idx, 'down')} disabled={idx === categories.length - 1} className="text-slate-400 hover:text-primary disabled:opacity-30"><ArrowDown size={14}/></button>
                            </div>
                            {editingId === cat.id ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        className="border p-1 rounded text-sm" 
                                        value={editName} 
                                        onChange={e => setEditName(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(cat.id)} className="text-green-600"><Check size={16}/></button>
                                    <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={16}/></button>
                                </div>
                            ) : (
                                <span className="font-bold text-slate-700">{cat.name}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => onToggle(cat.id)}
                                className={`text-xs font-bold px-3 py-1 rounded-full ${cat.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {cat.enabled ? 'Visible' : 'Hidden'}
                            </button>
                            <button onClick={() => startEdit(cat)} className="text-slate-400 hover:text-primary"><Edit2 size={16}/></button>
                            <button onClick={() => { if(confirm('Delete category?')) onDelete(cat.id) }} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 5. ORDER MANAGER (Restored) ---
const OrderManager = ({ orders, onUpdateStatus }: any) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [trackingInput, setTrackingInput] = useState({ carrier: 'DHL', number: '' });

    const handleExportCSV = () => {
        const headers = ["ID", "Date", "Customer", "Email", "Phone", "Total", "Status", "Carrier", "Tracking", "Items"];
        const rows = orders.map((o: Order) => [
            o.id, 
            o.orderDate, 
            o.customerName, 
            o.details?.email || '', 
            o.details?.phone || '', 
            o.grandTotal.toFixed(2), 
            o.status,
            o.carrier || '',
            o.trackingNumber || '',
            '' // Items summary could go here
        ].join(','));
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleUpdate = (id: string, newStatus: OrderStatus) => {
        if (newStatus === 'Shipped') {
            if (!trackingInput.number) {
                alert("Please enter a tracking number before marking as shipped.");
                return;
            }
            onUpdateStatus(id, newStatus, { carrier: trackingInput.carrier, trackingNumber: trackingInput.number });
            setTrackingInput({ carrier: 'DHL', number: '' }); // Reset
        } else {
            onUpdateStatus(id, newStatus);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
                <button onClick={handleExportCSV} className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order: Order) => (
                            <React.Fragment key={order.id}>
                                <tr className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                                    <td className="px-6 py-4 font-mono text-sm font-bold text-primary">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{order.customerName}</div>
                                        <div className="text-xs text-slate-500">{order.details?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{order.orderDate}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">${order.grandTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-primary">
                                            {expandedOrderId === order.id ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="flex gap-8">
                                                <div className="flex-1 space-y-4">
                                                    <h4 className="font-bold text-slate-700 border-b pb-2">Shipping Details</h4>
                                                    <div className="text-sm text-slate-600 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="block text-xs text-slate-400 uppercase">Address</span>
                                                            {order.shipAddress}, {order.shipCity}, {order.shipState} {order.shipZip}, {order.shipCountry}
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs text-slate-400 uppercase">Contact</span>
                                                            Phone: {order.details?.phone}<br/>
                                                            IP: {order.ipAddress}
                                                        </div>
                                                    </div>
                                                    
                                                    {order.trackingNumber && (
                                                        <div className="bg-white p-3 border rounded mt-2">
                                                            <div className="text-xs font-bold text-slate-400 uppercase">Tracking Info</div>
                                                            <div className="text-sm font-bold text-slate-700">{order.carrier}: <a href={order.trackingUrl} target="_blank" className="text-blue-600 underline">{order.trackingNumber}</a></div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="w-80 space-y-4">
                                                     <h4 className="font-bold text-slate-700 border-b pb-2">Update Status</h4>
                                                     <div className="space-y-3">
                                                         {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                                                             <>
                                                             <select 
                                                                 className="w-full border p-2 rounded text-sm"
                                                                 onChange={(e) => handleUpdate(order.id, e.target.value as OrderStatus)}
                                                                 value={order.status}
                                                             >
                                                                 <option value="Pending">Pending</option>
                                                                 <option value="Paid">Mark as Paid</option>
                                                                 <option value="Processing">Processing</option>
                                                                 <option value="Cancelled">Cancel Order</option>
                                                             </select>
                                                             
                                                             <div className="border-t pt-2 mt-2">
                                                                 <label className="text-xs font-bold text-slate-500">Ship Order</label>
                                                                 <div className="flex gap-2 mt-1 mb-2">
                                                                     <select className="border p-1 rounded text-sm" value={trackingInput.carrier} onChange={e => setTrackingInput({...trackingInput, carrier: e.target.value})}>
                                                                         {Object.keys(CARRIERS).map(c => <option key={c} value={c}>{c}</option>)}
                                                                     </select>
                                                                     <input 
                                                                        placeholder="Tracking Number" 
                                                                        className="border p-1 rounded text-sm flex-1"
                                                                        value={trackingInput.number}
                                                                        onChange={e => setTrackingInput({...trackingInput, number: e.target.value})}
                                                                     />
                                                                 </div>
                                                                 <button 
                                                                    onClick={() => handleUpdate(order.id, 'Shipped')}
                                                                    className="w-full bg-purple-600 text-white py-2 rounded text-sm font-bold hover:bg-purple-700"
                                                                 >
                                                                    Mark Shipped
                                                                 </button>
                                                             </div>
                                                             </>
                                                         )}
                                                         
                                                         {order.status === 'Shipped' && (
                                                             <button 
                                                                onClick={() => handleUpdate(order.id, 'Delivered')}
                                                                className="w-full bg-green-600 text-white py-2 rounded text-sm font-bold hover:bg-green-700"
                                                             >
                                                                Mark Delivered
                                                             </button>
                                                         )}
                                                     </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                 {orders.length === 0 && <div className="p-8 text-center text-slate-500">No orders found.</div>}
            </div>
        </div>
    );
};

// --- 6. SETTINGS MANAGER (Restored) ---
const SettingsManager = ({ paymentMethods, deliveryOptions, onAddPayment, onRemovePayment, onTogglePayment, onAddDelivery, onRemoveDelivery, onToggleDelivery }: any) => {
    const [newPayName, setNewPayName] = useState('');
    const [newPayIcon, setNewPayIcon] = useState('');
    
    const [newDelName, setNewDelName] = useState('');
    const [newDelPrice, setNewDelPrice] = useState('');
    const [newDelMin, setNewDelMin] = useState('');
    const [newDelMax, setNewDelMax] = useState('');

    const handleAddPayment = () => {
        if (!newPayName) return;
        onAddPayment({ id: `pm_${Date.now()}`, name: newPayName, iconUrl: newPayIcon || 'https://via.placeholder.com/50', enabled: true });
        setNewPayName(''); setNewPayIcon('');
    };

    const handleAddDelivery = () => {
        if (!newDelName || !newDelPrice) return;
        onAddDelivery({
            id: `del_${Date.now()}`,
            name: newDelName,
            price: parseFloat(newDelPrice),
            minDays: parseInt(newDelMin) || 5,
            maxDays: parseInt(newDelMax) || 10,
            icon: 'normal',
            enabled: true
        });
        setNewDelName(''); setNewDelPrice(''); setNewDelMin(''); setNewDelMax('');
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10">
            {/* Payment Methods */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Payment Methods</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-4">
                    <div className="flex gap-2 mb-6 items-end">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500">Method Name</label>
                            <input className="w-full border p-2 rounded" value={newPayName} onChange={e => setNewPayName(e.target.value)} placeholder="e.g. Bitcoin" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-500">Icon URL</label>
                            <input className="w-full border p-2 rounded" value={newPayIcon} onChange={e => setNewPayIcon(e.target.value)} placeholder="https://..." />
                        </div>
                        <button onClick={handleAddPayment} className="bg-primary text-white px-4 py-2 rounded font-bold mb-0.5">Add</button>
                    </div>

                    <div className="space-y-2">
                        {paymentMethods.map((pm: PaymentMethod) => (
                            <div key={pm.id} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <img src={pm.iconUrl} className="h-6 w-10 object-contain bg-white border rounded" />
                                    <span className="font-bold text-slate-700">{pm.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onTogglePayment(pm.id)} className={`text-xs font-bold px-2 py-1 rounded ${pm.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {pm.enabled ? 'Enabled' : 'Disabled'}
                                    </button>
                                    <button onClick={() => onRemovePayment(pm.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delivery Options */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Delivery Options</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="flex gap-2 mb-6 items-end flex-wrap">
                        <div className="w-40">
                            <label className="text-xs font-bold text-slate-500">Name</label>
                            <input className="w-full border p-2 rounded" value={newDelName} onChange={e => setNewDelName(e.target.value)} placeholder="e.g. Fedex" />
                        </div>
                        <div className="w-24">
                            <label className="text-xs font-bold text-slate-500">Price</label>
                            <input className="w-full border p-2 rounded" type="number" value={newDelPrice} onChange={e => setNewDelPrice(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="w-20">
                            <label className="text-xs font-bold text-slate-500">Min Days</label>
                            <input className="w-full border p-2 rounded" type="number" value={newDelMin} onChange={e => setNewDelMin(e.target.value)} placeholder="3" />
                        </div>
                        <div className="w-20">
                            <label className="text-xs font-bold text-slate-500">Max Days</label>
                            <input className="w-full border p-2 rounded" type="number" value={newDelMax} onChange={e => setNewDelMax(e.target.value)} placeholder="7" />
                        </div>
                        <button onClick={handleAddDelivery} className="bg-primary text-white px-4 py-2 rounded font-bold mb-0.5">Add</button>
                    </div>

                    <div className="space-y-2">
                        {deliveryOptions.map((opt: DeliveryOption) => (
                            <div key={opt.id} className="flex items-center justify-between p-3 border rounded bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <Truck size={18} className="text-slate-400" />
                                    <div>
                                        <div className="font-bold text-slate-700">{opt.name} - ${opt.price}</div>
                                        <div className="text-xs text-slate-500">{opt.minDays}-{opt.maxDays} Days</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onToggleDelivery(opt.id)} className={`text-xs font-bold px-2 py-1 rounded ${opt.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {opt.enabled ? 'Active' : 'Hidden'}
                                    </button>
                                    <button onClick={() => onRemoveDelivery(opt.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 7. PROFILE MANAGER (Restored) ---
const ProfileManager = ({ profile, onSave }: any) => {
    const [formData, setFormData] = useState<AdminProfile>(profile);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: val });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Store Configuration & Profile</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Contact Info */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                     <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2"><Phone size={20}/> Public Contact Info</h3>
                     <div className="space-y-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500">US Phone Number</label>
                             <input className="w-full border p-2 rounded" name="usPhoneNumber" value={formData.usPhoneNumber} onChange={handleChange} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500">UK Phone Number</label>
                             <input className="w-full border p-2 rounded" name="ukPhoneNumber" value={formData.ukPhoneNumber} onChange={handleChange} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500">Admin Email (For Notifications)</label>
                             <input className="w-full border p-2 rounded" name="email" value={formData.email} onChange={handleChange} />
                         </div>
                     </div>
                 </div>

                 {/* Integrations */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                     <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2"><MessageCircle size={20}/> Chat Integrations</h3>
                     <div className="space-y-4">
                         <div>
                             <label className="block text-xs font-bold text-slate-500">WhatsApp Number (e.g. 15551234567)</label>
                             <input className="w-full border p-2 rounded" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500">Telegram Username (e.g. MyStoreBot)</label>
                             <input className="w-full border p-2 rounded" name="telegramUsername" value={formData.telegramUsername} onChange={handleChange} />
                         </div>
                         <div className="flex items-center gap-2 mt-4">
                             <input type="checkbox" name="showFloatingChat" checked={formData.showFloatingChat} onChange={handleChange} className="w-4 h-4" />
                             <label className="text-sm font-bold text-slate-700">Show Floating Chat Widget</label>
                         </div>
                     </div>
                 </div>

                 {/* Notifications */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 md:col-span-2">
                     <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2"><Bell size={20}/> Admin Notifications</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="block text-xs font-bold text-slate-500">Telegram Bot Token</label>
                             <input className="w-full border p-2 rounded font-mono text-sm" name="telegramBotToken" value={formData.telegramBotToken} onChange={handleChange} />
                         </div>
                         <div>
                             <label className="block text-xs font-bold text-slate-500">Telegram Chat ID</label>
                             <input className="w-full border p-2 rounded font-mono text-sm" name="telegramChatId" value={formData.telegramChatId} onChange={handleChange} />
                         </div>
                     </div>
                     <div className="flex gap-6 mt-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" name="receiveEmailNotifications" checked={formData.receiveEmailNotifications} onChange={handleChange} />
                             <span className="text-sm text-slate-600">Email Alerts</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" name="receiveTelegramNotifications" checked={formData.receiveTelegramNotifications} onChange={handleChange} />
                             <span className="text-sm text-slate-600">Telegram Alerts</span>
                         </label>
                     </div>
                 </div>
                 
                  {/* Branding */}
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 md:col-span-2">
                     <h3 className="font-bold text-lg mb-4 text-slate-700 flex items-center gap-2"><Image size={20}/> Branding</h3>
                     <div>
                         <label className="block text-xs font-bold text-slate-500">Custom Logo URL</label>
                         <input className="w-full border p-2 rounded" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} placeholder="https://..." />
                         {formData.logoUrl && <img src={formData.logoUrl} className="h-10 mt-2 border p-1 rounded" />}
                     </div>
                 </div>
             </div>

             <div className="mt-8 flex justify-end">
                 <button onClick={() => onSave(formData)} className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition">
                     <Save size={20} /> Save Configuration
                 </button>
             </div>
        </div>
    );
};

// --- 8. NOTIFICATION LOGS (Restored) ---
const NotificationLogView = ({ logs }: any) => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Notification Logs</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Channel</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Recipient</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log: NotificationLog) => (
                            <tr key={log.id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-xs text-slate-500">{log.timestamp}</td>
                                <td className="px-6 py-3 font-bold text-slate-700">{log.channel}</td>
                                <td className="px-6 py-3 text-sm">{log.type}</td>
                                <td className="px-6 py-3 text-sm font-mono">{log.recipient}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${log.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-xs text-slate-400 truncate max-w-xs">{log.details}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-500">No logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- 9. SYSTEM HEALTH (Restored) ---
const SystemHealthCheck = () => {
    return (
        <div className="p-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600"><CheckCircle size={24} /></div>
                    <div>
                        <h4 className="font-bold text-slate-700">Database</h4>
                        <p className="text-sm text-green-600 font-medium">Connected (Supabase)</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Activity size={24} /></div>
                     <div>
                        <h4 className="font-bold text-slate-700">API Latency</h4>
                        <p className="text-sm text-slate-500 font-medium">24ms (Good)</p>
                     </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="p-3 bg-purple-100 rounded-full text-purple-600"><UploadCloud size={24} /></div>
                     <div>
                        <h4 className="font-bold text-slate-700">Storage</h4>
                        <p className="text-sm text-slate-500 font-medium">product-images bucket active</p>
                     </div>
                </div>
            </div>

            <div className="mt-8 bg-slate-800 text-white p-6 rounded-lg font-mono text-sm">
                <h3 className="text-slate-400 uppercase font-bold mb-4">Environment Config</h3>
                <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>VITE_SUPABASE_URL</span>
                        <span className="text-green-400">Configured</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>VITE_SUPABASE_ANON_KEY</span>
                        <span className="text-green-400">Configured</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span>APP_VERSION</span>
                        <span className="text-blue-400">v1.0.2</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
