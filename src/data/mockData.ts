import { OrderDetail, DashboardStats, AuthUser } from '../types';

export interface ProductCatalogItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  formattedPrice: string;
  category: string;
  stockStatus: string;
  imageUrl?: string;
  customizationTypes: ('engraving' | 'embroidery' | 'nameplate')[];
}

export const mockUser: AuthUser = {
  id: 14,
  username: 'hpbd_operator',
  name: 'Md. Kayeas Ahmed',
  email: 'mdkayeasahmed@gmail.com',
  roles: ['shop_manager', 'hpbd_operations_manager'],
  permissions: {
    readOrders: true,
    updateOrderStatus: true,
    manageSettings: true,
  },
};

export const mockStats: DashboardStats = {
  total: 1428,
  todayOrders: 18,
  pending: 6,
  processing: 14,
  completed: 1380,
  cancelled: 12,
  onHold: 5,
  customizedOrders: 11,
};

export const mockProducts: ProductCatalogItem[] = [
  {
    id: 501,
    name: '3M Littmann Classic III Stethoscope - Black Edition (Laser Ready)',
    sku: 'LIT-CL3-BLK',
    price: 11500,
    formattedPrice: '৳ 11,500',
    category: 'Stethoscopes',
    stockStatus: 'instock',
    customizationTypes: ['engraving'],
  },
  {
    id: 502,
    name: '3M Littmann Cardiology IV Diagnostic Stethoscope - Smoke Finish',
    sku: 'LIT-CARD4-SMK',
    price: 19800,
    formattedPrice: '৳ 19,800',
    category: 'Stethoscopes',
    stockStatus: 'instock',
    customizationTypes: ['engraving'],
  },
  {
    id: 503,
    name: 'HPBD Signature Breathable Scrub Set (Unisex Navy Blue)',
    sku: 'HPBD-SCRUB-NAVY',
    price: 2900,
    formattedPrice: '৳ 2,900',
    category: 'Apparel',
    stockStatus: 'instock',
    customizationTypes: ['embroidery'],
  },
  {
    id: 504,
    name: 'HPBD Executive Anti-Wrinkle Doctor Lab Coat (Pure White Twill)',
    sku: 'HPBD-COAT-EXEC',
    price: 3400,
    formattedPrice: '৳ 3,400',
    category: 'Apparel',
    stockStatus: 'instock',
    customizationTypes: ['embroidery'],
  },
  {
    id: 505,
    name: 'HPBD Deluxe Brass & Polished Mahogany Doctor Chamber Nameplate (8×3")',
    sku: 'HPBD-NP-BRASS',
    price: 3300,
    formattedPrice: '৳ 3,300',
    category: 'Chamber Accessories',
    stockStatus: 'instock',
    customizationTypes: ['nameplate'],
  },
  {
    id: 506,
    name: 'ADC Adscope 603 Clinician Stethoscope - Tactical Edition',
    sku: 'ADC-603-TAC',
    price: 6800,
    formattedPrice: '৳ 6,800',
    category: 'Stethoscopes',
    stockStatus: 'instock',
    customizationTypes: ['engraving'],
  },
];

