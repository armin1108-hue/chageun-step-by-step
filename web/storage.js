(function (scope) {
  'use strict';
  const key = 'keri.chageun.demo.v1';
  const blank = () => ({version: 1, routine: [], emotion: null, practice: 0, events: [], contrast: false, speech: true});
  let state = blank();
  let available = true;
  try {
    const old = JSON.parse(scope.localStorage.getItem(key) || 'null');
    if (old && old.version === 1) {
      state = Object.assign(blank(), old);
      state.routine = Array.isArray(old.routine) ? old.routine.filter(n => Number.isInteger(n) && n >= 0 && n < 5) : [];
      state.events = Array.isArray(old.events) ? old.events.slice(-100) : [];
    }
  } catch (_) { available = false; }
  function save() {
    try { scope.localStorage.setItem(key, JSON.stringify(state)); }
    catch (_) { available = false; }
    return state;
  }
  scope.ChageunStore = {
    get: () => state,
    available: () => available,
    patch: fields => { Object.assign(state, fields); return save(); },
    log: (type, detail) => {
      state.events.push({time: new Date().toISOString(), type, detail: String(detail)});
      state.events = state.events.slice(-100); return save();
    },
    clear: () => { state = blank(); return save(); },
    csv: () => '\uFEFF시간,활동,내용\r\n' + state.events.map(e => [e.time,e.type,e.detail].map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('\r\n')
  };
})(typeof window === 'undefined' ? globalThis : window);
