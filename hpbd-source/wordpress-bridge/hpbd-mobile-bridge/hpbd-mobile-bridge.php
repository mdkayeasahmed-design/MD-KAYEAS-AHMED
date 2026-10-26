<?php
/**
 * Plugin Name: HPBD Operations Mobile API Bridge
 * Description: Adds authenticated, capability-checked REST endpoints for the HPBD Operations Android app.
 * Version: 0.1.0
 * Requires Plugins: hpbd-operations, woocommerce
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;

final class HPBD_Mobile_Bridge {
    const NS = 'hpbd-mobile/v1';
    public static function boot() { add_action('rest_api_init', [__CLASS__, 'routes']); }
    public static function routes() {
        register_rest_route(self::NS, '/session', ['methods'=>'GET','callback'=>[__CLASS__,'session'],'permission_callback'=>[__CLASS__,'can_access']]);
        register_rest_route(self::NS, '/orders', ['methods'=>'GET','callback'=>[__CLASS__,'orders'],'permission_callback'=>[__CLASS__,'can_access'],'args'=>['q'=>['sanitize_callback'=>'sanitize_text_field'],'page'=>['default'=>1,'sanitize_callback'=>'absint']]]);
        register_rest_route(self::NS, '/orders/(?P<id>\d+)', ['methods'=>'GET','callback'=>[__CLASS__,'order'],'permission_callback'=>[__CLASS__,'can_access']]);
        register_rest_route(self::NS, '/orders/(?P<id>\d+)/status', ['methods'=>'POST','callback'=>[__CLASS__,'status'],'permission_callback'=>[__CLASS__,'can_manage'],'args'=>['status'=>['required'=>true,'sanitize_callback'=>'sanitize_key']]]);
    }
    public static function can_access() {
        return is_user_logged_in() && current_user_can('read') && current_user_can('hpbd_ops_access') && function_exists('wc_get_order');
    }
    public static function can_manage() { return self::can_access() && current_user_can('hpbd_ops_manage'); }
    public static function session() {
        $u = wp_get_current_user();
        return rest_ensure_response(['user'=>['id'=>$u->ID,'name'=>$u->display_name,'roles'=>array_values($u->roles)],'permissions'=>['read_orders'=>true,'update_order_status'=>current_user_can('hpbd_ops_manage'),'manage_settings'=>current_user_can('hpbd_ops_manage')]]);
    }
    private static function summary($o) {
        $custom = [];
        foreach ($o->get_items() as $item) {
            $all = $item->get_meta_data();
            foreach ($all as $meta) {
                $key = (string)$meta->key; $value = $meta->value;
                if (strpos($key, '_') === 0 || $value === '' || $value === null) continue;
                if (is_scalar($value)) $custom[] = sanitize_text_field($key . ': ' . (string)$value);
                elseif (is_array($value)) $custom[] = sanitize_text_field($key . ': ' . wp_json_encode($value, JSON_UNESCAPED_UNICODE));
            }
        }
        foreach (['_hpbd_fulfillment'=>'Fulfillment','_hpbd_ops_state'=>'Operations','_hpbd_created_by'=>'Created by'] as $key=>$label) {
            $v=$o->get_meta($key); if ($v !== '' && $v !== null) $custom[]=$label.': '.(string)$v;
        }
        return ['id'=>$o->get_id(),'number'=>(string)$o->get_order_number(),'status'=>$o->get_status(),'customer'=>$o->get_formatted_billing_full_name(),'phone'=>$o->get_billing_phone(),'total'=>wp_strip_all_tags($o->get_formatted_order_total()),'created'=>$o->get_date_created()?$o->get_date_created()->date_i18n('Y-m-d H:i'):'','fulfillment'=>(string)$o->get_meta('_hpbd_fulfillment'),'customization'=>array_values(array_unique($custom))];
    }
    public static function orders(WP_REST_Request $r) {
        $page=max(1,(int)$r->get_param('page')); $q=trim((string)$r->get_param('q'));
        $args=['type'=>'shop_order','limit'=>30,'page'=>$page,'paginate'=>true,'orderby'=>'date','order'=>'DESC','return'=>'objects'];
        if ($q !== '') {
            if (ctype_digit($q)) $args['include']=[(int)$q];
            else { $args['billing_phone']=$q; $args['search']='*'.esc_attr($q).'*'; }
        }
        $result=wc_get_orders($args); $items=[];
        foreach (($result->orders ?? []) as $o) $items[]=self::summary($o);
        return rest_ensure_response(['orders'=>$items,'total'=>(int)($result->total??count($items)),'page'=>$page,'pages'=>(int)($result->max_num_pages??1)]);
    }
    public static function order(WP_REST_Request $r) {
        $o=wc_get_order((int)$r['id']); if(!$o) return new WP_Error('hpbd_not_found','Order not found',['status'=>404]);
        $items=[];
        foreach($o->get_items() as $item) {
            $items[]=$item->get_name().' × '.$item->get_quantity();
            $custom=$item->get_meta('_hpbd_customization');
            if(is_string($custom)) { $decoded=json_decode($custom,true); if(is_array($decoded)) $custom=$decoded; }
            if(is_array($custom)) foreach($custom as $field) if(is_array($field)) { $label=(string)($field['label']??$field['key']??'Customization'); $value=$field['value']??''; if(is_scalar($value)&&trim((string)$value)!=='') $items[]=$label.': '.(string)$value; }
        }
        $notes=wc_get_order_notes(['order_id'=>$o->get_id(),'limit'=>50,'orderby'=>'date_created_gmt','order'=>'DESC']); $activity=[];
        foreach($notes as $n) $activity[]=['date'=>$n->date_created?$n->date_created->date_i18n('Y-m-d H:i'):'','author'=>(string)$n->added_by,'content'=>wp_strip_all_tags($n->content),'customerNote'=>(bool)$n->customer_note];
        $address=trim($o->get_formatted_shipping_address() ?: $o->get_formatted_billing_address());
        $statuses=[]; if(current_user_can('hpbd_ops_manage')) foreach(wc_get_order_statuses() as $key=>$label) $statuses[]=substr($key,3);
        return rest_ensure_response(['order'=>self::summary($o),'address'=>wp_strip_all_tags($address),'items'=>$items,'activity'=>$activity,'allowedStatuses'=>$statuses]);
    }
    public static function status(WP_REST_Request $r) {
        $o=wc_get_order((int)$r['id']); if(!$o) return new WP_Error('hpbd_not_found','Order not found',['status'=>404]);
        $status=sanitize_key((string)$r->get_param('status')); $allowed=array_map(static function($k){return substr($k,3);},array_keys(wc_get_order_statuses()));
        if(!in_array($status,$allowed,true)) return new WP_Error('hpbd_bad_status','Invalid order status',['status'=>400]);
        $before=$o->get_status(); $o->update_status($status,'Status updated via HPBD Operations Android app by user #'.get_current_user_id(),true);
        return rest_ensure_response(['message'=>'Order #'.$o->get_order_number().' updated from '.$before.' to '.$status.'.']);
    }
}
HPBD_Mobile_Bridge::boot();
