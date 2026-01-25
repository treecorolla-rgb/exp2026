import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, 
  Plus, Search, Edit2, Trash2, Save, X, Check, CreditCard, User, MessageCircle, Menu, Truck, ToggleLeft, ToggleRight, List, Phone, Image, UploadCloud, Activity, AlertCircle, CheckCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductPackage, DeliveryOption } from '../types';
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
  const { logout, products, orders, deleteProduct, updateProduct, addProduct, categories, toggleCategory, addCategory, adminProfile, updateAdminProfile, uploadImage } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'settings' | 'profile' | 'system'>('overview');
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
          onToggleStatus={(p: Product) => updateProduct({ ...p, enabled: p.enabled === false ? true : false })}
          onAdd={() => {
            const newP: Product = {
              id: `p_${Date.now()}`,
              name: '',
              activeIngredient: '',
              price: 0,
              image: 'https://picsum.photos/200/200',
              categoryIds: [], // Start with empty categories
              packages: [],
              deliveryOptions: [],
              enabled: true
            };
            setEditingProduct(newP);
            setIsNewProduct(true);
          }}
        />
      );
      case 'categories': return <CategoryManager categories={categories} onToggle={toggleCategory} onAdd={addCategory} />;
      case 'orders': return <OrderManager orders={orders} />;
      case 'settings': return <SettingsManager />;
      case 'profile': return <ProfileManager profile={adminProfile} onSave={updateAdminProfile} />;
      case 'system': return <SystemHealthCheck />;
      default: return <div>Select a tab</div>;
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

