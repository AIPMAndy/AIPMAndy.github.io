(() => {
'use strict';
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const toast=$('#toast');let messageTimer=null;
function tell(s){if(!toast)return;toast.textContent=s;toast.classList.add('show');clearTimeout(messageTimer);messageTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
async function copyText(s){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(s);else {const t=document.createElement('textarea');t.value=s;document.body.append(t);t.select();if(!document.execCommand('copy'))throw Error('copy failed');t.remove()}tell('复制成功，可以直接粘贴使用');}catch(e){tell('复制失败，请手动选中文本');}}
$$('[data-copy]').forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copy)));
let selected='全部';const query=$('#prompt-search');const cards=$$('.prompt-card');const tabs=$$('.tab');
function filter(){const q=(query?.value||'').trim().toLowerCase();let shown=0;cards.forEach(c=>{const yes=(selected==='全部'||c.dataset.category===selected)&&(!q||(c.textContent+' '+c.dataset.prompt).toLowerCase().includes(q));c.classList.toggle('hide',!yes);shown+=Number(yes)});const n=$('#prompt-count');if(n)n.textContent=`当前显示 ${shown} / ${cards.length} 个模板`;const empty=$('#no-results');if(empty)empty.hidden=shown>0;}
query?.addEventListener('input',filter);tabs.forEach(t=>t.addEventListener('click',()=>{selected=t.dataset.cat;tabs.forEach(x=>x.setAttribute('aria-pressed',String(x===t)));filter()}));filter();
$$('.copy-prompt').forEach(b=>b.addEventListener('click',()=>{const p=b.closest('.prompt-card');copyText(p?.dataset.prompt||'')}));
const fields=['#goal','#audience','#materials','#deliverable','#limitations'];
function taskText(){const v=fields.map(x=>$(x)?.value.trim()||'');return `【目标】${v[0]||'请明确你真正要完成的工作'}\n【交付对象】${v[1]||'请描述由谁验收'}\n【输入材料】${v[2]||'请列出可用材料和来源'}\n【范围与约束】${v[4]||'没有授权的文件和系统不可使用'}\n【执行要求】先给三步计划；关键动作先确认；发现未知不猜测。\n【输出格式】${v[3]||'可编辑 Markdown / CSV + 文件清单'}\n【验收标准】事实可溯源、数据能复算、文件可打开、可回滚、敏感信息不外泄。\n【人工确认】外发、发布、付款、删除、覆盖和权限更改前必须暂停。\n【收尾报告】请列出完成/未完成/待核验事项，以及输出路径。`}
function renderTask(){const box=$('#task-preview');if(box)box.textContent=taskText()}
fields.forEach(f=>$(f)?.addEventListener('input',renderTask));renderTask();$('#copy-task')?.addEventListener('click',()=>copyText(taskText()));$('#download-task')?.addEventListener('click',()=>{const blob=new Blob([taskText()],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-doubao-task-protocol.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);tell('任务协议已导出')});
const calcFields=['#manual','#setup','#wait','#review','#rework','#repeat'];
function calc(){const vs=calcFields.map(k=>Math.max(0,Number($(k)?.value)||0));const [manual,setup,wait,review,rework,repeat]=vs;const net=manual-setup-wait-review-rework;const result=$('#calc-result');const month=$('#calc-month');if(result){result.textContent=(net>=0?'+':'')+net.toFixed(0)+' 分钟';result.classList.toggle('negative',net<0)}if(month)month.textContent=`每月 ${repeat} 次：${(net*repeat/60).toFixed(1)} 小时（假设条件下的估算，非真实收益）`;}
calcFields.forEach(s=>$(s)?.addEventListener('input',calc));calc();
const nav=$('#site-nav');$('#menu-toggle')?.addEventListener('click',()=>{const open=nav?.classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open))});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('#site-nav')?.classList.remove('open');$('#menu-toggle')?.setAttribute('aria-expanded','false')}));
})();
