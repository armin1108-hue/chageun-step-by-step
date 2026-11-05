(function(scope){
  'use strict';
  const key='chageun.classroom.badges.v1';
  const templates={
    routine:{name:'하루 한 걸음',activity:'나의 하루',criteria:['활동 순서를 확인했어요','한 활동을 선택하고 해 보았어요','다음 활동을 확인했어요']},
    communication:{name:'마음을 전했어요',activity:'마음·의사 표현',criteria:['전하고 싶은 마음이나 요구를 골랐어요','말·그림·가리키기·AAC 중 편한 방법으로 전했어요','전달한 내용을 확인하거나 다시 선택했어요']},
    practice:{name:'생활을 해냈어요',activity:'생활 연습',criteria:['할 일의 단계를 확인했어요','자신에게 맞는 도움을 받아 활동을 시도했어요','다음 단계나 다시 하기를 선택했어요']}
  };
  const recipients=['가상 학생 A','가상 학생 B'];
  let records=[],loadError=false;
  const copy=v=>JSON.parse(JSON.stringify(v));
  const str=(v,max,label)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw new Error(label+'을 확인해 주세요.');return v.trim();};
  function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
  try{const saved=JSON.parse(scope.localStorage.getItem(key)||'[]');if(!Array.isArray(saved)||saved.some(r=>r.schema!=='chageun-classroom-badge/v1'||!recipients.includes(r.recipient)||!templates[r.template]||!['issued','revoked'].includes(r.status)||!r.id))throw new Error('invalid');records=saved;}catch(_){loadError=true;}
  function write(next){if(loadError)throw new Error('기존 배지 기록을 읽지 못했습니다. 다른 브라우저에서 시연하거나 기존 자료를 점검해 주세요.');scope.localStorage.setItem(key,JSON.stringify(next));records=next;}
  function issue(input){try{
    if(!recipients.includes(input.recipient))throw new Error('시연 대상을 선택해 주세요.');
    if(!templates[input.template])throw new Error('활동을 선택해 주세요.');
    if(!validDate(input.date))throw new Error('관찰 날짜를 확인해 주세요.');
    if(!Array.isArray(input.levels)||input.levels.length!==3||input.levels.some(v=>!['independent','cue','together'].includes(v)))throw new Error('세 행동 모두 관찰한 수행과 지원 수준을 선택해 주세요. 미관찰 항목은 다시 관찰합니다.');
    if(input.reviewed!==true)throw new Error('교사의 근거 확인과 발급 승인이 필요합니다.');
    const evidence=str(input.evidence,1000,'관찰 근거');if(evidence.length<10)throw new Error('직접 본 행동과 제공한 도움을 10자 이상 적어 주세요.');
    const name=str(input.name,40,'배지 이름'),issuer=str(input.issuer,60,'발급 교사 표시');
    if(records.some(r=>r.status==='issued'&&r.recipient===input.recipient&&r.template===input.template&&r.date===input.date))throw new Error('같은 학생·활동·날짜의 배지를 이미 발급했습니다. 기존 배지를 확인하세요.');
    const id='CC-'+(scope.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    const badge={schema:'chageun-classroom-badge/v1',id,recipient:input.recipient,template:input.template,name,issuer,date:input.date,criteria:copy(templates[input.template].criteria),levels:copy(input.levels),evidence,status:'issued',issuedAt:new Date().toISOString(),scope:'교실 성취 인정 시연용 · 이 브라우저 기록 · 블록체인 미사용'};
    write([...records,badge]);return {ok:true,badge:copy(badge)};
  }catch(error){return {ok:false,error:error.message};}}
  function revoke(id,reason){try{reason=str(reason,200,'정정 사유');const found=records.find(r=>r.id===id&&r.status==='issued');if(!found)throw new Error('발급 상태인 배지를 찾지 못했습니다.');write(records.map(r=>r.id===id?{...r,status:'revoked',revokedAt:new Date().toISOString(),revokeReason:reason}:r));return {ok:true};}catch(error){return {ok:false,error:error.message};}}
  scope.ChageunBadges={templates:copy(templates),recipients:copy(recipients),list:()=>copy(records),issue,revoke,loadError:()=>loadError};
})(typeof window==='undefined'?globalThis:window);
