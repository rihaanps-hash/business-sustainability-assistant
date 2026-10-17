(() => {
  const billsKey='kiranaKeeperBillsV1';
  const savingsKey='kkRecordedSavingsV1';
  const $=id=>document.getElementById(id);
  const read=(key)=>{try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
  const parseDate=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:d};
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const money=n=>'₹'+(Number(n)||0).toLocaleString('en-IN',{maximumFractionDigits:0});
  const startOfDay=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
  const monthKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const monthLabel=d=>d.toLocaleDateString('en-IN',{month:'short'});
  function renderBars(id,rows){
    const root=$(id);if(!root)return;root.innerHTML='';
    if(!rows.length||!rows.some(r=>r.value>0)){const p=document.createElement('div');p.className='kk-chart-empty';p.textContent='No recorded data for this period yet.';root.appendChild(p);return}
    const max=Math.max(...rows.map(r=>r.value),1);
    rows.forEach(row=>{
      const line=document.createElement('div');line.className='kk-bar-row';
      const label=document.createElement('span');label.className='kk-bar-label';label.textContent=row.label;label.title=row.label;
      const track=document.createElement('div');track.className='kk-bar-track';track.setAttribute('role','img');track.setAttribute('aria-label',`${row.label}: ${money(row.value)}`);
      const fill=document.createElement('div');fill.className='kk-bar-fill';fill.style.width=`${Math.max(0,row.value/max*100)}%`;track.appendChild(fill);
      const value=document.createElement('span');value.className='kk-bar-value';value.textContent=money(row.value);
      line.append(label,track,value);root.appendChild(line);
    });
  }
  function salesRows(){
    const bills=read(billsKey),today=startOfDay(new Date());
    const weekly=[];
    for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);const key=dateKey(d);const total=bills.reduce((sum,b)=>{const bd=parseDate(b.createdAt);return sum+(bd&&dateKey(bd)===key?(Number(b.total)||0):0)},0);weekly.push({label:d.toLocaleDateString('en-IN',{weekday:'short'}),value:total})}
    const monthly=[];
    for(let i=5;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1);const key=monthKey(d);const total=bills.reduce((sum,b)=>{const bd=parseDate(b.createdAt);return sum+(bd&&monthKey(bd)===key?(Number(b.total)||0):0)},0);monthly.push({label:monthLabel(d),value:total})}
    return {weekly,monthly};
  }
  function renderSavings(){
    const rows=read(savingsKey),today=new Date(),monthly=[];
    for(let i=5;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1),key=monthKey(d);monthly.push({label:monthLabel(d),value:rows.reduce((sum,r)=>{const rd=parseDate(r.date);return sum+(rd&&monthKey(rd)===key?(Number(r.amount)||0):0)},0)})}
    renderBars('kkMonthlySavingsChart',monthly);
  }
  function render(){
    const s=salesRows();renderBars('kkWeeklySalesChart',s.weekly);renderBars('kkMonthlySalesChart',s.monthly);renderSavings();
  }
  const form=$('kkSavingsForm');
  if(form){
    const date=$('kkSavingsDate');if(date&&!date.value)date.value=dateKey(new Date());
    form.addEventListener('submit',e=>{
      e.preventDefault();const description=$('kkSavingsDescription').value.trim(),amount=Number($('kkSavingsAmount').value),dateValue=$('kkSavingsDate').value;
      if(!description||!Number.isFinite(amount)||amount<=0||!dateValue)return;
      const rows=read(savingsKey);rows.push({description,amount,date:dateValue,createdAt:new Date().toISOString()});
      try{localStorage.setItem(savingsKey,JSON.stringify(rows));form.reset();if(date)date.value=dateKey(new Date());render();const note=document.createElement('p');note.className='sustain-muted';note.textContent='Saving recorded in this browser.';form.after(note);setTimeout(()=>note.remove(),3000)}catch(_){alert('Could not save this entry. Please check browser storage.')}
    });
  }
  window.addEventListener('storage',render);
  render();
})();