const toast=document.getElementById('toast');let toastTimer;
function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
const now=new Date();const dateEl=document.getElementById('today');if(dateEl)dateEl.textContent='✦  '+now.toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
const defaultProducts=[
{name:'Toned milk 500 ml',category:'Dairy',stock:4,price:29,shelf:'Chiller A',expiryDate:'',lowStockThreshold:5},
{name:'Curd 200 g',category:'Dairy',stock:3,price:25,shelf:'Chiller A',expiryDate:'',lowStockThreshold:5},
{name:'Toor dal 1 kg',category:'Groceries',stock:18,price:145,shelf:'Shelf B',expiryDate:'',lowStockThreshold:5},
{name:'Rice 5 kg',category:'Groceries',stock:12,price:320,shelf:'Shelf C',expiryDate:'',lowStockThreshold:5},
{name:'Tomatoes 1 kg',category:'Vegetables',stock:7,price:36,shelf:'Crate 1',expiryDate:'',lowStockThreshold:5},
{name:'Onions 1 kg',category:'Vegetables',stock:22,price:42,shelf:'Crate 2',expiryDate:'',lowStockThreshold:5}];
const inventoryStorageKey='kiranaKeeperInventoryV1';
function loadProducts(){try{const saved=localStorage.getItem(inventoryStorageKey);if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))return parsed}}catch(e){console.warn('Could not load saved inventory',e)}return defaultProducts.map(p=>({...p}))}
let products=loadProducts();
function saveProducts(){try{localStorage.setItem(inventoryStorageKey,JSON.stringify(products));const msg=document.getElementById('inventoryMessage');if(msg)msg.textContent='Saved on this computer in this browser.'}catch(e){showToast('Could not save inventory. Check browser storage settings.')}}
let filter='All items';
const rows=document.getElementById('productRows');
function dateStatus(date){if(!date)return '';const today=new Date();today.setHours(0,0,0,0);const expiry=new Date(date+'T00:00:00');const days=Math.ceil((expiry-today)/86400000);if(days<0)return 'Expired';if(days===0)return 'Expires today';if(days<=7)return `Expires in ${days} day${days===1?'':'s'}`;return ''}
function renderProducts(){if(!rows)return;const searchEl=document.getElementById('productSearch');const q=searchEl?searchEl.value.trim().toLowerCase():'';const list=products.filter(p=>(filter==='All items'||p.category===filter)&&`${p.name} ${p.category} ${p.shelf}`.toLowerCase().includes(q));rows.innerHTML='';list.forEach(p=>{const tr=document.createElement('tr');tr.innerHTML='<td><span class="product-name"></span><span class="product-sub"></span></td><td></td><td></td><td></td><td></td><td><span class="stock-pill"></span></td><td class="row-actions"></td>';tr.children[0].children[0].textContent=p.name;tr.children[0].children[1].textContent=p.shelf||'Unassigned';tr.children[1].textContent=p.category;tr.children[2].textContent=p.stock;tr.children[3].textContent='₹'+Number(p.price).toLocaleString('en-IN');tr.children[4].textContent=p.expiryDate?new Date(p.expiryDate+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';const expiryWarning=dateStatus(p.expiryDate);const status=tr.children[5].firstElementChild;status.textContent=expiryWarning|| (p.stock<=Number(p.lowStockThreshold??5)?'Low stock':'In stock');if(expiryWarning||p.stock<=Number(p.lowStockThreshold??5))status.classList.add('low');const actions=tr.querySelector('.row-actions');if(p.stock<=Number(p.lowStockThreshold??5)){const restock=document.createElement('button');restock.className='restock-button';restock.textContent='+ Restock';restock.title='Add stock to this product';restock.addEventListener('click',()=>{const raw=prompt(`How many units of ${p.name} would you like to add?`,'10');if(raw===null)return;const qty=Number(raw);if(Number.isFinite(qty)&&qty>0){p.stock+=Math.floor(qty);saveProducts();renderProducts();showToast(`${p.name} restocked. New quantity: ${p.stock}.`)}});actions.appendChild(restock)}const remove=document.createElement('button');remove.className='row-action';remove.title='Remove product';remove.textContent='···';remove.addEventListener('click',()=>{if(confirm(`Remove ${p.name} from this inventory?`)){products.splice(products.indexOf(p),1);saveProducts();renderProducts();showToast('Product removed.')}});actions.appendChild(remove);rows.appendChild(tr)});document.getElementById('emptyProducts').style.display=list.length?'none':'block';document.getElementById('productCount').innerHTML=`${products.length} <span>products</span>`;document.getElementById('lowCount').innerHTML=`${products.filter(p=>p.stock<=Number(p.lowStockThreshold??5)).length} <span>low stock</span>`;saveProducts()}
document.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(x=>x.classList.toggle('active',x===b));renderProducts()}));const search=document.getElementById('productSearch');if(search)search.addEventListener('input',renderProducts);const retry=document.getElementById('inventoryRetry');if(retry)retry.addEventListener('click',()=>{renderProducts();showToast('Inventory refreshed.')});
const modal=document.getElementById('productModal');function openModal(){if(modal){modal.classList.add('show');modal.querySelector('input[name="name"]').focus()}}function closeModal(){if(modal)modal.classList.remove('show')}
const addBtn=document.getElementById('addProductBtn');if(addBtn)addBtn.addEventListener('click',openModal);const closeBtn=document.getElementById('closeModal');if(closeBtn)closeBtn.addEventListener('click',closeModal);if(modal)modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&search){e.preventDefault();search.focus()}});
const productForm=document.getElementById('productForm');if(productForm)productForm.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(productForm);products.unshift({name:String(f.get('name')).trim(),category:String(f.get('category')),stock:Number(f.get('stock')),price:Number(f.get('price')),shelf:String(f.get('shelf')||'Unassigned'),expiryDate:String(f.get('expiryDate')||''),lowStockThreshold:Number(f.get('lowStockThreshold')||5)});saveProducts();productForm.reset();productForm.querySelector('input[name="stock"]').value=10;productForm.querySelector('input[name="lowStockThreshold"]').value=5;closeModal();filter='All items';document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));if(search)search.value='';renderProducts();showToast('Product added and saved on this computer.')});renderProducts();
if(rows && new URLSearchParams(window.location.search).get('add')==='1')openModal();
function addRecord(listId,title,subtitle,amount){const list=document.getElementById(listId);const row=document.createElement('div');row.className='data-item';const left=document.createElement('div');const b=document.createElement('b');b.textContent=title;const sm=document.createElement('small');sm.textContent=subtitle;left.append(b,sm);const right=document.createElement('b');right.textContent='₹ '+Number(amount).toLocaleString('en-IN');row.append(left,right);list.prepend(row)}
// Billing: itemised bills are saved in this browser and stock is reduced when a bill is saved.
const billStorageKey='kiranaKeeperBillsV1';
function loadBills(){try{const saved=localStorage.getItem(billStorageKey);if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))return parsed}}catch(e){console.warn('Could not load saved bills',e)}return []}
let bills=loadBills();
const billForm=document.getElementById('billForm');
const billLines=document.getElementById('billLines');
const addBillItemBtn=document.getElementById('addBillItem');
function money(value){return '₹ '+Number(value||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function saveBills(){try{localStorage.setItem(billStorageKey,JSON.stringify(bills))}catch(e){showToast('Could not save bills. Check browser storage settings.')}}
function inventoryProducts(){try{const saved=JSON.parse(localStorage.getItem(inventoryStorageKey)||'null');return Array.isArray(saved)?saved:products}catch(e){return products}}
function updateBillLine(line){const select=line.querySelector('.bill-product');const qty=line.querySelector('.bill-qty');const price=line.querySelector('.bill-price');const chosen=inventoryProducts().find(p=>p.name===select.value);if(chosen){price.value=Number(chosen.price)||0;line.dataset.productName=chosen.name}else{line.dataset.productName='';price.value=''}const quantity=Math.max(0,Number(qty.value)||0);const amount=quantity*(Number(price.value)||0);line.querySelector('.bill-line-total').textContent=money(amount);updateBillTotal()}
function updateBillTotal(){if(!billLines)return;const total=[...billLines.querySelectorAll('.bill-line')].reduce((sum,line)=>sum+Math.max(0,Number(line.querySelector('.bill-qty').value)||0)*Math.max(0,Number(line.querySelector('.bill-price').value)||0),0);const el=document.getElementById('billGrandTotal');if(el)el.textContent=money(total)}
function addBillLine(selectedName=''){if(!billLines)return;const line=document.createElement('div');line.className='bill-line';const productField=document.createElement('div');productField.className='field bill-product-field';const productLabel=document.createElement('label');productLabel.textContent='Product';const select=document.createElement('select');select.className='bill-product';select.required=true;const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose inventory product';select.appendChild(placeholder);inventoryProducts().forEach(product=>{const option=document.createElement('option');option.value=product.name;option.textContent=`${product.name} — stock: ${product.stock}`;option.dataset.price=product.price;select.appendChild(option)});if(selectedName)select.value=selectedName;productField.append(productLabel,select);const qtyField=document.createElement('div');qtyField.className='field bill-qty-field';const qtyLabel=document.createElement('label');qtyLabel.textContent='Qty';const qty=document.createElement('input');qty.className='bill-qty';qty.type='number';qty.min='1';qty.step='1';qty.value='1';qty.required=true;qtyField.append(qtyLabel,qty);const priceField=document.createElement('div');priceField.className='field bill-price-field';const priceLabel=document.createElement('label');priceLabel.textContent='Unit price (₹)';const price=document.createElement('input');price.className='bill-price';price.type='number';price.min='0';price.step='.01';price.required=true;price.readOnly=true;priceField.append(priceLabel,price);const totalField=document.createElement('div');totalField.className='field bill-line-total-field';const totalLabel=document.createElement('label');totalLabel.textContent='Line total';const total=document.createElement('strong');total.className='bill-line-total';total.textContent=money(0);totalField.append(totalLabel,total);const remove=document.createElement('button');remove.type='button';remove.className='remove-bill-line';remove.textContent='×';remove.title='Remove item';remove.setAttribute('aria-label','Remove item');line.append(productField,qtyField,priceField,totalField,remove);select.addEventListener('change',()=>updateBillLine(line));qty.addEventListener('input',()=>updateBillLine(line));remove.addEventListener('click',()=>{line.remove();if(!billLines.children.length)addBillLine();updateBillTotal()});billLines.appendChild(line);updateBillLine(line)}
function renderBills(){const tbody=document.getElementById('billsRows');if(!tbody)return;tbody.innerHTML='';const now=new Date();const todayKey=now.toLocaleDateString('en-CA');let todaysTotal=0,todaysCount=0;bills.forEach(bill=>{const date=new Date(bill.createdAt);const localKey=date.toLocaleDateString('en-CA');if(localKey===todayKey){todaysTotal+=Number(bill.total)||0;todaysCount++}const tr=document.createElement('tr');const cells=[bill.number||'—',date.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),`${(bill.items||[]).length} item${(bill.items||[]).length===1?'':'s'}`,bill.payment||'Cash',money(bill.total)];cells.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.appendChild(td)});const detailsTd=document.createElement('td');const detailsBtn=document.createElement('button');detailsBtn.type='button';detailsBtn.className='row-action bill-details-button';detailsBtn.textContent='View';detailsBtn.addEventListener('click',()=>{const summary=(bill.items||[]).map(item=>`${item.name} × ${item.quantity} = ${money(item.quantity*item.price)}`).join('\n');alert(`${bill.number}\n${date.toLocaleString('en-IN')}\nPayment: ${bill.payment}\n\n${summary}\n\nTOTAL: ${money(bill.total)}${bill.note?'\nNote: '+bill.note:''}`)});detailsTd.appendChild(detailsBtn);tr.appendChild(detailsTd);tbody.appendChild(tr)});const totalEl=document.getElementById('salesTotal');if(totalEl)totalEl.textContent=money(todaysTotal);const countEl=document.getElementById('salesCount');if(countEl)countEl.textContent=String(todaysCount);const empty=document.getElementById('emptyBills');if(empty)empty.style.display=bills.length?'none':'block'}
if(addBillItemBtn)addBillItemBtn.addEventListener('click',()=>addBillLine());
if(billLines){addBillLine();}
if(billForm)billForm.addEventListener('submit',e=>{e.preventDefault();const lines=[...billLines.querySelectorAll('.bill-line')];if(!lines.length){showToast('Add at least one item to the bill.');return}const chosenItems=[];for(const line of lines){const name=line.querySelector('.bill-product').value;const quantity=Number(line.querySelector('.bill-qty').value);const product=products.find(p=>p.name===name);if(!product){showToast('Choose a valid product from inventory.');return}if(!Number.isInteger(quantity)||quantity<1){showToast('Enter a whole-number quantity of at least 1.');return}if(quantity>Number(product.stock)){showToast(`Not enough stock for ${product.name}. Available: ${product.stock}.`);return}chosenItems.push({name:product.name,quantity,price:Number(product.price),category:product.category})}const grouped={};chosenItems.forEach(item=>grouped[item.name]=(grouped[item.name]||0)+item.quantity);for(const [name,qty] of Object.entries(grouped)){const product=products.find(p=>p.name===name);if(!product||qty>Number(product.stock)){showToast(`Not enough stock for ${name}.`);return}}const f=new FormData(billForm);const total=chosenItems.reduce((sum,item)=>sum+item.quantity*item.price,0);const createdAt=new Date().toISOString();const bill={number:'KK-'+createdAt.slice(0,10).replaceAll('-','')+'-'+String(bills.length+1).padStart(3,'0'),createdAt,payment:String(f.get('payment')||'Cash'),note:String(f.get('note')||'').trim(),items:chosenItems,total};chosenItems.forEach(item=>{const product=products.find(p=>p.name===item.name);product.stock-=item.quantity});saveProducts();bills.unshift(bill);saveBills();renderBills();billLines.innerHTML='';addBillLine();billForm.reset();showToast(`Bill ${bill.number} saved. Inventory updated.`)});
renderBills();

