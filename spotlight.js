/* Human-managed Spotlight. Demo portal roles and localStorage never authorize writes. */
(() => {
  const base = 'https://skuwewlgtddqtcnpwhas.supabase.co';
  const key = 'sb_publishable_ir6Dehzk9kX-G_XySFx1oQ_z_If4Oa5';
  let token = '', admin = false, rows = [], locked = true, selected = null, busy = false;
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mount = () => document.getElementById('spotlight-root');
  const adminRoute = () => location.hash === '#/spotlight-admin';
  const stamp = value => new Date(value).toLocaleString(undefined, {dateStyle:'medium',timeStyle:'short',timeZoneName:undefined});
  const localDate = value => { if (!value) return ''; const d = new Date(value); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); };
  async function api(path, method='GET', body) {
    const result = await fetch(base+path, {method, cache:'no-store', headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',Prefer:'return=representation'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
    if (!result.ok) {
      if (result.status === 401) { token=''; admin=false; }
      throw new Error(result.status===401?'Your session expired. Sign in again.':result.status===403?'This account is not authorized to manage Spotlight.':'Spotlight storage is unavailable or has not been activated. No changes were saved.');
    }
    return result.status===204?null:result.json();
  }
  function notice(message) { const el=document.getElementById('spotlight-notice'); if(el) el.textContent=message; }
  function card(p) { return `<article class="panel"><span class="tag">${e(p.kind==='giveaway'?'Giveaway':'Promo code')}</span><h2 class="h3" style="margin-top:18px">${e(p.title)}</h2><p style="white-space:pre-wrap">${e(p.description)}</p><p><b>Perks:</b> ${e(p.perks)}</p>${p.code?`<p class="code">${e(p.code)}</p>`:''}<p class="small mute">Starts: ${e(stamp(p.starts_at))}<br>Ends: ${e(stamp(p.ends_at))}${p.quantity?`<br>Available: ${e(p.quantity)}`:''}</p><p class="small"><b>Eligibility:</b> ${e(p.eligibility)}</p><details><summary>Rules &amp; terms</summary><p style="white-space:pre-wrap">${e(p.terms)}</p></details>${p.action_url?`<a class="btn primary" style="margin-top:18px" href="${e(p.action_url)}" target="_blank" rel="noopener noreferrer">${p.kind==='giveaway'?'View entry instructions':'View offer'} ↗</a>`:''}</article>`; }
  async function loadPublic() {
    const root=mount(); if(!root || adminRoute()) return;
    try {
      const settings=await api('/rest/v1/hq_spotlight_settings?select=locked&id=eq.1');
      if(settings.length!==1 || settings[0].locked!==false) return;
      const items=await api('/rest/v1/hq_spotlight_promotions?select=id,kind,title,description,perks,code,quantity,eligibility,terms,action_url,starts_at,ends_at,status&status=eq.published&order=starts_at.desc');
      if(mount()!==root || adminRoute()) return;
      const current=items.filter(p=>p.status==='published' && Date.parse(p.starts_at)<=Date.now() && Date.parse(p.ends_at)>Date.now());
      root.innerHTML=current.length?`<div class="grid g2">${current.map(card).join('')}</div>`:'<div class="panel"><h2 class="h2">No active promotions</h2><p>New promotions appear here after the Terqyn team launches them.</p></div>';
    } catch { /* Fail closed: the lock remains visible on configuration or network failure. */ }
  }
  function field(id,label,value='',type='text') { return `<label class="f"><span>${label}</span><input class="inp" name="${id}" type="${type}" value="${e(value)}" ${id==='code'||id==='quantity'||id==='action_url'?'':'required'} ${id==='quantity'?'min="1" step="1"':''} maxlength="${id==='title'?160:id==='code'?80:2048}"></label>`; }
  function area(id,label,value='') { return `<label class="f"><span>${label}</span><textarea class="inp" name="${id}" required maxlength="8000">${e(value)}</textarea></label>`; }
  function editor() {
    const p=selected||{};
    return `<form id="spotlight-editor" class="panel stack"><h2 class="h3">${p.id?'Edit promotion':'Create promotion'}</h2><p class="small mute">All times use your device time zone (${e(Intl.DateTimeFormat().resolvedOptions().timeZone)}). Saving a live promotion returns it to draft. Launch is a separate action.</p><label class="f"><span>Promotion type</span><select name="kind" class="inp"><option value="promo" ${p.kind==='promo'?'selected':''}>Promo code</option><option value="giveaway" ${p.kind==='giveaway'?'selected':''}>Giveaway</option></select></label>${field('title','Title',p.title)}${area('description','Description',p.description)}${area('perks','Perks / prize / discount details',p.perks)}${field('code','Promo code (required for promo codes)',p.code)}<div class="grid g2">${field('starts_at','Start date & time',localDate(p.starts_at),'datetime-local')}${field('ends_at','End date & time',localDate(p.ends_at),'datetime-local')}</div>${field('quantity','Quantity / redemption limit (optional)',p.quantity,'number')}${field('eligibility','Who is eligible?',p.eligibility)}${area('terms','Rules, terms & redemption instructions',p.terms)}${field('action_url','HTTPS entry / redemption page (required to launch)',p.action_url,'url')}<p class="small mute">Limits and discounts must also be configured in the linked entry or checkout system. Spotlight displays the offer; it does not issue checkout discounts or select winners.</p><div class="row"><button class="btn primary" type="submit">Save draft</button><button class="btn" type="button" data-spot="new">New promotion</button></div></form>`;
  }
  function drawAdmin() {
    const root=mount(); if(!root || !adminRoute()) return;
    root.innerHTML=!admin?`<div class="panel" style="max-width:580px"><h2 class="h2">Verified admin sign-in</h2><p>Use your existing Terqyn account. Only accounts explicitly authorized for Spotlight can create or launch promotions.</p><form id="spotlight-login" class="stack">${field('email','Email','','email')}${field('password','Password','','password')}<button class="btn primary">Sign in</button></form><p id="spotlight-notice" role="status" aria-live="polite"></p></div>`:`<div class="panel"><span class="tag ${locked?'warn':'good'}">Spotlight ${locked?'locked':'unlocked'}</span><p>Launching authorizes the exact promotion and its dates. Spotlight must also be unlocked before visitors can see active promotions. There is no automatic generation or winner selection.</p><div class="row"><button class="btn ${locked?'':'primary'}" data-spot="lock" data-value="${locked?'false':'true'}">${locked?'Unlock Spotlight':'Lock Spotlight now'}</button><button class="btn" data-spot="logout">Sign out</button></div><p id="spotlight-notice" role="status" aria-live="polite"></p></div><div class="grid g2" style="margin-top:24px;align-items:start">${editor()}<div class="stack"><h2 class="h3">Promotions</h2>${rows.length?rows.map(p=>`<article class="panel"><span class="tag">${e(p.status)}</span><h3 class="h3">${e(p.title)}</h3><p>${e(p.perks)}</p><p class="small mute">${e(stamp(p.starts_at))} – ${e(stamp(p.ends_at))}</p><div class="row"><button class="btn sm" data-spot="edit" data-id="${p.id}">Edit</button><button class="btn sm" data-spot="preview" data-id="${p.id}">Preview</button>${p.status!=='published'?`<button class="btn primary sm" data-spot="launch" data-id="${p.id}">Launch / authorize schedule</button>`:`<button class="btn sm" data-spot="pause" data-id="${p.id}">Pause</button>`}</div></article>`).join(''):'<p class="mute">No promotions yet. Create a draft to begin.</p>'}</div></div><div id="spotlight-preview" style="margin-top:24px"></div>`;
  }
  async function refreshAdmin() {
    admin=(await api('/rest/v1/rpc/hq_spotlight_is_admin','POST',{}))===true;
    if(!admin) {token=''; throw new Error('This account is not authorized to manage Spotlight.');}
    const settings=await api('/rest/v1/hq_spotlight_settings?select=locked&id=eq.1');
    if(settings.length!==1) throw new Error('Spotlight storage has not been activated.');
    locked=settings[0].locked;
    rows=await api('/rest/v1/hq_spotlight_promotions?select=*&order=created_at.desc');
  }
  function valid(p,launch=false) {
    if(!p.title.trim()||!p.description.trim()||!p.perks.trim()||!p.eligibility.trim()||!p.terms.trim()) throw new Error('Complete the title, description, perks, eligibility and rules.');
    if(!Number.isFinite(Date.parse(p.starts_at))||!Number.isFinite(Date.parse(p.ends_at))||Date.parse(p.ends_at)<=Date.parse(p.starts_at)) throw new Error('End time must be after the start time.');
    if(p.kind==='promo'&&!p.code?.trim()) throw new Error('Add the promo code.');
    if(p.quantity!==null&&(!Number.isInteger(p.quantity)||p.quantity<1)) throw new Error('Quantity must be a positive whole number.');
    if(p.action_url&&!/^https:\/\/[^\s]+$/i.test(p.action_url)) throw new Error('Use a valid HTTPS entry or redemption URL.');
    if(launch && (!p.action_url || Date.parse(p.ends_at)<=Date.now())) throw new Error('Launching requires an HTTPS entry or redemption page and a future end time.');
  }
  document.addEventListener('submit',async event=>{
    if(!['spotlight-login','spotlight-editor'].includes(event.target.id)) return;
    event.preventDefault(); if(busy) return; busy=true;
    try {
      const form=event.target, data=new FormData(form);
      if(form.id==='spotlight-login') {
        const auth=await api('/auth/v1/token?grant_type=password','POST',{email:data.get('email'),password:data.get('password')});
        form.reset(); token=auth.access_token;
        const user=await api('/auth/v1/user');
        if(!user.email_confirmed_at) {token=''; throw new Error('Verify your account email before managing Spotlight.');}
        await refreshAdmin(); drawAdmin();
      } else {
        const p=Object.fromEntries(data);
        p.quantity=p.quantity?Number(p.quantity):null;
        for(const key of ['starts_at','ends_at']) p[key]=p[key]?new Date(p[key]).toISOString():'';
        p.code=p.code.trim(); p.action_url=p.action_url.trim(); p.status='draft'; valid(p);
        const result=await api('/rest/v1/hq_spotlight_promotions'+(selected?'?id=eq.'+selected.id:''),selected?'PATCH':'POST',p);
        selected=result[0]||null; await refreshAdmin(); drawAdmin(); notice('Draft saved. Nothing was launched.');
      }
    } catch(error) {notice(error.message);} finally {busy=false;}
  });
  document.addEventListener('click',async event=>{
    const el=event.target.closest('[data-spot]'); if(!el || busy) return;
    const action=el.dataset.spot, p=rows.find(row=>row.id===el.dataset.id);
    if(action==='logout') {token='';admin=false;rows=[];selected=null;drawAdmin();return;}
    if(!admin) return;
    if(action==='new'||action==='edit') {selected=action==='edit'?p:null;drawAdmin();return;}
    if(action==='preview') {document.getElementById('spotlight-preview').innerHTML='<p class="tag warn">Admin preview — not a public launch</p>'+card(p);return;}
    busy=true;
    try {
      if(action==='lock') {
        const value=el.dataset.value==='true';
        if(!value&&!confirm('Unlock Spotlight? Only manually launched promotions within their approved dates will be visible.')) return;
        await api('/rest/v1/hq_spotlight_settings?id=eq.1','PATCH',{locked:value});
      } else if(action==='launch') {
        valid(p,true);
        if(!confirm('Launch “'+p.title+'” with these saved perks and dates? It will be visible during its approved period when Spotlight is unlocked.')) return;
        await api('/rest/v1/hq_spotlight_promotions?id=eq.'+p.id,'PATCH',{status:'published'});
      } else if(action==='pause') await api('/rest/v1/hq_spotlight_promotions?id=eq.'+p.id,'PATCH',{status:'paused'});
      await refreshAdmin();drawAdmin();notice('Change saved.');
    } catch(error) {notice(error.message);} finally {busy=false;}
  });
  const observer=new MutationObserver(()=>{const root=mount();if(!root||root.dataset.initialized) return;root.dataset.initialized='true';if(adminRoute())drawAdmin();else loadPublic();});
  observer.observe(document.getElementById('app'),{childList:true});
  const root=mount(); if(root) {root.dataset.initialized='true';if(adminRoute())drawAdmin();else loadPublic();}
  // Recheck lock and time windows; never retain expired offers or a stale unlocked page.
  setInterval(()=>{if(!adminRoute()&&mount()){mount().innerHTML=window.spotlightLockedMarkup;loadPublic();}},30000);
})();
