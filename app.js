(() => {
  // ---------- Helpers ----------
  const $ = sel => document.querySelector(sel);
  const norm = s => (s||'').toLowerCase().trim()
    .replace(/[.,;:!?]/g,'')
    .replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue')
    .replace(/\s+/g,' ');
  const shuffle = arr => {
    const a = [...arr];
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  };

  // ---------- Data (49) ----------
  const CARDS = [
    { en:'in the vicinity of', de:'in der Nähe von', sol:[
          'in der Nähe von',
          'in der nähe von'
        ] },
    { en:'to like (something)', de:'gefallen (etwas)', sol:[
          'gefallen (etwas)',
          'gefallen',
          'gefallen etwas'
        ] },
    { en:'to consist (of something)', de:'(aus etwas) bestehen', sol:[
          '(aus etwas) bestehen',
          'aus etwas bestehen',
          'bestehen'
        ] },
    { en:'should', de:'sollst|sollen', sol:[
          'sollst = sollen',
          'sollen',
          'sollst'
        ] },
    { en:'must', de:'must|müssen', sol:[
          'must = müssen',
          'must',
          'müssen'
        ] },
    { en:'I must inform you', de:'Ich muss Sie informieren', sol:[
          'Ich muss Sie informieren',
          'ich muss sie informieren'
        ] },
    { en:'previous', de:'vorherig', sol:[
          'vorherig'
        ] },
    { en:'the rest', de:'der Rest', sol:[
          'der Rest',
          'rest'
        ] },
    { en:'just (now)', de:'gerade (eben)', sol:[
          'gerade (eben)',
          'gerade eben',
          'gerade'
        ] },
    { en:'absolutely / under any circumstance', de:'unbedingt', sol:[
          'unbedingt'
        ] },
    { en:'one of', de:'eines der', sol:[
          'eines der'
        ] },
    { en:'few / a little (quantity)', de:'wenig', sol:[
          'wenig'
        ] },
    { en:'little (description)', de:'klein', sol:[
          'klein'
        ] },
    { en:'to order', de:'bestellen', sol:[
          'bestellen'
        ] },
    { en:'to open up', de:'aufmachen', sol:[
          'aufmachen'
        ] },
    { en:'clear', de:'klar', sol:[
          'klar'
        ] },
    { en:'maybe', de:'vielleicht', sol:[
          'vielleicht'
        ] },
    { en:'rich', de:'reich', sol:[
          'reich'
        ] },
    { en:'with that (not subclause intro)', de:'damit', sol:[
          'damit'
        ] },
    { en:'to become', de:'werden', sol:[
          'werden'
        ] },
    { en:'consciously', de:'bewusst', sol:[
          'bewusst'
        ] },
    { en:'to decide (oneself)', de:'(sich) entscheiden', sol:[
          '(sich) entscheiden',
          'sich entscheiden',
          'entscheiden'
        ] },
    { en:'first / first of all', de:'erstmal', sol:[
          'erstmal'
        ] },
    { en:'world', de:'die Welt', sol:[
          'die Welt',
          'welt'
        ] },
    { en:'different / various', de:'verschieden', sol:[
          'verschieden'
        ] },
    { en:'to drive', de:'fahren', sol:[
          'fahren'
        ] },
    { en:'because / because of (Genitive or Dative)', de:'wegen', sol:[
          'wegen'
        ] },
    { en:'most(ly)', de:'meist(en)', sol:[
          'meist(en)',
          'meisten',
          'meist'
        ] },
    { en:'show', de:'die Sendung', sol:[
          'die Sendung',
          'sendung'
        ] },
    { en:'seat / chair / place', de:'der Platz', sol:[
          'der Platz',
          'platz'
        ] },
    { en:'known or famous', de:'bekannt', sol:[
          'bekannt'
        ] },
    { en:'career path', de:'Berufsweg', sol:[
          'Berufsweg',
          'berufsweg'
        ] },
    { en:'to try (a bit)', de:'versuchen (etwas)', sol:[
          'versuchen (etwas)',
          'versuchen',
          'versuchen etwas'
        ] },
    { en:'to call', de:'anrufen', sol:[
          'anrufen'
        ] },
    { en:'the dish', de:'das Gericht', sol:[
          'das Gericht',
          'gericht'
        ] },
    { en:'before / previously (in terms of time)', de:'vorher', sol:[
          'vorher'
        ] },
    { en:'never (before)', de:'noch nie', sol:[
          'noch nie'
        ] },
    { en:'all the time / constantly', de:'dauernd', sol:[
          'dauernd'
        ] },
    { en:'different / various (alt)', de:'verschieden', sol:[
          'verschieden'
        ] },
    { en:'world (alt)', de:'die Welt', sol:[
          'die Welt',
          'welt'
        ] },
    { en:'because / due to', de:'wegen', sol:[
          'wegen'
        ] },
    { en:'most (alt)', de:'meist(en)', sol:[
          'meist(en)',
          'meist',
          'meisten'
        ] },
    { en:'show (alt)', de:'die Sendung', sol:[
          'die Sendung',
          'sendung'
        ] },
    { en:'seat / chair / place (alt)', de:'der Platz', sol:[
          'der Platz',
          'platz'
        ] },
    { en:'known / famous (alt)', de:'bekannt', sol:[
          'bekannt'
        ] },
    { en:'career path (alt)', de:'Berufsweg', sol:[
          'Berufsweg',
          'berufsweg'
        ] }
  ];

  // ---------- UI ----------
  const el = {
    start: $('#start'),
    submit: $('#submit'),
    reveal: $('#reveal'),
    skip: $('#skip'),
    input: $('#answer'),
    cardText: $('#card-text'),
    cardHint: $('#card-hint'),
    feedback: $('#feedback'),
    bucketOk: $('#bucket-ok'),
    bucketBad: $('#bucket-bad'),
    bar: $('#progress .bar'),
    results: $('#results'),
    fx: $('#fx')
  };

  // ---------- State ----------
  let deck = [];
  let idx = -1;
  let answered = 0, ok = 0, bad = 0;
  let locked = false, awaitNext = false;
  const history = [];

  function enableInputs(v){ el.input.disabled = el.submit.disabled = el.reveal.disabled = el.skip.disabled = !v; if(v) el.input.focus(); }
  function updateProgress(){ const safe = Math.min(answered, CARDS.length); el.bar.style.width = Math.round((safe/CARDS.length)*100)+'%'; }
  const pretty = card => card.de.split('|').join(' / ');
  function firstLetter(card){
    let variant = card.de.split('/')[0].split('|')[0].trim();
    const lower = variant.toLowerCase();
    if(lower.startsWith('der ')) variant = variant.slice(4);
    else if(lower.startsWith('die ')) variant = variant.slice(4);
    else if(lower.startsWith('das ')) variant = variant.slice(4);
    const letters = 'abcdefghijklmnopqrstuvwxyzäöüßABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';
    for(const ch of variant){ if(letters.indexOf(ch)!==-1) return ch.toUpperCase(); }
    return '';
  }
  function addMiniCard(to, card){ const d = document.createElement('div'); d.className='mini-card'; d.innerHTML = `<div class="en">${card.en}</div><div class="de">${card.de}</div>`; to.appendChild(d); }

  // ---------- Flow ----------
  function showWord(){
    const c = deck[idx];
    el.cardText.textContent = c.en;
    el.cardHint.textContent = 'Schreibe die deutsche Übersetzung (mit Artikel) und drücke ENTER';
    el.feedback.innerHTML = '';
    el.input.value = '';
    awaitNext = false; locked = false;
    enableInputs(true);
    if(el.fx) el.fx.innerHTML = '';
  }
  function nextCard(){ idx++; if(idx >= deck.length) return finish(); showWord(); }
  function showSolution(card){ el.cardText.textContent = pretty(card); el.cardHint.textContent = 'Drücke ENTER für das nächste Wort'; awaitNext = true; }
  function checkAnswer(){
    if(locked || idx < 0) return;
    locked = true;
    const userRaw = el.input.value.trim();
    const user = norm(userRaw);
    const card = deck[idx];
    const solutions = (card.sol || card.de.split('|')).map(norm);
    const correct = solutions.includes(user);

    enableInputs(false);

    if(correct){ ok++; answered++; el.feedback.innerHTML = '<span class="ok">✅ Richtig!</span>'; addMiniCard(el.bucketOk, card); }
    else { bad++; answered++; el.feedback.innerHTML = `<span class="bad">❌ Falsch.</span> <span>Richtige Lösung: <strong>${pretty(card)}</strong></span>`; addMiniCard(el.bucketBad, card); }
    history.push({ en:card.en, de:card.de, input:userRaw||'—', correct });
    updateProgress();
    locked = false;
    showSolution(card);
  }
  function renderResults(){
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
    el.cardText.textContent = 'Fertig!';
    el.cardHint.textContent = '';
    el.feedback.innerHTML = '';
    enableInputs(false);
    renderResults();
  }

  // ---------- Events ----------
  document.addEventListener('DOMContentLoaded', ()=>{
    if(el.start) el.start.addEventListener('click', ()=>{
      if(idx >= 0) return;
      deck = shuffle(CARDS);
      idx = -1; answered = ok = bad = 0; locked = false; awaitNext = false;
      history.length = 0;
      el.bucketOk.innerHTML = ''; el.bucketBad.innerHTML = '';
      el.results.classList.remove('show'); el.results.innerHTML='';
      if(el.fx) el.fx.innerHTML = '';
      updateProgress();
      nextCard();
    });
    if(el.submit) el.submit.addEventListener('click', ()=>{ if(awaitNext) nextCard(); else checkAnswer(); });
    if(el.reveal) el.reveal.addEventListener('click', ()=>{ if(idx>=0) showSolution(deck[idx]); });
    if(el.skip) el.skip.addEventListener('click', ()=>{ if(idx>=0) nextCard(); });
    el.input && el.input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        if(awaitNext) nextCard();
        else checkAnswer();
      }
    });

    // Komfort
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') el.input.blur(); if(e.key === 'ArrowUp') el.input.focus(); });

    // Init
    enableInputs(false); updateProgress();
  });
})();
