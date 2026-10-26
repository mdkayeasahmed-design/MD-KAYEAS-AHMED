package com.healthpointbd.operations

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.healthpointbd.operations.data.*
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState)
        val store = CredentialStore(this)
        setContent { MaterialTheme(colorScheme = lightColorScheme(primary = androidx.compose.ui.graphics.Color(0xFFB91C1C))) { HpbdApp(store) } }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable private fun HpbdApp(store: CredentialStore) {
    var loggedIn by remember { mutableStateOf(false) }
    var api by remember { mutableStateOf<HpbdApi?>(null) }
    var user by remember { mutableStateOf<ApiUser?>(null) }
    var selected by remember { mutableStateOf<Int?>(null) }
    var language by remember { mutableStateOf("bn") }
    val scope = rememberCoroutineScope()
    var error by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var rows by remember { mutableStateOf<List<OrderSummary>>(emptyList()) }
    var query by remember { mutableStateOf("") }
    var detail by remember { mutableStateOf<OrderDetailResponse?>(null) }
    fun loadOrders(a: HpbdApi, q: String = query) { scope.launch { busy=true; error=""; try { rows=a.orders(q).orders } catch(e: Exception) { error=e.message ?: "Request failed" } finally { busy=false } } }
    if (!loggedIn) {
        LoginScreen(store, language, { language=it }, { b,u,p ->
            scope.launch { busy=true; error=""; try { store.save(b,u,p); val a=ApiFactory(store).create(); val s=a.session(); api=a; user=s.user; loggedIn=true; loadOrders(a) } catch(e:Exception) { store.clear(); error=e.message ?: "Login failed. Check credentials and API bridge." } finally { busy=false } }
        }, busy, error)
    } else {
        Scaffold(topBar={ TopAppBar(title={ Text("HPBD Operations") }, navigationIcon={ if(selected!=null) IconButton(onClick={selected=null;detail=null}) { Icon(Icons.Default.ArrowBack,"Back") } }, actions={ TextButton(onClick={language=if(language=="bn")"en" else "bn"}) { Text(if(language=="bn")"EN" else "বাংলা") }; IconButton(onClick={ api?.let { loadOrders(it) } }) { Icon(Icons.Default.Refresh,"Refresh") } }) }) { pad ->
            Column(Modifier.padding(pad).fillMaxSize().padding(16.dp)) {
                Text("${if(language=="bn")"স্বাগতম" else "Welcome"}, ${user?.name.orEmpty()}", style=MaterialTheme.typography.titleMedium)
                if(selected==null) {
                    OutlinedTextField(query,{query=it},label={Text(if(language=="bn")"অর্ডার / ফোন / কাস্টমার সার্চ" else "Search order / phone / customer")},modifier=Modifier.fillMaxWidth(),singleLine=true)
                    Button(onClick={api?.let { loadOrders(it,query) }},modifier=Modifier.fillMaxWidth().padding(top=8.dp)) { Text(if(language=="bn")"সার্চ" else "Search") }
                    if(busy) LinearProgressIndicator(Modifier.fillMaxWidth())
                    LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)) { items(rows) { order -> Card(Modifier.fillMaxWidth().clickable { selected=order.id; scope.launch { busy=true; try { detail=api?.order(order.id) } catch(e:Exception){error=e.message?:"Failed"} finally {busy=false} } }) { Column(Modifier.padding(14.dp)) { Text("#${order.number} · ${order.customer}",style=MaterialTheme.typography.titleMedium); Text("${order.phone} · ${order.status}"); Text("${order.total} · ${order.fulfillment}") } } } }
                } else {
                    val d=detail
                    if(busy && d==null) CircularProgressIndicator()
                    if(d!=null) {
                        Text("#${d.order.number} — ${d.order.customer}",style=MaterialTheme.typography.titleLarge)
                        Text("${d.order.phone}\n${d.address}\n${d.order.status} · ${d.order.total}")
                        Spacer(Modifier.height(10.dp)); Text(if(language=="bn")"পণ্য ও কাস্টমাইজেশন" else "Products & customization",style=MaterialTheme.typography.titleMedium)
                        d.items.forEach { Text("• $it") }; d.order.customization.forEach { Text("• $it") }
                        var status by remember(d.order.id) { mutableStateOf(d.order.status) }
                        if(d.allowedStatuses.isNotEmpty()) { Text(if(language=="bn")"স্ট্যাটাস আপডেট" else "Update status"); d.allowedStatuses.forEach { s -> FilterChip(selected=status==s,onClick={status=s},label={Text(s)}) }; Button(onClick={scope.launch { busy=true; try { api?.updateStatus(d.order.id,StatusRequest(status)); detail=api?.order(d.order.id); loadOrders(api!!) } catch(e:Exception){error=e.message?:"Update failed"} finally {busy=false} }},enabled=status!=d.order.status) { Text(if(language=="bn")"সংরক্ষণ" else "Save status") } }
                        Spacer(Modifier.height(12.dp)); Text(if(language=="bn")"অ্যাক্টিভিটি" else "Activity",style=MaterialTheme.typography.titleMedium)
                        d.activity.forEach { Text("${it.date} · ${it.author}\n${it.content}",Modifier.padding(vertical=5.dp)) }
                    }
                }
                if(error.isNotBlank()) Text(error,color=MaterialTheme.colorScheme.error,modifier=Modifier.padding(top=8.dp))
                TextButton(onClick={store.clear();loggedIn=false;api=null;user=null;selected=null;detail=null}) { Text(if(language=="bn")"লগআউট" else "Log out") }
            }
        }
    }
}

@Composable private fun LoginScreen(store: CredentialStore, language: String, setLanguage:(String)->Unit, onLogin:(String,String,String)->Unit, busy:Boolean, error:String) {
    var base by remember { mutableStateOf(store.base()) }; var username by remember { mutableStateOf(store.username()) }; var password by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(24.dp),verticalArrangement=Arrangement.Center,horizontalAlignment=Alignment.CenterHorizontally) {
        Text("Health Point BD",style=MaterialTheme.typography.headlineMedium); Text("Operations",style=MaterialTheme.typography.titleLarge); Spacer(Modifier.height(20.dp))
        OutlinedTextField(base,{base=it},label={Text("WordPress HTTPS URL")},modifier=Modifier.fillMaxWidth(),singleLine=true,placeholder={Text("https://healthpointbd.com/")})
        OutlinedTextField(username,{username=it},label={Text(if(language=="bn")"WordPress ইউজারনেম" else "WordPress username")},modifier=Modifier.fillMaxWidth(),singleLine=true)
        OutlinedTextField(password,{password=it},label={Text(if(language=="bn")"Application Password" else "Application Password")},modifier=Modifier.fillMaxWidth(),singleLine=true)
        Text("Create a dedicated WordPress Application Password for each staff account. Do not use your main account password.",style=MaterialTheme.typography.bodySmall,modifier=Modifier.padding(vertical=8.dp))
        Button(onClick={onLogin(base,username,password)},enabled=!busy&&base.startsWith("https://")&&username.isNotBlank()&&password.isNotBlank(),modifier=Modifier.fillMaxWidth()) { Text(if(busy)"Connecting…" else if(language=="bn")"লগইন" else "Login") }
        TextButton(onClick={setLanguage(if(language=="bn")"en" else "bn")}) { Text(if(language=="bn")"English" else "বাংলা") }
        if(error.isNotBlank()) Text(error,color=MaterialTheme.colorScheme.error)
    }
}
