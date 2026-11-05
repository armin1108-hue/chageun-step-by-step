(function () {
  'use strict';
  const settings=window.ChageunSettings.get(), route=location.pathname.split('/').filter(Boolean).pop()||'index';
  const page=route.endsWith('.html')?route:`${route}.html`;
  const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  document.body.classList.toggle('reduce-motion',settings.reducedMotion);
  const banner=document.querySelector('.demo-banner');
  if(banner){
    banner.querySelector('a').textContent='교사 편집 · 시연 기록';
    banner.querySelector('span').textContent=page==='teacher.html'
      ?'시험용 · 가상 데이터 · 수업 설정·활동 표시는 브라우저에, 관찰 초안은 현재 탭에서만 유지됩니다.'
      :'시험용 · 가상 데이터 · 수업 설정·활동 표시만 이 브라우저에 저장됩니다. 실제 학생정보를 입력하지 마세요.';
  }
  document.querySelectorAll('img:not([alt])').forEach(img=>img.alt='');
  const main=document.querySelector('main');
  const stop=()=>{window.speechSynthesis?.cancel();window.dispatchEvent(new Event('chageun:stop-sounds'));};
  function speak(text){
    if(window.ChageunStore.get().speech===false || !window.speechSynthesis) return;
    stop();const utter=new SpeechSynthesisUtterance(text);utter.lang='ko-KR';utter.rate=.85;window.speechSynthesis.speak(utter);
  }
  if(page!=='teacher.html'){
    const controls=el('div',undefined,'extension-controls');
    const mute=el('button','소리 멈추기');mute.type='button';mute.addEventListener('click',stop);controls.append(mute);
    main?.prepend(controls);
  }
  window.addEventListener('pagehide',stop);
  if(page==='routine.html'){
    const cards=[...document.querySelectorAll('.task-card')];
    cards.forEach((card,i)=>{
      const data=settings.routine[i];card.querySelector('.task-name').textContent=data.title;
      const image=card.querySelector('img');
      const original=window.ChageunSettings.defaults().routine[i];
      if(image && (data.title!==original.title || data.icon!==original.icon)){
        image.hidden=true;
        const symbol=el('span',undefined,'material-symbols-outlined routine-symbol');symbol.textContent=data.icon;
        image.parentElement.prepend(symbol);
      }
      const note=card.querySelector('.absolute span:last-child');if(note)note.textContent=data.note;
      card.querySelector('.task-name')?.previousElementSibling && (card.querySelector('.task-name').previousElementSibling.textContent=data.icon);
      card.querySelector('.complete-btn').setAttribute('aria-label',`${i+1}단계 ${data.title} 표시 또는 취소`);
    });
    const now=el('section',undefined,'now-next');now.setAttribute('aria-live','polite');
    const current=el('p'),next=el('p');now.append(current,next);
    if(settings.changeNote)now.append(el('p',`변경 안내: ${settings.changeNote}`,'change-note'));
    document.querySelector('section[aria-label="오늘의 순서 카드 목록"]')?.before(now);
    function update(){
      const left=cards.filter(c=>c.dataset.completed!=='true');
      current.textContent=left.length?`지금: ${left[0].querySelector('.task-name').textContent}`:'오늘 일과를 모두 표시했어요.';
      next.textContent=left.length>1?`다음: ${left[1].querySelector('.task-name').textContent}`:'다음: 쉬어도 좋아요';
    }
    update();cards.forEach(c=>c.querySelector('.complete-btn').addEventListener('click',update));
    document.getElementById('reset-tasks-btn')?.addEventListener('click',update);
  }
  if(page==='aac.html'){
    document.querySelectorAll('.aac-card').forEach((card,i)=>{
      const data=settings.aac[i];card.dataset.phrase=data.phrase;card.dataset.category=data.category;
      card.querySelector('.font-headline-md').textContent=data.phrase;
      card.querySelector('.material-symbols-outlined').textContent=data.icon;
      const badge=card.querySelector('.rounded-full.bg-secondary');
      if(badge)badge.textContent={help:'도움',health:'건강',school:'교실'}[data.category];
      const small=card.querySelector('.mt-3 .font-label-sm');if(small)small.textContent='선택한 문구 그대로 읽어요';
      card.setAttribute('aria-label',data.phrase);
    });
  }
  if(page==='daily-skills.html'){
    const oldList=document.getElementById('stepListContainer');
    const title=document.querySelector('section[aria-label="지금 진행 중인 핵심 연습"] h3');if(title)title.textContent=settings.practice.title;
    document.querySelectorAll('p').forEach(p=>{if(p.textContent==='하나씩 누르며 완료 체크를 해보세요.')p.textContent='이전과 다음을 눌러 한 단계씩 살펴봐요.';});
    const custom=settings.practice.title!==window.ChageunSettings.defaults().practice.title;
    if(custom){
      document.querySelectorAll('[role="tab"]').forEach(tab=>{if(tab.textContent.includes('손 씻기'))tab.querySelector('span').textContent=settings.practice.title;});
      document.querySelector('section[aria-label="다른 생활 연습 추천"]')?.remove();
    }
    // Keep the surrounding Stitch screen and replace only the interactive steps.
    oldList.replaceChildren();
    let current=0;
    const row=el('article',undefined,'step-focus');row.setAttribute('aria-live','polite');
    const visual=el('div',undefined,'step-visual'),symbol=el('span',undefined,'material-symbols-outlined');
    visual.setAttribute('aria-hidden','true');visual.append(symbol);
    const counter=el('p'),text=el('h4'),support=el('p',settings.practice.support);row.append(visual,counter,text,support);
    const nav=el('div',undefined,'extension-controls');
    const previous=el('button','이전'),read=el('button','이 단계 듣기'),next=el('button','다음');
    const overview=el('ol',undefined,'step-overview');
    settings.practice.steps.forEach(value=>overview.append(el('li',value)));
    function render(){
      counter.textContent=`${current+1} / ${settings.practice.steps.length}단계`;text.textContent=settings.practice.steps[current];
      const defaultStep=window.ChageunSettings.defaults().practice.steps[current];
      symbol.textContent=settings.practice.steps[current]===defaultStep?['soap','back_hand','front_hand','water_drop','dry'][current]:'format_list_numbered';
      previous.disabled=current===0;next.disabled=current===settings.practice.steps.length-1;
      [...overview.children].forEach((li,i)=>{li.classList.toggle('is-current-step',i===current);if(i===current)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});stop();
    }
    previous.onclick=()=>{current--;render();};next.onclick=()=>{current++;render();};read.onclick=()=>speak(settings.practice.steps[current]);
    for(const btn of [previous,read,next]){btn.type='button';nav.append(btn);}
    const allSteps=el('details',undefined,'step-overview-wrap');allSteps.append(el('summary','전체 순서 보기'),overview);
    oldList.append(row,nav,allSteps);render();
    for(const id of ['masterTtsBtn','stepVoiceBtn']){
      const old=document.getElementById(id),btn=old?.cloneNode(true);if(!btn)continue;old.replaceWith(btn);
      btn.setAttribute('aria-label','지금 단계 듣기');btn.addEventListener('click',()=>speak(settings.practice.steps[current]));
      if(id==='stepVoiceBtn')btn.querySelector('span:last-child').textContent='지금 단계 다시 듣기';
    }
    const done=document.getElementById('completePracticeBtn');
    const clean=done.cloneNode(true);done.replaceWith(clean);clean.textContent='연습한 활동 표시하기';
    clean.onclick=()=>{const store=window.ChageunStore;store.patch({practice:store.get().practice+1});store.log('생활 연습 표시',settings.practice.title);document.getElementById('completedCounter').textContent=`${store.get().practice}회`;};
    document.querySelector('section[aria-label="실제 연습 모습 사진"]')?.remove();
  }
  if(page==='emotion.html'){
    const skip=el('a','마음 선택 건너뛰고 쉬어 가기','skip-feeling');skip.href='rest-space.html';main?.prepend(skip);
  }
})();
