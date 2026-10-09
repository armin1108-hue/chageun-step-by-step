(function () {
  'use strict';
  const config=window.ChageunSettings, drafts=window.ChageunDraft;
  const $=id=>document.getElementById(id);
  const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
  function field(parent,label,id,value,max){
    const wrap=el('label',label),input=el('input');input.id=id;input.value=value;input.required=true;input.maxLength=max;wrap.append(input);parent.append(wrap);return input;
  }
  function options(parent,label,id,entries,value){
    const wrap=el('label',label),select=el('select');select.id=id;
    for(const [key,title] of Object.entries(entries)){const option=el('option',title);option.value=key;select.append(option);}
    select.value=value;wrap.append(select);parent.append(wrap);return select;
  }
  function renderSettings(){
    const state=config.get();
    for(const id of ['routine-editor','aac-editor','practice-editor'])$(id).replaceChildren();
    state.routine.forEach((item,i)=>{
      const row=el('fieldset'),legend=el('legend',`${i+1}번째 일과`);row.append(legend);
      field(row,'일과 이름',`routine-title-${i}`,item.title,60);field(row,'짧은 안내',`routine-note-${i}`,item.note,120);
      options(row,'그림 기호',`routine-icon-${i}`,config.icons,item.icon);
      const actions=el('div');
      for(const [name,delta] of [['위로',-1],['아래로',1]]){
        const button=el('button',name);button.type='button';button.className='secondary-button';button.disabled=i+delta<0||i+delta>=5;
        button.setAttribute('aria-label',`${i+1}번째 일과 ${name}`);
        button.onclick=()=>{
          const pending=readRoutine();[pending[i],pending[i+delta]]=[pending[i+delta],pending[i]];
          pending.forEach((v,j)=>{$(`routine-title-${j}`).value=v.title;$(`routine-note-${j}`).value=v.note;$(`routine-icon-${j}`).value=v.icon;});
          $(`routine-title-${i+delta}`).focus();
        };actions.append(button);
      }
      row.append(actions);$('routine-editor').append(row);
    });
    state.aac.forEach((item,i)=>{
      const row=el('fieldset');row.append(el('legend',`${i+1}번째 카드`));
      field(row,'읽을 한국어 문구',`aac-phrase-${i}`,item.phrase,100);options(row,'그림 기호',`aac-icon-${i}`,config.icons,item.icon);
      options(row,'분류',`aac-category-${i}`,{help:'도움 요청',health:'신체·건강',school:'교실 생활'},item.category);$('aac-editor').append(row);
    });
    state.practice.steps.forEach((value,i)=>field($('practice-editor'),`${i+1}단계`, `practice-step-${i}`,value,150));
    $('change-note').value=state.changeNote;$('practice-title').value=state.practice.title;$('practice-support').value=state.practice.support;$('reduced-motion').checked=state.reducedMotion;
  }
  const readRoutine=()=>Array.from({length:5},(_,i)=>({title:$(`routine-title-${i}`).value,note:$(`routine-note-${i}`).value,icon:$(`routine-icon-${i}`).value}));
  function saveSettings(patch){
    const result=config.save({...config.get(),...patch});
    $('settings-status').textContent=result.ok?'수업 설정을 이 브라우저에 저장했습니다. 학생 화면을 새로 열거나 새로고침하면 적용됩니다.':`저장 실패: ${result.error} 입력은 유지되어 다시 시도할 수 있습니다.`;
    $('settings-status').classList.toggle('failure',!result.ok);
    if(result.ok)document.body.classList.toggle('reduce-motion',config.get().reducedMotion);
  }
  renderSettings();
  if(config.loadError())$('settings-status').textContent='기존 설정을 읽지 못해 기본 설정으로 표시했습니다. 저장할 수 있는지 확인해주세요.';
  $('routine-form').onsubmit=event=>{event.preventDefault();saveSettings({routine:readRoutine(),changeNote:$('change-note').value});};
  $('aac-form').onsubmit=event=>{event.preventDefault();saveSettings({aac:Array.from({length:8},(_,i)=>({phrase:$(`aac-phrase-${i}`).value,icon:$(`aac-icon-${i}`).value,category:$(`aac-category-${i}`).value}))});};
  $('practice-form').onsubmit=event=>{event.preventDefault();saveSettings({practice:{title:$('practice-title').value,steps:Array.from({length:5},(_,i)=>$(`practice-step-${i}`).value),support:$('practice-support').value}});};
  $('motion-form').onsubmit=event=>{event.preventDefault();saveSettings({reducedMotion:$('reduced-motion').checked});};

  const date=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});$('observation-date').value=date;$('review-date').value=date;
  const fields={subject:'subject',date:'observation-date',baseline:'baseline',goal:'goal',measure:'measure',reviewDate:'review-date',activity:'activity',observation:'observation',support:'support',context:'context',observer:'observer'};
  let edited=false;
  function renderDraft(){
    const draft=drafts.get(),preview=$('document-preview');preview.replaceChildren();preview.hidden=!draft;$('review-controls').hidden=!draft;
    $('print-draft').disabled=!draft||edited||draft.status!=='confirmed';$('confirm-draft').disabled=edited;
    if(!draft)return;
    preview.append(el('p','시험용 · 가상 데이터 · 서버에 저장되지 않은 시연 문서'),el('h3',draft.status==='confirmed'?'교사가 검토한 시연 문서':'교사 검토 전 시연 초안'));
    const list=el('dl');
    const names={subject:'대상',date:'관찰 날짜',baseline:'현재 수행·근거',goal:'교육 목표',measure:'확인 방법',reviewDate:'목표 검토일',activity:'관찰 활동',observation:'직접 관찰한 행동',support:'제공한 도움',context:'상황·환경',observer:'시연 관찰자'};
    for(const [key,name] of Object.entries(names))list.append(el('dt',name),el('dd',draft[key]));preview.append(list);
    if(edited)preview.append(el('p','입력이 변경되었습니다. 초안을 다시 만들어주세요.'));
  }
  $('observation-form').addEventListener('input',()=>{
    if(drafts.get()){edited=true;drafts.unconfirm();$('reviewed').checked=false;renderDraft();$('draft-status').textContent='입력이 변경되어 확정을 해제했습니다. 입력 내용으로 초안을 다시 만들어주세요.';}
  });
  $('observation-form').onsubmit=event=>{
    event.preventDefault();const value=Object.fromEntries(Object.entries(fields).map(([key,id])=>[key,$(id).value]));
    const result=drafts.save(value);
    if(result.ok){edited=false;$('reviewed').checked=false;renderDraft();$('draft-status').textContent='현재 탭에 시연 초안을 만들었습니다. 서버에 저장되지 않았으며 새로고침하면 사라집니다.';}
    else $('draft-status').textContent=`초안을 만들지 못했습니다: ${result.error} 입력은 유지됩니다.`;
  };
  $('confirm-draft').onclick=()=>{
    if(edited)return;const result=drafts.confirm($('reviewed').checked);renderDraft();
    $('draft-status').textContent=result.ok?'가상 자료의 시연 문서를 검토·확정했습니다. 현재 탭에서만 유지됩니다.':result.error;
  };
  $('reviewed').onchange=()=>{if(!$('reviewed').checked){drafts.unconfirm();renderDraft();}};
  $('print-draft').onclick=()=>{if(!edited&&drafts.get()?.status==='confirmed')window.print();};
  $('clear-draft').onclick=()=>{drafts.clear();edited=false;$('reviewed').checked=false;renderDraft();$('draft-status').textContent='현재 탭의 시연 초안을 지웠습니다.';};
  window.addEventListener('beforeunload',event=>{
    if(drafts.get()||Object.entries(fields).some(([key,id])=>!['subject','date','reviewDate','observer'].includes(key)&&$(id).value)){event.preventDefault();event.returnValue='';}
  });
})();
