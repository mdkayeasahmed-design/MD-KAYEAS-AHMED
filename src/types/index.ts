export type AppLanguage = 'bn' | 'en';

export interface CustomizationField {
  label: string;
  value: string;
  category: 'engraving' | 'embroidery' | 'nameplate' | 'general';
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  subtotal: string;
  total: string;
  sku?: string;
  imageUrl?: string;
  customizations: CustomizationField[];
}

export interface ActivityNote {
  id: number;
  date: string;
  author: string;
  content: string;
  customerNote: boolean;
}

export interface OrderSummary {
  id: number;
  number: string;
  status: 'pending' | 'processing' | 'completed' | 'on-hold' | 'cancelled';
  customer: string;
  phone: string;
  email: string;
  total: string;
  created: string;
  fulfillment?: string;
  source?: string;
  priority?: string;
  opsState?: string;
  customization: string[];
  badges: {
    hasCustomization: boolean;
    engraving: boolean;
    embroidery: boolean;
    nameplate: boolean;
  };
}

export interface OrderDetail extends OrderSummary {
  billingEmail: string;
  billingPhone: string;
  billingCity: string;
  shippingAddress: string;
  customerNote?: string;
  paymentMethod: string;
  shippingMethod: string;
  shippingTotal: string;
  discountTotal?: string;
  orderTotal: string;
  items: OrderItem[];
  activity: ActivityNote[];
  allowedStatuses: { key: string; label: string }[];
}

export interface DashboardStats {
  total: number;
  todayOrders: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  onHold: number;
  customizedOrders: number;
}

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  permissions: {
    readOrders: boolean;
    updateOrderStatus: boolean;
    manageSettings: boolean;
  };
}
