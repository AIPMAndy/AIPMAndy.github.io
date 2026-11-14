'use strict';
const prompts=JSON.parse(document.getElementById('prompt-data').textContent);
const category=document.getElementById('category'), query=document.getElementById('prompt-search'),cards=[...document.querySelectorAll('.prompt-card')];
const count=document.getElementById('prompt-count'),empty=document.getElementById('empty-message');
function filter(){const cat=category.value,q=query.value.trim().toLocaleLowerCase();let n=0;for(const c of cards){const show=(cat==='all'||c.dataset.category===cat)&&(!q||c.dataset.query.includes(q));c.hidden=!show;if(show)n++;}count.textContent=n+' 个模板';empty.hidden=!!n;}
category.addEventListener('change',filter);query.addEventListener('input',filter);
let toastTimer;
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('已复制到剪贴板');}catch{const el=document.createElement('textarea');el.value=text;el.setAttribute('readonly','');el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();toast(ok?'已复制到剪贴板':'复制失败，请展开模板手动复制');}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copyText(prompts[b.dataset.copy]);});
document.addEventListener('click',e=>{if(e.target.closest('[data-copy-wechat]'))copyText('AIPMAndy');});
const ids=['frequency','manual','agent','hourly','cost'];const inps=ids.map(id=>document.getElementById(id));function calculate(){let [frequency,manual,agent,hourly,cost]=inps.map(el=>Math.max(0,Number(el.value)||0));let hours=frequency*(manual-agent)/60,net=hours*hourly-cost;document.getElementById('saved-hours').textContent=hours.toLocaleString('zh-CN',{maximumFractionDigits:1});document.getElementById('net-value').textContent=net.toLocaleString('zh-CN',{maximumFractionDigits:0});}
inps.forEach(el=>el.addEventListener('input',calculate));document.getElementById('calc-form').addEventListener('submit',e=>e.preventDefault());calculate();
