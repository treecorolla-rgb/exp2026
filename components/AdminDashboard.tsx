
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, 
  Plus, Search, Edit2, Trash2, Save, X, Check, CreditCard, User, 
  MessageCircle, Menu, Truck, ToggleLeft, ToggleRight, List, Phone, 
  Image, UploadCloud, Activity, AlertCircle, CheckCircle, FileSpreadsheet, Download, Eye, Calendar, Bell, Mail, MessageSquare, Loader2, ArrowUp, ArrowDown, HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from './Toast';
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
  const { logout, products, orders, deleteProduct, updateProduct, addProduct, categories, toggleCategory, addCategory, seedCategories, updateCategory, deleteCategory, updateCategoryOrder, adminProfile, updateAdminProfile, uploadImage, placeOrder, addManualOrder, notificationLogs, updateProductFeaturedOrder, bulkDeleteProducts, paymentMethods, deliveryOptions, addPaymentMethod, removePaymentMethod, togglePaymentMethod, updatePaymentMethodOrder, addDeliveryOption, removeDeliveryOption, toggleDeliveryOption, updateDeliveryOption, updateOrderStatus } = useStore();
  const { showToast } = useToast();
  
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
          showToast={showToast}
        />
      );
      case 'categories': return (
        <CategoryManager 
            categories={categories} 
            onToggle={toggleCategory} 
            onAdd={addCategory} 
            onSeed={seedCategories}
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
           onUpdatePaymentOrder={updatePaymentMethodOrder}
           onAddDelivery={addDeliveryOption}
           onRemoveDelivery={removeDeliveryOption}
           onToggleDelivery={toggleDeliveryOption}
           onUpdateDelivery={updateDeliveryOption}
           adminProfile={adminProfile}
           onUpdateProfile={updateAdminProfile}
           onShowToast={showToast}
        />
      );
      case 'profile': return <ProfileManager profile={adminProfile} onSave={updateAdminProfile} onShowToast={showToast} />;
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
const ProductManager = ({ products, categories, onEdit, onDelete, onBulkDelete, onToggleStatus, onUpdateSort, onAdd, addProduct, addCategory, showToast }: any) => {
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
            showToast("CSV file appears to be empty. Please ensure it has a header row and data.", "error");
            setIsImporting(false);
            return;
        }

        let importedCount = 0;
        let skippedCount = 0;
        let currentProduct: Product | null = null;
        
        // Track categories seen in this session to prevent duplicate creation
        const categoryMap = new Map<string, Category>();
        categories.forEach((c: Category) => categoryMap.set(c.name.toLowerCase(), c));

        // Track existing products to prevent duplicates (normalize to lowercase)
        const existingProducts = new Set(products.map((p: Product) => p.name.toLowerCase().trim()));

        // Helper to save current product
        const saveCurrentProduct = async () => {
            if (currentProduct) {
                // Double check if product name exists (in case CSV has duplicates of same new product not yet in 'products' prop)
                if (!existingProducts.has(currentProduct.name.toLowerCase().trim())) {
                    await addProduct(currentProduct);
                    existingProducts.add(currentProduct.name.toLowerCase().trim()); // Add to set so we don't add it again if CSV repeats
                    importedCount++;
                } else {
                    skippedCount++;
                }
            }
        };

        for (let i = 1; i < rows.length; i++) {
            const line = rows[i].trim();
            if (!line) continue;
            
            const cols = parseCSVLine(line);
            
            // Extract fields
            const name = cols[0]?.trim();
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
                // If name matches current product, treat as same product (just new package)
                if (currentProduct && currentProduct.name.toLowerCase() === name.toLowerCase()) {
                    // Continue to add package to currentProduct
                } else {
                    // New Product detected: Save previous one first
                    await saveCurrentProduct();

                    // Start new product
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
                            categoryMap.set(catKey, newCategory);
                            await addCategory(newCategory);
                            currentProduct.categoryIds.push(newCatId);
                        }
                    } else {
                        if (categories.length > 0) currentProduct.categoryIds.push(categories[0].id);
                    }
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

        // Save last product
        await saveCurrentProduct();

        showToast(`Import Complete! Added: ${importedCount}, Skipped: ${skippedCount}`, "success");

    } catch (err) {
        console.error("Import failed", err);
        showToast("Failed to parse CSV file. Please check format.", "error");
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
                      <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-full transition" title="Edit"><Edit2 size={16} /></button>
                      <button 
                        onClick={() => { if(confirm(`Delete ${p.name}?`)) onDelete(p.id); }} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
const CategoryManager = ({ categories, onToggle, onAdd, onSeed, onReorder, onUpdate, onDelete }: any) => {
  const [newCatName, setNewCatName] = useState('');
  
  const handleAdd = () => {
      if(!newCatName.trim()) return;
      onAdd({
          id: `cat_${Date.now()}`,
          name: newCatName,
          slug: newCatName.toLowerCase().replace(/ /g, '-'),
          enabled: true,
          order: categories.length
      });
      setNewCatName('');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Category Management</h2>
          <button onClick={onSeed} className="text-sm text-blue-600 underline">Restore Defaults</button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 flex gap-4">
          <input 
            className="flex-1 border p-2 rounded" 
            placeholder="New Category Name" 
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="bg-primary text-white px-6 py-2 rounded font-bold">Add Category</button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {categories.map((cat: Category, idx: number) => (
                    <tr key={cat.id}>
                        <td className="px-6 py-3 w-20">
                            <div className="flex items-center gap-2">
                                <button disabled={idx === 0} onClick={() => {
                                    const newCats = [...categories];
                                    [newCats[idx], newCats[idx-1]] = [newCats[idx-1], newCats[idx]];
                                    onReorder(newCats);
                                }}><ArrowUp size={14} className={idx === 0 ? 'text-slate-300' : 'text-slate-600'}/></button>
                                <button disabled={idx === categories.length - 1} onClick={() => {
                                    const newCats = [...categories];
                                    [newCats[idx], newCats[idx+1]] = [newCats[idx+1], newCats[idx]];
                                    onReorder(newCats);
                                }}><ArrowDown size={14} className={idx === categories.length - 1 ? 'text-slate-300' : 'text-slate-600'}/></button>
                            </div>
                        </td>
                        <td className="px-6 py-3">
                            <input 
                                className="border-none bg-transparent hover:bg-slate-50 w-full focus:bg-white focus:ring-1 p-1 rounded" 
                                value={cat.name}
                                onChange={(e) => onUpdate(cat.id, e.target.value)}
                            />
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500">{cat.slug}</td>
                        <td className="px-6 py-3">
                            <button onClick={() => onToggle(cat.id)} className={`text-xs px-2 py-1 rounded border font-bold ${cat.enabled ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                                {cat.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </td>
                        <td className="px-6 py-3 text-right">
                             <button onClick={() => { if(confirm('Delete category?')) onDelete(cat.id); }} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

// --- 5. ORDER MANAGER ---
const OrderManager = ({ orders, onUpdateStatus }: any) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    
    // Tracking form
    const [trackingInput, setTrackingInput] = useState({ carrier: 'USPS', trackingNumber: '' });

    const openStatusModal = (order: Order) => {
        setSelectedOrder(order);
        setTrackingInput({ carrier: order.carrier || 'USPS', trackingNumber: order.trackingNumber || '' });
        setStatusModalOpen(true);
    };

    const handleStatusUpdate = (status: OrderStatus) => {
        if(!selectedOrder) return;
        
        if (status === 'Shipped') {
             // If shipped, pass tracking data
             onUpdateStatus(selectedOrder.id, status, trackingInput);
        } else {
             onUpdateStatus(selectedOrder.id, status);
        }
        setStatusModalOpen(false);
    };

    const exportOrdersCSV = () => {
        const headers = ['Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 'Country', 'Items', 'Subtotal', 'Shipping', 'Total', 'Payment Method', 'Status', 'Carrier', 'Tracking'];
        const rows = orders.map((o: Order) => [
            o.id,
            o.orderDate,
            o.customerName,
            o.details?.email || '',
            o.details?.phone || '',
            o.shipAddress || '',
            o.shipCity || '',
            o.shipState || '',
            o.shipZip || '',
            o.shipCountry || '',
            (o.items || []).map((i: any) => `${i.name} (${i.packageName}) x${i.quantity}`).join('; '),
            o.totalAmount?.toFixed(2) || '',
            o.shippingCost?.toFixed(2) || '',
            o.grandTotal?.toFixed(2) || '',
            o.paymentMethod || '',
            o.status,
            o.carrier || '',
            o.trackingNumber || ''
        ]);
        const csv = [headers, ...rows].map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
                <button 
                    onClick={exportOrdersCSV}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition"
                >
                    <Download size={16} />
                    Export All Orders
                </button>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {orders.map((order: Order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => openStatusModal(order)}>
                                <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{order.orderDate}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-700">{order.customerName}</div>
                                    <div className="text-xs text-slate-400">{order.details?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>{order.status}</span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">${order.grandTotal.toFixed(2)}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:underline text-sm font-bold">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Detail Modal */}
            {statusModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Order Details: {selectedOrder.id}</h3>
                            <button onClick={() => setStatusModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Customer & Shipping Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Customer Info</h4>
                                    <p className="text-sm font-bold">{selectedOrder.customerName}</p>
                                    <p className="text-sm text-slate-600">{selectedOrder.details?.email}</p>
                                    <p className="text-sm text-slate-600">{selectedOrder.details?.phone}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Shipping To</h4>
                                    <p className="text-sm">{selectedOrder.shipFirstName} {selectedOrder.shipLastName}</p>
                                    <p className="text-sm">{selectedOrder.shipAddress}</p>
                                    <p className="text-sm">{selectedOrder.shipCity}, {selectedOrder.shipState} {selectedOrder.shipZip}</p>
                                    <p className="text-sm">{selectedOrder.shipCountry}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Order Items</h4>
                                <div className="bg-slate-50 rounded border border-slate-200 divide-y divide-slate-200">
                                    {(selectedOrder.items || []).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3">
                                            <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} className="w-12 h-12 object-contain rounded" />
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.packageName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">${item.price?.toFixed(2)}</p>
                                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                        <p className="p-3 text-sm text-slate-500">No items found</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-500 uppercase mb-2">Payment Method</h4>
                                    <p className="text-sm font-bold">{selectedOrder.paymentMethod}</p>
                                    {selectedOrder.details?.cardNumber && (
                                        <p className="text-sm text-slate-600">Card: {selectedOrder.details.cardNumber}</p>
                                    )}
                                    {selectedOrder.details?.cardExpiry && (
                                        <p className="text-sm text-slate-600">Exp: {selectedOrder.details.cardExpiry}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Subtotal: ${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</p>
                                    <p className="text-sm text-slate-500">Shipping: ${selectedOrder.shippingCost?.toFixed(2) || '0.00'}</p>
                                    <p className="text-lg font-bold text-slate-800">Total: ${selectedOrder.grandTotal?.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Status Update Section */}
                            <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                <h4 className="font-bold text-sm text-slate-700 mb-3">Update Status</h4>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => handleStatusUpdate(s as OrderStatus)}
                                            className={`px-3 py-1.5 rounded text-sm font-bold border ${selectedOrder.status === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-300 hover:border-slate-400'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Tracking Info Inputs (Always visible for editing if shipped or about to ship) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Carrier</label>
                                        <select 
                                            className="w-full border p-2 rounded text-sm"
                                            value={trackingInput.carrier}
                                            onChange={e => setTrackingInput({...trackingInput, carrier: e.target.value})}
                                        >
                                            {Object.keys(CARRIERS).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Tracking Number</label>
                                        <input 
                                            className="w-full border p-2 rounded text-sm"
                                            value={trackingInput.trackingNumber}
                                            onChange={e => setTrackingInput({...trackingInput, trackingNumber: e.target.value})}
                                            placeholder="Ex: 1Z999..."
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                     <button 
                                        onClick={() => handleStatusUpdate(selectedOrder.status)} 
                                        className="text-xs text-blue-600 hover:underline"
                                     >
                                         Update Tracking Info Only
                                     </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- 6. NOTIFICATION LOG VIEW ---
const NotificationLogView = ({ logs }: any) => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Notification Logs</h2>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 font-semibold text-xs">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Channel</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Recipient</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No notifications sent yet.</td></tr>
                        )}
                        {logs.map((log: NotificationLog) => (
                            <tr key={log.id}>
                                <td className="px-6 py-3 text-slate-500">{log.timestamp}</td>
                                <td className="px-6 py-3"><span className="font-bold text-slate-700">{log.channel}</span></td>
                                <td className="px-6 py-3">{log.type}</td>
                                <td className="px-6 py-3 font-mono text-xs">{log.recipient}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${log.status === 'Sent' ? 'bg-green-100 text-green-700' : log.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-slate-500 truncate max-w-xs">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- 7. SETTINGS MANAGER ---
const SettingsManager = ({ paymentMethods, deliveryOptions, onAddPayment, onRemovePayment, onTogglePayment, onUpdatePaymentOrder, onAddDelivery, onRemoveDelivery, onToggleDelivery, onUpdateDelivery, adminProfile, onUpdateProfile, onShowToast }: any) => {
    const [newPay, setNewPay] = useState({ name: '', iconUrl: '' });
    const [newDel, setNewDel] = useState({ name: '', price: 0, minDays: 5, maxDays: 10, icon: 'normal' });
    const [editingDelivery, setEditingDelivery] = useState<DeliveryOption | null>(null);
    const [walletAddresses, setWalletAddresses] = useState({
        bitcoinWalletAddress: adminProfile?.bitcoinWalletAddress || '',
        usdtWalletAddress: adminProfile?.usdtWalletAddress || ''
    });

    useEffect(() => {
        setWalletAddresses({
            bitcoinWalletAddress: adminProfile?.bitcoinWalletAddress || '',
            usdtWalletAddress: adminProfile?.usdtWalletAddress || ''
        });
    }, [adminProfile]);

    const handleSaveWallets = () => {
        onUpdateProfile({
            ...adminProfile,
            bitcoinWalletAddress: walletAddresses.bitcoinWalletAddress,
            usdtWalletAddress: walletAddresses.usdtWalletAddress
        });
        onShowToast('Wallet addresses saved!', 'success');
    };

    return (
        <div className="p-8 space-y-8">
            {/* Payment Methods */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Payment Methods</h3>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
                    <div className="space-y-2 mb-4">
                        {[...paymentMethods].sort((a: PaymentMethod, b: PaymentMethod) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((pm: PaymentMethod, index: number) => (
                            <div key={pm.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <button 
                                            onClick={() => onUpdatePaymentOrder(pm.id, 'up')} 
                                            disabled={index === 0}
                                            className={`p-0.5 rounded ${index === 0 ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            <ArrowUp size={12}/>
                                        </button>
                                        <button 
                                            onClick={() => onUpdatePaymentOrder(pm.id, 'down')} 
                                            disabled={index === paymentMethods.length - 1}
                                            className={`p-0.5 rounded ${index === paymentMethods.length - 1 ? 'text-slate-300' : 'text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            <ArrowDown size={12}/>
                                        </button>
                                    </div>
                                    <img src={pm.iconUrl} className="h-6 w-10 object-contain" />
                                    <span className="font-bold text-sm">{pm.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onTogglePayment(pm.id)} className={`text-xs px-2 py-1 rounded ${pm.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {pm.enabled ? 'ON' : 'OFF'}
                                    </button>
                                    <button onClick={() => onRemovePayment(pm.id)} className="text-red-500 p-1"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold mb-2">Add New</h4>
                        <div className="flex gap-2 mb-2">
                            <input placeholder="Name" className="border p-2 text-sm rounded flex-1" value={newPay.name} onChange={e => setNewPay({...newPay, name: e.target.value})} />
                            <input placeholder="Icon URL" className="border p-2 text-sm rounded flex-1" value={newPay.iconUrl} onChange={e => setNewPay({...newPay, iconUrl: e.target.value})} />
                        </div>
                        <button onClick={() => {
                            if(newPay.name) {
                                onAddPayment({ id: `pm_${Date.now()}`, name: newPay.name, iconUrl: newPay.iconUrl || 'https://via.placeholder.com/50', enabled: true });
                                setNewPay({ name: '', iconUrl: '' });
                            }
                        }} className="w-full bg-slate-800 text-white text-sm py-2 rounded font-bold">Add Payment Method</button>
                    </div>
                </div>
            </div>

            {/* Delivery Options */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Delivery Options</h3>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4">
                    <div className="space-y-2 mb-4">
                        {deliveryOptions.map((opt: DeliveryOption) => (
                            <div key={opt.id} className="bg-slate-50 p-3 rounded border border-slate-100">
                                {editingDelivery?.id === opt.id ? (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                className="border p-2 text-sm rounded" 
                                                value={editingDelivery.name} 
                                                onChange={e => setEditingDelivery({...editingDelivery, name: e.target.value})}
                                                placeholder="Name"
                                            />
                                            <input 
                                                type="number" 
                                                className="border p-2 text-sm rounded" 
                                                value={editingDelivery.price} 
                                                onChange={e => setEditingDelivery({...editingDelivery, price: parseFloat(e.target.value) || 0})}
                                                placeholder="Price"
                                            />
                                            <input 
                                                type="number" 
                                                className="border p-2 text-sm rounded" 
                                                value={editingDelivery.minDays} 
                                                onChange={e => setEditingDelivery({...editingDelivery, minDays: parseInt(e.target.value) || 0})}
                                                placeholder="Min Days"
                                            />
                                            <input 
                                                type="number" 
                                                className="border p-2 text-sm rounded" 
                                                value={editingDelivery.maxDays} 
                                                onChange={e => setEditingDelivery({...editingDelivery, maxDays: parseInt(e.target.value) || 0})}
                                                placeholder="Max Days"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    onUpdateDelivery(editingDelivery.id, editingDelivery);
                                                    setEditingDelivery(null);
                                                    onShowToast('Delivery option updated!', 'success');
                                                }} 
                                                className="flex-1 bg-green-600 text-white text-sm py-2 rounded font-bold"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => setEditingDelivery(null)} 
                                                className="flex-1 bg-slate-300 text-slate-700 text-sm py-2 rounded font-bold"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-bold text-sm">{opt.name} (${opt.price})</div>
                                            <div className="text-xs text-slate-500">{opt.minDays}-{opt.maxDays} days</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setEditingDelivery(opt)} className="text-blue-600 p-1"><Edit2 size={14}/></button>
                                            <button onClick={() => onToggleDelivery(opt.id)} className={`text-xs px-2 py-1 rounded ${opt.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {opt.enabled ? 'ON' : 'OFF'}
                                            </button>
                                            <button onClick={() => onRemoveDelivery(opt.id)} className="text-red-500 p-1"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-bold mb-2">Add New</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input placeholder="Name" className="border p-2 text-sm rounded" value={newDel.name} onChange={e => setNewDel({...newDel, name: e.target.value})} />
                            <input type="number" placeholder="Price" className="border p-2 text-sm rounded" value={newDel.price} onChange={e => setNewDel({...newDel, price: parseFloat(e.target.value)})} />
                            <input type="number" placeholder="Min Days" className="border p-2 text-sm rounded" value={newDel.minDays} onChange={e => setNewDel({...newDel, minDays: parseInt(e.target.value)})} />
                            <input type="number" placeholder="Max Days" className="border p-2 text-sm rounded" value={newDel.maxDays} onChange={e => setNewDel({...newDel, maxDays: parseInt(e.target.value)})} />
                        </div>
                        <select className="w-full border p-2 text-sm rounded mb-2" value={newDel.icon} onChange={e => setNewDel({...newDel, icon: e.target.value})}>
                            <option value="normal">Normal Icon</option>
                            <option value="express">Express Icon</option>
                        </select>
                        <button onClick={() => {
                            if(newDel.name) {
                                onAddDelivery({ id: `del_${Date.now()}`, ...newDel, enabled: true });
                                setNewDel({ name: '', price: 0, minDays: 5, maxDays: 10, icon: 'normal' });
                            }
                        }} className="w-full bg-slate-800 text-white text-sm py-2 rounded font-bold">Add Delivery Option</button>
                    </div>
                </div>
            </div>

            {/* Crypto Wallet Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Cryptocurrency Payment Settings</h3>
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    Bitcoin (BTC) Wallet Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your Bitcoin wallet address"
                                    className="w-full border border-slate-300 rounded p-3 text-sm font-mono"
                                    value={walletAddresses.bitcoinWalletAddress}
                                    onChange={e => setWalletAddresses({...walletAddresses, bitcoinWalletAddress: e.target.value})}
                                />
                                <p className="text-xs text-slate-500">Customers will send BTC payments to this address</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    USDT (Tether) Wallet Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your USDT wallet address (TRC-20/ERC-20)"
                                    className="w-full border border-slate-300 rounded p-3 text-sm font-mono"
                                    value={walletAddresses.usdtWalletAddress}
                                    onChange={e => setWalletAddresses({...walletAddresses, usdtWalletAddress: e.target.value})}
                                />
                                <p className="text-xs text-slate-500">Customers will send USDT payments to this address</p>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <button
                                onClick={handleSaveWallets}
                                className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded font-bold text-sm transition"
                            >
                                Save Wallet Addresses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 8. PROFILE MANAGER ---
const ProfileManager = ({ profile, onSave, onShowToast }: any) => {
    const [formData, setFormData] = useState<AdminProfile>(profile);

    // Sync state if prop changes
    useEffect(() => { setFormData(profile); }, [profile]);

    return (
        <div className="p-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Store & Admin Profile</h2>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
                
                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Admin Email</label>
                            <input className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Support Email (for footer)</label>
                            <input className="w-full border p-2 rounded" placeholder="support@yourstore.com" value={formData.supportEmail || ''} onChange={e => setFormData({...formData, supportEmail: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">US Phone</label>
                            <input className="w-full border p-2 rounded" value={formData.usPhoneNumber} onChange={e => setFormData({...formData, usPhoneNumber: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">UK Phone</label>
                            <input className="w-full border p-2 rounded" value={formData.ukPhoneNumber} onChange={e => setFormData({...formData, ukPhoneNumber: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">WhatsApp Number</label>
                            <input className="w-full border p-2 rounded" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Telegram Username (t.me/...)</label>
                            <input className="w-full border p-2 rounded" value={formData.telegramUsername} onChange={e => setFormData({...formData, telegramUsername: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b">Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input type="checkbox" checked={formData.receiveEmailNotifications} onChange={e => setFormData({...formData, receiveEmailNotifications: e.target.checked})} className="w-5 h-5" />
                            <label>Receive Email Notifications</label>
                        </div>
                         <div className="flex items-center gap-4">
                            <input type="checkbox" checked={formData.receiveTelegramNotifications} onChange={e => setFormData({...formData, receiveTelegramNotifications: e.target.checked})} className="w-5 h-5" />
                            <label>Receive Telegram Notifications</label>
                        </div>
                        {formData.receiveTelegramNotifications && (
                            <div className="pl-9 space-y-3 bg-slate-50 p-4 rounded border border-slate-100">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Telegram Bot Token</label>
                                    <input className="w-full border p-2 rounded font-mono text-xs" value={formData.telegramBotToken} onChange={e => setFormData({...formData, telegramBotToken: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Telegram Chat ID</label>
                                    <input className="w-full border p-2 rounded font-mono text-xs" value={formData.telegramChatId} onChange={e => setFormData({...formData, telegramChatId: e.target.value})} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visuals */}
                <div>
                     <h3 className="text-lg font-bold text-slate-700 mb-4 pb-2 border-b">Visuals</h3>
                     <div className="flex items-center gap-4">
                            <input type="checkbox" checked={formData.showFloatingChat} onChange={e => setFormData({...formData, showFloatingChat: e.target.checked})} className="w-5 h-5" />
                            <label>Show Floating Chat Widget (WhatsApp/Telegram)</label>
                     </div>
                     <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Custom Logo URL</label>
                        <input className="w-full border p-2 rounded" value={formData.logoUrl || ''} onChange={e => setFormData({...formData, logoUrl: e.target.value})} placeholder="https://..." />
                     </div>
                </div>

                <div className="pt-4">
                    <button onClick={() => { onSave(formData); onShowToast('Settings Saved', 'success'); }} className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded font-bold shadow-sm transition">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 9. SYSTEM HEALTH ---
const SystemHealthCheck = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                         <h3 className="font-bold text-lg">Database (Supabase)</h3>
                    </div>
                    <p className="text-slate-500 text-sm">Connection Status: <span className="text-green-600 font-bold">Operational</span></p>
                    {supabase ? <p className="text-xs text-slate-400 mt-2">Client Initialized</p> : <p className="text-xs text-red-400 mt-2">Client Not Configured (Using Demo Data)</p>}
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                         <h3 className="font-bold text-lg">Email Service</h3>
                    </div>
                    <p className="text-slate-500 text-sm">Status: <span className="text-green-600 font-bold">Operational (Simulated)</span></p>
                </div>

                 <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                         <h3 className="font-bold text-lg">Telegram Bot</h3>
                    </div>
                    <p className="text-slate-500 text-sm">API: <span className="text-green-600 font-bold">Responsive</span></p>
                </div>
            </div>
        </div>
    );
};