// Bill Archive: searchable saved bills and downloadable receipt files.
const archiveRows=document.getElementById('billArchiveRows');
function escapeHtml(value){return String(value??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]))}
function receiptHtml(bill){const date=new Date(bill.createdAt);const items=(bill.items||[]).map(item=>`<tr><td>${escapeHtml(item.name)}</td><td>${Number(item.quantity)||0}</td><td>₹ ${(Number(item.price)||0).toFixed(2)}</td><td>₹ ${((Number(item.quantity)||0)*(Number(item.price)||0)).toFixed(2)}</td></tr>`).join('');return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(bill.number)} - Kirana Keeper</title><style>body{font:15px Arial,sans-serif;color:#38252a;max-width:760px;margin:32px auto;padding:24px}h1{color:#702c3b;margin-bottom:4px}.muted{color:#75656a;font-size:13px}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;padding:10px;border-bottom:1px solid #e8ddd5}th{background:#f5eae3}.total{text-align:right;font-size:22px;font-weight:bold;color:#702c3b}.note{margin-top:20px;padding:12px;background:#faf5f0}@media print{button{display:none}body{margin:0}}</style></head><body><h1>Kirana Keeper</h1><div class="muted">Grocery bill receipt</div><h2>${escapeHtml(bill.number||'Bill')}</h2><p><b>Date &amp; time:</b> ${escapeHtml(date.toLocaleString('en-IN'))}<br><b>Payment:</b> ${escapeHtml(bill.payment||'Cash')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${items}</tbody></table><div class="total">Total: ₹ ${(Number(bill.total)||0).toFixed(2)}</div>${bill.note?`<div class="note"><b>Note:</b> ${escapeHtml(bill.note)}</div>`:''}<p class="muted">Saved from Kirana Keeper.</p><button onclick="window.print()">Print receipt</button></body></html>`}
function downloadText(filename,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadReceipt(bill){downloadText(`${String(bill.number||'bill').replace(/[^a-z0-9_-]/gi,'_')}.html`,receiptHtml(bill),'text/html;charset=utf-8')}
function renderArchive(){
 if(!archiveRows)return;
 const query=(document.getElementById('archiveSearch')?.value||'').trim().toLowerCase();
 const filtered=bills.filter(b=>[b.number,b.payment,b.note,...(b.items||[]).map(i=>i.name)].join(' ').toLowerCase().includes(query));
 filtered.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 archiveRows.innerHTML='';
 let previousDay='';
 filtered.forEach(bill=>{
  const date=new Date(bill.createdAt);
  const dayKey=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  if(dayKey!==previousDay){
   const group=document.createElement('tr');
   group.className='bill-date-group';
   const heading=document.createElement('th');
   heading.colSpan=6;
   heading.scope='rowgroup';
   heading.textContent=date.toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
   group.appendChild(heading);
   archiveRows.appendChild(group);
   previousDay=dayKey;
  }
  const tr=document.createElement('tr');
  const values=[bill.number||'—',date.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),`${(bill.items||[]).length} item${(bill.items||[]).length===1?'':'s'}`,bill.payment||'Cash',money(bill.total)];
  values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});
  const actions=document.createElement('td');actions.className='archive-actions';
  const view=document.createElement('button');view.type='button';view.className='row-action bill-details-button';view.textContent='View';
  view.addEventListener('click',()=>{const win=window.open('','_blank');if(win){win.document.open();win.document.write(receiptHtml(bill));win.document.close()}else showToast('Allow pop-ups to view the receipt, or download it instead.')});
  const download=document.createElement('button');download.type='button';download.className='row-action bill-details-button';download.textContent='Download';download.addEventListener('click',()=>downloadReceipt(bill));
  actions.append(view,download);tr.appendChild(actions);archiveRows.appendChild(tr);
 });
 const count=document.getElementById('archiveBillCount');if(count)count.textContent=String(bills.length);
 const total=document.getElementById('archiveBillTotal');if(total)total.textContent=money(bills.reduce((sum,b)=>sum+(Number(b.total)||0),0));
 const empty=document.getElementById('archiveEmpty');if(empty){empty.style.display=filtered.length?'none':'block';empty.textContent=bills.length?'No bills match your search.':'No saved bills yet. Create a bill from Sales & bills first.'}
}
const archiveSearch=document.getElementById('archiveSearch');if(archiveSearch)archiveSearch.addEventListener('input',renderArchive);
const exportBillsCsv=document.getElementById('exportBillsCsv');if(exportBillsCsv)exportBillsCsv.addEventListener('click',()=>{if(!bills.length){showToast('There are no bills to export yet.');return}const cell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=[['Bill number','Date and time','Payment','Item names','Item quantities','Total','Note'],...bills.map(b=>[b.number,new Date(b.createdAt).toLocaleString('en-IN'),b.payment,(b.items||[]).map(i=>i.name).join('; '),(b.items||[]).map(i=>i.quantity).join('; '),Number(b.total||0).toFixed(2),b.note||''])];downloadText('kirana-keeper-bills-archive.csv','\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');showToast('Bill archive exported as CSV.')});
renderArchive();

