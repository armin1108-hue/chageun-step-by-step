(function () {
  'use strict';
  const route=(location.pathname.split('/').filter(Boolean).pop()||'index').replace(/\.html$/,'');
  if(route==='teacher')return;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const icon=name=>`<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
  document.body.classList.add('student-app',`page-${route}`);
  const main=$('main');
  const banner=$('.demo-banner');
  if(banner){banner.querySelector('span').textContent='시험용 · 가상 데이터';banner.querySelector('a').textContent='선생님 공간';banner.title='가상자료로만 체험하세요. 활동 표시는 이 브라우저에만 저장됩니다.';}
  // Keep working controls and their event listeners while simplifying the shell.
  const header=$('body > header');
  const voice=header.querySelector('button[aria-label*="자동 소리 읽기"]');
  const contrast=header.querySelector('button[aria-label*="대비 맞춤"]');
  const teacher=header.querySelector('button[aria-label*="선생님 및 보호자"]');
  const stop=$('main > .extension-controls button');
  const brand=make('a','student-brand');brand.href='index.html';brand.setAttribute('aria-label','차근차근 처음으로');
  brand.innerHTML=`<span class="brand-mark">${icon('eco')}</span><span><strong>차근차근</strong><small>나의 속도로, 한 걸음씩</small></span>`;
  const actions=make('div','student-tools');
  if(voice){voice.className='tool-button';const sync=()=>{const on=window.ChageunStore.get().speech;voice.innerHTML=icon(on?'volume_up':'volume_off')+`<span>소리 ${on?'켬':'끔'}</span>`;voice.setAttribute('aria-pressed',String(on));};sync();voice.addEventListener('click',sync);actions.append(voice);}
  if(stop){const parent=stop.parentElement;stop.className='tool-button stop-sound';stop.innerHTML=icon('stop_circle')+'<span>소리 멈춤</span>';stop.setAttribute('aria-label','모든 소리 멈추기');actions.append(stop);parent.remove();}
  if(contrast){contrast.className='tool-button';contrast.innerHTML=icon('contrast')+'<span>화면 대비</span>';actions.append(contrast);}
  if(teacher){teacher.className='tool-button teacher-tool';teacher.innerHTML=icon('tune')+'<span>선생님</span>';actions.append(teacher);}
  const headerInner=make('div','student-header-inner');headerInner.append(brand,actions);header.replaceChildren(headerInner);
  const nav=$('body > nav');nav.className='student-nav';nav.firstElementChild.className='student-nav-inner';
  nav.querySelectorAll('a').forEach(a=>{a.className='student-nav-item';const target=(a.getAttribute('href')||'').replace('.html','');if(target===route){a.classList.add('is-current');a.setAttribute('aria-current','page');}else a.removeAttribute('aria-current');});
  const paths={routine:['나의 하루','오늘 할 일을 하나씩'],emotion:['마음 전하기','지금 내 마음을 골라요'],aac:['말로 전하기','그림으로 하고 싶은 말'], 'daily-skills':['생활 연습','한 단계씩 해봐요'],'rest-space':['쉬어 가기','잠깐 쉬어도 괜찮아요']};
  // Small original vector pictograms use the same visual language in every activity.
  const drawings={
    routine:'<rect x="31" y="24" width="102" height="88" rx="15" fill="#fffdf6" stroke="#4d786b" stroke-width="3"/><path d="M32 48h100" stroke="#4d786b" stroke-width="3"/><path d="M57 17v19m50-19v19" stroke="#d5914d" stroke-width="8" stroke-linecap="round"/><rect x="48" y="61" width="22" height="20" rx="6" fill="#e6bd6c"/><path d="m52 70 5 5 10-11" fill="none" stroke="#6c5524" stroke-width="3" stroke-linecap="round"/><rect x="91" y="61" width="22" height="20" rx="6" fill="#b0d0be"/><rect x="49" y="90" width="63" height="5" rx="2.5" fill="#dfe6da"/>',
    emotion:'<circle cx="80" cy="64" r="46" fill="#f5bc73"/><circle cx="80" cy="60" r="42" fill="#ffcf91"/><path d="M62 52v5m36-5v5" stroke="#704b35" stroke-width="6" stroke-linecap="round"/><path d="M62 73q18 22 36 0" stroke="#704b35" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="49" cy="69" rx="8" ry="5" fill="#e79679"/><ellipse cx="111" cy="69" rx="8" ry="5" fill="#e79679"/><path d="m126 22 5 8 9 2-8 6-1 10-7-8-10 2 5-10-4-8z" fill="#e4a75b"/>',
    aac:'<path d="M30 33q0-12 14-12h63q14 0 14 14v39q0 13-14 13H63L37 104V87q-7-1-7-13z" fill="#5c9480"/><path d="M63 51q0-11 12-11h46q13 0 13 13v37q0 11-12 11h-8l-1 15-20-15H75q-12 0-12-11z" fill="#fffdf6" stroke="#3c6f60" stroke-width="2.5"/><circle cx="82" cy="72" r="5" fill="#e4ac63"/><circle cx="100" cy="72" r="5" fill="#e4ac63"/><circle cx="118" cy="72" r="5" fill="#e4ac63"/>',
    'daily-skills':'<rect x="20" y="71" width="99" height="38" rx="13" fill="#a9c7d4"/><rect x="32" y="60" width="77" height="33" rx="13" fill="#f9f7ec" stroke="#477286" stroke-width="2.5"/><path d="M50 73h40" stroke="#c5d8dc" stroke-width="4" stroke-linecap="round"/><path d="M122 24c-5 12-19 22-19 33a19 19 0 0 0 38 0c0-11-13-22-19-33z" fill="#70acc3"/><circle cx="43" cy="37" r="11" fill="#d4e7eb" stroke="#6b9fae" stroke-width="2"/><circle cx="73" cy="22" r="7" fill="#e1edf0" stroke="#6b9fae" stroke-width="2"/><circle cx="77" cy="47" r="5" fill="#d4e7eb"/>',
    'rest-space':'<path d="M41 83h68l-8 30H50z" fill="#d5a079"/><path d="M76 86V32" stroke="#456f55" stroke-width="4" stroke-linecap="round"/><path d="M75 64C47 66 28 39 40 28c21-9 42 10 35 36z" fill="#93bda0"/><path d="M77 47c-2-24 20-39 35-25 3 20-10 32-35 25z" fill="#567f61"/><path d="M75 81c2-22 22-28 38-16-1 17-19 24-38 16z" fill="#b4c79b"/><circle cx="133" cy="35" r="12" fill="#edcb87"/>'
  };
  function art(name){return `<svg class="activity-art" viewBox="0 0 160 128" aria-hidden="true"><ellipse cx="80" cy="112" rx="56" ry="7" fill="#234d3910"/>${drawings[name]||drawings.routine}</svg>`;}
  if(route==='index'){
    const content=main.firstElementChild;content.classList.add('home-content');
    const greeting=$('section[aria-label="오늘의 인사말"]'),scene=$('section[aria-label="환영 배너"]');
    const hero=make('div','home-hero');greeting.before(hero);hero.append(greeting,scene);
    greeting.className='home-greeting';scene.className='home-scene';
    const welcome=$('#play-welcome-audio');welcome.innerHTML=icon('volume_up')+'<span>소리로 안내 듣기</span>';welcome.className='welcome-listen';
    const heading=greeting.querySelector('h2');heading.innerHTML='오늘도,<br><span>나의 속도로.</span>';
    const message=greeting.querySelector('p');message.textContent='하고 싶은 활동을 골라요. 함께 시작해 볼까요?';
    greeting.firstElementChild.className='home-date';greeting.firstElementChild.lastElementChild.remove();
    const photo=scene.querySelector('img');photo.alt='햇살이 드는 교실에서 함께 배우는 모습';photo.loading='eager';
    const stamp=make('span','scene-stamp');stamp.innerHTML=icon('favorite')+'<span>천천히 해도 괜찮아요</span>';scene.append(stamp);
    const choices=$('section[aria-label="오늘의 배움 영역 바로가기"]');choices.className='home-choices';
    choices.firstElementChild.className='choices-heading';choices.querySelector('h3').textContent='무엇을 해볼까요?';choices.firstElementChild.lastElementChild.textContent='그림을 눌러 시작해요';
    const grid=make('div','activity-grid');
    choices.querySelectorAll(':scope > a').forEach(a=>{const name=(new URL(a.href,location.href).pathname.split('/').filter(Boolean).pop()||'index').replace(/\.html$/,'');if(!paths[name])return;const [title,desc]=paths[name];a.className=`activity-choice activity-${name}`;a.setAttribute('aria-label',title);a.innerHTML=art(name)+`<span class="activity-title">${title}</span><span class="activity-desc">${desc}</span><span class="activity-arrow">${icon('arrow_forward')}</span>`;grid.append(a);});choices.append(grid);
    const help=$('section[aria-label="빠른 도움 및 진정 쉼터"]');help.className='home-help';choices.after(help);
    help.firstElementChild.remove();const ask=$('#btn-call-teacher');ask.innerHTML=icon('front_hand')+'<span><strong>도움이 필요해요</strong><small>선생님께 이 화면을 보여주세요</small></span>'+icon('north_east');
    const rest=help.querySelector('a');rest.innerHTML=icon('spa')+'<span><strong>잠깐 쉬고 싶어요</strong><small>편안하게 쉬어 가요</small></span>'+icon('arrow_forward');
    $('section[aria-label="오늘의 응원"]')?.remove();
    const footer=$('[aria-label="기관 및 보호자 안내"]');if(footer){footer.className='student-footer';footer.textContent='KERI · 한국교육연구소';}
  }
  if(route==='routine'){
    const cards=$$('.task-card');const deck=$('section[aria-label="오늘의 순서 카드 목록"]');deck.classList.add('routine-grid');
    cards.forEach(card=>{const image=card.querySelector('img');image?.parentElement.classList.add('routine-picture');const title=card.querySelector('.task-name');title.classList.add('routine-title');if(image&&!image.hidden)image.alt='';});
    function update(){let currentFound=false;cards.forEach(card=>{const done=card.dataset.completed==='true';const current=!done&&!currentFound;if(current)currentFound=true;card.classList.toggle('is-next-task',current);const label=card.querySelector('.status-pill span:last-child');if(label)label.textContent=done?'표시했어요':current?'지금 할 일':'이따가 해요';card.querySelector('.btn-text').textContent=done?'했어요 · 다시 누르면 취소':'했어요';});}
    cards.forEach(card=>card.querySelector('.complete-btn').addEventListener('click',update));$('#reset-tasks-btn').addEventListener('click',update);update();
    const intro=$('section[aria-labelledby="sub-banner-title"]');intro?.classList.add('page-intro','routine-intro');
    const comfort=$('section[aria-labelledby="comfort-heading"]');if(comfort){comfort.className='quiet-note';comfort.innerHTML=icon('favorite')+'<p>도움을 받아도 괜찮아요. 나의 속도로 해봐요.</p>';}
    const done=$('#all-done-banner');if(done){done.classList.remove('animate-bounce');done.querySelector('.font-headline-lg-mobile').textContent='오늘의 일과를 모두 표시했어요.';done.querySelector('p').textContent='함께한 하루, 수고했어요.';}
    $$('main footer').forEach(e=>e.remove());
  }
  if(route==='aac'){
    main.querySelector(':scope > div > div:first-child')?.classList.add('aac-toolbar');
    $('#aac-grid').classList.add('communication-grid');
    $$('.aac-card').forEach(card=>{card.classList.add('communication-card');const badge=card.querySelector('.rounded-full.bg-secondary');badge?.remove();card.querySelector('.mt-3 .font-label-sm')?.remove();card.querySelectorAll('.material-symbols-outlined').forEach((node,i)=>{if(i>0)node.remove();});});
    const composer=$('section[aria-label="문장 만들기 상자"]');composer.classList.add('sentence-composer');
    const intro=$('h2').closest('div.bg-surface-container-low');intro?.classList.add('page-intro','aac-intro');if(intro)intro.querySelector('p').textContent='그림을 고르고 소리로 들려줘요.';
    const composerHeading=composer.firstElementChild;composerHeading.classList.add('composer-heading');
    const reset=$('#reset-all-btn');reset.classList.add('composer-reset');composerHeading.append(reset);
    $('#empty-chip-placeholder').textContent='아래 그림을 누르면 말이 모여요.';
  }
  if(route==='emotion'){
    $('div[role="radiogroup"]').classList.add('feeling-grid');
    $$('.emotion-card').forEach(card=>{card.classList.add('feeling-card');card.querySelector('p').hidden=true;const subtitle=card.querySelector(':scope > .font-label-sm');if(subtitle)subtitle.hidden=true;const voice=card.querySelector(':scope > .mt-space-sm');if(voice)voice.hidden=true;});
    const intro=$('h2').closest('.bg-primary-container');intro?.classList.add('page-intro','feeling-intro');if(intro){intro.querySelector('p').textContent='어떤 마음이든 괜찮아요. 내 마음을 골라요.';const skip=$('.skip-feeling');if(skip)intro.append(skip);}
    const preview=$('#preview-box').parentElement;preview.classList.add('feeling-preview');
    $('#show-big-btn span:last-child').textContent='이 마음 크게 보여주기';$('#speak-btn span:last-child').textContent='내 마음 소리로 듣기';
    const selected=$('#selected-badge');const update=()=>{const chosen=$('.emotion-card[aria-checked="true"]');$('#show-big-btn').disabled=!chosen;$('#speak-btn').disabled=!chosen;selected.textContent=chosen?'내가 고른 마음':'아직 고르지 않았어요';};
    $$('.emotion-card').forEach(card=>card.addEventListener('click',update));$('#reset-btn').addEventListener('click',update);update();
    const support=$('#sos-btn').parentElement;support.classList.add('feeling-support');support.querySelector('img')?.closest('.relative')?.remove();
    const paragraphs=support.querySelectorAll('p');if(paragraphs[0])paragraphs[0].textContent='어떤 마음이든 괜찮아요. 말하기 어려우면 화면을 보여주세요.';if(paragraphs[1])paragraphs[1].remove();
    $('#sos-btn span:last-child').textContent='도움이 필요해요';
  }
  if(route==='daily-skills'){
    const content=main.querySelector(':scope > div');content.classList.add('practice-content');
    $('#ttsPlayAllBtn')?.parentElement.classList.add('practice-toolbar');
    $('div[role="tablist"]')?.parentElement.remove();$('section[aria-label="다른 생활 연습 추천"]')?.remove();
    const activity=$('section[aria-label="지금 진행 중인 핵심 연습"]');activity.classList.add('practice-activity');
    const h=$('h2');h.textContent='하나씩, 해봐요';const intro=h.closest('div.relative.overflow-hidden');intro?.classList.add('page-intro','practice-intro');const p=intro?.querySelector('p');if(p)p.textContent='그림을 보고 내 속도로 따라 해요.';
    if(intro){const badge=h.previousElementSibling;if(badge)badge.textContent='도움을 받아도 괜찮아요';const labels=[...intro.querySelectorAll('span')];labels.forEach(s=>{if(s.textContent.trim()==='칭찬 도장 🌟')s.remove();if(s.textContent.trim()==='스스로 할 수 있어요')s.textContent='도움을 받아도 괜찮아요';});}
    const header=activity.querySelector('h3').closest('div').parentElement.parentElement;header.classList.add('practice-title-row');
    header.nextElementSibling?.classList.add('practice-tip');
    activity.querySelector('h3').textContent=window.ChageunSettings.get().practice.title;
    const complete=$('#completePracticeBtn');complete.innerHTML=icon('check_circle')+'<span>여기까지 해봤어요</span>';
    const count=intro?.lastElementChild;if(count&&count.contains($('#completedCounter'))){count.classList.add('practice-count');complete.parentElement.append(count);}
  }
  if(route==='rest-space'){
    const content=main.querySelector(':scope > div');content.classList.add('rest-content');
    const intro=$('h2').closest('section');intro.classList.add('page-intro','rest-intro');intro.querySelector('p').textContent='아무것도 하지 않고 쉬어도 괜찮아요.';
    const breath=$('section[aria-labelledby="breathing-heading"]'),sound=$('section[aria-labelledby="sound-heading"]');
    const grid=make('div','rest-grid');breath.before(grid);grid.append(breath,sound);breath.classList.add('rest-panel');sound.classList.add('rest-panel');
    $('#breathing-heading').textContent='천천히 숨 쉬어요';$('#sound-heading').textContent='편안한 소리를 골라요';
    const show=$('section[aria-labelledby="rest-card-heading"]');show.classList.add('rest-share');
    $('#rest-card-heading').textContent='쉬는 중이라고 보여줄까요?';$('#openRestCardBtn span:last-child').textContent='쉬는 중이에요';
    const image=content.querySelector('img');if(image)image.closest('div.w-full').classList.add('rest-landscape');
  }
  // Student footers describe the current demonstration accurately and briefly.
  $$('main p').filter(p=>/^한국(?:교육연구소|특수교육)/.test(p.textContent.trim())).forEach(p=>{
    const footer=p.parentElement;footer.className='student-footer';footer.textContent='가상자료로 연습하는 공간 · KERI';
  });
  // Decorative glyph names should not be read as English instructions.
  $$('.material-symbols-outlined').forEach(e=>e.setAttribute('aria-hidden','true'));
})();
