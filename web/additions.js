(function () {
  'use strict';
  const settings=window.ChageunSettings.get(), page=location.pathname.split('/').pop();
  const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  document.body.classList.toggle('reduce-motion',settings.reducedMotion);
  const banner=document.querySelector('.demo-banner');
  if(banner){banner.querySelector('a').textContent='교사 편집 · 시연 기록';}
  document.querySelectorAll('img:not([alt])').forEach(img=>img.alt='');
  const main=document.querySelector('main');
  const stop=()=>window.speechSynthesis?.cancel();
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
      const image=card.querySelector('img');if(image)image.hidden=true;
      const symbol=el('span',window.ChageunSettings.icons[data.icon],'routine-symbol');
      image?.parentElement.prepend(symbol);
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
      const small=card.querySelector('.mt-3 .font-label-sm');if(small)small.textContent='선택한 문구 그대로 읽어요';
      card.setAttribute('aria-label',data.phrase);
    });
  }
  if(page==='daily-skills.html'){
    const oldList=document.getElementById('stepListContainer');
    const title=document.querySelector('section[aria-label="지금 진행 중인 핵심 연습"] h3');if(title)title.textContent=settings.practice.title;
    // Keep the surrounding Stitch screen and replace only the interactive steps.
    oldList.replaceChildren();
    let current=0;
    const row=el('article',undefined,'step-focus');row.setAttribute('aria-live','polite');
    const counter=el('p'),text=el('h4'),support=el('p',settings.practice.support);row.append(counter,text,support);
    const nav=el('div',undefined,'extension-controls');
    const previous=el('button','이전'),read=el('button','이 단계 듣기'),next=el('button','다음');
    const overview=el('ol',undefined,'step-overview');
    settings.practice.steps.forEach(value=>overview.append(el('li',value)));
    function render(){counter.textContent=`${current+1} / ${settings.practice.steps.length}단계`;text.textContent=settings.practice.steps[current];previous.disabled=current===0;next.disabled=current===settings.practice.steps.length-1;stop();}
    previous.onclick=()=>{current--;render();};next.onclick=()=>{current++;render();};read.onclick=()=>speak(settings.practice.steps[current]);
    for(const btn of [previous,read,next]){btn.type='button';nav.append(btn);}
    oldList.append(row,nav,overview);render();
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
