import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('web/badge-store.js','utf8');
function boot(memory={},failed=false){const scope={localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>{if(failed)throw Error('저장 실패');memory[k]=v;}}};vm.createContext(scope);vm.runInContext(code,scope);return scope.ChageunBadges;}
function input(){return {recipient:'가상 학생 A',date:'2026-11-06',template:'routine',name:'하루 한 걸음',levels:['cue','together','independent'],evidence:'그림을 보고 선택한 뒤 말 안내를 받아 활동하고 다음을 확인했다.',issuer:'시연 교사',reviewed:true};}
test('assisted performance can earn a teacher-approved badge and survives reload',()=>{const m={},a=boot(m),r=a.issue(input());assert.equal(r.ok,true);assert.equal(boot(m).list()[0].id,r.badge.id);assert.equal(r.badge.levels[1],'together');});
test('unobserved criterion and missing teacher approval prevent issuance',()=>{for(const x of [{...input(),reviewed:false},{...input(),levels:['cue','','together']},{...input(),evidence:'없음'},{...input(),date:'2026-02-30'},{...input(),recipient:'실제 학생'}]){const a=boot();assert.equal(a.issue(x).ok,false);assert.equal(a.list().length,0);}});
test('same student activity and day cannot receive duplicate active awards',()=>{const a=boot();assert.equal(a.issue(input()).ok,true);assert.equal(a.issue(input()).ok,false);assert.equal(a.issue({...input(),recipient:'가상 학생 B'}).ok,true);});
test('revocation requires a reason, preserves history, and permits corrected issuance',()=>{const a=boot(),r=a.issue(input());assert.equal(a.revoke(r.badge.id,'').ok,false);assert.equal(a.revoke(r.badge.id,'관찰 날짜 정정').ok,true);assert.equal(a.list()[0].status,'revoked');assert.equal(a.issue(input()).ok,true);assert.equal(a.list().length,2);});
test('failed browser writes do not claim issue or revocation success',()=>{const m={},a=boot(m,true);assert.equal(a.issue(input()).ok,false);assert.equal(a.list().length,0);const b=boot(m),r=b.issue(input()),c=boot(m,true);assert.equal(c.revoke(r.badge.id,'정정').ok,false);assert.equal(c.list()[0].status,'issued');});
test('corrupt badge data blocks further writes and keeps existing bytes',()=>{const m={'chageun.classroom.badges.v1':'broken'},a=boot(m);assert.equal(a.loadError(),true);assert.equal(a.issue(input()).ok,false);assert.equal(m['chageun.classroom.badges.v1'],'broken');});
test('returned badge objects cannot mutate saved records',()=>{const a=boot(),r=a.issue(input());r.badge.name='changed';a.list()[0].name='changed';assert.equal(a.list()[0].name,'하루 한 걸음');});
