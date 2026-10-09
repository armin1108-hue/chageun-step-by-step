import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('web/storage.js','utf8');
function boot(memory={}){const context={localStorage:{getItem:k=>memory[k]||null,setItem:(k,v)=>memory[k]=v}};vm.createContext(context);vm.runInContext(code,context);return context.ChageunStore;}
test('completed tasks and emotion persist across reloads',()=>{const memory={};const s=boot(memory);s.patch({routine:[0,2],emotion:{id:'happy',title:'기뻐요'}});const reloaded=boot(memory);assert.deepEqual([...reloaded.get().routine],[0,2]);assert.equal(reloaded.get().emotion.title,'기뻐요');});
test('corrupt storage recovers and events stay bounded',()=>{const s=boot({'keri.chageun.demo.v1':'bad json'});for(let i=0;i<120;i++)s.log('활동',String(i));assert.equal(s.get().events.length,100);assert.equal(s.get().events[0].detail,'20');});
test('CSV escapes quotes and clearing resets every record',()=>{const s=boot();s.log('AAC','"물", 주세요');assert.ok(s.csv().includes('""물"", 주세요'));s.clear();assert.equal(s.get().events.length,0);assert.equal(s.get().emotion,null);});
