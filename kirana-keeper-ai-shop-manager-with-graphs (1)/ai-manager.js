(() => {
  const $ = id => document.getElementById(id);
  const KEYS = {
    inventory:'kiranaKeeperInventoryV1',
    bills:'kiranaKeeperBillsV1',
    expenses:'kiranaKeeperExpensesV1',
    footprint:'kkSustainabilityFootprintV1',
    waste:'kkSustainabilityWasteV1'
  };
  const chat=$('kkAiChat'), form=$('kkAiForm'), input=$('kkAiInput');
  if(!chat||!form||!input)return;
  const readArray=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
  const readObject=key=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:null}catch(_){return null}};
  const money=n=>'₹'+(Number(n)||0).toLocaleString('en-IN',{maximumFractionDigits:2});
  const inventory=()=>readArray(KEYS.inventory);
  const bills=()=>readArray(KEYS.bills);
  const expenses=()=>readArray(KEYS.expenses);
  const dateOf=x=>{const d=new Date(x);return Number.isNaN(d.getTime())?null:d};
  const daysAgo=x=>{const d=dateOf(x);return d?(Date.now()-d.getTime())/86400000:Infinity};
  const expiryDays=date=>{if(!date)return null;const exp=new Date(date+'T00:00:00');if(Number.isNaN(exp.getTime()))return null;const today=new Date();today.setHours(0,0,0,0);return Math.ceil((exp-today)/86400000)};
  function addMessage(who,text){const box=document.createElement('div');box.className='kk-ai-message '+who;const title=document.createElement('strong');title.textContent=who==='owner'?'You':'Shop Manager';const p=document.createElement('p');p.textContent=text;box.append(title,p);chat.appendChild(box);chat.scrollTop=chat.scrollHeight}
  function getSalesStats(){
    const all=bills(), now=Date.now(), week=all.filter(b=>daysAgo(b.createdAt)<=7), prev=all.filter(b=>daysAgo(b.createdAt)>7&&daysAgo(b.createdAt)<=14);
    const total=arr=>arr.reduce((s,b)=>s+(Number(b.total)||0),0);
    const itemCounts={};all.forEach(b=>(b.items||[]).forEach(i=>{const n=i.name||'Unknown';itemCounts[n]=(itemCounts[n]||0)+(Number(i.quantity)||0)}));
    const top=Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    return {all,week,prev,total:total(all),weekTotal:total(week),prevTotal:total(prev),itemCounts,top};
  }
  function answer(prompt){
    const q=prompt.toLowerCase(), stock=inventory(), allBills=bills(), allExpenses=expenses(), stats=getSalesStats();
    const low=stock.filter(p=>Number(p.stock)<=Number(p.lowStockThreshold??5));
    const expiry=stock.map(p=>({p,days:expiryDays(p.expiryDate)})).filter(x=>x.days!==null&&x.days<=7).sort((a,b)=>a.days-b.days);
    const recentExpenses=allExpenses.filter(e=>daysAgo(e.createdAt)<=30), expenseTotal=recentExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0);
    if(/restock|low stock|stock order|reorder|inventory/.test(q)){
      if(!stock.length)return'No saved inventory was found in this browser. Open Inventory and add products first.';
      if(!low.length)return'Based on your saved inventory, no products are at or below their low-stock thresholds. Review upcoming demand and supplier lead times before ordering.';
      const lines=low.map(p=>{
        const sold=stats.itemCounts[p.name]||0;
        const suggested=Math.max(0,Number(p.lowStockThreshold??5)*2-Number(p.stock));
        return`• ${p.name}: ${p.stock} currently in stock; threshold ${p.lowStockThreshold??5}; ${sold?`${sold} unit(s) appear across saved bills`:'no sales found in saved bills'}. Suggested draft top-up: ${suggested} unit(s).`;
      });
      return'Low-stock review based on saved inventory and bills:\n'+lines.join('\n')+'\n\nSuggested quantities are a simple rule-of-thumb draft, not a demand forecast. Check pack sizes, expiry dates and supplier lead time. Nothing has been changed.';
    }
    if(/sales|revenue|bill|turnover|best.sell|popular product/.test(q)){
      if(!allBills.length)return'No saved bills are available yet. Record sales on the Sales & bills page; I will not invent revenue figures.';
      const comparison=stats.prev.length?`\n• Previous 7 days: ${money(stats.prevTotal)} across ${stats.prev.length} bill(s)\n• Change vs previous 7 days: ${stats.prevTotal?`${((stats.weekTotal-stats.prevTotal)/stats.prevTotal*100).toFixed(1)}%`:'not calculable because previous-period sales were ₹0'}`:'\n• Previous 7-day comparison: not available (no bills found in that period).';
      const top=stats.top.length?'\n• Most-sold items by units in saved bills: '+stats.top.map(([n,c])=>`${n} (${c})`).join(', '):'';
      return`Saved sales summary:\n• Bills recorded: ${allBills.length}\n• Total value of all saved bills: ${money(stats.total)}\n• Last 7 days: ${money(stats.weekTotal)} across ${stats.week.length} bill(s)`+comparison+top+'\n\nThis is the value of recorded bills, not profit. Only records saved in this browser are included.';
    }
    if(/expense|cost|spend|profit|margin|rent|electricity bill/.test(q)){
      if(!allExpenses.length)return'No saved expense entries were found. Add expenses on the Expenses page first.';
      const categories={};recentExpenses.forEach(e=>{const c=e.category||'Other';categories[c]=(categories[c]||0)+(Number(e.amount)||0)});
      const top=Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`• ${c}: ${money(n)}`).join('\n');
      const allTotal=allExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0);
      const sampleCount=allExpenses.filter(e=>e.sample).length;
      let answer=`Saved expense summary:\n• Total saved entries: ${allExpenses.length}\n• Total of all saved expenses: ${money(allTotal)}\n• Expenses in the last 30 days: ${money(expenseTotal)}\n• Last-30-day category breakdown:\n${top||'No expenses dated in the last 30 days.'}`;
      if(sampleCount)answer+=`\n\nNote: ${sampleCount} initial entry/entries were carried over from the page's pre-existing demo examples. Replace them with real records for business decisions.`;
      if(/profit|margin/.test(q))answer+='\n\nProfit cannot be calculated reliably yet because recorded bill totals do not include item-level purchase cost / cost of goods sold.';
      return answer;
    }
    if(/expir|waste|spoiled|spoilage/.test(q)){
      const waste=readArray(KEYS.waste);
      let result=expiry.length?'Expiry dates to review:\n'+expiry.map(x=>`• ${x.p.name}: ${x.days<0?`expired ${Math.abs(x.days)} day(s) ago`:x.days===0?'expires today':`expires in ${x.days} day(s)`}; stock ${x.p.stock}.`).join('\n'):'No inventory expiry dates within the next 7 days were found. This is useful only if expiry dates are recorded.';
      result+=`\n\nSustainability waste log: ${waste.length} record(s), ${waste.reduce((s,r)=>s+(Number(r.quantity)||0),0).toFixed(2)} kg recorded.`;
      result+='\nUse first-expiry-first-out (FEFO), move near-expiry stock forward, and review food-safety requirements before selling or disposing of items.';
      return result;
    }
    if(/sustain|carbon|electric|water|environment|footprint|impact/.test(q)){
      const f=readObject(KEYS.footprint), waste=readArray(KEYS.waste);
      const tips=['Compare electricity and water use across the same period each month.','Use FEFO and record products discarded due to expiry or spoilage.','Separate recyclable packaging and compost suitable organic waste where local services allow.','Switch off unused equipment and maintain refrigerator seals and temperatures.'];
      let context=f?`\nSaved footprint estimate (${f.period||'selected period'}): ${Number(f.total||0).toFixed(2)} kg CO₂e.`:'\nNo saved footprint estimate found yet.';
      context+=`\nWaste log: ${waste.length} record(s), ${waste.reduce((s,r)=>s+(Number(r.quantity)||0),0).toFixed(2)} kg recorded.`;
      return'Practical sustainability review:\n'+tips.map((t,i)=>`${i+1}. ${t}`).join('\n')+context+'\n\nThe footprint is an estimate based on the factors entered, not a verified audit.';
    }
    if(/help|what can you|hello|hi\b/.test(q))return'I can analyse saved records in this browser:\n• “What should I restock?” — inventory thresholds and quantities from saved bills.\n• “Summarise my sales” — bill totals, 7-day comparison, and top items.\n• “Summarise my expenses” — expense totals and category breakdown.\n• “What expiry risks should I check?” — recorded expiry dates and waste log.\n• “How can I reduce waste?” — sustainability estimate and waste records.\n\nI am a free, rule-based prototype, not a generative AI model. I do not send your records to an AI provider or make changes for you.';
    return'I can analyse saved Kirana Keeper records with predefined business rules, rather than open-ended AI reasoning. Try “What should I restock?”, “Summarise my sales”, “Summarise my expenses”, “What expiry risks should I check?”, or “How can I reduce waste?”.';
  }
  function ask(text){const clean=String(text||'').trim();if(!clean)return;addMessage('owner',clean);addMessage('assistant',answer(clean))}
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value='';input.focus()});
  document.querySelectorAll('[data-ai-prompt]').forEach(b=>b.addEventListener('click',()=>{const prompts={restock:'What should I restock?',sales:'Summarise my sales',expiry:'What expiry risks should I check?',sustainability:'How can I reduce waste?'};ask(prompts[b.dataset.aiPrompt]||b.textContent)}));
})();