const SystemHealthCheck = () => {
  const [status, setStatus] = useState<{db: 'pending'|'success'|'error', storage: 'pending'|'success'|'error', message: string}>({
    db: 'pending',
    storage: 'pending',
    message: 'Ready to run diagnostics...'
  });

  const runDiagnostics = async () => {
    setStatus({ db: 'pending', storage: 'pending', message: 'Running...' });
    
    // 1. Check DB
    try {
      if(!supabase) throw new Error("Supabase client not initialized (Check env vars)");
      
      const { data, error } = await supabase.from('store_settings').select('*').limit(1);
      if (error) throw error;
      
      setStatus(prev => ({ ...prev, db: 'success' }));
    } catch (e: any) {
      setStatus(prev => ({ ...prev, db: 'error', message: `DB Error: ${e.message}` }));
      return;
    }

    // 2. Check Storage
    try {
      if(!supabase) throw new Error("Supabase client not initialized");
      
      const blob = new Blob(['Health Check'], { type: 'text/plain' });
      const fileName = `health_check_${Date.now()}.txt`;
      
      const { error } = await supabase.storage.from('product-images').upload(fileName, blob);
      if (error) throw error;

      // Clean up (optional, failure here doesn't mean storage is broken)
      await supabase.storage.from('product-images').remove([fileName]);

      setStatus(prev => ({ ...prev, storage: 'success', message: 'All systems operational!' }));
    } catch (e: any) {
      setStatus(prev => ({ ...prev, storage: 'error', message: `Storage Error: ${e.message} (Did you create the 'product-images' bucket and policies?)` }));
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">System Health Diagnostics</h2>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl">
        
        <div className="mb-8 p-4 bg-slate-50 rounded border border-slate-100">
           <p className="text-sm text-slate-600 mb-2 font-bold uppercase tracking-wide">Configuration Status</p>
           <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_SUPABASE_URL ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</span>
           </div>
           <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Supabase Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</span>
           </div>
        </div>

        <div className="space-y-6 mb-8">
           {/* DB Check */}
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-100 p-2 rounded text-blue-600"><List size={20}/></div>
                 <div>
                    <h4 className="font-bold text-slate-800">Database Connection</h4>
                    <p className="text-xs text-slate-500">Reads 'store_settings' table</p>
                 </div>
              </div>
              <div>
                 {status.db === 'pending' && <span className="text-slate-400 text-sm font-medium">Waiting...</span>}
                 {status.db === 'success' && <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16}/> Connected</span>}
                 {status.db === 'error' && <span className="text-red-500 text-sm font-bold flex items-center gap-1"><AlertCircle size={16}/> Failed</span>}
              </div>
           </div>

           {/* Storage Check */}
           <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                 <div className="bg-purple-100 p-2 rounded text-purple-600"><Image size={20}/></div>
                 <div>
                    <h4 className="font-bold text-slate-800">Storage Permissions</h4>
                    <p className="text-xs text-slate-500">Uploads file to 'product-images'</p>
                 </div>
              </div>
              <div>
                 {status.storage === 'pending' && <span className="text-slate-400 text-sm font-medium">Waiting...</span>}
                 {status.storage === 'success' && <span className="text-green-600 text-sm font-bold flex items-center gap-1"><CheckCircle size={16}/> Writable</span>}
                 {status.storage === 'error' && <span className="text-red-500 text-sm font-bold flex items-center gap-1"><AlertCircle size={16}/> Failed</span>}
              </div>
           </div>
        </div>
        
        <div className="mb-6">
           <p className={`text-sm font-medium p-3 rounded ${status.message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
              Log: {status.message}
           </p>
        </div>

        <button 
           onClick={runDiagnostics}
           className="w-full bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-700 transition shadow-lg flex items-center justify-center gap-2"
        >
           <Activity size={18} /> Run Diagnostics
        </button>
      </div>
    </div>
  );
};

const CategoryManager = ({ categories, onToggle, onAdd }: any) => {
  const [filter, setFilter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  
  const filtered = categories.filter((c: any) => c.name.toLowerCase().includes(filter.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.name) return;
    
    const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    onAdd({
      id: `cat_${Date.now()}`,
      name: formData.name,
      slug: slug,
      enabled: true
    });
    setFormData({ name: '', slug: '' });
    setIsAdding(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Category Management</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition">
          {isAdding ? <X size={18} /> : <Plus size={18} />} {isAdding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 max-w-4xl animate-in slide-in-from-top-2">
           <h3 className="font-bold text-slate-700 mb-4">Add New Category</h3>
           <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                 <label className="block text-sm font-medium text-slate-600 mb-1">Category Name</label>
                 <input 
                    className="w-full border p-2 rounded" 
                    placeholder="e.g. Vitamins"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                 />
              </div>
              <div className="flex-1 w-full">
                 <label className="block text-sm font-medium text-slate-600 mb-1">Slug (URL)</label>
                 <input 
                    className="w-full border p-2 rounded" 
                    placeholder="e.g. vitamins (optional)"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                 />
              </div>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold transition flex items-center gap-2">
                 <Save size={18} /> Save
              </button>
           </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
         <div className="p-4 border-b border-slate-200 flex gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-primary"
                value={filter}
                onChange={e => setFilter(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Slug ID</th>
                <th className="px-6 py-4 text-right">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                   <td className="px-6 py-4 font-medium text-slate-800">{cat.name}</td>
                   <td className="px-6 py-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                   <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onToggle(cat.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition ${
                          cat.enabled !== false 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                         {cat.enabled !== false ? (
                           <><ToggleRight size={18} /> Enabled</>
                         ) : (
                           <><ToggleLeft size={18} /> Disabled</>
                         )}
                      </button>
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

const ProfileManager = ({ profile, onSave }: any) => {
  const [formData, setFormData] = useState(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = () => {
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-8">
       <h2 className="text-2xl font-bold text-slate-800 mb-6">Admin Profile</h2>
       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8 max-w-2xl">
          
          <div className="mb-6 border-b border-slate-200 pb-6">
             <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
               <Image size={20} className="text-primary"/> Store Branding
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL (Optional)</label>
                  <input 
                    type="text" 
                    name="logoUrl"
                    value={formData.logoUrl || ''} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-400 mt-1">If set, this image will replace the text logo in the header.</p>
                </div>
             </div>
          </div>

          <div className="mb-6 border-b border-slate-200 pb-6">
             <h3 className="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
               <Phone size={20} className="text-primary"/> Contact Configuration
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">US Phone Number</label>
                  <input 
                    type="text" 
                    name="usPhoneNumber"
                    value={formData.usPhoneNumber || ''} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary"
                    placeholder="+1 (888) ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UK Phone Number</label>
                  <input 
                    type="text" 
                    name="ukPhoneNumber"
                    value={formData.ukPhoneNumber || ''} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary"
                    placeholder="+44 (800) ..."
                  />
                </div>
             </div>
          </div>

          <div className="mb-6">
             <h3 className="font-bold text-lg text-slate-700 mb-4">Notification Settings</h3>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-100">
                   <div>
                      <div className="font-medium text-slate-800">Email Notifications</div>
                      <div className="text-sm text-slate-500">Receive an email when a new order is placed</div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="receiveEmailNotifications" checked={formData.receiveEmailNotifications} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-100">
                   <div>
                      <div className="font-medium text-slate-800">Telegram Notifications</div>
                      <div className="text-sm text-slate-500">Receive a message via Telegram Bot</div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="receiveTelegramNotifications" checked={formData.receiveTelegramNotifications} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </label>
                </div>
             </div>
          </div>

          <div className="space-y-4 mb-8">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email ID</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary"
                />
             </div>
             
             {formData.receiveTelegramNotifications && (
               <>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Bot ID (Token)</label>
                    <input 
                      type="text" 
                      name="telegramBotToken"
                      value={formData.telegramBotToken} 
                      onChange={handleChange}
                      placeholder="123456789:AbCdEfGhIjK..."
                      className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary font-mono text-sm"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Chat ID (Notification Target)</label>
                    <input 
                      type="text" 
                      name="telegramChatId"
                      value={formData.telegramChatId} 
                      onChange={handleChange}
                      placeholder="-100123456789"
                      className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary font-mono text-sm"
                    />
                 </div>
               </>
             )}
          </div>

          <div className="mb-6 border-t border-slate-200 pt-6">
             <h3 className="font-bold text-lg text-slate-700 mb-4">Floating Chat Widgets</h3>
             
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-100 mb-4">
                 <div className="flex items-center gap-3">
                    <MessageCircle className="text-green-500" />
                    <div>
                      <div className="font-medium text-slate-800">Show Chat Buttons</div>
                      <div className="text-sm text-slate-500">Display floating WhatsApp/Telegram on storefront</div>
                    </div>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="showFloatingChat" checked={formData.showFloatingChat} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                 </label>
             </div>

             {formData.showFloatingChat && (
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">What App Number</label>
                      <input 
                        type="text" 
                        name="whatsappNumber"
                        value={formData.whatsappNumber || ''} 
                        onChange={handleChange}
                        placeholder="e.g. 15551234567"
                        className="w-full border border-slate-300 rounded p-2 focus:ring-primary focus:border-primary"
                      />
                      <p className="text-xs text-slate-400 mt-1">Include country code, no symbols.</p>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telegram Username (for Chat)</label>
                      <div className="flex">
                         <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">t.me/</span>
                         <input 
                           type="text" 
                           name="telegramUsername"
                           value={formData.telegramUsername || ''} 
                           onChange={handleChange}
                           placeholder="SupportBot"
                           className="w-full border border-slate-300 rounded-r-md p-2 focus:ring-primary focus:border-primary"
                         />
                      </div>
                   </div>
                </div>
             )}
          </div>

          <div className="flex items-center gap-4">
             <button onClick={handleSubmit} className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded font-bold transition flex items-center gap-2">
                <Save size={18} /> Save Profile
             </button>
             {isSaved && <span className="text-green-600 flex items-center gap-1 font-medium"><Check size={18} /> Saved!</span>}
          </div>

       </div>
    </div>
  );
};

const SettingsManager = () => {
  const { 
    paymentMethods, addPaymentMethod, removePaymentMethod, togglePaymentMethod,
    deliveryOptions, addDeliveryOption, removeDeliveryOption, toggleDeliveryOption 
  } = useStore();
  
  const [newMethodName, setNewMethodName] = useState('');
  
  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    name: '', price: '', minDays: '', maxDays: '', icon: 'normal'
  });

  const handleAddPayment = () => {
    if(!newMethodName) return;
    addPaymentMethod({
      id: `pm_${Date.now()}`,
      name: newMethodName,
      iconUrl: '', // Default empty for custom
      enabled: true
    });
    setNewMethodName('');
  };

  const handleAddShipping = () => {
    if(!shippingForm.name || !shippingForm.price) return;
    const newOption: DeliveryOption = {
      id: `del_${Date.now()}`,
      name: shippingForm.name,
      price: parseFloat(shippingForm.price),
      minDays: parseInt(shippingForm.minDays) || 5,
      maxDays: parseInt(shippingForm.maxDays) || 10,
      icon: shippingForm.icon,
      enabled: true
    };
    addDeliveryOption(newOption);
    setShippingForm({ name: '', price: '', minDays: '', maxDays: '', icon: 'normal' });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Store Configuration</h2>
      
      {/* 1. Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-4xl">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
          <CreditCard size={24} className="text-primary" /> Accepted Payment Methods
        </h3>
        <p className="text-sm text-slate-500 mb-6">Manage payment icons displayed on product pages.</p>
        
        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 border p-2 rounded" 
            placeholder="Method Name (e.g. PayPal)" 
            value={newMethodName}
            onChange={e => setNewMethodName(e.target.value)}
          />
          <button onClick={handleAddPayment} className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-blue-600 transition">Add Method</button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map(pm => (
            <div key={pm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-8 bg-white border border-slate-300 rounded flex items-center justify-center text-[9px] font-bold text-slate-500 uppercase overflow-hidden">
                    {pm.iconUrl ? <img src={pm.iconUrl} className="w-full h-full object-contain" /> : pm.name.substring(0,3)}
                 </div>
                 <span className={`font-medium ${pm.enabled ? 'text-slate-800' : 'text-slate-400 decoration-slate-400'}`}>
                    {pm.name}
                 </span>
                 {!pm.enabled && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Disabled</span>}
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                    onClick={() => togglePaymentMethod(pm.id)}
                    className={`text-sm font-medium flex items-center gap-1 ${pm.enabled ? 'text-green-600' : 'text-slate-400'}`}
                 >
                    {pm.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    {pm.enabled ? 'Enabled' : 'Disabled'}
                 </button>
                 <button onClick={() => removePaymentMethod(pm.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <Trash2 size={18} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Shipping Options */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-4xl">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
          <Truck size={24} className="text-orange-500" /> Shipping Options
        </h3>
        <p className="text-sm text-slate-500 mb-6">Configure delivery methods available for products.</p>
        
        {/* Add New Shipping Form */}
        <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6">
           <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Add New Option</h4>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input 
                placeholder="Name (e.g. DHL)" 
                className="border p-2 rounded text-sm"
                value={shippingForm.name}
                onChange={e => setShippingForm({...shippingForm, name: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Price ($)" 
                className="border p-2 rounded text-sm"
                value={shippingForm.price}
                onChange={e => setShippingForm({...shippingForm, price: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Min Days" 
                className="border p-2 rounded text-sm"
                value={shippingForm.minDays}
                onChange={e => setShippingForm({...shippingForm, minDays: e.target.value})}
              />
              <input 
                type="number"
                placeholder="Max Days" 
                className="border p-2 rounded text-sm"
                value={shippingForm.maxDays}
                onChange={e => setShippingForm({...shippingForm, maxDays: e.target.value})}
              />
              <select 
                 className="border p-2 rounded text-sm bg-white"
                 value={shippingForm.icon}
                 onChange={e => setShippingForm({...shippingForm, icon: e.target.value})}
              >
                 <option value="normal">Normal Mail Icon</option>
                 <option value="express">Express Icon</option>
              </select>
           </div>
           <button onClick={handleAddShipping} className="mt-3 w-full bg-slate-800 text-white py-2 rounded font-bold text-sm hover:bg-slate-700 transition">
              Add Shipping Option
           </button>
        </div>

        {/* Shipping List */}
        <div className="space-y-3">
          {deliveryOptions.map(opt => (
            <div key={opt.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded border border-slate-200 hover:shadow-sm transition">
               <div className="flex items-center gap-4 mb-2 md:mb-0">
                 <div className="w-16 h-10 flex items-center justify-center">
                    {opt.icon === 'express' ? <ExpressIcon /> : <NormalIcon />}
                 </div>
                 <div>
                    <div className="font-bold text-slate-800">{opt.name}</div>
                    <div className="text-xs text-slate-500">
                       ${opt.price.toFixed(2)} • {opt.minDays}-{opt.maxDays} Days
                    </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-4 justify-end">
                 <button 
                    onClick={() => toggleDeliveryOption(opt.id)}
                    className={`text-sm font-medium flex items-center gap-1 ${opt.enabled ? 'text-green-600' : 'text-slate-400'}`}
                 >
                    {opt.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    {opt.enabled ? 'Active' : 'Inactive'}
                 </button>
                 <button onClick={() => removeDeliveryOption(opt.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                    <Trash2 size={18} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ orders, products }: any) => {
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
  
  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<ShoppingBag className="text-green-500" />} />
        <StatCard label="Total Orders" value={orders.length} icon={<Package className="text-blue-500" />} />
        <StatCard label="Products" value={products.length} icon={<LayoutDashboard className="text-purple-500" />} />
        <StatCard label="Active Users" value="1,240" icon={<Users className="text-orange-500" />} />
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="h-48 flex items-center justify-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded">
           Chart Visualization Placeholder
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-full">{icon}</div>
  </div>
);

const ProductManager = ({ products, onEdit, onDelete, onAdd, onToggleStatus, categories }: any) => {
  const [filter, setFilter] = useState('');
  
  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(filter.toLowerCase()));

  const getCategoryNames = (ids: string[]) => {
    if (!ids || ids.length === 0) return 'Uncategorized';
    return ids.map(id => categories.find((c: any) => c.id === id)?.name).filter(Boolean).join(', ');
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Product Management</h2>
        <button onClick={onAdd} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-primary"
                value={filter}
                onChange={e => setFilter(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Ingredient</th>
                <th className="px-6 py-4">Categories</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded border border-slate-200 object-contain" alt="" />
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.activeIngredient}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                    {getCategoryNames(p.categoryIds)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onToggleStatus(p)}
                      className={`flex items-center gap-1 text-sm font-medium ${p.enabled !== false ? 'text-green-600' : 'text-slate-400'}`}
                      title="Toggle Status"
                    >
                      {p.enabled !== false ? (
                        <><ToggleRight size={22} /> Active</>
                      ) : (
                        <><ToggleLeft size={22} /> Disabled</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 font-mono">${p.price}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => onEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => { if(confirm('Are you sure?')) onDelete(p.id) }} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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

const OrderManager = ({ orders }: any) => (
  <div className="p-4 md:p-8">
    <h2 className="text-2xl font-bold text-slate-800 mb-6">Order History</h2>
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-primary">{o.id}</td>
                <td className="px-6 py-4">{o.customerName}</td>
                <td className="px-6 py-4 text-slate-500">{o.date ? new Date(o.date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 font-bold">${o.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    o.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- COMPLEX EDITOR COMPONENT ---
const ProductEditor = ({ product, isNew, onSave, onCancel, categories, uploadImage }: any) => {
  const [formData, setFormData] = useState<Product>(product);
  const [isUploading, setIsUploading] = useState(false);
  
  // Package Editor State
  const [packages, setPackages] = useState<ProductPackage[]>(product.packages || []);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryToggle = (catId: string) => {
    setFormData(prev => {
      const current = prev.categoryIds || [];
      if (current.includes(catId)) {
        return { ...prev, categoryIds: current.filter(id => id !== catId) };
      } else {
        return { ...prev, categoryIds: [...current, catId] };
      }
    });
  };

  const handlePackageChange = (id: string, field: keyof ProductPackage, value: any) => {
    setPackages(prev => prev.map(p => {
       if (p.id !== id) return p;
       const updated = { ...p, [field]: value };
       // Auto calc total price if pricePerPill changes
       if (field === 'pricePerPill') {
          updated.totalPrice = Number((value * p.quantity).toFixed(2));
       }
       return updated;
    }));
  };

  const addNewPackage = () => {
    const newPkg: ProductPackage = {
      id: `pkg_${Date.now()}`,
      dosage: '50 MG',
      quantity: 30,
      pricePerPill: 1.00,
      totalPrice: 30.00
    };
    setPackages([...packages, newPkg]);
  };

  const removePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = () => {
    onSave({ ...formData, packages });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    
    // Call the upload function passed from context
    const publicUrl = await uploadImage(file);
    
    if (publicUrl) {
        handleChange('image', publicUrl);
    } else {
        alert("Failed to upload image. Check console.");
    }
    setIsUploading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{isNew ? 'Create Product' : 'Edit Product'}</h2>
        <div className="flex gap-2">
           <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded transition">Cancel</button>
           <button onClick={handleSave} className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2 transition shadow-sm">
             <Save size={18} /> Save Changes
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-slate-700">Basic Information</h3>
                <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.enabled !== false} 
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" 
                  />
                  Product Enabled
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
                    <input className="w-full border p-2 rounded" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Active Ingredient</label>
                    <input className="w-full border p-2 rounded" value={formData.activeIngredient} onChange={e => handleChange('activeIngredient', e.target.value)} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Base Price ($)</label>
                    <input type="number" className="w-full border p-2 rounded" value={formData.price} onChange={e => handleChange('price', parseFloat(e.target.value))} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Categories</label>
                    <div className="w-full border p-2 rounded max-h-40 overflow-y-auto bg-white">
                      {categories.map((c: any) => (
                        <label key={c.id} className="flex items-center gap-2 mb-1 p-1 hover:bg-slate-50 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formData.categoryIds?.includes(c.id)} 
                            onChange={() => handleCategoryToggle(c.id)}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-700">{c.name}</span>
                        </label>
                      ))}
                    </div>
                 </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">Other Names (comma separated)</label>
                <input 
                    className="w-full border p-2 rounded" 
                    value={formData.otherNames?.join(', ') || ''} 
                    onChange={e => handleChange('otherNames', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                    placeholder="e.g. Name1, Name2"
                />
              </div>

              <div className="mt-4">
                 <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                 <textarea rows={4} className="w-full border p-2 rounded" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
              </div>
           </div>

           {/* Packages Manager */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="font-bold text-slate-700">Product Packages & Dosages</h3>
                 <button onClick={addNewPackage} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                   <Plus size={14} /> Add Package
                 </button>
              </div>
              
              <div className="space-y-3">
                 {packages.length === 0 && <p className="text-slate-400 italic text-sm">No packages configured.</p>}
                 {packages.map((pkg) => (
                    <div key={pkg.id} className="flex flex-wrap md:flex-nowrap gap-2 items-end p-3 bg-slate-50 border border-slate-200 rounded">
                       <div className="w-20">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Dosage</label>
                          <input className="w-full border p-1 text-sm rounded" value={pkg.dosage} onChange={e => handlePackageChange(pkg.id, 'dosage', e.target.value)} />
                       </div>
                       <div className="w-16">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Qty</label>
                          <input type="number" className="w-full border p-1 text-sm rounded" value={pkg.quantity} onChange={e => handlePackageChange(pkg.id, 'quantity', parseInt(e.target.value))} />
                       </div>
                       <div className="w-20">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Per Pill</label>
                          <input type="number" step="0.01" className="w-full border p-1 text-sm rounded" value={pkg.pricePerPill} onChange={e => handlePackageChange(pkg.id, 'pricePerPill', parseFloat(e.target.value))} />
                       </div>
                       <div className="w-20">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Total</label>
                          <input type="number" className="w-full border p-1 text-sm rounded bg-slate-100" readOnly value={pkg.totalPrice} />
                       </div>
                       <div className="flex-1 min-w-[150px]">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Bonus Text</label>
                          <input className="w-full border p-1 text-sm rounded" placeholder="Free Shipping..." value={pkg.bonus || ''} onChange={e => handlePackageChange(pkg.id, 'bonus', e.target.value)} />
                       </div>
                       <button onClick={() => removePackage(pkg.id)} className="p-2 text-red-400 hover:text-red-600"><X size={16}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Image & Options */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
               <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Product Image</h3>
               <div className="flex flex-col items-center">
                  <div className="w-full h-48 border border-slate-200 rounded mb-4 bg-slate-50 flex items-center justify-center relative overflow-hidden group">
                     {formData.image ? (
                        <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                     ) : (
                        <Image className="text-slate-300" size={48} />
                     )}
                     {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                           <span className="text-white font-bold animate-pulse">Uploading...</span>
                        </div>
                     )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="w-full mb-3">
                     <label className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded cursor-pointer transition">
                        <UploadCloud size={18} />
                        <span>Upload Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                     </label>
                  </div>

                  <div className="w-full">
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Or enter URL</label>
                    <input className="w-full border p-2 text-xs rounded" value={formData.image} onChange={e => handleChange('image', e.target.value)} placeholder="https://..." />
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};
