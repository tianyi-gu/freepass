// Public-source triage, not a claim that every service is verified. A phone
// appearing on a website does not establish current hours or eligibility.
import fs from 'node:fs';
const resources=JSON.parse(fs.readFileSync('.context/audit/resources.json','utf8'));
const courses=JSON.parse(fs.readFileSync('.context/audit/courses.json','utf8'));
const cache=new Map();
async function inspect(raw){
  if(!raw)return {status:'missing_url'};
  let url;
  try{url=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);if(!['https:','http:'].includes(url.protocol)||url.username||url.password||!url.hostname.includes('.')||/^[\d.:]+$/.test(url.hostname)||url.hostname.endsWith('.local'))throw Error();}catch{return {status:'invalid_url'};}
  if(cache.has(url.href))return cache.get(url.href);
  const result=(async()=>{try{const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'FreePass directory verification (public contact information)'}});const html=await response.text();const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');return {status:response.status,url:response.url,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim()??'',digits:text.replace(/\D/g,''),contactLinks:[...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].filter((m)=>/contact/i.test(m[2])).slice(0,3).map((m)=>{try{return new URL(m[1],response.url).href}catch{return ''}})};}catch(error){return {status:'fetch_failed',reason:error.name};}})();cache.set(url.href,result);return result;
}
const items=[...resources.map((r)=>({type:'resource',id:r.id,name:r.name,website:r.website,phone:r.phone,last_verified:r.last_verified})),...courses.map((c)=>({type:'course',id:c.id,name:c.name,website:c.web_link||c.video_link,phone:null,last_verified:null}))];
const results=[];let next=0;
await Promise.all(Array.from({length:6},async()=>{while(next<items.length){const item=items[next++];const source=await inspect(item.website);const phone=(item.phone||'').replace(/\D/g,'');results.push({...item,source_status:source.status,final_url:source.url??'',source_title:source.title??'',phone_found_on_page:phone.length>=10?!!source.digits?.includes(phone.slice(-10)):null,contact_links:source.contactLinks??[],review_status:'Needs staff review of current services, hours, and eligibility'});}}));
results.sort((a,b)=>a.type.localeCompare(b.type)||a.name.localeCompare(b.name));
fs.writeFileSync('.context/audit/public-content-results.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
const columns=['type','id','name','website','phone','last_verified','source_status','final_url','source_title','phone_found_on_page','review_status'];
const escape=(value)=>'"'+String(value??'').replaceAll('"','""')+'"';
fs.mkdirSync('docs/audit',{recursive:true});
fs.writeFileSync('docs/audit/content-review.csv',columns.join(',')+'\n'+results.map((r)=>columns.map((c)=>escape(r[c])).join(',')).join('\n')+'\n');
console.log(JSON.stringify({records:results.length,resources:resources.length,courses:courses.length,recordedVerificationDates:resources.filter((r)=>r.last_verified).length,reachable:results.filter((r)=>r.source_status===200).length,phoneMatches:results.filter((r)=>r.phone_found_on_page).length,unreachable:results.filter((r)=>r.source_status!==200).map(({name,source_status})=>({name,source_status}))},null,2));
