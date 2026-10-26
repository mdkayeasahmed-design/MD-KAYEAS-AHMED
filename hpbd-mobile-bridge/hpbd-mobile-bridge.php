<?php
/**
 * Plugin Name: HPBD Operations Mobile API Bridge
 * Plugin URI: https://healthpointbd.com/
 * Description: Production-ready authenticated REST API bridge connecting the HPBD Operations Android app to WooCommerce and the HPBD Operations core plugin (v1.5.0). Preserves existing tables, roles, and order customization fields. Supports real order creation, product search, customization specifications, and staff audit logs.
 * Version: 1.5.0
 * Author: Health Point BD Engineering
 * Text Domain: hpbd-mobile-bridge
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 */

defined('ABSPATH') || exit;

// Declare WooCommerce High-Performance Order Storage (HPOS) compatibility
add_action('before_woocommerce_init', function() {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
});

final class HPBD_Mobile_Bridge {

    const NS = 'hpbd-mobile/v1';
    const RATE_LIMIT_WINDOW = 60; // 60 seconds
    const RATE_LIMIT_MAX_REQUESTS = 120; // 120 requests per minute

    public static function boot() {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_action('init', [__CLASS__, 'ensure_capabilities']);
    }

    /**
     * Ensure capabilities exist if core HPBD plugin is active or for administrators
     */
    public static function ensure_capabilities() {
        $admin = get_role('administrator');
        if ($admin) {
            if (!$admin->has_cap('hpbd_ops_access')) $admin->add_cap('hpbd_ops_access');
            if (!$admin->has_cap('hpbd_ops_manage')) $admin->add_cap('hpbd_ops_manage');
        }
        $manager = get_role('shop_manager');
        if ($manager) {
            if (!$manager->has_cap('hpbd_ops_access')) $manager->add_cap('hpbd_ops_access');
            if (!$manager->has_cap('hpbd_ops_manage')) $manager->add_cap('hpbd_ops_manage');
        }
    }

