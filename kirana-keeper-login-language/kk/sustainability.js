(() => {
const $ = id => document.getElementById(id);
const footprintKey='kkSustainabilityFootprintV1', wasteKey='kkSustainabilityWasteV1';
const num=id=>Math.max(0,Number($(id)?.value||0));
const fmt=n=>Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function saveFootprint(e){e.preventDefault();
 const electricity=num('electricityKwh')*num('electricityFactor');
 const water=num('waterLitres')*num('waterFactor');
 const waste=num('landfillKg')*num('landfillFactor')+num('recycledKg')*num('recycledFactor')+num('compostKg')*num('compostFactor');
 const data={period:$('footprintPeriod').value,electricityKwh:num('electricityKwh'),waterLitres:num('waterLitres'),landfillKg:num('landfillKg'),recycledKg:num('recycledKg'),compostKg:num('compostKg'),electricityFactor:num('electricityFactor'),waterFactor:num('waterFactor'),landfillFactor:num('landfillFactor'),recycledFactor:num('recycledFactor'),compostFactor:num('compostFactor'),electricity,water,waste,total:electricity+water+waste,savedAt:new Date().toISOString()};
 localStorage.setItem(footprintKey,JSON.stringify(data));renderFootprint(data);
 $('footprintNote').textContent='Estimate saved in this browser. Default factors are illustrative and may not match your local grid or waste service.';
}
function renderFootprint(d){if(!d)return;$('electricityEmissions').textContent=fmt(d.electricity)+' kg';$('waterEmissions').textContent=fmt(d.water)+' kg';$('wasteEmissions').textContent=fmt(d.waste)+' kg';$('totalEmissions').textContent=fmt(d.total);$('footprintPeriod').value=d.period;
 ['electricityKwh','waterLitres','landfillKg','recycledKg','compostKg','electricityFactor','waterFactor','landfillFactor','recycledFactor','compostFactor'].forEach(k=>{if($(k)&&d[k]!==undefined)$(k).value=d[k]});
}
function clearFootprint(){['electricityKwh','waterLitres','landfillKg','recycledKg','compostKg'].forEach(k=>$(k).value='');localStorage.removeItem(footprintKey);['electricityEmissions','waterEmissions','wasteEmissions','totalEmissions'].forEach(k=>$(k).textContent='—');$('footprintNote').textContent='Inputs cleared. Enter new usage values to calculate another estimate.'}
function loadWaste(){try{return JSON.parse(localStorage.getItem(wasteKey)||'[]')}catch(e){return []}}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderWaste(){const records=loadWaste(),rows=$('wasteRows');rows.innerHTML='';records.forEach((r,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${safe(r.date)}</td><td>${safe(r.item)}</td><td>${safe(r.reason)}</td><td>${safe(r.handling)}</td><td>${fmt(r.quantity)} kg</td><td><button class="waste-delete" type="button" data-index="${i}" aria-label="Delete waste record">×</button></td>`;rows.appendChild(tr)});
$('wasteEmpty').style.display=records.length?'none':'block';$('wasteTotal').textContent=fmt(records.reduce((s,r)=>s+r.quantity,0))+' kg';$('wasteRecordCount').textContent=records.length;$('wasteFoodCount').textContent=records.filter(r=>['Expired','Spoiled'].includes(r.reason)).length;
rows.querySelectorAll('button[data-index]').forEach(b=>b.addEventListener('click',()=>{const all=loadWaste();all.splice(Number(b.dataset.index),1);localStorage.setItem(wasteKey,JSON.stringify(all));renderWaste()}));
}
$('footprintForm')?.addEventListener('submit',saveFootprint);$('clearFootprint')?.addEventListener('click',clearFootprint);
$('wasteDate').value=new Date().toISOString().slice(0,10);
$('wasteForm')?.addEventListener('submit',e=>{e.preventDefault();const records=loadWaste();records.unshift({item:$('wasteItem').value.trim(),quantity:Number($('wasteQuantity').value),reason:$('wasteReason').value,handling:$('wasteHandling').value,date:$('wasteDate').value});localStorage.setItem(wasteKey,JSON.stringify(records));$('wasteForm').reset();$('wasteDate').value=new Date().toISOString().slice(0,10);renderWaste();if(typeof showToast==='function')showToast('Waste record saved.')});
try{const saved=JSON.parse(localStorage.getItem(footprintKey)||'null');if(saved)renderFootprint(saved)}catch(e){}renderWaste();
})();