// Expenses: persist entries locally so the Shop Manager can analyse actual records.
const expenseStorageKey='kiranaKeeperExpensesV1';
function loadExpenses(){try{const saved=JSON.parse(localStorage.getItem(expenseStorageKey)||'null');return Array.isArray(saved)?saved:[]}catch(e){return []}}
function renderExpenses(){const list=document.getElementById('expenseList');if(!list)return;const entries=loadExpenses();list.innerHTML='';entries.forEach(entry=>addRecord('expenseList',entry.description,`${entry.category} · ${new Date(entry.createdAt).toLocaleDateString('en-IN')}`,entry.amount));const total=entries.reduce((sum,entry)=>sum+(Number(entry.amount)||0),0);const totalEl=document.getElementById('expenseTotal');if(totalEl)totalEl.textContent='₹ '+total.toLocaleString('en-IN',{maximumFractionDigits:2});const count=document.getElementById('expenseCount');if(count)count.textContent=String(entries.length)}
const expenseForm=document.getElementById('expenseForm');
if(expenseForm){
  // On first visit, preserve the existing three displayed demo expenses as local sample records.
  if(!localStorage.getItem(expenseStorageKey)){
    const list=document.getElementById('expenseList');
    const initial=[...((list&&list.querySelectorAll('.data-item'))||[])].map(row=>({description:row.querySelector('b')?.textContent||'Sample expense',category:row.querySelector('small')?.textContent||'Other',amount:Number((row.querySelectorAll('b')[1]?.textContent||'').replace(/[^0-9.]/g,''))||0,createdAt:new Date().toISOString(),sample:true}));
    localStorage.setItem(expenseStorageKey,JSON.stringify(initial));
  }
  renderExpenses();
  expenseForm.addEventListener('submit',e=>{
    e.preventDefault();const f=new FormData(expenseForm);
    const entries=loadExpenses();entries.unshift({description:String(f.get('description')).trim(),category:String(f.get('category')),amount:Number(f.get('amount')),createdAt:new Date().toISOString(),sample:false});
    localStorage.setItem(expenseStorageKey,JSON.stringify(entries));renderExpenses();expenseForm.reset();showToast('Expense saved in this browser.');
  });
}
const ask=document.getElementById('askAssistant');if(ask)ask.addEventListener('click',()=>{const answers={low:'Milk and curd are low in the sample inventory. Check recent sales before restocking, and order a smaller quantity of short-life products more often.',expiry:'Use first-expiry-first-out: move the nearest expiry dates to the front, check dates daily, and consider a small discount before products expire.',sales:'Track your best-selling items, keep popular essentials available, and review sales by day of week to spot patterns.',festival:'Check last year’s festival demand if you have it. Increase stock gradually for relevant products and avoid over-ordering items with short shelf lives.'};document.getElementById('answerText').textContent=answers[document.getElementById('assistantQuestion').value];document.getElementById('assistantAnswer').style.display='block'});


