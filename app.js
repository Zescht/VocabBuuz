(() => {
  const $ = sel => document.querySelector(sel);
  const norm = s => (s||'').toLowerCase().trim()
    .replace(/[.,;:!?]/g,'')
    .replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/\s+/g,' ');
  const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };

  const CARDS = [
    { en:'in the vicinity of', de:'in der Nähe von', sol:['in der Nähe von'] },
    { en:'to like (something)', de:'gefallen (etwas)', sol:['gefallen', 'gefallen (etwas)'] },
    { en:'to consist (of something)', de:'(aus etwas) bestehen', sol:['(aus etwas) bestehen', 'bestehen'] },
    { en:'should', de:'sollst = sollen', sol:['sollst = sollen'] },
    { en:'must', de:'must = müssen', sol:['must = müssen'] },
    { en:'I must inform you', de:'Ich muss Sie informieren', sol:['Ich muss Sie informieren'] },
    { en:'previous', de:'vorherig', sol:['vorherig'] },
    { en:'earliest', de:'frühestens', sol:['frühestens'] },
    { en:'from', de:'von', sol:['von'] },
    { en:'from home', de:'von zu Hause', sol:['von zu Hause'] },
    { en:'to do', de:'tun', sol:['tun'] },
    { en:'what a company does for the health of its employees', de:'was eine Firma für die Gesundheit ihrer Mitarbeiter tut', sol:['was eine Firma für die Gesundheit ihrer Mitarbeiter tut'] },
    { en:'to taste', de:'schmecken', sol:['schmecken'] },
    { en:'it tastes good', de:'Es schmeckt gut', sol:['Es schmeckt gut'] },
    { en:'everywhere', de:'überall', sol:['überall'] },
    { en:'to receive', de:'bekommen', sol:['bekommen'] },
    { en:'to become', de:'werden', sol:['werden'] },
    { en:'the company', de:'die Firma', sol:['die Firma', 'Firma'] },
    { en:'to miss', de:'fehlen', sol:['fehlen'] },
    { en:'in the past (for this sentence)', de:'früher', sol:['früher'] },
    { en:'for that', de:'dafür', sol:['dafür'] },
    { en:'I have no time for that', de:'Ich habe keine Zeit dafür', sol:['Ich habe keine Zeit dafür'] },
    { en:'I have no space for that', de:'Ich habe keinen Platz dafür', sol:['Ich habe keinen Platz dafür'] },
    { en:'after', de:'danach', sol:['danach'] },
    { en:'to feel', de:'(sich) fühlen', sol:['fühlen', '(sich) fühlen'] },
    { en:'there', de:'dort', sol:['dort'] },
    { en:'there', de:'da', sol:['da'] },
    { en:'besides that / furthermore', de:'außerdem', sol:['außerdem'] },
    { en:'fresh vegetables', de:'frisches Gemüse', sol:['frisches Gemüse'] },
    { en:'to laugh', de:'lachen', sol:['lachen'] },
    { en:'to clean', de:'putzen', sol:['putzen'] },
    { en:'difficult', de:'schwierig', sol:['schwierig'] },
    { en:'rather / pretty / fairly', de:'ziemlich', sol:['ziemlich'] },
    { en:'to change', de:'sich ändern', sol:['sich ändern'] },
    { en:'to try', de:'versuchen (etwas)', sol:['versuchen', 'versuchen (etwas)'] },
    { en:'to call', de:'anrufen', sol:['anrufen'] },
    { en:'the dish', de:'das Gericht', sol:['Gericht', 'das Gericht'] },
    { en:'before / previously (in terms of time)', de:'vorher', sol:['vorher'] },
    { en:'never (before)', de:'noch nie', sol:['noch nie'] },
    { en:'all the time / constantly', de:'dauernd', sol:['dauernd'] },
    { en:'absolutely / under any circumstance', de:'unbedingt', sol:['unbedingt'] },
    { en:'one of', de:'eines der', sol:['eines der'] },
    { en:'a few / a little (quantity)', de:'wenig', sol:['wenig'] },
    { en:'little (description)', de:'klein', sol:['klein'] },
    { en:'order (rarely reserve)', de:'bestellen', sol:['bestellen'] },
    { en:'to open up', de:'aufmachen', sol:['aufmachen'] },
    { en:'clear', de:'klar', sol:['klar'] },
    { en:'maybe', de:'vielleicht', sol:['vielleicht'] },
    { en:'rich', de:'reich', sol:['reich'] }
  ];

  let deck = [], idx = -1, answered = 0, ok = 0, bad = 0, locked = false, awaitNext = false;
  const history = [];

  const el = {
    start: null, submit: null, reveal: null, skip: null, input: null,
    cardBox: null, cardText: null, cardHint: null, feedback: null,
    bucketOk: null, bucketBad: null, bar: null, results: null, fx: null
  };

  function grabDOM() {
    el.start   = $('#start');
    el.submit  = $('#submit');
    el.reveal  = $('#reveal');
    el.skip    = $('#skip');
    el.input   = $('#answer');
    el.cardText= $('#card-text');
    el.cardHint= $('#card-hint');
    el.feedback= $('#feedback');
    el.bucketOk= $('#bucket-ok');
    el.bucketBad= $('#bucket-bad');
    el.bar     = $('#progress .bar');
    el.results = $('#results');
    const host = $('#card') || $('#card-area') || $('#cardwrap') || (el.cardText && el.cardText.parentElement) || document.body;
    el.cardBox = host;
    el.fx = $('#fx');
    if (!el.fx) {
      el.fx = document.createElement('div');
      el.fx.id = 'fx';
      el.fx.setAttribute('aria-hidden','true');
      const cs = getComputedStyle(host);
      if (cs.position === 'static' || !cs.position) host.style.position = 'relative';
      Object.assign(el.fx.style, {
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
        paddingTop: '6%'
      });
      host.appendChild(el.fx);
    }
  }

  function enableInputs(v){
    const d = !v;
    if (el.input) el.input.disabled = d;
    if (el.submit) el.submit.disabled = d;
    if (el.reveal) el.reveal.disabled = d;
    if (el.skip) el.skip.disabled = d;
    if (v && el.input) el.input.focus();
  }
  function updateProgress(){
    const safe = Math.min(answered, CARDS.length);
    if (el.bar) el.bar.style.width = Math.round((safe/CARDS.length)*100)+'%';
  }
  const pretty = card => (card.de||'').split('|').join(' / ');
  function addMiniCard(to, card){
    if(!to) return;
    const d = document.createElement('div');
    d.className='mini-card';
    d.innerHTML = `<div class="en">${card.en||''}</div><div class="de">${card.de||''}</div>`;
    to.appendChild(d);
  }

  const FX = { okUrl:'https://i.imgur.com/RQ3mDTH.png', badUrl:'https://i.imgur.com/9BACXIX.png', holdMs:3000, outMs:600 };
  const _fx = { timers: [] };
  function _clearFxTimers(){ _fx.timers.forEach(t=>clearTimeout(t)); _fx.timers.length=0; }
  function _preloadFx(){ ['okUrl','badUrl'].forEach(k=>{ const img=new Image(); img.src = FX[k]; }); }
  function showFx(kind){
    const c = el.fx; if(!c) return;
    _clearFxTimers(); c.innerHTML='';
    const img = new Image();
    img.alt = kind==='ok' ? 'Richtig' : 'Falsch';
    img.src = kind==='ok' ? FX.okUrl : FX.badUrl;
    Object.assign(img.style, {
      width: '70%',
      height: 'auto',
      opacity: '0',
      transform: 'translateY(12px)',
      transition: 'opacity 250ms ease, transform 600ms ease',
      filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.25))'
    });
    c.appendChild(img);
    requestAnimationFrame(()=>{ img.style.opacity='1'; img.style.transform='translateY(0)'; });
    const t1 = setTimeout(()=>{ img.style.opacity='0'; img.style.transform='translateY(-22px)'; }, Math.max(0, FX.holdMs - FX.outMs));
    const t2 = setTimeout(()=>{ c.innerHTML=''; }, FX.holdMs);
    _fx.timers.push(t1,t2);
  }

  function showWord(){
    const c = deck[idx];
    if (el.cardText) el.cardText.textContent = c.en;
    if (el.cardHint) el.cardHint.textContent = 'Schreibe die deutsche Übersetzung (mit Artikel) und drücke ENTER';
    if (el.feedback) el.feedback.innerHTML = '';
    if (el.input) el.input.value = '';
    awaitNext = false; locked = false;
    enableInputs(true);
    if (el.fx) el.fx.innerHTML='';
  }
  function nextCard(){ idx++; if(idx >= deck.length) return finish(); showWord(); }
  function showSolution(card){
    if (el.cardText) el.cardText.textContent = pretty(card);
    if (el.cardHint) el.cardHint.textContent = 'Drücke ENTER für das nächste Wort';
    awaitNext = true;
  }
  function checkAnswer(){
    if(locked || idx < 0) return;
    locked = true;
    const userRaw = (el.input && el.input.value ? el.input.value : '').trim();
    const user = norm(userRaw);
    const card = deck[idx];
    const solutions = (card.sol && card.sol.length ? card.sol : (card.de||'').split('|')).map(norm);
    const correct = solutions.includes(user);
    enableInputs(false);
    if(correct){
      ok++; answered++;
      if (el.feedback) el.feedback.innerHTML = '<span class="ok">✅ Richtig!</span>';
      addMiniCard(el.bucketOk, card);
      showFx('ok');
    } else {
      bad++; answered++;
      if (el.feedback) el.feedback.innerHTML = `<span class="bad">❌ Falsch.</span> <span>Richtige Lösung: <strong>${pretty(card)}</strong></span>`;
      addMiniCard(el.bucketBad, card);
      showFx('bad');
    }
    history.push({ en:card.en, de:card.de, input:userRaw||'—', correct });
    updateProgress();
    locked = false;
    showSolution(card);
  }
  function renderResults(){
    if(!el.results) return;
    const right = history.filter(h=>h.correct);
    const wrong = history.filter(h=>!h.correct);
    const table = (list,title)=>{
      const rows = list.map(h=>`<tr><td>${h.en}</td><td>${h.de}</td><td>${h.input}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>';
      return `<div class="res-card"><h3>${title}</h3><table><thead><tr><th>EN</th><th>DE</th><th>Eingabe</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };
    el.results.innerHTML = table(right,'Richtig') + table(wrong,'Falsch');
    el.results.classList.add('show');
  }
  function finish(){
    if (el.cardText) el.cardText.textContent = 'Fertig!';
    if (el.cardHint) el.cardHint.textContent = '';
    if (el.feedback) el.feedback.innerHTML = '';
    enableInputs(false);
    renderResults();
  }

  function bindEvents(){
    if (el.start) el.start.addEventListener('click', ()=>{
      if (!CARDS.length) { alert('Keine Karten gefunden.'); return; }
      deck = shuffle(CARDS);
      idx = -1; answered = ok = bad = 0; locked = false; awaitNext = false;
      history.length = 0;
      if(el.bucketOk) el.bucketOk.innerHTML = '';
      if(el.bucketBad) el.bucketBad.innerHTML = '';
      if(el.results){ el.results.classList.remove('show'); el.results.innerHTML=''; }
      if(el.fx) el.fx.innerHTML='';
      updateProgress();
      nextCard();
    });
    if (el.submit) el.submit.addEventListener('click', ()=>{ if(awaitNext) nextCard(); else checkAnswer(); });
    if (el.reveal) el.reveal.addEventListener('click', ()=>{ if(idx>=0) showSolution(deck[idx]); });
    if (el.skip) el.skip.addEventListener('click', ()=>{ if(idx>=0) nextCard(); });
    if (el.input) el.input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){ if(awaitNext) nextCard(); else checkAnswer(); }
    });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && el.input) el.input.blur(); if(e.key === 'ArrowUp' && el.input) el.input.focus(); });
  }

  function init(){
    grabDOM();
    _preloadFx();
    enableInputs(false);
    updateProgress();
    bindEvents();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
