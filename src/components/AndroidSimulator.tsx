import React, { useState } from 'react';
import {
  Smartphone,
  RotateCw,
  Search,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Package,
  Layers,
  Settings,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  User,
  Key,
  Globe,
  SlidersHorizontal,
  PlusCircle,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe2,
  FileText,
  Badge,
} from 'lucide-react';
import { AppLanguage, OrderDetail, DashboardStats, AuthUser } from '../types';
import { mockUser, mockStats, mockOrders, mockProducts, ProductCatalogItem } from '../data/mockData';

interface AndroidSimulatorProps {
  initialLanguage?: AppLanguage;
  onLiveUrlChange?: (url: string) => void;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  initialLanguage = 'bn',
}) => {
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'create_order' | 'browser' | 'settings'>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Auth form states
  const [siteUrl, setSiteUrl] = useState('https://healthpointbd.com/');
  const [username, setUsername] = useState('hpbd_operator');
  const [appPassword, setAppPassword] = useState('4fe5 12ad 59aa 45ae');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Orders and filtering
  const [orders, setOrders] = useState<OrderDetail[]>(mockOrders);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customizedOnly, setCustomizedOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [auditNote, setAuditNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Order Form States
  const [newCustName, setNewCustName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDistrict, setNewDistrict] = useState('Dhaka');
  const [newUpazila, setNewUpazila] = useState('');
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [newDeliveryFee, setNewDeliveryFee] = useState(120);
  const [selectedProducts, setSelectedProducts] = useState<{
    product: ProductCatalogItem;
    quantity: number;
    engraving: string;
    embroidery: string;
    nameplate: string;
  }[]>([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<number | null>(null);
  const [newSource, setNewSource] = useState('Manual');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [newPaymentMethod, setNewPaymentMethod] = useState('cod');
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [browserTab, setBrowserTab] = useState<'create' | 'orders' | 'customization' | 'production' | 'print'>('create');

  // Bangladesh Districts
  const districts = [
    'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
    'Gazipur', 'Narayanganj', 'Comilla', 'Bogra', 'Jessore', 'Dinajpur', 'Cox\'s Bazar'
  ];

  // Translations
  const t = {
    bn: {
      appName: 'এইচপিবিডি অপারেশনস',
      tagline: 'হেলথ পয়েন্ট বিডি অপারেশনস পোর্টাল',
      loginTitle: 'স্টাফ অথেন্টিকেশন',
      loginSubtitle: 'ওয়ার্ডপ্রেস ইউজার ও অ্যাপ্লিকেশন পাসওয়ার্ড দিয়ে লগইন করুন।',
      siteUrl: 'ওয়ার্ডপ্রেস HTTPS ইউআরএল',
      username: 'ওয়ার্ডপ্রেস ইউজারনেম',
      password: 'অ্যাপ্লিকেশন পাসওয়ার্ড',
      signIn: 'লগইন করুন',
      verifying: 'যাচাই করা হচ্ছে…',
      todayOrders: 'আজকের অর্ডার',
      totalOrders: 'সর্বমোট অর্ডার',
      pending: 'পেন্ডিং',
      processing: 'প্রসেসিং',
      completed: 'কমপ্লিট',
      onHold: 'অন-হোল্ড',
      cancelled: 'বাতিল',
      recentOrders: 'সাম্প্রতিক অর্ডার',
      viewAll: 'সবগুলো দেখুন',
      searchPlaceholder: 'অর্ডার নং, কাস্টমার, ফোন, খোদাই নাম…',
      all: 'সকল',
      customized: 'কাস্টমাইজড',
      engraving: 'লেজার খোদাই',
      embroidery: 'এমব্রয়ডারি',
      nameplate: 'নেমপ্লেট',
      productsSection: 'পণ্য ও কাস্টমাইজেশন বিবরণ',
      customerSection: 'গ্রাহকের তথ্য ও ঠিকানা',
      paymentSection: 'পেমেন্ট ও ডেলিভারি বিবরণ',
      activitySection: 'অডিট ও অ্যাক্টিভিটি হিস্ট্রি',
      updateStatusBtn: 'অর্ডার স্ট্যাটাস আপডেট',
      confirmStatus: 'স্ট্যাটাস পরিবর্তনের নিশ্চয়তা',
      auditNotePlaceholder: 'অভ্যন্তরীণ অডিট নোট (যেমন: লেজার খোদাই সম্পন্ন হয়েছে)',
      confirmBtn: 'নিশ্চিত করুন ও সেভ করুন',
      cancelBtn: 'বাতিল',
      logout: 'নিরাপদে লগআউট করুন',
      settingsLanguage: 'ভাষা পরিবর্তন (Language)',
      keystoreActive: 'Android Keystore AES256 এনক্রিপশন সক্রিয়',
      deliveryAddress: 'ডেলিভারি ঠিকানা',
      grandTotal: 'সর্বমোট মূল্য',
      noOrdersFound: 'কোনো অর্ডার পাওয়া যায়নি।',
      newOrderTitle: 'নতুন অর্ডার তৈরি করুন',
      addProduct: '+ পণ্য যোগ করুন',
      duplicateOrder: 'অর্ডার ডুপ্লিকেট করুন',
      createOrderBtn: 'উকমার্সে অর্ডার তৈরি করুন',
      webPortal: 'ওয়েব পোর্টাল',
    },
    en: {
      appName: 'HPBD Operations',
      tagline: 'Health Point BD Operations Suite',
      loginTitle: 'Staff Authentication',
      loginSubtitle: 'Sign in with your WordPress user account and dedicated Application Password.',
      siteUrl: 'WordPress HTTPS URL',
      username: 'WordPress Username',
      password: 'Application Password',
      signIn: 'Sign In to Operations',
      verifying: 'Verifying Credentials…',
      todayOrders: "Today's Orders",
      totalOrders: 'Total Lifetime Orders',
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      onHold: 'On Hold',
      cancelled: 'Cancelled',
      recentOrders: 'Recent Orders',
      viewAll: 'View All',
      searchPlaceholder: 'Order #, Customer, Phone, Engraving…',
      all: 'All',
      customized: 'Customized',
      engraving: 'Engraving',
      embroidery: 'Embroidery',
      nameplate: 'Nameplate',
      productsSection: 'Products & Customization',
      customerSection: 'Customer Information',
      paymentSection: 'Financial & Delivery Breakdown',
      activitySection: 'Audit & Activity Log',
      updateStatusBtn: 'Update Order Status',
      confirmStatus: 'Confirm Status Change',
      auditNotePlaceholder: 'Internal audit note (e.g., Laser engraving completed)',
      confirmBtn: 'Confirm & Update',
      cancelBtn: 'Cancel',
      logout: 'Log Out Securely',
      settingsLanguage: 'Language Switcher',
      keystoreActive: 'Android Keystore AES256-GCM Vault Active',
      deliveryAddress: 'Delivery Address',
      grandTotal: 'Grand Total',
      noOrdersFound: 'No orders found matching criteria.',
      newOrderTitle: 'Create New Order',
      addProduct: '+ Add Product',
      duplicateOrder: 'Duplicate Order',
      createOrderBtn: 'Create Order in WooCommerce',
      webPortal: 'Web Portal',
    },
  }[language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!siteUrl.startsWith('https://')) {
      setLoginError('Security Error: HTTPS is strictly required for mobile API.');
      return;
    }
    if (!username.trim() || !appPassword.trim()) {
      setLoginError('All login credentials are required.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
    }, 700);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleDistrictChange = (dist: string) => {
    setNewDistrict(dist);
    setNewDeliveryFee(dist === 'Dhaka' ? 120 : 150);
  };

  // Add Product to Create Order Form
  const addProductToForm = (p: ProductCatalogItem) => {
    setSelectedProducts((prev) => [
      ...prev,
      {
        product: p,
        quantity: 1,
        engraving: '',
        embroidery: '',
        nameplate: '',
      },
    ]);
    setProductPickerOpen(false);
  };

  // Submit Real Order Creation
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateOrderError(null);
    if (!newCustName.trim() || !newPhone.trim() || !newAddress.trim()) {
      setCreateOrderError('Please fill in Customer Name, Phone Number, and Full Delivery Address.');
      return;
    }
    if (selectedProducts.length === 0) {
      setCreateOrderError('Please add at least one product to the order.');
      return;
    }

    setIsCreatingOrder(true);

    setTimeout(() => {
      const newId = 10843 + Math.floor(Math.random() * 50);
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

      const subtotal = selectedProducts.reduce((sum, sp) => sum + sp.product.price * sp.quantity, 0);
      const totalAmount = subtotal + newDeliveryFee;

      const orderItems = selectedProducts.map((sp, idx) => {
        const customs = [];
        if (sp.engraving) customs.push({ label: 'Laser Engraving Name', value: sp.engraving, category: 'engraving' as const });
        if (sp.embroidery) customs.push({ label: 'Embroidery Name', value: sp.embroidery, category: 'embroidery' as const });
        if (sp.nameplate) customs.push({ label: 'Nameplate Specification', value: sp.nameplate, category: 'nameplate' as const });

        return {
          id: 500 + idx,
          name: sp.product.name,
          quantity: sp.quantity,
          subtotal: `৳ ${sp.product.price.toLocaleString()}`,
          total: `৳ ${(sp.product.price * sp.quantity).toLocaleString()}`,
          sku: sp.product.sku,
          customizations: customs,
        };
      });

      const customizationTexts = selectedProducts.flatMap((sp) => {
        const list = [];
        if (sp.engraving) list.push(`Engraving: ${sp.engraving}`);
        if (sp.embroidery) list.push(`Embroidery: ${sp.embroidery}`);
        if (sp.nameplate) list.push(`Nameplate: ${sp.nameplate}`);
        return list;
      });

      const paymentMethodTitle = 
        newPaymentMethod === 'bkash' ? 'bKash Mobile Payment' :
        newPaymentMethod === 'bank' ? 'Direct Bank Transfer (BACS)' : 'Cash on Delivery (COD)';

      const newOrderObj: OrderDetail = {
        id: newId,
        number: `${newId}`,
        status: 'processing',
        customer: newCustName,
        phone: newPhone,
        email: newEmail || 'customer@healthpointbd.com',
        billingEmail: newEmail || 'customer@healthpointbd.com',
        billingPhone: newPhone,
        billingCity: newDistrict,
        shippingAddress: `${newAddress}, ${newUpazila ? newUpazila + ', ' : ''}${newDistrict}`,
        customerNote: newCustomerNote,
        paymentMethod: paymentMethodTitle,
        shippingMethod: `Standard Courier (${newDistrict})`,
        shippingTotal: `৳ ${newDeliveryFee}`,
        total: `৳ ${totalAmount.toLocaleString()}`,
        orderTotal: `৳ ${totalAmount.toLocaleString()}`,
        created: now,
        fulfillment: customizationTexts.length > 0 ? 'Production Queue' : 'Ready to Pack',
        source: newSource,
        priority: newPriority,
        opsState: customizationTexts.length > 0 ? 'Customization' : 'Pending',
        customization: customizationTexts,
        badges: {
          hasCustomization: customizationTexts.length > 0,
          engraving: selectedProducts.some((p) => !!p.engraving),
          embroidery: selectedProducts.some((p) => !!p.embroidery),
          nameplate: selectedProducts.some((p) => !!p.nameplate),
        },
        allowedStatuses: [
          { key: 'pending', label: 'Pending Payment' },
          { key: 'processing', label: 'Processing' },
          { key: 'on-hold', label: 'On Hold' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ],
        items: orderItems,
        activity: [
          {
            id: Date.now(),
            date: now,
            author: `${mockUser.name} (#${mockUser.id})`,
            content: `Order #${newId} created via HPBD Operations Native Android App [Source: ${newSource}, Priority: ${newPriority}].${newInternalNote ? ' Internal Note: ' + newInternalNote : ''}`,
            customerNote: false,
          },
        ],
      };

      setOrders([newOrderObj, ...orders]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        todayOrders: prev.todayOrders + 1,
        processing: prev.processing + 1,
        customizedOrders: prev.customizedOrders + (customizationTexts.length > 0 ? 1 : 0),
      }));

      setIsCreatingOrder(false);
      setOrderCreatedSuccess(newId);
    }, 800);
  };

  // Duplicate an existing order
  const handleDuplicateOrder = (order: OrderDetail) => {
    setNewCustName(order.customer);
    setNewPhone(order.phone);
    setNewEmail(order.billingEmail);
    setNewAddress(order.shippingAddress);
    setNewDistrict(order.billingCity || 'Dhaka');
    setSelectedProducts(
      order.items.map((it) => {
        const eng = it.customizations.find((c) => c.category === 'engraving')?.value || '';
        const emb = it.customizations.find((c) => c.category === 'embroidery')?.value || '';
        const np = it.customizations.find((c) => c.category === 'nameplate')?.value || '';
        const matched = mockProducts.find((p) => p.name === it.name) || mockProducts[0];
        return {
          product: matched,
          quantity: it.quantity,
          engraving: eng,
          embroidery: emb,
          nameplate: np,
        };
      })
    );
    setSelectedOrderId(null);
    setActiveTab('create_order');
    setSuccessToast(`Pre-filled order form with data from Order #${order.number}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrderId || !targetStatus) return;
    setIsUpdatingStatus(true);

    setTimeout(() => {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === selectedOrderId) {
            const updatedActivity = [
              {
                id: Date.now(),
                date: now,
                author: `${mockUser.name} (#${mockUser.id})`,
                content: `Status updated from ${o.status} to ${targetStatus} via HPBD Operations Android app.${
                  auditNote ? ` Note: ${auditNote}` : ''
                }`,
                customerNote: false,
              },
              ...o.activity,
            ];
            return {
              ...o,
              status: targetStatus as any,
              activity: updatedActivity,
            };
          }
          return o;
        })
      );

      setIsUpdatingStatus(false);
      setStatusModalOpen(false);
      setAuditNote('');
      setSuccessToast(`Order #${selectedOrderId} updated to ${targetStatus}`);
      setTimeout(() => setSuccessToast(null), 3500);
    }, 600);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (customizedOnly && !o.badges.hasCustomization) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = o.number.toLowerCase().includes(q);
      const matchCustomer = o.customer.toLowerCase().includes(q);
      const matchPhone = o.phone.toLowerCase().includes(q);
      const matchCustom = o.customization.some((c) => c.toLowerCase().includes(q));
      const matchItems = o.items.some(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.customizations.some((c) => c.value.toLowerCase().includes(q))
      );
      return matchNumber || matchCustomer || matchPhone || matchCustom || matchItems;
    }
    return true;
  });

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Device Shell */}
      <div className="relative w-[380px] h-[790px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800">
        {/* Speaker & Camera Notch */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full flex items-center justify-center gap-3 z-30 shadow-inner">
          <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
          <div className="w-1.5 h-1.5 bg-blue-900/60 rounded-full" />
        </div>

        {/* Screen Bezel */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 shadow-inner">
          {/* Android Status Bar */}
          <div className="h-9 px-6 pt-2 flex justify-between items-center text-xs font-semibold select-none text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur z-20">
            <span>10:45</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono tracking-tighter">5G</span>
              <div className="w-3.5 h-2 border border-current rounded-xs flex items-center p-0.5">
                <div className="w-2 h-1 bg-current" />
              </div>
            </div>
          </div>

          {/* Android App Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {!isAuthenticated ? (
              /* LOGIN SCREEN */
              <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      {language === 'bn' ? 'English' : 'বাংলা'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-700/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold leading-tight">{t.appName}</h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{t.tagline}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs mb-4">
                    <h2 className="text-sm font-semibold mb-1">{t.loginTitle}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {t.loginSubtitle}
                    </p>

                    <form onSubmit={handleLogin} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          {t.siteUrl}
                        </label>
                        <input
                          type="text"
                          value={siteUrl}
                          onChange={(e) => setSiteUrl(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                          placeholder="https://healthpointbd.com/"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          {t.username}
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600"
                            placeholder="wp_username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                          {t.password}
                        </label>
                        <div className="relative">
                          <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="password"
                            value={appPassword}
                            onChange={(e) => setAppPassword(e.target.value)}
                            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600 font-mono"
                            placeholder="•••• •••• •••• ••••"
                          />
                        </div>
                      </div>

                      {loginError && (
                        <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm shadow-red-700/30"
                      >
                        {isLoggingIn ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            {t.verifying}
                          </>
                        ) : (
                          t.signIn
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pb-2">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="font-medium">{t.keystoreActive}</span>
                  </div>
                  WordPress Application Password Authentication over HTTPS
                </div>
              </div>
            ) : activeTab === 'create_order' ? (
              /* REAL ORDER CREATION SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold">{t.newOrderTitle}</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-400">
                    WooCommerce Real Sync
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Customer Information */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Customer Details
                    </span>

                    <input
                      type="text"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="Customer Name (e.g. Dr. Kayeas Ahmed) *"
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Phone Number *"
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Email (optional)"
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <textarea
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Full Delivery Address (House, Road, Area) *"
                      rows={2}
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d} (৳{d === 'Dhaka' ? 120 : 150})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={newUpazila}
                        onChange={(e) => setNewUpazila(e.target.value)}
                        placeholder="Upazila / Thana"
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    {/* Order Source & Priority (HPBD 1.5.0) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Order Source</label>
                        <select
                          value={newSource}
                          onChange={(e) => setNewSource(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          <option value="Manual">Manual Entry</option>
                          <option value="Messenger">Messenger</option>
                          <option value="Facebook Comment">Facebook Comment</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Website">Website</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Priority Level</label>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setNewPriority('Normal')}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                              newPriority === 'Normal'
                                ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewPriority('Urgent')}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                              newPriority === 'Urgent'
                                ? 'bg-red-700 text-white border-red-700'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            Urgent 🔥
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Payment Method</label>
                      <select
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="bkash">bKash Mobile Payment</option>
                        <option value="bank">Direct Bank Transfer (BACS)</option>
                      </select>
                    </div>

                    {createOrderError && (
                      <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{createOrderError}</span>
                      </div>
                    )}
                  </div>

                  {/* Products & Customizations */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Products ({selectedProducts.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setProductPickerOpen(true)}
                        className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        {t.addProduct}
                      </button>
                    </div>

                    {selectedProducts.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        No product selected yet. Click "+ Add Product".
                      </div>
                    ) : (
                      selectedProducts.map((sp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {sp.product.name}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                ৳{sp.product.price} each · SKU: {sp.product.sku}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProducts(selectedProducts.filter((_, i) => i !== idx))
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Customization Inputs based on item category */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                            {sp.product.customizationTypes.includes('engraving') && (
                              <input
                                type="text"
                                value={sp.engraving}
                                onChange={(e) => {
                                  const updated = [...selectedProducts];
                                  updated[idx].engraving = e.target.value;
                                  setSelectedProducts(updated);
                                }}
                                placeholder="Laser Engraving: e.g. Dr. Kayeas Ahmed, MBBS"
                                className="w-full text-[11px] p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200"
                              />
                            )}

                            {sp.product.customizationTypes.includes('embroidery') && (
                              <input
                                type="text"
                                value={sp.embroidery}
                                onChange={(e) => {
                                  const updated = [...selectedProducts];
                                  updated[idx].embroidery = e.target.value;
                                  setSelectedProducts(updated);
                                }}
                                placeholder="Embroidery: e.g. Dr. Kayeas Ahmed / Cardiology"
                                className="w-full text-[11px] p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 text-pink-900 dark:text-pink-200"
                              />
                            )}

                            {sp.product.customizationTypes.includes('nameplate') && (
                              <input
                                type="text"
                                value={sp.nameplate}
                                onChange={(e) => {
                                  const updated = [...selectedProducts];
                                  updated[idx].nameplate = e.target.value;
                                  setSelectedProducts(updated);
                                }}
                                placeholder="Nameplate: Dr. Name, Degree, Specialty"
                                className="w-full text-[11px] p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Financial Total */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Products Subtotal:</span>
                      <span>
                        ৳
                        {selectedProducts
                          .reduce((sum, sp) => sum + sp.product.price * sp.quantity, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee ({newDistrict}):</span>
                      <span>৳{newDeliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-red-700 dark:text-red-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Total:</span>
                      <span>
                        ৳
                        {(
                          selectedProducts.reduce(
                            (sum, sp) => sum + sp.product.price * sp.quantity,
                            0
                          ) + newDeliveryFee
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <button
                    type="button"
                    onClick={handleCreateOrderSubmit}
                    disabled={isCreatingOrder || selectedProducts.length === 0}
                    className="w-full py-2.5 bg-red-700 hover:bg-red-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-red-700/30"
                  >
                    {isCreatingOrder ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        Creating in WooCommerce…
                      </>
                    ) : (
                      t.createOrderBtn
                    )}
                  </button>
                </div>

                {/* Product Search Picker Dialog Modal */}
                {productPickerOpen && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 w-full max-h-[85%] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold">Select WooCommerce Product</span>
                        <button
                          onClick={() => setProductPickerOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          ✕
                        </button>
                      </div>

                      <input
                        type="text"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Search stethoscope, scrubs, nameplate…"
                        className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2"
                      />

                      <div className="flex-1 overflow-y-auto space-y-1.5">
                        {mockProducts
                          .filter((p) =>
                            p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => addProductToForm(p)}
                              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-500 cursor-pointer text-xs flex justify-between items-center"
                            >
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[210px]">
                                  {p.name}
                                </p>
                                <span className="text-[10px] text-slate-500">
                                  {p.sku} · {p.category}
                                </span>
                              </div>
                              <span className="font-bold text-red-600 shrink-0">
                                {p.formattedPrice}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Order Modal */}
                {orderCreatedSuccess && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 w-full text-center space-y-3 shadow-2xl">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold">Order #{orderCreatedSuccess} Created!</h4>
                      <p className="text-xs text-slate-500">
                        Order has been created in WooCommerce and synced with HPBD Operations.
                      </p>
                      <button
                        onClick={() => {
                          const id = orderCreatedSuccess;
                          setOrderCreatedSuccess(null);
                          setSelectedOrderId(id);
                        }}
                        className="w-full py-2 bg-red-700 text-white rounded-xl text-xs font-bold"
                      >
                        View Order Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 'browser' ? (
              /* HYBRID WEB BROWSER SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Browser Top Navigation Bar */}
                <div className="p-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono text-[9px] truncate text-slate-700 dark:text-slate-300">
                      https://healthpointbd.com/hpbd-operations/?hpbd_tab={browserTab}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-2 py-1 rounded-lg bg-red-700 text-white text-[10px] font-bold shrink-0 hover:bg-red-800 transition"
                  >
                    Native Mode
                  </button>
                </div>

                {/* HPBD Operations Portal Tab Switcher */}
                <div className="bg-slate-800 text-white px-2 py-1 flex items-center gap-1 overflow-x-auto text-[10px] shrink-0 border-b border-slate-700">
                  <span className="font-bold text-red-400 px-1">HPBD 1.5.0:</span>
                  {[
                    { id: 'create', label: 'Create Order' },
                    { id: 'orders', label: 'Orders List' },
                    { id: 'customization', label: 'Customization' },
                    { id: 'production', label: 'Production' },
                    { id: 'print', label: 'Print Center' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBrowserTab(tab.id as any)}
                      className={`px-2 py-0.5 rounded transition whitespace-nowrap font-medium ${
                        browserTab === tab.id
                          ? 'bg-red-700 text-white font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Simulated Portal Page Content */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                  {browserTab === 'create' && (
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            Create WooCommerce Order
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Desktop workspace portal · /hpbd-operations/?hpbd_tab=create
                          </p>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          HTTPS Direct
                        </span>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900 text-[10px] text-amber-800 dark:text-amber-200">
                        ℹ️ <strong>Hybrid Mode Active:</strong> Orders created in this web portal or via Native Android sync into the same WooCommerce order repository with identical customization metadata.
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Portal Actions Available:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-500 text-[10px]">
                          <li>Pasted messenger address extraction with AI / local parsing</li>
                          <li>WooCommerce product attributes and variable pricing</li>
                          <li>Dedicated file upload for doctor signature reference</li>
                          <li>ThemeComplete extra product options integration</li>
                        </ul>
                      </div>

                      <button
                        onClick={() => setActiveTab('create_order')}
                        className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Open High-Speed Native New Order Screen</span>
                      </button>
                    </div>
                  )}

                  {browserTab === 'orders' && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-xs">Unified Operations Order List</span>
                        <span className="text-[10px] text-slate-500">{orders.length} orders</span>
                      </div>
                      <div className="space-y-1.5 max-h-64 overflow-y-auto">
                        {orders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => setSelectedOrderId(o.id)}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer flex justify-between items-center text-[10px]"
                          >
                            <div>
                              <span className="font-bold text-red-700">#{o.number}</span>
                              <span className="ml-1 font-medium">{o.customer}</span>
                              <p className="text-slate-500">{o.phone} · {o.billingCity}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold">{o.total}</span>
                              <span className="block text-[9px] capitalize text-slate-500">{o.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {browserTab === 'customization' && (
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <h4 className="font-bold text-xs mb-1">HPBD 1.5.0 Customization Queues</h4>
                        <p className="text-[10px] text-slate-500 mb-2">
                          Categorized automatically by product metadata and website fields.
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900">
                            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">23</span>
                            <span className="block text-[9px] text-purple-600 dark:text-purple-400 font-semibold">Laser Engraving</span>
                          </div>
                          <div className="p-2 bg-pink-50 dark:bg-pink-950/40 rounded-xl border border-pink-200 dark:border-pink-900">
                            <span className="text-sm font-bold text-pink-700 dark:text-pink-300">14</span>
                            <span className="block text-[9px] text-pink-600 dark:text-pink-400 font-semibold">Embroidery</span>
                          </div>
                          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900">
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">18</span>
                            <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-semibold">Nameplate (NP)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {browserTab === 'production' && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs">Production Task Workbench</h4>
                      <p className="text-[10px] text-slate-500">
                        Daily task allocation across technicians and quality assurance stations.
                      </p>
                      <div className="space-y-1.5 text-[10px]">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                          <span>Stethoscope Engraving Station #1</span>
                          <span className="font-bold text-emerald-600">Active (12 done)</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                          <span>Doctor Coat Embroidery Station #2</span>
                          <span className="font-bold text-blue-600">Active (8 done)</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                          <span>Acrylic / Brass Nameplate Unit</span>
                          <span className="font-bold text-amber-600">Batch Processing</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {browserTab === 'print' && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <h4 className="font-bold text-xs">Daily Print Center</h4>
                      <p className="text-[10px] text-slate-500">
                        Print thermal slips, packing invoices, and courier handover sheets.
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl font-bold text-[10px]">
                          Preview Daily Sheet
                        </button>
                        <button className="flex-1 py-1.5 bg-red-700 text-white rounded-xl font-bold text-[10px]">
                          Print Thermal Slips
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : selectedOrderId ? (
              /* ORDER DETAIL SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Detail Header */}
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span className="text-xs font-bold">Order #{selectedOrder?.number}</span>
                    <p className="text-[10px] text-slate-500">{selectedOrder?.created}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Detail Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Status & Financial Banner */}
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Current Status:</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          selectedOrder?.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : selectedOrder?.status === 'processing'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : selectedOrder?.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {selectedOrder?.status}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500">{t.grandTotal}</span>
                      <span className="text-base font-bold text-red-700 dark:text-red-400">
                        {selectedOrder?.total}
                      </span>
                    </div>

                    {/* Status update & Duplicate triggers */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => {
                          setTargetStatus(selectedOrder?.status || 'processing');
                          setStatusModalOpen(true);
                        }}
                        className="py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        {t.updateStatusBtn}
                      </button>

                      <button
                        onClick={() => selectedOrder && handleDuplicateOrder(selectedOrder)}
                        className="py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {t.duplicateOrder}
                      </button>
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-red-600" />
                      {t.customerSection}
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedOrder?.customer}
                      </p>
                      <a
                        href={`tel:${selectedOrder?.phone}`}
                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedOrder?.phone}</span>
                      </a>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Mail className="w-3 h-3" />
                        <span>{selectedOrder?.billingEmail}</span>
                      </p>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          {selectedOrder?.shippingAddress}
                        </span>
                      </div>
                      {selectedOrder?.customerNote && (
                        <p className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] p-2 rounded-lg italic">
                          "{selectedOrder.customerNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Line Items & Customization Inspector */}
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-red-600" />
                      {t.productsSection}
                    </h3>

                    <div className="space-y-3">
                      {selectedOrder?.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-xs font-semibold leading-tight">{item.name}</p>
                              <span className="text-[10px] text-slate-500">
                                Qty: {item.quantity} × {item.subtotal}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {item.total}
                            </span>
                          </div>

                          {/* Customization Details Badges */}
                          {item.customizations.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 block uppercase tracking-wider">
                                Customization Specs:
                              </span>
                              {item.customizations.map((c, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs shrink-0 ${
                                      c.category === 'engraving'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                        : c.category === 'embroidery'
                                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                                        : c.category === 'nameplate'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                    }`}
                                  >
                                    {c.label}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200">
                                    {c.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit & Activity Log */}
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-600" />
                      {t.activitySection}
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder?.activity.map((act) => (
                        <div
                          key={act.id}
                          className="text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                            <span className="font-semibold text-red-700 dark:text-red-400">
                              {act.author}
                            </span>
                            <span>{act.date}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-normal">
                            {act.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'dashboard' ? (
              /* DASHBOARD SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-xs">
                  <div>
                    <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.appName}
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'স্বাগতম' : 'Welcome'}, {mockUser.name.split(' ')[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab('create_order')}
                      className="px-2 py-1 bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Order</span>
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* Today Orders Hero Card */}
                  <div
                    onClick={() => {
                      setStatusFilter('all');
                      setActiveTab('orders');
                    }}
                    className="cursor-pointer bg-gradient-to-br from-red-600 to-red-800 text-white p-4 rounded-2xl shadow-sm shadow-red-700/20 relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <span className="text-[11px] font-medium text-red-100 uppercase tracking-wider block mb-1">
                        {t.todayOrders}
                      </span>
                      <div className="text-3xl font-extrabold tracking-tight">
                        {stats.todayOrders}
                      </div>
                      <p className="text-[10px] text-red-200 mt-1">
                        {t.totalOrders}: {stats.total}
                      </p>
                    </div>
                    <TrendingUp className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4" />
                  </div>

                  {/* Status Pipeline Grid */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Pipeline Status
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => {
                          setStatusFilter('pending');
                          setActiveTab('orders');
                        }}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 transition"
                      >
                        <div className="flex items-center justify-between text-amber-600 mb-1">
                          <span className="text-[10px] font-medium">{t.pending}</span>
                          <Clock className="w-3 h-3" />
                        </div>
                        <span className="text-lg font-bold text-amber-600">{stats.pending}</span>
                      </div>

                      <div
                        onClick={() => {
                          setStatusFilter('processing');
                          setActiveTab('orders');
                        }}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 transition"
                      >
                        <div className="flex items-center justify-between text-blue-600 mb-1">
                          <span className="text-[10px] font-medium">{t.processing}</span>
                          <RotateCw className="w-3 h-3" />
                        </div>
                        <span className="text-lg font-bold text-blue-600">{stats.processing}</span>
                      </div>

                      <div
                        onClick={() => {
                          setStatusFilter('completed');
                          setActiveTab('orders');
                        }}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition"
                      >
                        <div className="flex items-center justify-between text-emerald-600 mb-1">
                          <span className="text-[10px] font-medium">{t.completed}</span>
                          <CheckCircle className="w-3 h-3" />
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          {stats.completed}
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          setStatusFilter('on-hold');
                          setActiveTab('orders');
                        }}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-400 transition"
                      >
                        <div className="flex items-center justify-between text-orange-600 mb-1">
                          <span className="text-[10px] font-medium">{t.onHold}</span>
                          <Layers className="w-3 h-3" />
                        </div>
                        <span className="text-lg font-bold text-orange-600">{stats.onHold}</span>
                      </div>
                    </div>
                  </div>

                  {/* HPBD Operations 1.5.0 Workstation Queues */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Workstation Queues (HPBD 1.5.0)
                      </h3>
                      <button
                        onClick={() => {
                          setBrowserTab('customization');
                          setActiveTab('browser');
                        }}
                        className="text-[10px] text-red-600 font-semibold hover:underline"
                      >
                        Workbench →
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div
                        onClick={() => {
                          setCustomizedOnly(true);
                          setActiveTab('orders');
                        }}
                        className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-xs cursor-pointer hover:border-purple-400 transition"
                      >
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">23</span>
                        <span className="block text-[9px] text-purple-600 dark:text-purple-400 font-semibold truncate">Engraving</span>
                      </div>
                      <div
                        onClick={() => {
                          setCustomizedOnly(true);
                          setActiveTab('orders');
                        }}
                        className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-pink-200 dark:border-pink-900/60 shadow-xs cursor-pointer hover:border-pink-400 transition"
                      >
                        <span className="text-sm font-bold text-pink-700 dark:text-pink-300">14</span>
                        <span className="block text-[9px] text-pink-600 dark:text-pink-400 font-semibold truncate">Embroidery</span>
                      </div>
                      <div
                        onClick={() => {
                          setCustomizedOnly(true);
                          setActiveTab('orders');
                        }}
                        className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs cursor-pointer hover:border-amber-400 transition"
                      >
                        <span className="text-sm font-bold text-amber-700 dark:text-amber-300">18</span>
                        <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-semibold truncate">Nameplate</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.recentOrders}
                      </h3>
                      <button
                        onClick={() => {
                          setStatusFilter('all');
                          setActiveTab('orders');
                        }}
                        className="text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                      >
                        {t.viewAll}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {orders.slice(0, 3).map((order) => (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrderId(order.id)}
                          className="cursor-pointer bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 transition"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              #{order.number} · {order.customer}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs capitalize ${
                                order.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{order.phone}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {order.total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'orders' ? (
              /* ORDERS LIST SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Search Bar */}
                <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  {/* Filter Badges Horizontal Scroll */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                    {[
                      { key: 'all', label: t.all },
                      { key: 'pending', label: t.pending },
                      { key: 'processing', label: t.processing },
                      { key: 'completed', label: t.completed },
                      { key: 'on-hold', label: t.onHold },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        className={`px-2 py-1 rounded-full font-medium whitespace-nowrap transition ${
                          statusFilter === f.key
                            ? 'bg-red-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}

                    <button
                      onClick={() => setCustomizedOnly(!customizedOnly)}
                      className={`px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 transition ${
                        customizedOnly
                          ? 'bg-purple-700 text-white'
                          : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {t.customized}
                    </button>
                  </div>
                </div>

                {/* Orders Scrollable List */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      {t.noOrdersFound}
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="cursor-pointer bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-400 transition"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-red-700 dark:text-red-400">
                            #{order.number}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs capitalize ${
                              order.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : order.status === 'processing'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {order.customer}
                        </p>

                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>{order.phone}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {order.total}
                          </span>
                        </div>

                        {/* Customization Chips */}
                        {order.badges.hasCustomization && (
                          <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            {order.badges.engraving && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                ★ {t.engraving}
                              </span>
                            )}
                            {order.badges.embroidery && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300">
                                ★ {t.embroidery}
                              </span>
                            )}
                            {order.badges.nameplate && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                ★ {t.nameplate}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* SETTINGS SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">Settings</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-2">
                      {t.settingsLanguage}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setLanguage('bn')}
                        className={`py-1.5 text-xs font-medium rounded-xl border transition ${
                          language === 'bn'
                            ? 'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-700 dark:text-red-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        বাংলা (Bengali)
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`py-1.5 text-xs font-medium rounded-xl border transition ${
                          language === 'en'
                            ? 'bg-red-50 dark:bg-red-950/60 border-red-600 text-red-700 dark:text-red-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Active WordPress Session
                    </span>
                    <p className="font-mono text-[10px] text-slate-500 truncate">{siteUrl}</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      User: {mockUser.name} ({mockUser.username})
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Keystore Encrypted (AES256-GCM)</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-1 text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">App Build</p>
                    <p>Version: 1.3.0 (Build 3)</p>
                    <p>Compile SDK: 35 (Android 15)</p>
                    <p>Min SDK: 26 (Android 8.0)</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsAuthenticated(false);
                      setSelectedOrderId(null);
                    }}
                    className="w-full py-2.5 border border-red-300 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.logout}
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Navigation Bar */}
            {isAuthenticated && (
              <div className="h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 flex justify-around items-center z-10 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setActiveTab('dashboard');
                  }}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition ${
                    activeTab === 'dashboard' && !selectedOrderId
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setActiveTab('orders');
                  }}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition ${
                    activeTab === 'orders' || selectedOrderId
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </button>

                {/* Create Order FAB */}
                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setActiveTab('create_order');
                  }}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition ${
                    activeTab === 'create_order'
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className="w-7 h-7 -mt-2 bg-red-700 text-white rounded-full flex items-center justify-center shadow-md">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>New Order</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setActiveTab('browser');
                  }}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition ${
                    activeTab === 'browser'
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Browser</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedOrderId(null);
                    setActiveTab('settings');
                  }}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-medium transition ${
                    activeTab === 'settings' && !selectedOrderId
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            )}

            {/* Success Toast */}
            {successToast && (
              <div className="absolute top-12 left-4 right-4 bg-emerald-600 text-white text-xs font-medium py-2 px-3 rounded-xl shadow-lg flex items-center gap-2 z-40 animate-fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Consequential Status Update Dialog Modal */}
            {statusModalOpen && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {t.confirmStatus}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Transition Order #{selectedOrder?.number} to:
                  </p>

                  <div className="space-y-1.5">
                    {selectedOrder?.allowedStatuses.map((st) => (
                      <label
                        key={st.key}
                        className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <input
                          type="radio"
                          name="targetStatus"
                          value={st.key}
                          checked={targetStatus === st.key}
                          onChange={(e) => setTargetStatus(e.target.value)}
                          className="accent-red-600"
                        />
                        <span className="capitalize font-medium">{st.label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-slate-500 block mb-1">
                      Audit Note (recorded in order history):
                    </label>
                    <textarea
                      value={auditNote}
                      onChange={(e) => setAuditNote(e.target.value)}
                      placeholder={t.auditNotePlaceholder}
                      rows={2}
                      className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setStatusModalOpen(false)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={handleUpdateStatus}
                      disabled={isUpdatingStatus}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-700 hover:bg-red-800 text-white flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isUpdatingStatus ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        t.confirmBtn
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Gesture Pill Bar */}
          <div className="h-4 bg-white dark:bg-slate-900 flex justify-center items-center pb-1">
            <div className="w-24 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
