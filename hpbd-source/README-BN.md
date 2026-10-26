# HPBD Operations Android — Starter Project (Kotlin)

এটি Android Studio-তে খোলার উপযোগী starter source project, APK নয়। এটি HPBD Operations 1.3.1-এর বর্তমান WordPress/WooCommerce ডেটার সঙ্গে কাজ করার জন্য আলাদা REST bridge ব্যবহার করে। মূল plugin-এর order records, meta/customization fields, role/capabilities বা activity history পরিবর্তন করে না।

## বর্তমান starter-এ আছে
- Kotlin + Jetpack Compose Android app
- বাংলা/English UI toggle
- HTTPS URL + WordPress username + **Application Password** দিয়ে লগইন
- Order list/search, detail, customization text, WooCommerce order notes/activity
- Manager-capability থাকলেই order status update endpoint/UI
- EncryptedSharedPreferences-এ credential storage
- WordPress bridge REST routes

## গুরুত্বপূর্ণ সীমা
- এটি starter implementation; production release নয় এবং এখানে Android build/real-site integration test চালানো হয়নি।
- এই chat-এ দেওয়া ZIP-এর plugin source পরীক্ষা করে `hpbd_ops_access` এবং `hpbd_ops_manage` capability ব্যবহার করা হয়েছে। আপনার live WordPress-এ role/capability এবং WooCommerce order data যাচাই করে নিতে হবে।
- `wc_get_orders()`-এর সার্চ আচরণ WooCommerce সংস্করণ/ডেটা স্টোর অনুযায়ী পরীক্ষা করতে হবে। নাম/ফোন/অর্ডার নম্বর সার্চ production-এ প্রত্যেকটি আলাদাভাবে QA করুন।
- Android app-এ status update শুধু `hpbd_ops_manage` permission-এ উন্মুক্ত। বিদ্যমান plugin-এর delivery/production-specific workflow-গুলোর জন্য আলাদা endpoint যোগ করতে হবে; সাধারণ WooCommerce status update-কে সেই workflow-এর বিকল্প ধরে নেওয়া হয়নি।
- App Password WordPress user-এর permission-ই পায়; আলাদা permission system তৈরি করে না। প্রত্যেক স্টাফের আলাদা সীমিত WordPress account এবং আলাদা Application Password দিন। Admin password ব্যবহার করবেন না।

## সেটআপ
1. আগে সাইটের পূর্ণ backup নিন এবং staging site-এ পরীক্ষা করুন।
2. WordPress → Plugins → Add New Plugin → Upload Plugin-এ মূল `HPBD-Operations-v1.3.1-download-fix.zip`-এর মতো এই bridge PHP-কে ZIP করে upload করবেন না; bridge ফাইলটি আলাদা plugin folder `hpbd-mobile-bridge`-এ রেখে ZIP করুন, তারপর upload/activate করুন। মূল HPBD Operations plugin অপরিবর্তিত রাখুন।
3. WordPress-এ সংশ্লিষ্ট স্টাফের জন্য আলাদা Application Password তৈরি করুন (Users → Profile → Application Passwords)। HTTPS আবশ্যক।
4. Android Studio → Open → এই folder (`hpbd-android-starter`) নির্বাচন করুন। Android SDK 35 ও JDK 17 ইনস্টল করুন; Gradle sync করুন।
5. ফোনে চালাতে Run চাপুন। Login-এ site URL দিন, যেমন `https://healthpointbd.com/` (শেষে slash থাকলে ভালো), WordPress username ও Application Password দিন।
6. প্রথমে staging site-এ পরীক্ষা করুন: login, list, search, details, customization, activity, permission denied, status update, logout.

## Endpoint contract
- `GET /wp-json/hpbd-mobile/v1/session`
- `GET /wp-json/hpbd-mobile/v1/orders?q=&page=1`
- `GET /wp-json/hpbd-mobile/v1/orders/{id}`
- `POST /wp-json/hpbd-mobile/v1/orders/{id}/status` JSON `{ "status": "processing" }`

WordPress Application Password authentication Basic Auth header ব্যবহার করে। HTTPS ছাড়া অ্যাপ ইচ্ছাকৃতভাবে কাজ করবে না। Reverse proxy/WAF REST Basic authentication আটকে দিলে server-side configuration ঠিক করতে হবে; TLS verification বন্ধ করবেন না।

## Before production
- Search implementation: phone, customer name, order number, SKU/customization, pagination যাচাই
- Order visibility: প্রতিটি role-এ প্রত্যাশিত order scope যাচাই
- Audit trail: status update author/time ও notes যাচাই
- Rate limiting, server-side audit logs, token revocation, privacy policy
- Crash/error handling, offline state, accessibility, Bengali rendering
- Release signing, minification/proguard, Play policy and internal QA
