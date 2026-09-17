// Opt-in integration test. Creates two isolated accounts and private fixtures,
// then removes them in finally. Never targets existing users or content.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { config } from 'dotenv';
config({ quiet: true });
const base=process.env.EXPO_PUBLIC_SUPABASE_URL, anon=process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !anon || !service || process.env.RUN_PRODUCTION_SECURITY_CHECK !== 'yes') throw new Error('Explicit test opt-in and server credentials required');
const prefix=`freepass-audit-${Date.now()}`;const accounts=[];const questions=[];const posts=[];const files=[];const checks=[];
async function call(path,{token=service,method='GET',body,raw=false,headers={}}={}) {
 const r=await fetch(base+path,{method,headers:{apikey:token===service?service:anon,Authorization:`Bearer ${token}`,...(!raw&&body!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(body!==undefined?{body:raw?body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}return {status:r.status,ok:r.ok,data};
}
async function row(table,body,token=service){const r=await call('/rest/v1/'+table,{method:'POST',token,body,headers:{Prefer:'return=representation'}});assert.ok(r.ok,`${table} fixture status ${r.status}`);return r.data[0]}
function pass(name){checks.push(name);console.log('PASS '+name)}
try {
 for(let i=0;i<2;i++){const email=`${prefix}-${i}@example.invalid`, password=randomUUID()+'aA!';const created=await call('/auth/v1/admin/users',{method:'POST',body:{email,password,email_confirm:true,user_metadata:{display_name:'Temporary audit account'}}});assert.ok(created.ok,`create account ${created.status}`);accounts.push({id:created.data.id});const login=await call('/auth/v1/token?grant_type=password',{method:'POST',token:anon,body:{email,password}});assert.ok(login.ok);accounts[i].token=login.data.access_token;}const [a,b]=accounts;
 pass('Two isolated accounts sign in');
 const escalate=await call(`/rest/v1/profiles?id=eq.${a.id}`,{method:'PATCH',token:a.token,body:{is_staff:true}});assert.ok(!escalate.ok);pass('Ordinary user cannot self-assign staff');
 const feedback=await row('questions',{question:prefix+' private feedback',category:'Feedback',asked_by:'Audit',user_id:a.id},a.token);questions.push(feedback.id);
 for(const token of [anon,b.token]){const r=await call(`/rest/v1/questions?id=eq.${feedback.id}&select=id`,{token});assert.ok(r.ok);assert.equal(r.data.length,0);}assert.equal((await call(`/rest/v1/questions?id=eq.${feedback.id}&select=id`,{token:a.token})).data.length,1);pass('Feedback visible to owner and hidden from other users and guests');
 const question=await row('questions',{question:prefix+' public question',asked_by:'Audit',user_id:a.id},a.token);questions.push(question.id);
 const forged=await call('/rest/v1/questions',{method:'POST',token:a.token,body:{question:prefix,user_id:a.id,is_faq:true,upvotes:99}});assert.ok(!forged.ok);pass('Client cannot forge FAQ or vote fields');
 const strangerEdit=await call(`/rest/v1/questions?id=eq.${question.id}`,{method:'PATCH',token:b.token,body:{question:'Unauthorized'},headers:{Prefer:'return=representation'}});assert.ok(!strangerEdit.ok || strangerEdit.data.length===0);
 const ownEdit=await call(`/rest/v1/questions?id=eq.${question.id}`,{method:'PATCH',token:a.token,body:{question:prefix+' edited'},headers:{Prefer:'return=representation'}});assert.ok(ownEdit.ok);assert.equal(ownEdit.data.length,1);pass('Only the author can edit public questions');
 const v1=await call('/rest/v1/rpc/upvote_question',{method:'POST',token:b.token,body:{qid:question.id}});const v2=await call('/rest/v1/rpc/upvote_question',{method:'POST',token:b.token,body:{qid:question.id}});assert.ok(v1.ok&&v2.ok);assert.equal(v1.data,v2.data);pass('Repeated votes do not inflate totals');
 const badPost=await call('/rest/v1/community_posts',{method:'POST',token:a.token,body:{content:'fuck you',user_id:a.id,display_name:'Audit'}});assert.ok(!badPost.ok);pass('Content filter applies to direct API posts');
 const post=await row('community_posts',{content:prefix+' block test',display_name:'Audit B',user_id:b.id},b.token);posts.push(post.id);
 assert.equal((await call(`/rest/v1/community_posts?id=eq.${post.id}&select=id`,{token:a.token})).data.length,1);
 await row('blocked_users',{blocker_id:a.id,blocked_id:b.id},a.token);
 assert.equal((await call(`/rest/v1/community_posts?id=eq.${post.id}&select=id`,{token:a.token})).data.length,0);pass('Blocked author hidden at API layer');
 const path=a.id+'/'+prefix+'.png';const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII=','base64');
 const upload=await call('/storage/v1/object/documents/'+path,{method:'POST',token:a.token,raw:true,body:png,headers:{'Content-Type':'image/png'}});assert.ok(upload.ok,`upload ${upload.status}`);files.push(path);
 const download=await call('/storage/v1/object/authenticated/documents/'+path,{token:b.token});assert.ok(!download.ok);pass('Another account cannot read private document files');
 const crossDoc=await call('/rest/v1/user_documents',{method:'POST',token:b.token,body:{user_id:b.id,name:'Audit',storage_path:path}});assert.ok(!crossDoc.ok);pass('Document metadata cannot reference another account folder');
 const blockedDelete=await call('/rest/v1/rpc/delete_account',{method:'POST',token:a.token,body:{}});assert.ok(!blockedDelete.ok);pass('Account deletion refuses to orphan an uploaded file');
 const remove=await call('/storage/v1/object/documents',{method:'DELETE',token:a.token,body:{prefixes:[path]}});assert.ok(remove.ok);files.splice(files.indexOf(path),1);
 const deletion=await call('/rest/v1/rpc/delete_account',{method:'POST',token:a.token,body:{}});assert.ok(deletion.ok,`delete_account ${deletion.status}`);
 const missing=await call('/auth/v1/admin/users/'+a.id);assert.equal(missing.status,404);pass('Storage API removal followed by account deletion succeeds');
 await fs.mkdir('.context/audit',{recursive:true});await fs.writeFile('.context/audit/production-security-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),checks},null,2));
} finally {
 const failures=[];
 if(files.length){const r=await call('/storage/v1/object/documents',{method:'DELETE',body:{prefixes:files}});if(!r.ok)failures.push('files')}
 for(const id of posts){if(!(await call('/rest/v1/community_posts?id=eq.'+id,{method:'DELETE'})).ok)failures.push('post '+id)}
 for(const id of questions){if(!(await call('/rest/v1/questions?id=eq.'+id,{method:'DELETE'})).ok)failures.push('question '+id)}
 for(const a of accounts){const r=await call('/auth/v1/admin/users/'+a.id,{method:'DELETE'});if(!r.ok&&r.status!==404)failures.push('account '+a.id)}
 assert.equal(failures.length,0,'Fixture cleanup failed: '+failures.join(', '));console.log('Temporary accounts, files, and posts removed.');
}
