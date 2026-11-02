import test from 'node:test';import assert from 'node:assert/strict';
const calls=[];globalThis.fetch=async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});await new Promise(r=>setTimeout(r,Math.random()*8));return new Response(JSON.stringify({choices:[{message:{content:JSON.parse(init.body).messages[0].content.includes('Tinkra')?'Tinkra':'Ryx'}}]}),{status:200})};
process.env.Xia_API_Key='test-xai';process.env.Seek_API_Key='test-deepseek';
const {characterRouting,profiles}=await import('./lib/character-routing.mjs');
test('concurrent profiles keep independent routes; retain handler guards',async()=>{
 const handler=async(req,res)=>{assert.equal(req.body.persona,'aethon');if(req.body.messages[0].content==='reject'){res.status=429;return;}const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/test:generateContent',{method:'POST',body:'{}'});res.data=await r.json()};
 const run=characterRouting(handler);const a={method:'POST',body:{persona:'vector',messages:[{role:'user',content:'hello'}]}},b={method:'POST',body:{persona:'ryx',messages:[{role:'user',content:'hello'}]}};const ra={},rb={};await Promise.all([run(a,ra),run(b,rb)]);
 assert.match(calls[0].url,/deepseek/);assert.match(calls[1].url,/x.ai/);assert.equal(ra.data.candidates[0].content.parts[0].text,'Tinkra');assert.equal(rb.data.candidates[0].content.parts[0].text,'Ryx');assert.equal(a.body.persona,'vector');const prior=calls.length,r={};await run({method:'POST',body:{persona:'tinkra',messages:[{role:'user',content:'reject'}]}},r);assert.equal(r.status,429);assert.equal(calls.length,prior);
});
test('ten named language characters with no provider override from client',()=>{assert.equal(Object.keys(profiles).length,10);assert.equal(profiles.caelis.name,'Quorik');assert.equal(profiles.vera.name,'Lurnix')});
