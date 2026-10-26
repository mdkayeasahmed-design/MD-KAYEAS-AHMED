=== HPBD Operations Mobile API Bridge ===
Contributors: healthpointbd
Tags: woocommerce, mobile-api, hpbd-operations, rest-api, order-management
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.5.0
License: Proprietary
License URI: https://healthpointbd.com/

Authenticated, capability-checked REST endpoints for Health Point BD Native Android Operations App (v1.5.0) with Real Order Creation, Multi-item Catalog Search, and Production Queue Routing.

== Description ==

This plugin provides secure REST API endpoints connecting the native Android HPBD Operations app directly to your WordPress/WooCommerce installation.

It does NOT modify existing database tables, WooCommerce metadata, order statuses, or user roles. Declares full compatibility with WooCommerce High-Performance Order Storage (HPOS).

== Endpoints ==
* GET /wp-json/hpbd-mobile/v1/session - Authenticates user & checks capabilities ('hpbd_ops_access', 'hpbd_ops_manage')
* GET /wp-json/hpbd-mobile/v1/config - Retrieves supported order sources, production queues, and payment gateways
* GET /wp-json/hpbd-mobile/v1/production-queues - Real-time statistics across NP, Embroidery, and Laser Engraving workstations
* GET /wp-json/hpbd-mobile/v1/stats - Live dashboard statistics (Today's orders, pending, processing, completed)
* GET /wp-json/hpbd-mobile/v1/products - Search WooCommerce products & variations with stock status and prices
* GET /wp-json/hpbd-mobile/v1/orders - Paginated order list with search (order id, customer, phone, customization, queue)
* POST /wp-json/hpbd-mobile/v1/orders - REAL ORDER CREATION with line items, district/upazila, order source, priority, and customization fields (Engraving, Embroidery, Nameplate)
* GET /wp-json/hpbd-mobile/v1/orders/{id} - Full order details with Engraving, Embroidery, Nameplate, and notes
* PUT /wp-json/hpbd-mobile/v1/orders/{id} - Edit customer details, delivery address, and notes on an existing order
* POST /wp-json/hpbd-mobile/v1/orders/{id}/status - Consequential status transition with audit note logging
* GET /wp-json/hpbd-mobile/v1/reports/daily-sheet - Daily printable order summary
* GET /wp-json/hpbd-mobile/v1/staff-stats - Staff-wise activity metrics

== Security ==
* Enforces HTTPS.
* Uses WordPress Application Passwords for per-staff credentialing.
* Enforces server-side capability verification on every endpoint.
* Sliding-window rate limiting to prevent abuse.
* Idempotency protection (`X-Idempotency-Key`) preventing duplicate order creation on network retries.
* Audit logging writes directly to WooCommerce Order Notes.