// Daily Stock Assistant: estimate next-day demand from the previous 30 calendar days of saved bills.
const demoSalesStorageKey='kiranaKeeperDemoSales30D_v1';
function loadDemoSales(){try{const data=JSON.parse(localStorage.getItem(demoSalesStorageKey)||'[]');return Array.isArray(data)?data:[]}catch(e){return []}}
function createDemoSales(){
 const names=[
  {name:'Toned milk 500 ml',price:29,base:7},{name:'Curd 200 g',price:25,base:5},
  {name:'Toor dal 1 kg',price:145,base:2},{name:'Rice 5 kg',price:320,base:1},
  {name:'Tomatoes 1 kg',price:36,base:4},{name:'Onions 1 kg',price:42,base:3}
 ];
 const data=[];const today=new Date();today.setHours(12,0,0,0);
 for(let day=29;day>=0;day--){
  const date=new Date(today);date.setDate(date.getDate()-day);
  const items=[];
  names.forEach((product,index)=>{
   // Deterministic variation gives the demo weekday and day-to-day differences.
   const variation=((day*3+index*5)%5)-2;
   const weekdayBoost=[0,1,0,1,2,2,3][date.getDay()];
   const quantity=Math.max(0,product.base+variation+(index<2?Math.floor(weekdayBoost/2):Math.floor(weekdayBoost/3)));
   if(quantity>0)items.push({name:product.name,quantity,price:product.price,category:index<2?'Dairy':index<4?'Groceries':'Vegetables'});
  });
  if(items.length){const total=items.reduce((sum,item)=>sum+item.quantity*item.price,0);data.push({number:'DEMO-'+date.toISOString().slice(0,10),createdAt:date.toISOString(),payment:['Cash','UPI','Card'][day%3],items,total,isDemo:true});}
 }
 try{localStorage.setItem(demoSalesStorageKey,JSON.stringify(data));return data}catch(e){showToast('Could not save demo data in this browser.');return []}
}
function renderStockForecast(){
 const tbody=document.getElementById('forecastRows');if(!tbody)return;
 const today=new Date();today.setHours(0,0,0,0);const start=new Date(today);start.setDate(start.getDate()-29);
 const demoBills=loadDemoSales();const allForecastBills=[...bills,...demoBills];const dayKeys=new Set();const soldByProduct={};
 allForecastBills.forEach(bill=>{const d=new Date(bill.createdAt);if(Number.isNaN(d.getTime()))return;const day=new Date(d);day.setHours(0,0,0,0);if(day<start||day>today)return;dayKeys.add(day.toISOString().slice(0,10));(bill.items||[]).forEach(item=>{const name=String(item.name||'');if(!name)return;if(!soldByProduct[name])soldByProduct[name]={qty:0,first:day};soldByProduct[name].qty+=Math.max(0,Number(item.quantity)||0);if(day<soldByProduct[name].first)soldByProduct[name].first=day;});});
 const hist=document.getElementById('forecastHistory');if(hist)hist.textContent=dayKeys.size+' day'+(dayKeys.size===1?'':'s')+' with sales'+(demoBills.length?' · includes demo data':'');
 tbody.innerHTML='';let hasAny=false;
 products.forEach(product=>{const sales=soldByProduct[product.name];const sold=sales?sales.qty:0;const activeDays=sales?Math.max(1,Math.min(30,Math.floor((today-sales.first)/86400000)+1)):0;const avg=activeDays?sold/activeDays:0;const projected=Math.ceil(avg*1.2);const current=Math.max(0,Number(product.stock)||0);const order=Math.max(0,projected-current);
 const tr=document.createElement('tr');[product.name,String(sold),avg.toFixed(1),String(current),String(order),!sales?'No sales in this 30-day window':order>0?'Demand + 20% buffer exceeds stock':'Current stock covers estimate'].forEach((value,i)=>{const td=document.createElement('td');td.textContent=value;if(i===4&&order>0)td.style.fontWeight='700';tr.appendChild(td)});tbody.appendChild(tr);hasAny=hasAny||Boolean(sales);
 });
 const empty=document.getElementById('forecastEmpty');if(empty)empty.style.display=hasAny?'none':'block';
}
const loadDemoSalesBtn=document.getElementById('loadDemoSales');if(loadDemoSalesBtn)loadDemoSalesBtn.addEventListener('click',()=>{const data=createDemoSales();renderStockForecast();showToast(data.length?'30 days of demo sales loaded. Your real bills and inventory were not changed.':'Could not load demo sales.');});
const refreshForecast=document.getElementById('refreshForecast');if(refreshForecast)refreshForecast.addEventListener('click',()=>{renderStockForecast();showToast('30-day stock forecast refreshed.')});renderStockForecast();


