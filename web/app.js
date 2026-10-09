(function () {
  'use strict';
  const store = window.ChageunStore;
  const config = window.ChageunSettings;
  const routineConfig = JSON.stringify(config.get().routine);
  const oldRoutineConfig = store.get().routineConfig || JSON.stringify(config.defaults().routine);
  if (routineConfig !== oldRoutineConfig) store.patch({routine:[],routineConfig});
  else if (!store.get().routineConfig) store.patch({routineConfig});
  const route = location.pathname.split('/').filter(Boolean).pop() || 'index';
  const page = route.endsWith('.html') ? route : `${route}.html`;
  const today = new Date().toLocaleDateString('ko-KR', {month:'long',day:'numeric',weekday:'long'});
  const demoText = {
    '10월 6일 화요일': today,
    '안심 모드 작동 중': '수업용 데모',
    '햇살반 3명 활동 중': '교실 디자인 예시',
    '한국교육연구소 KERI v1.0 · 특수교육 디지털 교육과정 표준 지원': '한국교육연구소 KERI · 앱 만들기 수업용 데모 v1.0',
    '한국교육연구소 KERI · 특수교육 디지털 교육과정 표준 지원 v1.0': '한국교육연구소 KERI · 앱 만들기 수업용 데모 v1.0',
    '별도의 비밀번호 없이 학생이 안심하고 터치하며 스스로 배울 수 있는 안전 모드입니다.': '로그인 없이 체험하는 수업용 화면입니다. 실제 학생정보를 입력하지 마세요.'
  };
  document.querySelectorAll('span,p').forEach(el=>{
    if(demoText[el.textContent.trim()]) el.textContent=demoText[el.textContent.trim()];
  });
  function toast(message) {
    document.querySelector('.demo-toast')?.remove();
    const el = document.createElement('div'); el.className='demo-toast'; el.setAttribute('role','status'); el.textContent=message;
    document.body.append(el); setTimeout(()=>el.remove(),5000);
  }
  function speak(text) {
    if (!store.get().speech) return;
    if (!('speechSynthesis' in window)) {toast('이 브라우저는 음성 읽기를 지원하지 않습니다.');return;}
    speechSynthesis.cancel(); const utter=new SpeechSynthesisUtterance(text); utter.lang='ko-KR'; utter.rate=0.85; speechSynthesis.speak(utter);
  }
  const banner=document.createElement('div');banner.className='demo-banner';
  banner.innerHTML='<span>수업용 데모 · 기록은 이 브라우저에 저장됩니다. 실제 학생정보를 입력하지 마세요.</span><a href="teacher.html">시연 기록 보기</a>';
  document.body.prepend(banner);
  const menuRoutes = {intro:'index.html','daily-routine':'routine.html','express-feelings':'emotion.html','voice-communication':'aac.html','daily-skills':'daily-skills.html','rest-and-play':'rest-space.html'};
  document.querySelectorAll('nav a[data-path]').forEach(a=>{if(menuRoutes[a.dataset.path])a.href=menuRoutes[a.dataset.path];});
  if (!store.available()) toast('저장공간을 사용할 수 없어 새로고침 후 기록이 사라질 수 있습니다.');
  document.body.classList.toggle('demo-contrast',store.get().contrast);
  document.querySelectorAll('button[aria-label*="처음 화면"],button[onclick*="history.back"]').forEach(b=>b.onclick=()=>location.href='index.html');
  document.querySelectorAll('button[aria-label*="선생님 및 보호자"]').forEach(b=>b.onclick=()=>location.href='teacher.html');
  document.querySelectorAll('button[aria-label*="자동 소리 읽기"]').forEach(b=>b.addEventListener('click',()=>{
    const enabled=!store.get().speech;store.patch({speech:enabled});b.setAttribute('aria-label',enabled?'자동 소리 읽기 켜짐':'자동 소리 읽기 꺼짐');toast(enabled?'음성 안내를 켰어요.':'음성 안내를 껐어요.');
  }));
  document.querySelectorAll('button[aria-label*="대비 맞춤"]').forEach(b=>b.addEventListener('click',()=>{
    const next=!store.get().contrast;store.patch({contrast:next});document.body.classList.toggle('demo-contrast',next);toast(next?'화면 대비를 높였어요.':'기본 화면으로 돌아왔어요.');
  }));
  document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();toast('이 활동은 디자인 예시입니다. 오늘은 손 씻기 연습을 사용해주세요.');}));
  document.querySelectorAll('button').forEach(b=>{if(b.textContent.includes('쉬어 가기 바로가기'))b.onclick=()=>location.href='rest-space.html';});
  if(page==='index.html'){
    document.querySelectorAll('span').forEach(el=>{
      if(el.childElementCount===0 && /5개 중 \d개 완료/.test(el.textContent))el.textContent=`5개 중 ${store.get().routine.length}개 완료`;
      if(el.childElementCount===0 && /도장 \d개 모음/.test(el.textContent))el.textContent=`연습 ${store.get().practice}회 완료`;
    });
    document.getElementById('play-welcome-audio')?.addEventListener('click',()=>speak('안녕! 오늘도 좋은 하루 보내자. 나의 하루, 마음 전하기, 말로 전하기, 생활 연습, 쉬어 가기 중 하나를 선택해요.'));
    document.getElementById('btn-call-teacher')?.addEventListener('click',()=>{store.log('도움 요청','홈 화면에서 도움 요청 표시');speak('선생님 도움이 필요해요. 이 화면을 봐주세요.');toast('도움 요청을 표시했어요. 선생님께 직접 보여주세요.');});
  }
  if(page==='routine.html'){
    const buttons=[...document.querySelectorAll('.task-card .complete-btn')];
    store.get().routine.forEach(i=>{if(document.querySelectorAll('.task-card')[i]?.getAttribute('data-completed')!=='true')buttons[i]?.click();});
    buttons.forEach(b=>b.addEventListener('click',()=>{
      const done=[...document.querySelectorAll('.task-card')].flatMap((c,i)=>c.getAttribute('data-completed')==='true'?[i]:[]);
      store.patch({routine:done});store.log('일과 체크',`${done.length}/5 완료`);
    }));
    document.getElementById('reset-tasks-btn')?.addEventListener('click',()=>{store.patch({routine:[]});store.log('일과 초기화','0/5 완료');});
    document.querySelector('button[aria-label*="일과 진행 안내"]')?.addEventListener('click',()=>speak(`오늘 일과 5개 중 ${store.get().routine.length}개를 마쳤어요.`));
  }
  if(page==='emotion.html'){
    const cards=[...document.querySelectorAll('.emotion-card')];
    const saved=cards.find(c=>c.dataset.emotion===store.get().emotion?.id);saved?.click();
    cards.forEach(c=>c.addEventListener('click',()=>{const emotion={id:c.dataset.emotion,title:c.dataset.title};store.patch({emotion});store.log('감정 선택',emotion.title);}));
    document.getElementById('reset-btn')?.addEventListener('click',()=>store.patch({emotion:null}));
    document.getElementById('sos-btn')?.addEventListener('click',()=>store.log('도움 요청','마음 전하기 화면에서 도움 요청 표시'));
  }
  if(page==='aac.html'){
    document.querySelectorAll('[data-phrase]').forEach(c=>c.addEventListener('click',()=>store.log('AAC 카드',c.dataset.phrase)));
    document.getElementById('speak-btn')?.addEventListener('click',()=>store.log('AAC 음성','사용자가 문장 읽기 버튼을 누름'));
  }
  if(page==='daily-skills.html'){
    const counter=document.getElementById('completedCounter');
    if(counter)counter.textContent=`${store.get().practice}회`;
    document.getElementById('completePracticeBtn')?.addEventListener('click',()=>{store.patch({practice:store.get().practice+1});store.log('생활 연습','손 씻기 연습 완료 표시');if(counter)counter.textContent=`${store.get().practice}회`;});
    document.querySelectorAll('button').forEach(b=>{if(['양치하기','옷 입기','자리 정리'].some(t=>b.textContent.includes(t)))b.addEventListener('click',()=>toast('이 탭은 디자인 예시입니다. 손 씻기 연습을 이용해주세요.'));});
  }
  if(page==='rest-space.html'){
    let audio,source,gain,endTimer,current=null;
    function stop(){source?.stop();source=null;current=null;clearTimeout(endTimer);}
    document.querySelectorAll('.sound-card').forEach(card=>card.addEventListener('click',()=>{
      const type=card.dataset.sound;if(type===current){stop();return;}stop();
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){toast('이 브라우저는 합성 소리를 지원하지 않습니다.');return;}
      audio=audio||new Audio();audio.resume();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*0.3;
      source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value={rain:1600,birds:900,wave:400,fire:700}[type]||800;
      gain=audio.createGain();gain.gain.value=Number(document.getElementById('soundVolume')?.value||30)/300;source.connect(filter).connect(gain).connect(audio.destination);source.start();current=type;
      const selected=document.querySelector('.timer-chip.bg-primary');const mins=Number(selected?.textContent.match(/\d+/)?.[0]||3);endTimer=setTimeout(()=>{stop();document.getElementById('soundPlayingBadge')?.classList.add('hidden');toast('휴식 소리가 끝났어요.');},mins*60000);
      store.log('휴식 소리','브라우저 합성 소리 재생');
    }));
    document.getElementById('soundVolume')?.addEventListener('input',e=>{if(gain)gain.gain.value=Number(e.target.value)/300;});
    window.addEventListener('pagehide',stop);
  }
  if(page==='teacher.html'){
    function render(){const s=store.get();document.getElementById('routine-value').textContent=`${s.routine.length}/5`;document.getElementById('emotion-value').textContent=s.emotion?.title||'선택 전';document.getElementById('practice-value').textContent=`${s.practice}회`;
      const list=document.getElementById('event-rows');list.replaceChildren();[...s.events].reverse().forEach(event=>{const tr=document.createElement('tr');[new Date(event.time).toLocaleString('ko-KR'),event.type,event.detail].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});list.append(tr);});document.getElementById('empty-record').hidden=s.events.length>0;
    }render();
    document.getElementById('refresh').onclick=render;
    document.getElementById('download-csv').onclick=()=>{const url=URL.createObjectURL(new Blob([store.csv()],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='차근차근_시연기록.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    document.getElementById('clear-record').onclick=()=>{if(confirm('이 브라우저의 시연 기록을 초기화할까요?')){store.clear();render();}};
  }
})();
