const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync(__dirname+'/spotlight.js','utf8');
function app(hash,replies) {
 const calls=[],events={}; const root={innerHTML:'LOCKED',dataset:{}}; const note={textContent:''};
 const context={Date,Intl,console,URL,window:{spotlightLockedMarkup:'LOCKED'},location:{hash},
 document:{getElementById:id=>id==='spotlight-root'?root:id==='spotlight-notice'?note:{},addEventListener:(n,f)=>events[n]=f},
 MutationObserver:class {observe(){}},setInterval(){},confirm:()=>true,
 FormData:class {constructor(f){this.f=f;}get(k){return this.f.data[k];}},
 fetch:async(url,options)=>{calls.push({url,options});const r=replies.shift();if(!r) throw Error('unexpected request');return {ok:r.status===undefined||r.status<400,status:r.status||200,json:async()=>r.data};}};
 vm.runInNewContext(code,context);return {root,note,calls,events};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const promotion={id:'00000000-0000-4000-8000-000000000001',title:'Approved offer',kind:'promo',description:'Human written',perks:'A real perk',code:'APPROVED',eligibility:'Customers',terms:'Rules',quantity:1,action_url:'https://example.com/offer',starts_at:'2020-01-01T00:00:00Z',ends_at:'2099-01-01T00:00:00Z',status:'published'};
test('locked public Spotlight never requests or displays promotions',async()=>{const a=app('#/spotlight',[{data:[{locked:true}]}]);await flush();assert.equal(a.root.innerHTML,'LOCKED');assert.equal(a.calls.length,1);});
test('storage failure fails closed',async()=>{const a=app('#/spotlight',[{status:503}]);await flush();assert.equal(a.root.innerHTML,'LOCKED');});
test('public view filters expired and draft rows even if returned by transport',async()=>{const a=app('#/spotlight',[{data:[{locked:false}]},{data:[promotion,{...promotion,title:'EXPIRED',ends_at:'2021-01-01'},{...promotion,title:'DRAFT',status:'draft'}]}]);await flush();assert.match(a.root.innerHTML,/Approved offer/);assert.doesNotMatch(a.root.innerHTML,/EXPIRED|DRAFT/);});
test('unverified email cannot reach admin RPC',async()=>{const a=app('#/spotlight-admin',[{data:{access_token:'session'}},{data:{email_confirmed_at:null}}]);await a.events.submit({preventDefault(){},target:{id:'spotlight-login',data:{email:'test@example.com',password:'test'},reset(){}}});assert.equal(a.calls.length,2);assert.match(a.note.textContent,/Verify your account email/);});
test('signed-in non-admin is refused, independent of demo roles',async()=>{const a=app('#/spotlight-admin',[{data:{access_token:'session'}},{data:{email_confirmed_at:'2026-01-01'}},{data:false}]);await a.events.submit({preventDefault(){},target:{id:'spotlight-login',data:{email:'test@example.com',password:'test'},reset(){}}});assert.match(a.note.textContent,/not authorized/);assert.equal(a.calls.length,3);assert.doesNotMatch(a.root.innerHTML,/Save draft/);});
test('verified admin must explicitly launch saved draft; action changes only status',async()=>{const a=app('#/spotlight-admin',[{data:{access_token:'session'}},{data:{email_confirmed_at:'2026-01-01'}},{data:true},{data:[{locked:true}]},{data:[{...promotion,status:'draft'}]},{data:[promotion]},{data:true},{data:[{locked:true}]},{data:[promotion]}]);await a.events.submit({preventDefault(){},target:{id:'spotlight-login',data:{email:'admin@example.com',password:'test'},reset(){}}});assert.match(a.root.innerHTML,/Save draft/);assert.equal(a.calls.filter(c=>c.options.method==='PATCH').length,0);await a.events.click({target:{closest:()=>({dataset:{spot:'launch',id:promotion.id}})}});const write=a.calls.find(c=>c.options.method==='PATCH');assert.deepEqual(JSON.parse(write.options.body),{status:'published'});assert.equal(write.options.headers.Authorization,'Bearer session');assert.match(a.root.innerHTML,/Spotlight locked/);});
test('public content escapes HTML in human-authored offers',async()=>{const a=app('#/spotlight',[{data:[{locked:false}]},{data:[{...promotion,title:'<script>alert(1)</script>'}]}]);await flush();assert.doesNotMatch(a.root.innerHTML,/<script>/);assert.match(a.root.innerHTML,/&lt;script&gt;/);});