export const mockOrders: OrderDetail[] = [
  {
    id: 10842,
    number: '10842',
    status: 'processing',
    customer: 'Dr. Rafiqul Islam',
    phone: '+8801711223344',
    email: 'dr.rafiqul@dmc.edu.bd',
    billingEmail: 'dr.rafiqul@dmc.edu.bd',
    billingPhone: '+8801711223344',
    billingCity: 'Dhaka',
    shippingAddress: 'Flat 4B, House 24, Road 7, Dhanmondi, Dhaka-1205, Bangladesh',
    customerNote: 'Please ensure crisp laser engraving on stethoscope bell.',
    paymentMethod: 'bKash / Nagad Mobile Banking (Verified)',
    shippingMethod: 'Steadfast Courier - Express Delivery',
    shippingTotal: '৳ 120',
    discountTotal: '৳ 200',
    total: '৳ 14,320',
    orderTotal: '৳ 14,320',
    created: '2026-10-25 14:15',
    fulfillment: 'Engraving Station',
    customization: [
      'Engraving: Dr. Rafiqul Islam, FCPS (Cardiology)',
      'Embroidery: Dhaka Medical College Hospital',
      'Size: Large (42)',
      'Color: Royal Navy Blue',
    ],
    badges: {
      hasCustomization: true,
      engraving: true,
      embroidery: true,
      nameplate: false,
    },
    allowedStatuses: [
      { key: 'pending', label: 'Pending Payment' },
      { key: 'processing', label: 'Processing' },
      { key: 'on-hold', label: 'On Hold' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
    ],
    items: [
      {
        id: 401,
        name: '3M Littmann Classic III Stethoscope - Black Edition',
        quantity: 1,
        subtotal: '৳ 11,500',
        total: '৳ 11,500',
        sku: 'LIT-CL3-BLK',
        customizations: [
          {
            label: 'Laser Engraving Name',
            value: 'Dr. Rafiqul Islam, FCPS',
            category: 'engraving',
          },
          {
            label: 'Font Style',
            value: 'Monotype Corsiva Italic',
            category: 'general',
          },
          {
            label: 'Engraving Position',
            value: 'Stainless Steel Chestpiece Bell',
            category: 'general',
          },
        ],
      },
      {
        id: 402,
        name: 'HPBD Signature Doctor Scrub Set (Unisex Breathable)',
        quantity: 1,
        subtotal: '৳ 2,900',
        total: '৳ 2,900',
        sku: 'HPBD-SCRUB-NAVY-L',
        customizations: [
          {
            label: 'Embroidery Line 1',
            value: 'Dr. Rafiqul Islam',
            category: 'embroidery',
          },
          {
            label: 'Embroidery Line 2',
            value: 'Department of Cardiology',
            category: 'embroidery',
          },
          {
            label: 'Thread Color',
            value: 'Golden Silk #D4AF37',
            category: 'general',
          },
          {
            label: 'Size',
            value: 'L (Chest 42, Waist 34)',
            category: 'general',
          },
        ],
      },
    ],
    activity: [
      {
        id: 91,
        date: '2026-10-25 15:30',
        author: 'Md. Kayeas Ahmed (#14)',
        content: 'Status updated from pending to processing via HPBD Operations Android app. Note: Stethoscope sent to fiber laser engraving station.',
        customerNote: false,
      },
      {
        id: 90,
        date: '2026-10-25 14:18',
        author: 'System',
        content: 'bKash Merchant Payment confirmed. Transaction ID: 9K83LA719Q.',
        customerNote: true,
      },
      {
        id: 89,
        date: '2026-10-25 14:15',
        author: 'Customer',
        content: 'Order created via Health Point BD WooCommerce storefront.',
        customerNote: false,
      },
    ],
  },
  {
    id: 10841,
    number: '10841',
    status: 'pending',
    customer: 'Dr. Farhana Yasmin',
    phone: '+8801823998877',
    email: 'farhana.dr@bsmmu.edu.bd',
    billingEmail: 'farhana.dr@bsmmu.edu.bd',
    billingPhone: '+8801823998877',
    billingCity: 'Chittagong',
    shippingAddress: 'Doctor\'s Quarter, Block C, Chittagong Medical College, Nasirabad, Chattogram',
    customerNote: 'Need urgent delivery before Friday seminar.',
    paymentMethod: 'Cash on Delivery (COD)',
    shippingMethod: 'Pathao Courier - Out of Dhaka',
    shippingTotal: '৳ 150',
    total: '৳ 3,450',
    orderTotal: '৳ 3,450',
    created: '2026-10-25 13:40',
    fulfillment: 'Awaiting Call Confirmation',
    customization: [
      'Nameplate: Dr. Farhana Yasmin, MBBS, MS (Surgery)',
      'Metal Finish: Brushed Brass Gold',
    ],
    badges: {
      hasCustomization: true,
      engraving: false,
      embroidery: false,
      nameplate: true,
    },
    allowedStatuses: [
      { key: 'pending', label: 'Pending Payment' },
      { key: 'processing', label: 'Processing' },
      { key: 'on-hold', label: 'On Hold' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
    ],
    items: [
      {
        id: 403,
        name: 'HPBD Deluxe Acrylic & Brass Chamber Nameplate (8×3 inch)',
        quantity: 1,
        subtotal: '৳ 3,300',
        total: '৳ 3,300',
        sku: 'HPBD-NP-BRASS',
        customizations: [
          {
            label: 'Nameplate Name',
            value: 'Dr. Farhana Yasmin',
            category: 'nameplate',
          },
          {
            label: 'Degrees & Specialty',
            value: 'MBBS, BCS (Health), MS (General Surgery)',
            category: 'nameplate',
          },
          {
            label: 'Base Stand',
            value: 'Mahogany Polished Wooden Base',
            category: 'general',
          },
        ],
      },
    ],
    activity: [
      {
        id: 88,
        date: '2026-10-25 13:42',
        author: 'System',
        content: 'Order placed via WooCommerce. Payment pending verification.',
        customerNote: false,
      },
    ],
  },
  {
    id: 10840,
    number: '10840',
    status: 'completed',
    customer: 'Prof. Dr. Anisur Rahman',
    phone: '+8801912345678',
    email: 'anis.rahman@birdem.org.bd',
    billingEmail: 'anis.rahman@birdem.org.bd',
    billingPhone: '+8801912345678',
    billingCity: 'Dhaka',
    shippingAddress: 'BIRDEM General Hospital, Room 512, Shahbag, Dhaka',
    customerNote: 'Deliver to hospital chamber during office hours.',
    paymentMethod: 'Direct Bank Transfer / Card',
    shippingMethod: 'Express Rider Delivery',
    shippingTotal: '৳ 80',
    total: '৳ 6,880',
    orderTotal: '৳ 6,880',
    created: '2026-10-24 11:20',
    fulfillment: 'Delivered & Signed',
    customization: [
      'Embroidery: Prof. Dr. Anisur Rahman, Endocrinologist',
      'Size: XL (44)',
    ],
    badges: {
      hasCustomization: true,
      engraving: false,
      embroidery: true,
      nameplate: false,
    },
    allowedStatuses: [
      { key: 'completed', label: 'Completed' },
      { key: 'processing', label: 'Processing' },
    ],
    items: [
      {
        id: 404,
        name: 'HPBD Executive Doctor Lab Coat (Twill Anti-Wrinkle)',
        quantity: 2,
        subtotal: '৳ 3,400',
        total: '৳ 6,800',
        sku: 'HPBD-COAT-EXEC-XL',
        customizations: [
          {
            label: 'Embroidery Line 1',
            value: 'Prof. Dr. Anisur Rahman',
            category: 'embroidery',
          },
          {
            label: 'Embroidery Line 2',
            value: 'Professor & Head of Endocrinology, BIRDEM',
            category: 'embroidery',
          },
          {
            label: 'Size',
            value: 'XL (44)',
            category: 'general',
          },
        ],
      },
    ],
    activity: [
      {
        id: 87,
        date: '2026-10-25 11:00',
        author: 'Rider Rahim (#22)',
        content: 'Delivered to BIRDEM chamber. Customer received and signed acknowledgment.',
        customerNote: true,
      },
      {
        id: 86,
        date: '2026-10-24 16:30',
        author: 'Md. Kayeas Ahmed (#14)',
        content: 'Status updated from processing to completed via HPBD Operations Android app.',
        customerNote: false,
      },
    ],
  },
  {
    id: 10839,
    number: '10839',
    status: 'on-hold',
    customer: 'Dr. Tanvir Hossain',
    phone: '+8801678112233',
    email: 'tanvir.doc@gmail.com',
    billingEmail: 'tanvir.doc@gmail.com',
    billingPhone: '+8801678112233',
    billingCity: 'Sylhet',
    shippingAddress: 'House 12, Upashahar Block B, Sylhet Sadar, Sylhet',
    customerNote: 'Spell name as Dr. Tanvir Hossain (Titu)',
    paymentMethod: 'bKash Manual Send Money',
    shippingMethod: 'Steadfast Courier',
    shippingTotal: '৳ 140',
    total: '৳ 8,240',
    orderTotal: '৳ 8,240',
    created: '2026-10-24 09:10',
    fulfillment: 'Awaiting Spelling Confirmation',
    customization: [
      'Engraving: Dr. Tanvir Hossain (Titu)',
      'Product: Littmann Classic III Burgundy',
    ],
    badges: {
      hasCustomization: true,
      engraving: true,
      embroidery: false,
      nameplate: false,
    },
    allowedStatuses: [
      { key: 'pending', label: 'Pending Payment' },
      { key: 'processing', label: 'Processing' },
      { key: 'on-hold', label: 'On Hold' },
      { key: 'completed', label: 'Completed' },
      { key: 'cancelled', label: 'Cancelled' },
    ],
    items: [
      {
        id: 405,
        name: '3M Littmann Classic III Stethoscope - Burgundy Mirror Finish',
        quantity: 1,
        subtotal: '৳ 8,100',
        total: '৳ 8,100',
        sku: 'LIT-CL3-BUR-MIR',
        customizations: [
          {
            label: 'Laser Engraving Name',
            value: 'Dr. Tanvir Hossain (Titu)',
            category: 'engraving',
          },
          {
            label: 'Engraving Note',
            value: 'Confirmation needed if nickname is wanted in parentheses',
            category: 'general',
          },
        ],
      },
    ],
    activity: [
      {
        id: 85,
        date: '2026-10-24 10:15',
        author: 'Staff Nahid (#18)',
        content: 'Placed on hold to call customer and verify if "(Titu)" should be laser engraved or only full medical council name.',
        customerNote: false,
      },
    ],
  },
];