    /**
     * Register versioned REST endpoints
     */
    public static function register_routes() {
        // GET /session - Verify credentials and return active user profile + capabilities
        register_rest_route(self::NS, '/session', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_session'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /config - Operations configuration, queues, and order sources
        register_rest_route(self::NS, '/config', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_config'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /production-queues - Real-time stats across NP, Embroidery, and Engraving
        register_rest_route(self::NS, '/production-queues', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_production_queues'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /stats - Aggregated dashboard metrics
        register_rest_route(self::NS, '/stats', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_stats'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /products - Search and retrieve WooCommerce products with variations and attributes
        register_rest_route(self::NS, '/products', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_products'],
            'permission_callback' => [__CLASS__, 'can_access'],
            'args' => [
                'q' => ['sanitize_callback' => 'sanitize_text_field', 'default' => ''],
                'category' => ['sanitize_callback' => 'sanitize_text_field', 'default' => ''],
                'limit' => ['sanitize_callback' => 'absint', 'default' => 30],
                'page' => ['sanitize_callback' => 'absint', 'default' => 1],
            ],
        ]);

        // GET /orders - Paginated order list with search and filter
        register_rest_route(self::NS, '/orders', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_orders'],
            'permission_callback' => [__CLASS__, 'can_access'],
            'args' => [
                'q' => ['sanitize_callback' => 'sanitize_text_field', 'default' => ''],
                'status' => ['sanitize_callback' => 'sanitize_key', 'default' => ''],
                'queue' => ['sanitize_callback' => 'sanitize_text_field', 'default' => ''],
                'page' => ['sanitize_callback' => 'absint', 'default' => 1],
                'limit' => ['sanitize_callback' => 'absint', 'default' => 20],
                'customized_only' => ['sanitize_callback' => 'rest_sanitize_boolean', 'default' => false],
            ],
        ]);

        // POST /orders - CREATE REAL WOOCOMMERCE ORDER
        register_rest_route(self::NS, '/orders', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'endpoint_create_order'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);

        // GET /orders/{id} - Full order details with customization and audit activity
        register_rest_route(self::NS, '/orders/(?P<id>\d+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_order'],
            'permission_callback' => [__CLASS__, 'can_access'],
            'args' => [
                'id' => ['validate_callback' => function($param) { return is_numeric($param); }],
            ],
        ]);

        // PUT /orders/{id} - EDIT EXISTING ORDER
        register_rest_route(self::NS, '/orders/(?P<id>\d+)', [
            'methods' => WP_REST_Server::EDITABLE,
            'callback' => [__CLASS__, 'endpoint_update_order'],
            'permission_callback' => [__CLASS__, 'can_manage'],
            'args' => [
                'id' => ['validate_callback' => function($param) { return is_numeric($param); }],
            ],
        ]);

        // POST /orders/{id}/status - Consequential order status update with audit logging
        register_rest_route(self::NS, '/orders/(?P<id>\d+)/status', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'endpoint_update_status'],
            'permission_callback' => [__CLASS__, 'can_manage'],
            'args' => [
                'id' => ['validate_callback' => function($param) { return is_numeric($param); }],
                'status' => [
                    'required' => true,
                    'sanitize_callback' => 'sanitize_key',
                    'validate_callback' => function($param) { return !empty($param); },
                ],
                'note' => ['sanitize_callback' => 'sanitize_textarea_field', 'default' => ''],
            ],
        ]);

        // GET /reports/daily-sheet - Printable daily order sheet data
        register_rest_route(self::NS, '/reports/daily-sheet', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_daily_sheet'],
            'permission_callback' => [__CLASS__, 'can_access'],
            'args' => [
                'date' => ['sanitize_callback' => 'sanitize_text_field', 'default' => 'today'],
                'status' => ['sanitize_callback' => 'sanitize_key', 'default' => 'all'],
            ],
        ]);

        // GET /staff-stats - Staff-wise activity and assignment counts
        register_rest_route(self::NS, '/staff-stats', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'endpoint_staff_stats'],
            'permission_callback' => [__CLASS__, 'can_access'],
        ]);
    }

    /**
     * Permission check: Requires HTTPS, authenticated user, and 'hpbd_ops_access'
     */
    public static function can_access() {
        if (!is_ssl() && (!defined('WP_ENVIRONMENT_TYPE') || WP_ENVIRONMENT_TYPE !== 'local')) {
            return new WP_Error('hpbd_insecure', 'HTTPS is strictly required for HPBD Operations Mobile API.', ['status' => 403]);
        }

        if (!is_user_logged_in()) {
            return new WP_Error('hpbd_unauthorized', 'Authentication required. Use a dedicated WordPress Application Password.', ['status' => 401]);
        }

        if (!function_exists('wc_get_orders')) {
            return new WP_Error('hpbd_no_woocommerce', 'WooCommerce is not active.', ['status' => 500]);
        }

        // Check rate limiting
        $rate_check = self::check_rate_limit(get_current_user_id());
        if (is_wp_error($rate_check)) {
            return $rate_check;
        }

        return current_user_can('hpbd_ops_access') || current_user_can('manage_woocommerce') || current_user_can('administrator');
    }

    /**
     * Permission check: Requires 'hpbd_ops_manage' for status updates and edits
     */
    public static function can_manage() {
        $base = self::can_access();
        if (is_wp_error($base) || $base !== true) {
            return $base;
        }
        return current_user_can('hpbd_ops_manage') || current_user_can('manage_woocommerce') || current_user_can('administrator');
    }

    /**
     * Simple sliding transient rate-limiter
     */
    private static function check_rate_limit($user_id) {
        $transient_key = 'hpbd_rl_' . $user_id;
        $reqs = (int) get_transient($transient_key);
        if ($reqs >= self::RATE_LIMIT_MAX_REQUESTS) {
            return new WP_Error('hpbd_rate_limit', 'Rate limit exceeded. Please wait a minute before making more requests.', ['status' => 429]);
        }
        set_transient($transient_key, $reqs + 1, self::RATE_LIMIT_WINDOW);
        return true;
    }

    /**
     * GET /session
     */
    public static function endpoint_session() {
        $u = wp_get_current_user();
        $can_manage = current_user_can('hpbd_ops_manage') || current_user_can('manage_woocommerce') || current_user_can('administrator');

        return rest_ensure_response([
            'user' => [
                'id' => $u->ID,
                'username' => $u->user_login,
                'name' => $u->display_name ?: $u->user_login,
                'email' => $u->user_email,
                'roles' => array_values($u->roles),
                'avatar' => get_avatar_url($u->ID, ['size' => 96]),
            ],
            'permissions' => [
                'read_orders' => true,
                'create_orders' => true,
                'update_order_status' => $can_manage,
                'edit_orders' => $can_manage,
                'manage_settings' => current_user_can('manage_options'),
            ],
            'server_time' => current_time('mysql'),
            'bridge_version' => '1.5.0',
            'hpbd_version' => defined('HPBD_OPS_VERSION') ? HPBD_OPS_VERSION : '1.5.0',
            'supported_sources' => ['Messenger', 'Facebook Comment', 'WhatsApp', 'Website', 'Manual'],
            'production_queues' => ['NP', 'Embroidery', 'Engraving', 'review'],
        ]);
    }

    /**
     * GET /config - Operations configuration, queues, and order sources
     */
    public static function endpoint_config() {
        $gateways = [];
        if (function_exists('WC') && WC()->payment_gateways()) {
            foreach (WC()->payment_gateways()->payment_gateways() as $id => $gateway) {
                if ($gateway->enabled === 'yes') {
                    $gateways[] = [
                        'id' => $id,
                        'title' => $gateway->get_title(),
                        'description' => $gateway->get_description(),
                    ];
                }
            }
        }

        $states = function_exists('WC') && WC()->countries ? WC()->countries->get_states('BD') : [];

        return rest_ensure_response([
            'sources' => ['Messenger', 'Facebook Comment', 'WhatsApp', 'Website', 'Manual'],
            'statuses' => ['Pending', 'Confirmed', 'Customization', 'Ready to pack', 'Packed', 'Delivered', 'Issue', 'Cancelled'],
            'production_queues' => [
                ['key' => 'NP', 'label' => 'Nameplate (চেম্বার নেমপ্লেট)'],
                ['key' => 'Embroidery', 'label' => 'Embroidery (এপ্রোন এমব্রয়ডারি)'],
                ['key' => 'Engraving', 'label' => 'Laser Engraving (লেজার খোদাই)'],
                ['key' => 'review', 'label' => 'Unmapped / Review'],
            ],
            'payment_gateways' => $gateways,
            'districts' => $states ?: [
                'BD-01' => 'Dhaka', 'BD-02' => 'Chittagong', 'BD-03' => 'Sylhet', 'BD-04' => 'Rajshahi',
                'BD-05' => 'Khulna', 'BD-06' => 'Barisal', 'BD-07' => 'Rangpur', 'BD-08' => 'Mymensingh',
            ],
            'standard_delivery_fees' => [
                'inside_dhaka' => 120,
                'outside_dhaka' => 150,
            ],
        ]);
    }

    /**
     * GET /production-queues - Real-time statistics across production queues
     */
    public static function endpoint_production_queues() {
        $recent_orders = wc_get_orders([
            'limit' => 150,
            'status' => ['processing', 'pending', 'on-hold'],
            'return' => 'objects',
        ]);

        $queues = [
            'NP' => ['count' => 0, 'orders' => []],
            'Embroidery' => ['count' => 0, 'orders' => []],
            'Engraving' => ['count' => 0, 'orders' => []],
            'total_customized' => 0,
        ];

        foreach ($recent_orders as $order) {
            $has_custom = false;
            foreach ($order->get_items() as $item) {
                $customs = self::extract_item_customizations($item);
                if (!empty($customs)) {
                    $has_custom = true;
                    foreach ($customs as $c) {
                        $cat = $c['category'];
                        if ($cat === 'nameplate') {
                            $queues['NP']['count']++;
                            $queues['NP']['orders'][] = $order->get_id();
                        } elseif ($cat === 'embroidery') {
                            $queues['Embroidery']['count']++;
                            $queues['Embroidery']['orders'][] = $order->get_id();
                        } elseif ($cat === 'engraving') {
                            $queues['Engraving']['count']++;
                            $queues['Engraving']['orders'][] = $order->get_id();
                        }
                    }
                }
            }
            if ($has_custom) {
                $queues['total_customized']++;
            }
        }

        // Deduplicate order IDs in queue lists
        $queues['NP']['orders'] = array_values(array_unique($queues['NP']['orders']));
        $queues['Embroidery']['orders'] = array_values(array_unique($queues['Embroidery']['orders']));
        $queues['Engraving']['orders'] = array_values(array_unique($queues['Engraving']['orders']));

        return rest_ensure_response($queues);
    }

    /**
     * GET /stats
     */
    public static function endpoint_stats() {
        $counts = wc_get_order_statuses();
        $stats = [
            'total' => 0,
            'today_orders' => 0,
            'pending' => 0,
            'processing' => 0,
            'completed' => 0,
            'cancelled' => 0,
            'on_hold' => 0,
            'failed' => 0,
            'customized_orders' => 0,
        ];

        // Fetch WC status counts
        foreach (array_keys($counts) as $status_key) {
            $pure = substr($status_key, 3);
            $c = wc_orders_count($pure);
            $stats['total'] += $c;
            if (isset($stats[$pure])) {
                $stats[$pure] = $c;
            }
        }

        // Count today's orders
        $today_start = strtotime('today midnight');
        $today_orders = wc_get_orders([
            'limit' => -1,
            'date_created' => '>=' . $today_start,
            'return' => 'ids',
        ]);
        $stats['today_orders'] = count($today_orders);

        return rest_ensure_response($stats);
    }

    /**
     * GET /products
     */
    public static function endpoint_products(WP_REST_Request $r) {
        $q = trim((string)$r->get_param('q'));
        $category = trim((string)$r->get_param('category'));
        $limit = min(100, max(5, (int)$r->get_param('limit')));
        $page = max(1, (int)$r->get_param('page'));

        $args = [
            'status' => 'publish',
            'limit' => $limit,
            'page' => $page,
            'paginate' => true,
            'orderby' => 'date',
            'order' => 'DESC',
        ];

        if ($q !== '') {
            $args['s'] = $q;
        }

        if ($category !== '') {
            $args['category'] = [$category];
        }

        $query = wc_get_products($args);
        $products = [];

        foreach ($query->products as $p) {
            $image_id = $p->get_image_id();
            $image_url = $image_id ? wp_get_attachment_image_url($image_id, 'thumbnail') : '';

            $variations_data = [];
            if ($p->is_type('variable')) {
                $available_variations = $p->get_available_variations();
                foreach ($available_variations as $var) {
                    $variations_data[] = [
                        'variation_id' => $var['variation_id'],
                        'attributes' => $var['attributes'],
                        'price' => (float)$var['display_price'],
                        'formatted_price' => wp_strip_all_tags(wc_price($var['display_price'])),
                        'is_in_stock' => (bool)$var['is_in_stock'],
                        'sku' => $var['sku'],
                    ];
                }
            }

            $products[] = [
                'id' => $p->get_id(),
                'name' => $p->get_name(),
                'sku' => $p->get_sku(),
                'price' => (float)$p->get_price(),
                'regular_price' => (float)$p->get_regular_price(),
                'formatted_price' => wp_strip_all_tags(wc_price($p->get_price())),
                'stock_status' => $p->get_stock_status(),
                'manage_stock' => $p->get_manage_stock(),
                'stock_quantity' => $p->get_stock_quantity(),
                'image_url' => $image_url ?: '',
                'type' => $p->get_type(),
                'attributes' => $p->get_attributes(),
                'variations' => $variations_data,
            ];
        }

        return rest_ensure_response([
            'products' => $products,
            'total' => (int)$query->total,
            'pages' => (int)$query->max_num_pages,
            'page' => $page,
        ]);
    }

    /**
     * POST /orders - CREATE REAL WOOCOMMERCE ORDER
     */
    public static function endpoint_create_order(WP_REST_Request $r) {
        $user = wp_get_current_user();
        $params = $r->get_json_params() ?: $r->get_params();

        // Idempotency check: prevent duplicate submissions on network retries
        $idempotency_key = trim((string)($r->get_header('X-Idempotency-Key') ?: ($params['idempotency_key'] ?? '')));
        if (!empty($idempotency_key)) {
            $cached_order_id = get_transient('hpbd_idem_' . md5($idempotency_key));
            if ($cached_order_id) {
                $existing_order = wc_get_order($cached_order_id);
                if ($existing_order) {
                    return rest_ensure_response([
                        'success' => true,
                        'message' => "Order #{$existing_order->get_order_number()} retrieved (idempotent submission).",
                        'order_id' => $existing_order->get_id(),
                        'order' => self::normalize_order_summary($existing_order),
                        'idempotent' => true,
                    ]);
                }
            }
        }

        // Required customer parameters
        $customer_name = sanitize_text_field(trim((string)($params['customer_name'] ?? '')));
        $phone = sanitize_text_field(trim((string)($params['phone'] ?? '')));
        $email = sanitize_email(trim((string)($params['email'] ?? '')));
        $address = sanitize_textarea_field(trim((string)($params['address'] ?? '')));
        $district = sanitize_text_field(trim((string)($params['district'] ?? '')));
        $upazila = sanitize_text_field(trim((string)($params['upazila'] ?? '')));
        $status = sanitize_key(trim((string)($params['status'] ?? 'processing')));
        $customer_note = sanitize_textarea_field(trim((string)($params['customer_note'] ?? '')));
        $internal_note = sanitize_textarea_field(trim((string)($params['internal_note'] ?? '')));
        $delivery_charge = (float)($params['delivery_charge'] ?? 0);
        $discount_amount = (float)($params['discount'] ?? 0);
        $payment_method = sanitize_text_field(trim((string)($params['payment_method'] ?? 'cod')));
        $source = sanitize_text_field(trim((string)($params['source'] ?? 'Manual')));
        $priority = sanitize_text_field(trim((string)($params['priority'] ?? 'Normal')));

        // Validate source against 1.5.0 HPBD allowed sources
        $valid_sources = ['Messenger', 'Facebook Comment', 'WhatsApp', 'Website', 'Manual'];
        if (!in_array($source, $valid_sources, true)) {
            $source = 'Manual';
        }

        if (empty($customer_name)) {
            return new WP_Error('hpbd_missing_field', 'Customer name is required.', ['status' => 400]);
        }
        if (empty($phone)) {
            return new WP_Error('hpbd_missing_field', 'Phone number is required.', ['status' => 400]);
        }
        if (empty($address)) {
            return new WP_Error('hpbd_missing_field', 'Full address is required.', ['status' => 400]);
        }
        if (empty($district)) {
            return new WP_Error('hpbd_missing_field', 'District is required.', ['status' => 400]);
        }

        $items = $params['items'] ?? [];
        if (!is_array($items) || empty($items)) {
            return new WP_Error('hpbd_missing_items', 'Order must contain at least one product item.', ['status' => 400]);
        }

        // Create WooCommerce Order
        $order = wc_create_order([
            'status' => $status ?: 'processing',
            'created_via' => 'HPBD Operations Android App',
        ]);

        if (is_wp_error($order) || !$order) {
            return new WP_Error('hpbd_order_failed', 'Failed to initialize WooCommerce order.', ['status' => 500]);
        }

        // Split name into first and last name
        $name_parts = explode(' ', $customer_name, 2);
        $first_name = $name_parts[0];
        $last_name = $name_parts[1] ?? '';

        // Set Addresses
        $full_address_line = $address;
        if (!empty($upazila)) {
            $full_address_line .= ', ' . $upazila;
        }

        $address_fields = [
            'first_name' => $first_name,
            'last_name' => $last_name,
            'phone' => $phone,
            'email' => $email,
            'address_1' => $full_address_line,
            'city' => $district,
            'state' => $district,
            'country' => 'BD',
        ];

        $order->set_address($address_fields, 'billing');
        $order->set_address($address_fields, 'shipping');

        // Customer note
        if (!empty($customer_note)) {
            $order->set_customer_note($customer_note);
        }

        // Payment method
        if ($payment_method === 'bkash') {
            $order->set_payment_method('bkash');
            $order->set_payment_method_title('bKash Mobile Payment');
        } elseif ($payment_method === 'bank') {
            $order->set_payment_method('bacs');
            $order->set_payment_method_title('Direct Bank Transfer');
        } else {
            $order->set_payment_method('cod');
            $order->set_payment_method_title('Cash on Delivery');
        }

        // Add Product Line Items with Customization Specs
        $has_customizations = false;
        $order_production_queues = [];

        foreach ($items as $item_data) {
            $product_id = absint($item_data['product_id'] ?? 0);
            $variation_id = absint($item_data['variation_id'] ?? 0);
            $quantity = max(1, absint($item_data['quantity'] ?? 1));
            $customizations = $item_data['customizations'] ?? [];

            $target_id = $variation_id ?: $product_id;
            $product = wc_get_product($target_id);

            if (!$product) {
                continue;
            }

            // Custom price override if supplied
            $args = [];
            if (isset($item_data['unit_price']) && is_numeric($item_data['unit_price'])) {
                $unit_price = (float)$item_data['unit_price'];
                $args['subtotal'] = $unit_price * $quantity;
                $args['total'] = $unit_price * $quantity;
            }

            $item_id = $order->add_product($product, $quantity, $args);

            if ($item_id && is_array($customizations) && !empty($customizations)) {
                $has_customizations = true;
                $formatted_customs = [];

                foreach ($customizations as $c) {
                    $c_label = sanitize_text_field($c['label'] ?? 'Customization');
                    $c_value = sanitize_text_field($c['value'] ?? '');
                    if ($c_value !== '') {
                        $cat = self::detect_custom_category($c_label);
                        $queue_name = $cat === 'engraving' ? 'Engraving' : ($cat === 'embroidery' ? 'Embroidery' : ($cat === 'nameplate' ? 'NP' : ''));
                        if ($queue_name) {
                            $order_production_queues[$queue_name] = true;
                            // Add staff queue instruction key for HPBD 1.5.0 Workbench compatibility
                            wc_add_order_item_meta($item_id, 'hpbd_staff_' . $queue_name, $c_value);
                        }

                        // Store explicit item meta matching original keys
                        wc_add_order_item_meta($item_id, $c_label, $c_value);

                        $formatted_customs[] = [
                            'key' => sanitize_key($c_label),
                            'label' => $c_label,
                            'value' => $c_value,
                            'type' => 'text',
                            'meta_key' => $c_label,
                            'production' => $queue_name,
                            'required' => false,
                        ];
                    }
                }

                // Also store unified HPBD bundle for native plugin backward-compatibility
                if (!empty($formatted_customs)) {
                    wc_add_order_item_meta($item_id, '_hpbd_customization', wp_json_encode($formatted_customs, JSON_UNESCAPED_UNICODE));
                }
            }
        }

        // Add Shipping charge if provided
        if ($delivery_charge > 0) {
            $shipping_item = new WC_Order_Item_Shipping();
            $shipping_item->set_method_title('Standard Delivery (' . $district . ')');
            $shipping_item->set_method_id('flat_rate');
            $shipping_item->set_total($delivery_charge);
            $order->add_item($shipping_item);
        }

        // Apply discount if provided
        if ($discount_amount > 0) {
            $order->set_discount_total($discount_amount);
        }

        // Calculate Totals
        $order->calculate_totals();

        // Operational Metadata for HPBD core plugin v1.5.0
        $fulfillment_status = $has_customizations ? 'Production Queue' : 'Ready to Pack';
        $order->update_meta_data('_hpbd_fulfillment', $fulfillment_status);
        $order->update_meta_data('_hpbd_source', $source);
        $order->update_meta_data('hpbd_source', $source);
        $order->update_meta_data('_hpbd_priority', $priority);
        $order->update_meta_data('_hpbd_state', 'Pending');
        $order->update_meta_data('_hpbd_ops_state', $has_customizations ? 'Customization' : 'Pending');
        $order->update_meta_data('_hpbd_ops_created_by', $user->ID);
        $order->update_meta_data('_hpbd_ops_created_by_name', $user->display_name ?: $user->user_login);
        $order->update_meta_data('_hpbd_ops_created_time', current_time('mysql'));
        $order->update_meta_data('_hpbd_district', $district);
        if (!empty($upazila)) {
            $order->update_meta_data('_hpbd_upazila', $upazila);
        }
        if (!empty($order_production_queues)) {
            $order->update_meta_data('_hpbd_production_queues', array_keys($order_production_queues));
        }

        // Initial Audit History Note
        $creator_name = $user->display_name ?: $user->user_login;
        $audit_msg = "Order #{$order->get_order_number()} created via HPBD Operations Native Android App by {$creator_name} (#{$user->ID}) [Source: {$source}, Priority: {$priority}].";
        if (!empty($internal_note)) {
            $audit_msg .= " Internal Note: {$internal_note}";
        }
        $order->add_order_note($audit_msg, false, true);

        $order->save();

        // Cache Idempotency Key for 10 minutes
        if (!empty($idempotency_key)) {
            set_transient('hpbd_idem_' . md5($idempotency_key), $order->get_id(), 600);
        }

        return rest_ensure_response([
            'success' => true,
            'message' => "Order #{$order->get_order_number()} created successfully in WooCommerce.",
            'order_id' => $order->get_id(),
            'order' => self::normalize_order_summary($order),
        ]);
    }

    /**
     * PUT /orders/{id} - EDIT EXISTING ORDER
     */
    public static function endpoint_update_order(WP_REST_Request $r) {
        $order_id = (int)$r['id'];
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('hpbd_not_found', "Order #{$order_id} not found.", ['status' => 404]);
        }

        $params = $r->get_json_params() ?: $r->get_params();
        $user = wp_get_current_user();

        // Update addresses if supplied
        if (!empty($params['customer_name'])) {
            $parts = explode(' ', sanitize_text_field($params['customer_name']), 2);
            $order->set_billing_first_name($parts[0]);
            $order->set_billing_last_name($parts[1] ?? '');
            $order->set_shipping_first_name($parts[0]);
            $order->set_shipping_last_name($parts[1] ?? '');
        }
        if (!empty($params['phone'])) {
            $order->set_billing_phone(sanitize_text_field($params['phone']));
        }
        if (!empty($params['address'])) {
            $order->set_billing_address_1(sanitize_textarea_field($params['address']));
            $order->set_shipping_address_1(sanitize_textarea_field($params['address']));
        }
        if (!empty($params['district'])) {
            $order->set_billing_city(sanitize_text_field($params['district']));
            $order->set_shipping_city(sanitize_text_field($params['district']));
        }
        if (!empty($params['customer_note'])) {
            $order->set_customer_note(sanitize_textarea_field($params['customer_note']));
        }

        $audit_note = "Order details modified via HPBD Operations Android App by {$user->display_name} (#{$user->ID}).";
        if (!empty($params['edit_note'])) {
            $audit_note .= " Note: " . sanitize_textarea_field($params['edit_note']);
        }
        $order->add_order_note($audit_note, false, true);
        $order->save();

        return rest_ensure_response([
            'success' => true,
            'message' => "Order #{$order->get_order_number()} updated successfully.",
            'order' => self::normalize_order_summary($order),
        ]);
    }

    /**
     * GET /orders
     */
    public static function endpoint_orders(WP_REST_Request $r) {
        $page = max(1, (int)$r->get_param('page'));
        $limit = min(100, max(5, (int)$r->get_param('limit')));
        $q = trim((string)$r->get_param('q'));
        $status = trim((string)$r->get_param('status'));

        $args = [
            'type' => 'shop_order',
            'limit' => $limit,
            'page' => $page,
            'paginate' => true,
            'orderby' => 'date',
            'order' => 'DESC',
            'return' => 'objects',
        ];

        if (!empty($status) && $status !== 'all') {
            $args['status'] = $status;
        }

        if ($q !== '') {
            if (ctype_digit($q)) {
                $args['include'] = [(int)$q];
            } else {
                $args['search'] = '*' . esc_attr($q) . '*';
            }
        }

        $result = wc_get_orders($args);
        $items = [];

        foreach (($result->orders ?? []) as $order) {
            $items[] = self::normalize_order_summary($order);
        }

        return rest_ensure_response([
            'orders' => $items,
            'total' => (int)($result->total ?? count($items)),
            'page' => $page,
            'pages' => (int)($result->max_num_pages ?? 1),
            'limit' => $limit,
        ]);
    }

    /**
     * GET /orders/{id}
     */
    public static function endpoint_order(WP_REST_Request $r) {
        $order_id = (int)$r['id'];
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('hpbd_not_found', "Order #{$order_id} was not found.", ['status' => 404]);
        }

        $summary = self::normalize_order_summary($order);
        $items = [];
        $has_customization = false;

        foreach ($order->get_items() as $item_id => $item) {
            $customizations = self::extract_item_customizations($item);
            if (!empty($customizations)) {
                $has_customization = true;
            }

            $product = $item->get_product();
            $image_url = $product ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : '';

            $items[] = [
                'id' => $item_id,
                'name' => $item->get_name(),
                'quantity' => (int)$item->get_quantity(),
                'subtotal' => wp_strip_all_tags(wc_price($item->get_subtotal())),
                'total' => wp_strip_all_tags(wc_price($item->get_total())),
                'sku' => $product ? $product->get_sku() : '',
                'image_url' => $image_url ?: '',
                'customizations' => $customizations,
            ];
        }

        $notes = wc_get_order_notes([
            'order_id' => $order->get_id(),
            'limit' => 50,
            'orderby' => 'date_created_gmt',
            'order' => 'DESC',
        ]);

        $activity = [];
        foreach ($notes as $n) {
            $activity[] = [
                'id' => $n->id,
                'date' => $n->date_created ? $n->date_created->date_i18n('Y-m-d H:i') : '',
                'author' => (string)($n->added_by ?: 'System'),
                'content' => wp_strip_all_tags($n->content),
                'customer_note' => (bool)$n->customer_note,
            ];
        }

        $shipping = $order->get_formatted_shipping_address();
        $billing = $order->get_formatted_billing_address();
        $full_address = wp_strip_all_tags(trim($shipping ?: $billing));

        $allowed_statuses = [];
        if (current_user_can('hpbd_ops_manage') || current_user_can('manage_woocommerce') || current_user_can('administrator')) {
            $all_wc_statuses = wc_get_order_statuses();
            foreach ($all_wc_statuses as $key => $label) {
                $pure = substr($key, 3);
                $allowed_statuses[] = [
                    'key' => $pure,
                    'label' => $label,
                ];
            }
        }

        return rest_ensure_response([
            'order' => $summary,
            'customer_name' => $order->get_formatted_billing_full_name(),
            'billing_email' => $order->get_billing_email(),
            'billing_phone' => $order->get_billing_phone(),
            'billing_city' => $order->get_billing_city(),
            'billing_state' => $order->get_billing_state(),
            'shipping_address' => $full_address,
            'customer_note' => wp_strip_all_tags($order->get_customer_note()),
            'payment_method' => $order->get_payment_method_title(),
            'shipping_method' => $order->get_shipping_method(),
            'shipping_total' => wp_strip_all_tags(wc_price($order->get_shipping_total())),
            'discount_total' => wp_strip_all_tags(wc_price($order->get_discount_total())),
            'order_total' => wp_strip_all_tags($order->get_formatted_order_total()),
            'items' => $items,
            'activity' => $activity,
            'allowed_statuses' => $allowed_statuses,
            'has_customization' => $has_customization || !empty($summary['customization']),
        ]);
    }

    /**
     * POST /orders/{id}/status
     */
    public static function endpoint_update_status(WP_REST_Request $r) {
        $order_id = (int)$r['id'];
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('hpbd_not_found', "Order #{$order_id} was not found.", ['status' => 404]);
        }

        $new_status = sanitize_key((string)$r->get_param('status'));
        $extra_note = sanitize_textarea_field((string)$r->get_param('note'));

        $valid_keys = array_map(function($k) { return substr($k, 3); }, array_keys(wc_get_order_statuses()));
        if (!in_array($new_status, $valid_keys, true)) {
            return new WP_Error('hpbd_invalid_status', "Status '{$new_status}' is not a valid WooCommerce order status.", ['status' => 400]);
        }

        $current_status = $order->get_status();
        if ($current_status === $new_status) {
            return rest_ensure_response([
                'success' => true,
                'message' => "Order #{$order->get_order_number()} is already in '{$new_status}' status.",
                'order' => self::normalize_order_summary($order),
            ]);
        }

        $user = wp_get_current_user();
        $actor_info = $user->display_name ? "{$user->display_name} (#{$user->ID})" : "User #{$user->ID}";

        $audit_note = "Status changed from '{$current_status}' to '{$new_status}' via HPBD Operations Android App by {$actor_info}.";
        if (!empty($extra_note)) {
            $audit_note .= " Note: {$extra_note}";
        }

        $order->update_status($new_status, $audit_note, true);
        $order->update_meta_data('_hpbd_ops_last_action_by', $user->ID);
        $order->update_meta_data('_hpbd_ops_last_action_time', current_time('mysql'));
        $order->save();

        return rest_ensure_response([
            'success' => true,
            'message' => "Order #{$order->get_order_number()} successfully updated from '{$current_status}' to '{$new_status}'.",
            'order' => self::normalize_order_summary($order),
        ]);
    }

    /**
     * GET /reports/daily-sheet - Printable daily order sheet
     */
    public static function endpoint_daily_sheet(WP_REST_Request $r) {
        $date_param = trim((string)$r->get_param('date'));
        $status_param = trim((string)$r->get_param('status'));

        $date_start = $date_param === 'today' ? strtotime('today midnight') : strtotime($date_param . ' midnight');
        $date_end = $date_start + 86400;

        $args = [
            'limit' => 200,
            'date_created' => '>=' . $date_start,
            'return' => 'objects',
        ];

        if ($status_param && $status_param !== 'all') {
            $args['status'] = $status_param;
        }

        $orders = wc_get_orders($args);
        $sheet_rows = [];

        foreach ($orders as $o) {
            $sheet_rows[] = [
                'id' => $o->get_id(),
                'number' => $o->get_order_number(),
                'status' => $o->get_status(),
                'customer' => $o->get_formatted_billing_full_name(),
                'phone' => $o->get_billing_phone(),
                'city' => $o->get_billing_city(),
                'total' => wp_strip_all_tags($o->get_formatted_order_total()),
                'customizations' => self::normalize_order_summary($o)['customization'],
                'items_count' => $o->get_item_count(),
            ];
        }

        return rest_ensure_response([
            'date' => date('Y-m-d', $date_start),
            'total_orders' => count($sheet_rows),
            'orders' => $sheet_rows,
        ]);
    }

    /**
     * GET /staff-stats - Staff-wise activity
     */
    public static function endpoint_staff_stats() {
        global $wpdb;
        $users = get_users(['role__in' => ['administrator', 'shop_manager', 'editor']]);
        $stats = [];

        foreach ($users as $u) {
            $created_count = (int) $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = '_hpbd_ops_created_by' AND meta_value = %d",
                $u->ID
            ));

            $stats[] = [
                'id' => $u->ID,
                'name' => $u->display_name ?: $u->user_login,
                'email' => $u->user_email,
                'orders_created' => $created_count,
            ];
        }

        return rest_ensure_response(['staff' => $stats]);
    }

    /**
     * Normalize order summary for card listings
     */
    private static function normalize_order_summary($order) {
        $customization_labels = [];
        $has_engraving = false;
        $has_embroidery = false;
        $has_nameplate = false;

        foreach ($order->get_items() as $item) {
            $customs = self::extract_item_customizations($item);
            foreach ($customs as $c) {
                $customization_labels[] = $c['label'] . ': ' . $c['value'];
                if ($c['category'] === 'engraving') $has_engraving = true;
                if ($c['category'] === 'embroidery') $has_embroidery = true;
                if ($c['category'] === 'nameplate') $has_nameplate = true;
            }
        }

        // Order-level HPBD meta
        foreach ([
            '_hpbd_fulfillment' => 'Fulfillment',
            '_hpbd_ops_state' => 'Operations',
            '_hpbd_production_station' => 'Station',
            '_hpbd_courier_tracking' => 'Tracking',
            '_hpbd_district' => 'District',
            '_hpbd_upazila' => 'Upazila',
        ] as $k => $label) {
            $v = $order->get_meta($k);
            if ($v !== '' && $v !== null && !is_array($v)) {
                $customization_labels[] = $label . ': ' . (string)$v;
            }
        }

        return [
            'id' => $order->get_id(),
            'number' => (string)$order->get_order_number(),
            'status' => $order->get_status(),
            'customer' => $order->get_formatted_billing_full_name() ?: 'Guest Customer',
            'phone' => (string)$order->get_billing_phone(),
            'email' => (string)$order->get_billing_email(),
            'total' => wp_strip_all_tags($order->get_formatted_order_total()),
            'created' => $order->get_date_created() ? $order->get_date_created()->date_i18n('Y-m-d H:i') : '',
            'fulfillment' => (string)$order->get_meta('_hpbd_fulfillment'),
            'customization' => array_values(array_unique($customization_labels)),
            'badges' => [
                'has_customization' => !empty($customization_labels),
                'engraving' => $has_engraving,
                'embroidery' => $has_embroidery,
                'nameplate' => $has_nameplate,
            ],
        ];
    }

    /**
     * Extract all customization fields from line item meta
     */
    private static function extract_item_customizations($item) {
        $extracted = [];
        $meta_data = $item->get_meta_data();

        foreach ($meta_data as $meta) {
            $raw_key = (string)$meta->key;
            $val = $meta->value;

            // Handle HPBD dedicated JSON bundle
            if ($raw_key === '_hpbd_customization') {
                if (is_string($val)) {
                    $decoded = json_decode($val, true);
                    if (is_array($decoded)) $val = $decoded;
                }
                if (is_array($val)) {
                    foreach ($val as $sub) {
                        if (is_array($sub) && !empty($sub['value'])) {
                            $label = $sub['label'] ?? $sub['key'] ?? 'Customization';
                            $extracted[] = [
                                'label' => sanitize_text_field($label),
                                'value' => sanitize_text_field((string)$sub['value']),
                                'category' => self::detect_custom_category($label),
                            ];
                        }
                    }
                }
                continue;
            }

            // Skip internal WC meta starting with _
            if (strpos($raw_key, '_') === 0 || $val === '' || $val === null) {
                continue;
            }

            // Normal custom line meta
            if (is_scalar($val)) {
                $val_str = trim((string)$val);
                if ($val_str !== '') {
                    $extracted[] = [
                        'label' => sanitize_text_field($raw_key),
                        'value' => sanitize_text_field($val_str),
                        'category' => self::detect_custom_category($raw_key),
                    ];
                }
            } elseif (is_array($val)) {
                $extracted[] = [
                    'label' => sanitize_text_field($raw_key),
                    'value' => wp_json_encode($val, JSON_UNESCAPED_UNICODE),
                    'category' => self::detect_custom_category($raw_key),
                ];
            }
        }

        return $extracted;
    }

    /**
     * Detect custom category: engraving, embroidery, nameplate, or general
     */
    private static function detect_custom_category($label) {
        $l = mb_strtolower($label, 'UTF-8');
        if (strpos($l, 'engrav') !== false || strpos($l, 'খোদাই') !== false || strpos($l, 'laser') !== false) {
            return 'engraving';
        }
        if (strpos($l, 'embroi') !== false || strpos($l, 'এমব্রয়ডারি') !== false || strpos($l, 'সেলাই') !== false) {
            return 'embroidery';
        }
        if (strpos($l, 'nameplate') !== false || strpos($l, 'নেমপ্লেট') !== false || strpos($l, 'plate') !== false) {
            return 'nameplate';
        }
        return 'general';
    }
}

HPBD_Mobile_Bridge::boot();