// Weather alerts: geocode the entered city and check the next 24 hours using Open-Meteo (no API key required).
const weatherButton=document.getElementById('checkWeather');
if(weatherButton)weatherButton.addEventListener('click',async()=>{
 const cityInput=document.getElementById('weatherCity');const result=document.getElementById('weatherResult');const city=(cityInput?.value||'').trim();
 if(!city){showToast('Enter a town or city first.');return}
 weatherButton.disabled=true;weatherButton.textContent='Checking…';
 result.innerHTML='<span class="alert-icon">…</span><div>Fetching the latest forecast for '+escapeWeatherText(city)+'…</div>';
 try{
  const geoResponse=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city)+'&count=1&language=en&format=json');
  if(!geoResponse.ok)throw new Error('Location lookup failed');const geo=await geoResponse.json();const place=geo.results&&geo.results[0];if(!place)throw new Error('City not found. Try a nearby larger town or city.');
  const forecastResponse=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+place.latitude+'&longitude='+place.longitude+'&hourly=precipitation_probability,precipitation,rain,weather_code&forecast_days=2&timezone=auto');
  if(!forecastResponse.ok)throw new Error('Forecast service unavailable');const forecast=await forecastResponse.json();const hourly=forecast.hourly||{};const times=hourly.time||[];const nowTime=Date.now();const next=times.map((t,i)=>({time:new Date(t).getTime(),prob:Number(hourly.precipitation_probability?.[i]||0),precip:Number(hourly.precipitation?.[i]||0),rain:Number(hourly.rain?.[i]||0),code:Number(hourly.weather_code?.[i]||0)})).filter(x=>x.time>=nowTime&&x.time<=nowTime+24*60*60*1000);
  if(!next.length)throw new Error('No hourly forecast was returned. Try again later.');const maxProb=Math.max(...next.map(x=>x.prob));const totalRain=next.reduce((sum,x)=>sum+x.precip,0);const rainy=next.some(x=>x.prob>=40||x.precip>=0.2||x.rain>=0.2||[51,53,55,61,63,65,66,67,80,81,82,95,96,99].includes(x.code));
  const peak=next.reduce((a,b)=>b.prob>a.prob?b:a,next[0]);const currentCode=next[0].code;const icon=weatherArt(currentCode);const iconTarget=document.getElementById('weatherMainIcon');if(iconTarget)iconTarget.innerHTML=icon;const heading=rainy?'Rain may affect your shop in the next 24 hours.':'No strong rain signal in the next 24 hours.';const advice=rainy?'Consider checking delivery timing, protecting outdoor goods, and keeping rain-sensitive stock covered.':'Keep checking local conditions; forecasts can change.';
  result.innerHTML='<span class="weather-result-art">'+icon+'</span><div><strong>'+heading+'</strong><br><span>'+escapeWeatherText(place.name+(place.admin1?', '+place.admin1:'')+(place.country?', '+place.country:''))+'</span><br>Highest hourly rain probability: '+maxProb+'% · Forecast precipitation total: '+totalRain.toFixed(1)+' mm<br>'+advice+'<br><small>Updated '+new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})+'</small></div>';result.classList.toggle('weather-rain-alert',rainy);result.classList.toggle('weather-clear-alert',!rainy);
 }catch(error){result.classList.remove('weather-rain-alert','weather-clear-alert');result.innerHTML='<span class="alert-icon">!</span><div><strong>Could not check the weather.</strong><br>'+escapeWeatherText(error.message||'Check your internet connection and try again.')+'</div>'}
 finally{weatherButton.disabled=false;weatherButton.textContent='Check weather ↻'}
});
function weatherArt(code){
 const sun='<circle cx="22" cy="20" r="8" class="sun-core"/><path d="M22 5v4M22 31v4M7 20h4M33 20h4M11 9l3 3M30 28l3 3M33 9l-3 3M14 28l-3 3" class="sun-rays"/>';
 const cloud='<path d="M18 44h28a10 10 0 0 0 0-20 15 15 0 0 0-29-3A11 11 0 0 0 18 44Z" class="cloud-shape"/>';
 const rain='<path d="m22 49-3 6m15-6-3 6m15-6-3 6" class="rain-lines"/>';
 const lightning='<path d="m34 43-8 12h8l-4 8 14-16h-9l4-4Z" class="bolt-shape"/>';
 let art,kind='';
 if([0,1].includes(code)){art=sun;kind='weather-sun';}
 else if([2].includes(code)){art=sun+cloud;kind='weather-partly';}
 else if(code===3||[45,48].includes(code)){art=cloud+(code===3?'':'<path d="M8 50h48M13 56h38" class="fog-lines"/>');kind=code===3?'weather-cloud':'weather-fog';}
 else if([51,53,55,56,57].includes(code)){art=sun+cloud+rain;kind='weather-drizzle';}
 else if([95,96,99].includes(code)){art=cloud+lightning+rain;kind='weather-storm';}
 else if([61,63,65,66,67,80,81,82].includes(code)){art=cloud+rain;kind='weather-rain';}
 else {art=cloud;kind='weather-cloud';}
 return '<svg class="weather-art '+kind+'" viewBox="0 0 64 64" role="img" aria-label="Weather condition">'+art+'</svg>';
}
function escapeWeatherText(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

// Expiry alerts: show a persistent on-page warning on every page when products are expired or expiring within 7 days.
(function showExpiryAlerts(){
 try {
  const raw=localStorage.getItem('kiranaKeeperInventoryV1');
  const items=raw?JSON.parse(raw):[]; if(!Array.isArray(items)||!items.length)return;
  const today=new Date();today.setHours(0,0,0,0);
  const urgent=items.map(p=>{if(!p.expiryDate)return null;const d=new Date(p.expiryDate+'T00:00:00');return {p,days:Math.ceil((d-today)/86400000)}}).filter(x=>x&&x.days<=7);
  if(!urgent.length)return;
  const expired=urgent.filter(x=>x.days<0);const soon=urgent.filter(x=>x.days>=0);
  const banner=document.createElement('div');banner.className='expiry-global-alert';banner.setAttribute('role','status');
  const title=document.createElement('strong');title.textContent='Expiry alert: '+expired.length+' expired · '+soon.length+' expiring within 7 days';
  const details=document.createElement('p');details.textContent=urgent.slice(0,5).map(x=>x.p.name+' — '+(x.days<0?'expired':x.days===0?'expires today':'expires in '+x.days+' day'+(x.days===1?'':'s'))).join(' · ')+(urgent.length>5?' · and '+(urgent.length-5)+' more':'');
  const link=document.createElement('a');link.href='inventory.html';link.textContent='Review inventory →';banner.append(title,details,link);
  const main=document.querySelector('.main');const topbar=main&&main.querySelector('.topbar');if(topbar)topbar.insertAdjacentElement('afterend',banner);
 } catch(e){console.warn('Expiry alert could not be displayed',e)}
})();


// Optional browser notifications for low stock and expiry. Requires explicit permission.
(function setupShopNotifications(){
 const button=document.getElementById('enableShopNotifications'),status=document.getElementById('notificationStatus');
 const supported=('Notification' in window);const setStatus=m=>{if(status)status.textContent=m};
 if(!supported){if(button)button.disabled=true;setStatus('Browser notifications are not supported here. On-page alerts remain available.');return}
 function getInventory(){try{const d=JSON.parse(localStorage.getItem('kiranaKeeperInventoryV1')||'[]');return Array.isArray(d)?d:[]}catch(e){return []}}
 function notify(){if(Notification.permission!=='granted')return;const items=getInventory();if(!items.length)return;const today=new Date();today.setHours(0,0,0,0);
 const low=items.filter(p=>Number(p.stock)<=Number(p.lowStockThreshold??5));
 const expiry=items.map(p=>{if(!p.expiryDate)return null;return {p,days:Math.ceil((new Date(p.expiryDate+'T00:00:00')-today)/86400000)}}).filter(x=>x&&x.days<=7);
 const alerts=[];if(low.length)alerts.push({key:'low-stock',title:'Kirana Keeper: Low stock',body:low.slice(0,4).map(p=>`${p.name} (${p.stock} left)`).join(', ')+(low.length>4?` and ${low.length-4} more`: '')});
 if(expiry.length)alerts.push({key:'expiry',title:'Kirana Keeper: Expiry alert',body:expiry.slice(0,4).map(x=>`${x.p.name}: ${x.days<0?'expired':x.days===0?'expires today':`expires in ${x.days} day${x.days===1?'':'s'}`}`).join(', ')+(expiry.length>4?` and ${expiry.length-4} more`: '')});
 const day=new Date().toISOString().slice(0,10);let sent={};try{sent=JSON.parse(localStorage.getItem('kkBrowserNotificationsSent')||'{}')||{}}catch(e){}
 alerts.forEach(a=>{const key=day+':'+a.key;if(sent[key])return;try{const n=new Notification(a.title,{body:a.body,tag:key});n.onclick=()=>{window.focus();window.location.href='inventory.html'};sent[key]=true}catch(e){console.warn('Notification failed',e)}});
 try{localStorage.setItem('kkBrowserNotificationsSent',JSON.stringify(sent))}catch(e){}
 }
 if(button){if(Notification.permission==='granted'){button.textContent='Notifications enabled';setStatus('Enabled. Alerts are checked when you open a Kirana Keeper page.')}else if(Notification.permission==='denied'){button.disabled=true;setStatus('Notifications are blocked in browser settings.')}button.addEventListener('click',async()=>{try{const p=await Notification.requestPermission();if(p==='granted'){button.textContent='Notifications enabled';setStatus('Enabled. Checking your inventory for low-stock and expiry alerts.');notify()}else if(p==='denied'){button.disabled=true;setStatus('Permission denied. Change it in browser site settings to enable notifications.')}else setStatus('Permission was not granted. You can enable it later.')}catch(e){setStatus('Try opening the website through localhost or HTTPS to request permission.')}})}
 if(Notification.permission==='granted')notify();
})();
