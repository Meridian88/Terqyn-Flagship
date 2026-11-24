import { profiles as renamedProfiles } from '../lib/character-routing.mjs';
const approvedNames={muse:'Nova',aegis:'Reid',vera:'Luca',aethon:'Atlas',vector:'Axel',caelis:'Jett'};
for(const [id,name] of Object.entries(approvedNames))if(renamedProfiles[id])renamedProfiles[id].name=name;
import handler from '../lib/oracle-handler.mjs';
import { nexusOrigin } from '../lib/nexus-origin.mjs';
import { reservedIntelligences } from '../lib/agent-slots.mjs';
import { characterRouting } from '../lib/character-routing.mjs';
import { withQuotaFeedback } from '../lib/chat-quota-feedback.mjs';
const routed=withQuotaFeedback(nexusOrigin(characterRouting(reservedIntelligences(handler))));
const origins=new Set(['https://terqyn.com','https://www.terqyn.com','https://terqyn.nexus','https://www.terqyn.nexus','https://terqyn.tech','https://www.terqyn.tech']);
export default async function(req,res){
 const renamedIds={nova:'muse',reid:'aegis',luca:'vera',atlas:'aethon',axel:'vector',jett:'caelis'};
 if(req.body&&renamedIds[req.body.persona])req.body={...req.body,persona:renamedIds[req.body.persona]};
 const origin=req.headers.origin;
 if(origin&&origins.has(origin)){
  res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(204).end();
 }
 if(req.method==='OPTIONS')return res.status(403).end();
 if(origin&&origins.has(origin)){
  const setHeader=res.setHeader;req.headers.origin='https://terqyn.com';
  res.setHeader=function(name,value){return setHeader.call(this,name,name.toLowerCase()==='access-control-allow-origin'?origin:value)};
  try{return await routed(req,res)}finally{req.headers.origin=origin;res.setHeader=setHeader}
 }
 return routed(req,res);
}
