import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('web/settings.js','utf8');
function boot(memory={},failWrite=false){
  const scope={localStorage:{getItem:key=>memory[key]||null,setItem:(key,value)=>{if(failWrite)throw new Error('quota');memory[key]=value;}}};
  vm.createContext(scope);vm.runInContext(code,scope);return scope;
}
test('teacher settings persist and card order is retained',()=>{
  const memory={},scope=boot(memory),state=scope.ChageunSettings.get();
  state.aac[0].phrase='한 번 더 설명해주세요.';state.routine.reverse();
  assert.equal(scope.ChageunSettings.save(state).ok,true);
  const loaded=boot(memory).ChageunSettings.get();
  assert.equal(loaded.aac[0].phrase,'한 번 더 설명해주세요.');assert.equal(loaded.routine[0].title,'집으로 가기');
});
test('failed or invalid setting saves do not publish changes',()=>{
  const scope=boot({},true),settings=scope.ChageunSettings,state=settings.get();state.aac[0].phrase='변경';
  assert.equal(settings.save(state).ok,false);assert.equal(settings.get().aac[0].phrase,'선생님, 도와주세요!');
  state.aac[0].icon='unknown';assert.equal(settings.save(state).ok,false);
  state.aac=[];assert.equal(settings.save(state).ok,false);
});
test('corrupt settings recover without importing extra fields',()=>{
  const scope=boot({'keri.chageun.settings.v1':'invalid'});assert.equal(scope.ChageunSettings.loadError(),true);
  const state=scope.ChageunSettings.get();state.privateRecord='never import';scope.ChageunSettings.save(state);
  assert.equal(scope.ChageunSettings.get().privateRecord,undefined);
});
function observation(){return {subject:'가상 학생 A',date:'2026-10-09',baseline:'관찰 원문',goal:'교사가 정한 목표',measure:'직접 관찰',reviewDate:'2026-10-23',activity:'손 씻기',observation:'실제 관찰을 가정한 시연 원문',support:'언어적 안내',context:'가상 교실',observer:'가상 교사 A'};}
test('manual drafts preserve supplied evidence and require explicit review',()=>{
  const drafts=boot().ChageunDraft;assert.equal(drafts.confirm(true).ok,false);
  assert.equal(drafts.save(observation()).ok,true);assert.equal(drafts.confirm(false).ok,false);assert.equal(drafts.get().status,'draft');
  assert.equal(drafts.confirm(true).ok,true);assert.equal(drafts.get().observation,observation().observation);
  const value=observation();value.observation='수정된 관찰 원문';drafts.save(value);assert.equal(drafts.get().status,'draft');
});
test('drafts never reach storage and disappear in a new page context',()=>{
  const memory={},scope=boot(memory);scope.ChageunDraft.save(observation());scope.ChageunDraft.confirm(true);
  assert.deepEqual(memory,{});assert.equal(boot(memory).ChageunDraft.get(),null);
  scope.ChageunDraft.clear();assert.equal(scope.ChageunDraft.get(),null);
});
test('invalid observation retains the existing original',()=>{
  const drafts=boot().ChageunDraft;drafts.save(observation());const invalid=observation();invalid.observation='';
  assert.equal(drafts.save(invalid).ok,false);assert.equal(drafts.get().observation,observation().observation);
  invalid.observation='교사 관찰';invalid.subject='실제 이름';assert.equal(drafts.save(invalid).ok,false);
  invalid.subject='가상 학생 A';invalid.date='2026-02-30';assert.equal(drafts.save(invalid).ok,false);
});
