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
  function normalizePrompt(prompt, lang) {
    const q = prompt.toLowerCase();
    if (lang === 'hi') {
      if (/स्टॉक|मँग|मंग|खरीद|सामान/.test(q)) return 'What should I restock?';
      if (/बिक्री|सेल|बिल|कमाई/.test(q)) return 'Summarise my sales';
      if (/खर्च|पैसा|लागत|मुनाफ़ा|मुनाफा/.test(q)) return 'Summarise my expenses';
      if (/एक्सपायरी|समाप्त|खराब|बर्बादी|कचरा/.test(q)) return 'What expiry risks should I check?';
      if (/पर्यावरण|बिजली|पानी|कार्बन|स्थिरता/.test(q)) return 'How can I reduce waste?';
      if (/नमस्ते|मदद|क्या कर/.test(q)) return 'help';
    }
    if (lang === 'te') {
      if (/స్టాక్|కొన|వస్తువ|తెప్పించ/.test(q)) return 'What should I restock?';
      if (/అమ్మక|బిల్లు|ఆదాయం/.test(q)) return 'Summarise my sales';
      if (/ఖర్చ|డబ్బు|లాభం/.test(q)) return 'Summarise my expenses';
      if (/గడువు|వ్యర్థ|వృథా|పాడ/.test(q)) return 'What expiry risks should I check?';
      if (/పర్యావరణ|విద్యుత్|నీరు|కార్బన్/.test(q)) return 'How can I reduce waste?';
      if (/నమస్కార|సహాయం|ఏమి చేయ/.test(q)) return 'help';
    }
    return prompt;
  }
  function localizeAnswer(text, lang) {
    if (lang === 'en') return text;
    const hi = {
      'No saved inventory was found in this browser. Open Inventory and add products first.':'इस ब्राउज़र में स्टॉक का कोई रिकॉर्ड नहीं मिला। पहले स्टॉक पेज पर उत्पाद जोड़ें।',
      'Based on your saved inventory, no products are at or below their low-stock thresholds. Review upcoming demand and supplier lead times before ordering.':'आपके सेव किए गए स्टॉक के अनुसार किसी उत्पाद का स्टॉक तय सीमा से कम नहीं है। ऑर्डर करने से पहले माँग और सप्लायर का समय देखें।',
      'Low-stock review based on saved inventory and bills:':'सेव किए गए स्टॉक और बिलों के आधार पर कम स्टॉक की समीक्षा:',
      'Suggested quantities are a simple rule-of-thumb draft, not a demand forecast. Check pack sizes, expiry dates and supplier lead time. Nothing has been changed.':'सुझाई गई मात्रा एक सामान्य अनुमान है, माँग का पक्का पूर्वानुमान नहीं। पैक का आकार, समाप्ति तिथि और सप्लायर का समय जाँचें। कोई बदलाव नहीं किया गया है।',
      'No saved bills are available yet. Record sales on the Sales & bills page; I will not invent revenue figures.':'अभी कोई सेव किया गया बिल नहीं है। बिक्री और बिल पेज पर बिक्री दर्ज करें; मैं कमाई के आँकड़े नहीं गढ़ूँगा।',
      'Saved sales summary:':'सेव की गई बिक्री का सारांश:',
      'Bills recorded:':'दर्ज बिल:', 'Total value of all saved bills:':'सभी सेव किए गए बिलों की कुल राशि:', 'Last 7 days:':'पिछले 7 दिन:', 'Previous 7 days:':'उससे पहले के 7 दिन:', 'Change vs previous 7 days:':'पिछले 7 दिनों की तुलना में बदलाव:', 'not calculable because previous-period sales were ₹0':'गणना नहीं हो सकती क्योंकि पिछली अवधि की बिक्री ₹0 थी', 'Previous 7-day comparison: not available (no bills found in that period).':'पिछले 7 दिनों से तुलना उपलब्ध नहीं है (उस अवधि में कोई बिल नहीं मिला)।', 'Most-sold items by units in saved bills:':'सेव किए गए बिलों में सबसे ज़्यादा बिके सामान (इकाइयों के अनुसार):',
      'This is the value of recorded bills, not profit. Only records saved in this browser are included.':'यह दर्ज बिलों की राशि है, मुनाफ़ा नहीं। इसमें केवल इसी ब्राउज़र के रिकॉर्ड शामिल हैं।',
      'No saved expense entries were found. Add expenses on the Expenses page first.':'खर्च की कोई सेव प्रविष्टि नहीं मिली। पहले खर्च पेज पर खर्च जोड़ें।','Saved expense summary:':'सेव किए गए खर्चों का सारांश:', 'Total saved entries:':'कुल सेव प्रविष्टियाँ:', 'Total of all saved expenses:':'सभी सेव किए गए खर्चों का कुल:', 'Expenses in the last 30 days:':'पिछले 30 दिनों के खर्च:', 'Last-30-day category breakdown:':'पिछले 30 दिनों के खर्चों की श्रेणीवार जानकारी:', 'No expenses dated in the last 30 days.':'पिछले 30 दिनों की तारीख वाला कोई खर्च नहीं है।',
      'Profit cannot be calculated reliably yet because recorded bill totals do not include item-level purchase cost / cost of goods sold.':'अभी मुनाफ़े की सही गणना नहीं हो सकती, क्योंकि बिलों में प्रत्येक उत्पाद की खरीद लागत शामिल नहीं है।',
      'Expiry dates to review:':'जाँचने योग्य समाप्ति तिथियाँ:', 'expired':'समाप्त हो चुका', 'expires today':'आज समाप्त होगा', 'expires in ':'में समाप्त होगा ', 'day(s) ago':'दिन पहले', 'day(s)':'दिन', 'stock ':'स्टॉक ', 'No inventory expiry dates within the next 7 days were found. This is useful only if expiry dates are recorded.':'अगले 7 दिनों में समाप्त होने वाले उत्पाद नहीं मिले। यह तभी उपयोगी है जब समाप्ति तिथियाँ दर्ज हों।',
      'Sustainability waste log:':'स्थिरता कचरा रिकॉर्ड:', 'record(s), ':'रिकॉर्ड, ', ' kg recorded.':' किग्रा दर्ज।','Use first-expiry-first-out (FEFO), move near-expiry stock forward, and review food-safety requirements before selling or disposing of items.':'पहले समाप्त होने वाले उत्पाद पहले बेचें (FEFO), जल्द समाप्त होने वाले स्टॉक को आगे रखें और बेचने या फेंकने से पहले खाद्य-सुरक्षा नियम जाँचें।',
      'Practical sustainability review:':'स्थिरता के लिए उपयोगी सुझाव:', 'Compare electricity and water use across the same period each month.':'हर महीने समान अवधि की बिजली और पानी की खपत की तुलना करें।','Use FEFO and record products discarded due to expiry or spoilage.':'FEFO अपनाएँ और एक्सपायरी या खराब होने से फेंके गए उत्पाद दर्ज करें।','Separate recyclable packaging and compost suitable organic waste where local services allow.':'रीसायकल पैकेजिंग अलग रखें और जहाँ सुविधा हो वहाँ जैविक कचरे की खाद बनाएँ।','Switch off unused equipment and maintain refrigerator seals and temperatures.':'बेकार उपकरण बंद करें और फ्रिज की सील व तापमान सही रखें।','No saved footprint estimate found yet.':'अभी पर्यावरणीय प्रभाव का कोई सेव अनुमान नहीं है।','The footprint is an estimate based on the factors entered, not a verified audit.':'पर्यावरणीय प्रभाव दर्ज कारकों पर आधारित अनुमान है, प्रमाणित ऑडिट नहीं।',
      'I can analyse saved records in this browser:':'मैं इस ब्राउज़र में सेव रिकॉर्ड का विश्लेषण कर सकता हूँ:', '“What should I restock?” — inventory thresholds and quantities from saved bills.':'“क्या दोबारा मँगाऊँ?” — स्टॉक की सीमा और बिलों में दर्ज मात्रा।','“Summarise my sales” — bill totals, 7-day comparison, and top items.':'“मेरी बिक्री का सारांश” — बिल का कुल, 7 दिनों की तुलना और सबसे ज़्यादा बिके उत्पाद।','“Summarise my expenses” — expense totals and category breakdown.':'“मेरे खर्चों का सारांश” — कुल खर्च और श्रेणीवार विवरण।','“What expiry risks should I check?” — recorded expiry dates and waste log.':'“कौन-सी एक्सपायरी जाँचूँ?” — दर्ज समाप्ति तिथियाँ और कचरे का रिकॉर्ड।','“How can I reduce waste?” — sustainability estimate and waste records.':'“बर्बादी कैसे कम करूँ?” — स्थिरता अनुमान और कचरे के रिकॉर्ड।','I am a free, rule-based prototype, not a generative AI model. I do not send your records to an AI provider or make changes for you.':'मैं मुफ़्त, नियम-आधारित प्रोटोटाइप हूँ, जनरेटिव AI मॉडल नहीं। मैं आपके रिकॉर्ड किसी AI प्रदाता को नहीं भेजता और आपके लिए बदलाव नहीं करता।',
      'I can analyse saved Kirana Keeper records with predefined business rules, rather than open-ended AI reasoning. Try “What should I restock?”, “Summarise my sales”, “Summarise my expenses”, “What expiry risks should I check?”, or “How can I reduce waste?”.':'मैं तय व्यावसायिक नियमों से Kirana Keeper के सेव रिकॉर्ड का विश्लेषण कर सकता हूँ। “क्या दोबारा मँगाऊँ?”, “बिक्री का सारांश”, “खर्च का सारांश”, “कौन-सी एक्सपायरी जाँचूँ?” या “बर्बादी कैसे कम करूँ?” पूछें।'
    };
    const te = {
      'No saved inventory was found in this browser. Open Inventory and add products first.':'ఈ బ్రౌజర్‌లో స్టాక్ రికార్డులు లేవు. ముందుగా స్టాక్ పేజీలో ఉత్పత్తులను జోడించండి.',
      'Based on your saved inventory, no products are at or below their low-stock thresholds. Review upcoming demand and supplier lead times before ordering.':'మీ సేవ్ చేసిన స్టాక్ ప్రకారం ఏ ఉత్పత్తి కూడా తక్కువ స్టాక్ పరిమితికి చేరలేదు. ఆర్డర్ చేసే ముందు డిమాండ్, సరఫరాదారు సమయాన్ని చూడండి.',
      'Low-stock review based on saved inventory and bills:':'సేవ్ చేసిన స్టాక్, బిల్లుల ఆధారంగా తక్కువ స్టాక్ సమీక్ష:',
      'Suggested quantities are a simple rule-of-thumb draft, not a demand forecast. Check pack sizes, expiry dates and supplier lead time. Nothing has been changed.':'సూచించిన పరిమాణాలు సాధారణ అంచనా మాత్రమే; డిమాండ్ అంచనా కాదు. ప్యాక్ పరిమాణం, గడువు తేదీ, సరఫరా సమయాన్ని తనిఖీ చేయండి. ఏ మార్పూ చేయలేదు.',
      'No saved bills are available yet. Record sales on the Sales & bills page; I will not invent revenue figures.':'ఇంకా సేవ్ చేసిన బిల్లులు లేవు. అమ్మకాలు & బిల్లుల పేజీలో నమోదు చేయండి; ఆదాయ సంఖ్యలను నేను కల్పించను.',
      'Saved sales summary:':'సేవ్ చేసిన అమ్మకాల సారాంశం:', 'Bills recorded:':'నమోదైన బిల్లులు:', 'Total value of all saved bills:':'అన్ని సేవ్ చేసిన బిల్లుల మొత్తం విలువ:', 'Last 7 days:':'గత 7 రోజులు:', 'Previous 7 days:':'అంతకు ముందు 7 రోజులు:', 'Change vs previous 7 days:':'మునుపటి 7 రోజులుతో పోలిస్తే మార్పు:', 'not calculable because previous-period sales were ₹0':'మునుపటి కాలపు అమ్మకాలు ₹0 కాబట్టి లెక్కించలేము', 'Previous 7-day comparison: not available (no bills found in that period).':'మునుపటి 7 రోజుల పోలిక అందుబాటులో లేదు (ఆ కాలంలో బిల్లులు లేవు).', 'Most-sold items by units in saved bills:':'సేవ్ చేసిన బిల్లుల్లో ఎక్కువగా అమ్మిన వస్తువులు:',
      'This is the value of recorded bills, not profit. Only records saved in this browser are included.':'ఇది నమోదైన బిల్లుల విలువ మాత్రమే, లాభం కాదు. ఈ బ్రౌజర్‌లోని రికార్డులే ఇందులో ఉంటాయి.',
      'No saved expense entries were found. Add expenses on the Expenses page first.':'సేవ్ చేసిన ఖర్చుల నమోదు లేదు. ముందుగా ఖర్చుల పేజీలో నమోదు చేయండి.','Saved expense summary:':'సేవ్ చేసిన ఖర్చుల సారాంశం:', 'Total saved entries:':'మొత్తం సేవ్ చేసిన నమోదులు:', 'Total of all saved expenses:':'అన్ని ఖర్చుల మొత్తం:', 'Expenses in the last 30 days:':'గత 30 రోజుల ఖర్చులు:', 'Last-30-day category breakdown:':'గత 30 రోజుల వర్గాల వారీ ఖర్చులు:', 'No expenses dated in the last 30 days.':'గత 30 రోజుల తేదీల్లో ఖర్చులు లేవు.',
      'Profit cannot be calculated reliably yet because recorded bill totals do not include item-level purchase cost / cost of goods sold.':'బిల్లుల్లో ఒక్కో వస్తువు కొనుగోలు ధర లేనందున ఇప్పుడే లాభాన్ని ఖచ్చితంగా లెక్కించలేం.',
      'Expiry dates to review:':'తనిఖీ చేయాల్సిన గడువు తేదీలు:', 'expired':'గడువు ముగిసింది', 'expires today':'ఈరోజు గడువు ముగుస్తుంది', 'expires in ':'లో గడువు ముగుస్తుంది ', 'day(s) ago':'రోజుల క్రితం', 'day(s)':'రోజులు', 'stock ':'స్టాక్ ', 'No inventory expiry dates within the next 7 days were found. This is useful only if expiry dates are recorded.':'తదుపరి 7 రోజుల్లో గడువు ముగిసే ఉత్పత్తులు లేవు. గడువు తేదీలు నమోదు చేసినప్పుడే ఇది ఉపయోగకరం.',
      'Sustainability waste log:':'సుస్థిరత వ్యర్థాల రికార్డు:', 'record(s), ':'నమోదులు, ', ' kg recorded.':' కిలోలు నమోదు.','Use first-expiry-first-out (FEFO), move near-expiry stock forward, and review food-safety requirements before selling or disposing of items.':'ముందుగా గడువు ముగిసే వస్తువులను ముందుగా అమ్మండి (FEFO), గడువు దగ్గరలో ఉన్న స్టాక్‌ను ముందుకు పెట్టండి; అమ్మే లేదా పారేసే ముందు ఆహార భద్రత నియమాలు చూడండి.',
      'Practical sustainability review:':'సుస్థిరతకు ఉపయోగకరమైన సూచనలు:', 'Compare electricity and water use across the same period each month.':'ప్రతి నెల ఒకే కాలానికి విద్యుత్, నీటి వినియోగాన్ని పోల్చండి.','Use FEFO and record products discarded due to expiry or spoilage.':'FEFO పాటించండి; గడువు లేదా పాడవడం వల్ల పారేసిన వస్తువులను నమోదు చేయండి.','Separate recyclable packaging and compost suitable organic waste where local services allow.':'రీసైకిల్ చేయగల ప్యాకేజింగ్‌ను వేరు చేసి, సౌకర్యం ఉన్నచోట సేంద్రియ వ్యర్థాలతో కంపోస్ట్ చేయండి.','Switch off unused equipment and maintain refrigerator seals and temperatures.':'వాడని పరికరాలను ఆపి, ఫ్రిజ్ సీల్స్ మరియు ఉష్ణోగ్రతను సరిగ్గా ఉంచండి.','No saved footprint estimate found yet.':'ఇంకా పర్యావరణ ప్రభావ అంచనా సేవ్ కాలేదు.','The footprint is an estimate based on the factors entered, not a verified audit.':'ఇది నమోదు చేసిన కారకాల ఆధారంగా అంచనా మాత్రమే; ధృవీకరించిన ఆడిట్ కాదు.',
      'I can analyse saved records in this browser:':'ఈ బ్రౌజర్‌లో సేవ్ చేసిన రికార్డులను విశ్లేషించగలను:', '“What should I restock?” — inventory thresholds and quantities from saved bills.':'“ఏవి మళ్లీ తెప్పించాలి?” — స్టాక్ పరిమితులు, బిల్లుల్లోని పరిమాణాలు.','“Summarise my sales” — bill totals, 7-day comparison, and top items.':'“నా అమ్మకాల సారాంశం” — బిల్లుల మొత్తం, 7 రోజుల పోలిక, ఎక్కువగా అమ్మిన వస్తువులు.','“Summarise my expenses” — expense totals and category breakdown.':'“నా ఖర్చుల సారాంశం” — మొత్తం ఖర్చు, వర్గాల వారీ వివరాలు.','“What expiry risks should I check?” — recorded expiry dates and waste log.':'“ఏ గడువు తేదీలు చూడాలి?” — నమోదు చేసిన గడువు తేదీలు, వ్యర్థాల రికార్డు.','“How can I reduce waste?” — sustainability estimate and waste records.':'“వృథాను ఎలా తగ్గించాలి?” — సుస్థిరత అంచనా, వ్యర్థాల రికార్డులు.','I am a free, rule-based prototype, not a generative AI model. I do not send your records to an AI provider or make changes for you.':'నేను ఉచిత, నియమాల ఆధారిత నమూనాను; జనరేటివ్ AI మోడల్‌ను కాదు. మీ రికార్డులను AI సేవకు పంపను, మీ తరఫున మార్పులు చేయను.',
      'I can analyse saved Kirana Keeper records with predefined business rules, rather than open-ended AI reasoning. Try “What should I restock?”, “Summarise my sales”, “Summarise my expenses”, “What expiry risks should I check?”, or “How can I reduce waste?”.':'ముందుగా నిర్ణయించిన వ్యాపార నియమాలతో Kirana Keeper రికార్డులను విశ్లేషించగలను. “ఏవి మళ్లీ తెప్పించాలి?”, “అమ్మకాల సారాంశం”, “ఖర్చుల సారాంశం”, “ఏ గడువు చూడాలి?” లేదా “వృథాను ఎలా తగ్గించాలి?” అని అడగండి.'
    };
    const map = lang === 'hi' ? hi : te;
    let out = text;
    // Replace longest phrases first so labels do not interfere with complete sentences.
    Object.keys(map).sort((a,b)=>b.length-a.length).forEach(key=>{out=out.split(key).join(map[key]);});
    return out;
  }
  function readShopData(){
    const get=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch(_){return fallback}};
    return {
      inventory:get(KEYS.inventory,[]), bills:get(KEYS.bills,[]), expenses:get(KEYS.expenses,[]),
      sustainabilityFootprint:get(KEYS.footprint,null), sustainabilityWaste:get(KEYS.waste,[])
    };
  }
  function cloudConfig(){
    const c=window.KK_AI_CONFIG||{};
    return c.SUPABASE_URL&&c.SUPABASE_URL.startsWith('https://')&&
      c.SUPABASE_PUBLISHABLE_KEY&&!c.SUPABASE_PUBLISHABLE_KEY.includes('YOUR_')&&
      c.FUNCTION_NAME&&!c.FUNCTION_NAME.includes('YOUR_')?c:null;
  }
  async function ask(text){
    const clean=String(text||'').trim();if(!clean)return;
    const lang=(window.KiranaKeeperI18n&&window.KiranaKeeperI18n.language)||localStorage.getItem('kiranaKeeperLanguage')||'en';
    addMessage('owner',clean);
    const cfg=cloudConfig();
    if(!cfg){addMessage('assistant',localizeAnswer(answer(normalizePrompt(clean,lang)),lang)+'\n\nTo enable Gemini, fill in ai-config.js with your Supabase project URL, publishable key, and deployed function name.');return;}
    const waiting=document.createElement('div');waiting.className='kk-ai-message assistant';
    const title=document.createElement('strong');title.textContent='Shop Manager';
    const paragraph=document.createElement('p');paragraph.textContent=lang==='te'?'సమాధానం సిద్ధం చేస్తోంది…':lang==='hi'?'जवाब तैयार हो रहा है…':'Thinking…';
    waiting.append(title,paragraph);chat.appendChild(waiting);chat.scrollTop=chat.scrollHeight;
    form.querySelector('button[type="submit"]').disabled=true;
    try{
      const root=cfg.SUPABASE_URL.replace(/\/+$/,'');
      const response=await fetch(`${root}/functions/v1/${encodeURIComponent(cfg.FUNCTION_NAME)}`,{
        method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.SUPABASE_PUBLISHABLE_KEY,'Authorization':`Bearer ${cfg.SUPABASE_PUBLISHABLE_KEY}`},
        body:JSON.stringify({message:clean,language:lang,shopData:readShopData()})
      });
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||`Request failed (${response.status})`);
      paragraph.textContent=payload.reply||payload.answer||'The AI returned an empty response. Please try again.';
    }catch(err){
      console.error('Kirana Keeper Gemini request failed:',err);
      paragraph.textContent=(lang==='te'?'AI సేవను చేరుకోలేకపోయాం. Supabase URL, function పేరు, key మరియు function access సెట్టింగులను తనిఖీ చేయండి.':lang==='hi'?'AI सेवा से कनेक्ट नहीं हो सका। Supabase URL, function नाम, key और access settings जाँचें।':'Could not connect to the AI service. Check the Supabase URL, function name, publishable key, and function access settings.')+'\n\n'+localizeAnswer(answer(normalizePrompt(clean,lang)),lang);
    }finally{form.querySelector('button[type="submit"]').disabled=false;chat.scrollTop=chat.scrollHeight;}
  }
  form.addEventListener('submit',e=>{e.preventDefault();ask(input.value);input.value='';input.focus()});
  document.querySelectorAll('[data-ai-prompt]').forEach(b=>b.addEventListener('click',()=>{const prompts={restock:'What should I restock?',sales:'Summarise my sales',expiry:'What expiry risks should I check?',sustainability:'How can I reduce waste?'};ask(prompts[b.dataset.aiPrompt]||b.textContent)}));
})();