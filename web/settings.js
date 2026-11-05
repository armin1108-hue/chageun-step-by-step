(function (scope) {
  'use strict';
  const key = 'keri.chageun.settings.v1';
  const icons = {
    backpack:'가방', waving_hand:'인사', menu_book:'책', restaurant:'식사', home:'집',
    work:'직업', self_improvement:'휴식', front_hand:'도움', water_drop:'물', wc:'화장실',
    pause_circle:'멈춤', thumb_up:'좋아요', thumb_down:'싫어요', replay:'다시', chair:'자리',
    soap:'비누', dry:'수건', checkroom:'옷', more_horiz:'활동'
  };
  const defaults = () => ({
    version:1, revision:0,
    routine:[
      {title:'가방 정리', note:'알림장과 필통 꺼내기', icon:'backpack'},
      {title:'아침 인사', note:'친구와 선생님께 인사해요', icon:'waving_hand'},
      {title:'함께 배우기', note:'함께 활동을 시작해요', icon:'menu_book'},
      {title:'점심 먹기', note:'내 속도로 식사해요', icon:'restaurant'},
      {title:'집으로 가기', note:'내 짐을 챙겨요', icon:'home'}
    ],
    aac:[
      {phrase:'선생님, 도와주세요!', icon:'front_hand', category:'help'},
      {phrase:'물 마시고 싶어요.', icon:'water_drop', category:'health'},
      {phrase:'화장실 가고 싶어요.', icon:'wc', category:'health'},
      {phrase:'잠깐 쉬고 싶어요.', icon:'pause_circle', category:'health'},
      {phrase:'좋아요! 네.', icon:'thumb_up', category:'school'},
      {phrase:'싫어요. 아니오.', icon:'thumb_down', category:'school'},
      {phrase:'더 하고 싶어요!', icon:'replay', category:'school'},
      {phrase:'내 자리로 갈래요.', icon:'chair', category:'help'}
    ],
    practice:{title:'깨끗하게 손 씻기', steps:[
      '물로 손을 적시고 비누 거품을 내요.', '손바닥과 손등을 문질러요.',
      '손가락 사이와 엄지를 닦아요.', '흐르는 물에 거품을 씻어내요.', '깨끗한 수건이나 종이로 닦아요.'
    ], support:'어려운 단계에서는 선생님께 도움을 요청해요.'},
    changeNote:'', reducedMotion:true
  });
  const copy = value => JSON.parse(JSON.stringify(value));
  function text(value, max, name, allowEmpty=false) {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > max) throw new Error(`${name}을 확인해주세요.`);
    return value.trim();
  }
  function icon(value) { if (!Object.hasOwn(icons,value)) throw new Error('그림 기호를 확인해주세요.'); return value; }
  function validate(value) {
    if (!value || value.version !== 1 || !Array.isArray(value.routine) || value.routine.length !== 5 || !Array.isArray(value.aac) || value.aac.length !== 8 || !Array.isArray(value.practice?.steps) || value.practice.steps.length !== 5) throw new Error('설정 형식이 올바르지 않습니다.');
    return {
      version:1, revision:Number.isSafeInteger(value.revision) && value.revision >= 0 ? value.revision : 0,
      routine:value.routine.map(v=>({title:text(v.title,60,'일과 이름'),note:text(v.note,120,'일과 안내'),icon:icon(v.icon)})),
      aac:value.aac.map(v=>{
        if (!['help','health','school'].includes(v.category)) throw new Error('카드 분류를 확인해주세요.');
        return {phrase:text(v.phrase,100,'카드 문구'),icon:icon(v.icon),category:v.category};
      }),
      practice:{title:text(value.practice.title,60,'활동 이름'),steps:value.practice.steps.map(v=>text(v,150,'활동 단계')),support:text(value.practice.support,200,'지원 방법')},
      changeNote:text(value.changeNote,200,'변경 안내',true), reducedMotion:value.reducedMotion !== false
    };
  }
  let state = defaults(), loadError = false;
  try { const old = scope.localStorage.getItem(key); if (old) state = validate(JSON.parse(old)); }
  catch (_) { loadError = true; }
  function save(value) {
    try {
      const next = validate(value); next.revision = state.revision + 1;
      // Publish only after a successful write. Failed writes retain the previous settings.
      scope.localStorage.setItem(key, JSON.stringify(next));
      state = next; loadError = false; return {ok:true, revision:next.revision};
    } catch (error) { return {ok:false, error:error.message || '설정을 저장하지 못했습니다.'}; }
  }
  scope.ChageunSettings = {key, icons, get:()=>copy(state), defaults, save, loadError:()=>loadError};

  // Manual observation drafts deliberately have no storage or network operations.
  let draft = null;
  function updateDraft(value) {
    try {
      if (!['가상 학생 A','가상 학생 B'].includes(value.subject)) throw new Error('가상 학생을 선택해주세요.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.date) || Number.isNaN(Date.parse(value.date)) || new Date(value.date).toISOString().slice(0,10) !== value.date) throw new Error('관찰 날짜를 확인해주세요.');
      const next = {subject:value.subject, date:value.date, status:'draft'};
      for (const [name, max] of Object.entries({baseline:500,goal:500,measure:300,reviewDate:10,activity:150,observation:2000,support:300,context:500,observer:80})) {
        next[name]=text(value[name],max,name);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(next.reviewDate) || Number.isNaN(Date.parse(next.reviewDate)) || new Date(next.reviewDate).toISOString().slice(0,10) !== next.reviewDate) throw new Error('목표 검토일을 확인해주세요.');
      if (next.reviewDate < next.date) throw new Error('목표 검토일은 관찰 날짜 이후로 정해주세요.');
      draft=next; return {ok:true};
    } catch (error) { return {ok:false,error:error.message}; }
  }
  scope.ChageunDraft = {
    get:()=>draft ? copy(draft) : null, save:updateDraft,
    unconfirm:()=>{if(draft) draft.status='draft';},
    confirm:reviewed=>{
      if (!draft || reviewed !== true) return {ok:false,error:'관찰 근거와 목표를 직접 검토한 후 확인해주세요.'};
      draft.status='confirmed'; return {ok:true};
    }, clear:()=>{draft=null;}
  };
})(typeof window === 'undefined' ? globalThis : window);
