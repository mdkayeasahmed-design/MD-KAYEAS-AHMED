import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RotateCw,
  Globe,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import { mockUser, mockStats, mockOrders, mockProducts } from '../data/mockData';

export const ApiTester: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('/orders_create');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [baseUrl, setBaseUrl] = useState<string>('https://healthpointbd.com');
  const [username, setUsername] = useState<string>('hpbd_operator');
  const [appPassword, setAppPassword] = useState<string>('xxxx xxxx xxxx xxxx');
  const [queryParam, setQueryParam] = useState<string>('q=stethoscope&limit=5');
  const [postBody, setPostBody] = useState<string>(
    JSON.stringify(
      {
        customer_name: 'Dr. Kayeas Ahmed',
        phone: '+8801711223344',
        email: 'dr.kayeas@healthpointbd.com',
        address: 'Flat 4B, House 24, Road 7, Dhanmondi',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        status: 'processing',
        payment_method: 'cod',
        delivery_charge: 120,
        items: [
          {
            product_id: 501,
            quantity: 1,
            unit_price: 11500,
            customizations: [
              { label: 'Laser Engraving Name', value: 'Dr. Kayeas Ahmed, MBBS', category: 'engraving' },
              { label: 'Engraving Position', value: 'Stainless Steel Bell', category: 'general' }
            ]
          }
        ],
        customer_note: 'Deliver during daytime please.',
        internal_note: 'Verified with doctor over phone.'
      },
      null,
      2
    )
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseData, setResponseData] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleEndpointSelect = (val: string) => {
    setEndpoint(val);
    if (val === '/orders_create') {
      setMethod('POST');
      setPostBody(
        JSON.stringify(
          {
            customer_name: 'Dr. Kayeas Ahmed',
            phone: '+8801711223344',
            email: 'dr.kayeas@healthpointbd.com',
            address: 'Flat 4B, House 24, Road 7, Dhanmondi',
            district: 'Dhaka',
            upazila: 'Dhanmondi',
            status: 'processing',
            delivery_charge: 120,
            items: [
              {
                product_id: 501,
                quantity: 1,
                unit_price: 11500,
                customizations: [
                  { label: 'Laser Engraving Name', value: 'Dr. Kayeas Ahmed, MBBS', category: 'engraving' }
                ]
              }
            ]
          },
          null,
          2
        )
      );
    } else if (val === '/products') {
      setMethod('GET');
      setQueryParam('q=Littmann&limit=10');
    } else if (val === '/session' || val === '/stats' || val === '/orders' || val === '/config' || val === '/production-queues') {
      setMethod('GET');
      setQueryParam('');
    } else if (val === '/daily_sheet') {
      setMethod('GET');
      setQueryParam('date=today&status=all');
    } else if (val.includes('/status')) {
      setMethod('POST');
      setPostBody(JSON.stringify({ status: 'completed', note: 'Order fulfilled and shipped' }, null, 2));
    }
  };

  const handleSend = () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData('');

    setTimeout(() => {
      setLoading(false);
      setResponseStatus(200);
      setResponseHeaders({
        'content-type': 'application/json; charset=UTF-8',
        'x-hpbd-bridge-version': '1.5.0',
        'x-hpbd-ops-core': '1.5.0',
        'x-ratelimit-remaining': '119',
      });

      if (endpoint === '/orders_create') {
        const newOrderId = 10843;
        setResponseData(
          JSON.stringify(
            {
              success: true,
              message: `Order #${newOrderId} created successfully in WooCommerce.`,
              order_id: newOrderId,
              order: {
                id: newOrderId,
                number: `${newOrderId}`,
                status: 'processing',
                customer: 'Dr. Kayeas Ahmed',
                phone: '+8801711223344',
                total: '৳ 11,620',
                created: new Date().toISOString().slice(0, 16).replace('T', ' '),
                fulfillment: 'Laser Engraving Queue',
                customization: ['Laser Engraving Name: Dr. Kayeas Ahmed, MBBS'],
                badges: {
                  hasCustomization: true,
                  engraving: true,
                  embroidery: false,
                  nameplate: false,
                },
              },
            },
            null,
            2
          )
        );
      } else if (endpoint === '/products') {
        setResponseData(
          JSON.stringify(
            {
              products: mockProducts,
              total: mockProducts.length,
              pages: 1,
              page: 1,
            },
            null,
            2
          )
        );
      } else if (endpoint === '/daily_sheet') {
        setResponseData(
          JSON.stringify(
            {
              date: '2026-10-25',
              total_orders: mockOrders.length,
              orders: mockOrders.map((o) => ({
                id: o.id,
                number: o.number,
                status: o.status,
                customer: o.customer,
                phone: o.phone,
                city: o.billingCity,
                total: o.total,
                customizations: o.customization,
                items_count: o.items.length,
              })),
            },
            null,
            2
          )
        );
      } else if (endpoint === '/session') {
        setResponseData(
          JSON.stringify(
            {
              user: mockUser,
              permissions: {
                ...mockUser.permissions,
                create_orders: true,
                edit_orders: true,
              },
              server_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              bridge_version: '1.5.0',
              hpbd_version: '1.5.0',
              supported_sources: ['Messenger', 'Facebook Comment', 'WhatsApp', 'Website', 'Manual'],
              production_queues: ['NP', 'Embroidery', 'Engraving', 'review'],
            },
            null,
            2
          )
        );
      } else if (endpoint === '/config') {
        setResponseData(
          JSON.stringify(
            {
              sources: ['Messenger', 'Facebook Comment', 'WhatsApp', 'Website', 'Manual'],
              statuses: ['Pending', 'Confirmed', 'Customization', 'Ready to pack', 'Packed', 'Delivered', 'Issue', 'Cancelled'],
              production_queues: [
                { key: 'NP', label: 'Nameplate (চেম্বার নেমপ্লেট)' },
                { key: 'Embroidery', label: 'Embroidery (এপ্রোন এমব্রয়ডারি)' },
                { key: 'Engraving', label: 'Laser Engraving (লেজার খোদাই)' },
                { key: 'review', label: 'Unmapped / Review' },
              ],
              standard_delivery_fees: {
                inside_dhaka: 120,
                outside_dhaka: 150,
              },
            },
            null,
            2
          )
        );
      } else if (endpoint === '/production-queues') {
        setResponseData(
          JSON.stringify(
            {
              NP: { count: 18, orders: [10840, 10839, 10836] },
              Embroidery: { count: 14, orders: [10842, 10837] },
              Engraving: { count: 23, orders: [10843, 10841, 10838] },
              total_customized: 55,
            },
            null,
            2
          )
        );
      } else if (endpoint === '/stats') {
        setResponseData(JSON.stringify(mockStats, null, 2));
      } else {
        setResponseData(
          JSON.stringify(
            {
              orders: mockOrders.map((o) => ({
                id: o.id,
                number: o.number,
                status: o.status,
                customer: o.customer,
                phone: o.phone,
                total: o.total,
                created: o.created,
                customization: o.customization,
                badges: o.badges,
              })),
              total: mockOrders.length,
              page: 1,
              pages: 1,
            },
            null,
            2
          )
        );
      }
    }, 450);
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(responseData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Top Config Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Live REST API Bridge Inspector & Sandbox (v1.3.0)
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Active: POST /orders &amp; GET /products
          </span>
        </div>

        {/* URL and Method Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
            {method}
          </span>

          <select
            value={endpoint}
            onChange={(e) => handleEndpointSelect(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none font-mono flex-1 min-w-[240px]"
          >
            <option value="/orders_create">POST /orders (Real Order Creation + Customization Specs)</option>
            <option value="/products">GET /products (Search WooCommerce Catalog & Variations)</option>
            <option value="/orders">GET /orders (Paginated Orders & Multi-Field Search)</option>
            <option value="/config">GET /config (HPBD 1.5.0 Sources, States & Queues)</option>
            <option value="/production-queues">GET /production-queues (NP, Embroidery, Engraving Stats)</option>
            <option value="/orders/10842/status">POST /orders/{'{id}'}/status (Status Update with Audit Note)</option>
            <option value="/daily_sheet">GET /reports/daily-sheet (Printable Order Sheet Summary)</option>
            <option value="/session">GET /session (Validate User & HPBD Capabilities)</option>
            <option value="/stats">GET /stats (Aggregate Dashboard Metrics)</option>
          </select>

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            {loading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Execute Request</span>
          </button>
        </div>

        {/* Credentials row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-500 font-medium block">Site HTTPS URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium block">WordPress Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium block">Application Password</label>
            <input
              type="password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Request Body / Params & Response Pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Request Config */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 overflow-y-auto">
          {method === 'GET' ? (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Query Parameters
              </label>
              <input
                type="text"
                value={queryParam}
                onChange={(e) => setQueryParam(e.target.value)}
                placeholder="q=stethoscope&limit=10"
                className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                JSON Request Body
              </label>
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                rows={9}
                className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono leading-tight"
              />
            </div>
          )}

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Idempotency &amp; Auth Header
            </span>
            <code className="text-[10px] font-mono text-slate-500 break-all block">
              X-Idempotency-Key: {crypto.randomUUID()}
            </code>
            <code className="text-[10px] font-mono text-slate-500 break-all block">
              Authorization: Basic {btoa(`${username}:${appPassword}`)}
            </code>
          </div>
        </div>

        {/* Right Side: Response View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Server Response</span>
              {responseStatus !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    responseStatus === 200
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  HTTP {responseStatus} OK
                </span>
              )}
            </div>

            {responseData && (
              <button
                onClick={copyResponse}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1 border border-slate-700"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-red-500" />
                <span>Executing request against WordPress REST API…</span>
              </div>
            ) : responseData ? (
              <pre className="text-emerald-400">
                <code>{responseData}</code>
              </pre>
            ) : (
              <div className="text-slate-600 flex flex-col items-center justify-center h-full space-y-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p>Click "Execute Request" above to test the REST API response.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
