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

  // ---------- Data (EXACT vocabulary from German.xlsx) ----------
  const CARDS = [
    { en:'in the vicinity of', de:'in der Nähe von', sol:['in der Nähe von'] },
    { en:'to like (something)', de:'gefallen (etwas)', sol:['gefallen (etwas)', 'gefallen', 'gefallen etwas'] },
    { en:'to consist (of something)', de:'(aus etwas) bestehen', sol:['(aus etwas) bestehen', 'aus etwas bestehen', 'bestehen'] },
    { en:'should', de:'sollst = sollen', sol:['sollst', 'sollen'] },
    { en:'must', de:'must = müssen', sol:['must', 'müssen'] },
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
    { en:'the company', de:'die Firma', sol:['die Firma'] },
    { en:'to miss', de:'fehlen', sol:['fehlen'] },
    { en:'in the past (for this sentence)', de:'früher', sol:['früher'] },
    { en:'for that', de:'dafür', sol:['dafür'] },
    { en:'I have no time for that', de:'Ich habe keine Zeit dafür', sol:['Ich habe keine Zeit dafür'] },
    { en:'I have no space for that', de:'Ich habe keinen Platz dafür', sol:['Ich habe keinen Platz dafür'] },
    { en:'after', de:'danach', sol:['danach'] },
    { en:'to feel', de:'(sich) fühlen', sol:['(sich) fühlen', 'sich fühlen', 'fühlen'] },
    { en:'there', de:'dort', sol:['dort'] },
    { en:'there', de:'da', sol:['da'] },
    { en:'besides that / furthermore', de:'außerdem', sol:['außerdem'] },
    { en:'fresh vegetables', de:'frisches Gemüse', sol:['frisches Gemüse'] },
    { en:'to laugh', de:'lachen', sol:['lachen'] },
    { en:'to clean', de:'putzen', sol:['putzen'] },
    { en:'difficult', de:'schwierig', sol:['schwierig'] },
    { en:'rather / pretty / fairly', de:'ziemlich', sol:['ziemlich'] },
    { en:'to change', de:'sich ändern', sol:['sich ändern', 'ändern'] },
    { en:'to try', de:'versuchen (etwas)', sol:['versuchen (etwas)', 'versuchen'] },
    { en:'to call', de:'anrufen', sol:['anrufen'] },
    { en:'the dish', de:'das Gericht', sol:['das Gericht'] },
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

  const STATUS_IMG = { ok:'https://i.imgur.com/RQ3mDTH.png', bad:'https://i.imgur.com/9BACXIX.png' };

  // ---------- State ----------
  let deck = [], idx = -1, answered = 0, ok = 0, bad = 0, locked = false, awaitNext = false;
  const history = [];
  const el = {
    card: $('#card'), cardText: $('#card-text'), cardHint: $('#card-hint'),
    startRow: $('#start-row'), startBtn: $('#start-btn'), fx: $('#fx'),
    input: $('#answer-input'), submit: $('#submit-btn'), reveal: $('#reveal-btn'), skip: $('#skip-btn'),
    feedback: $('#feedback'), counter: $('#counter'), bar: $('#bar-fill'),
    bucketOk: $('#bucket-correct'), bucketBad: $('#bucket-wrong'),
    results: $('#results'), restart: $('#restart-btn'), form: $('#answer-form')
  };

  // ---------- UI ----------
  function enableInputs(v){ 
    el.input.disabled = el.submit.disabled = el.reveal.disabled = el.skip.disabled = !v; 
    if(v) el.input.focus(); 
  }
  
  function updateProgress(){ 
    const safe = Math.min(answered, CARDS.length); 
    el.counter.textContent = `${safe} / ${CARDS.length}`; 
    el.bar.style.width = Math.round((safe/CARDS.length)*100)+'%'; 
  }
  
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
  
  function addMiniCard(to, card, isCorrect){ 
    const d = document.createElement('div'); 
    d.className = `mini-card ${isCorrect ? 'ok' : 'bad'}`; 
    d.innerHTML = `<div class="en">${card.en}</div><div class="de">${card.de}</div>`; 
    to.appendChild(d); 
  }

  // ---------- Flow ----------
  function showWord(){
    const c = deck[idx];
    el.cardText.textContent = c.en;
    el.cardHint.textContent = 'Schreibe die deutsche Übersetzung (mit Artikel) und drücke ENTER';
    el.feedback.innerHTML = '';
    el.input.value = '';
    awaitNext = false;
    locked = false;
    enableInputs(true);
    if(el.fx) el.fx.innerHTML = '';
  }
  
  function nextCard(){ 
    idx++; 
    if(idx >= deck.length) return finish(); 
    showWord(); 
  }
  
  function showSolution(card){ 
    el.cardText.textContent = pretty(card); 
    el.cardHint.textContent = 'Drücke ENTER für das nächste Wort'; 
    awaitNext = true; 
  }
  
  function checkAnswer(){
    if(locked || idx < 0) return;
    locked = true;
    const userRaw = el.input.value.trim();
    const user = norm(userRaw);
    const card = deck[idx];
    const solutions = (card.sol || card.de.split('|')).map(norm);
    const correct = solutions.includes(user);

    enableInputs(false);

    if(correct){ 
      ok++; 
      answered++; 
      el.feedback.innerHTML = '<span class="ok">✅ Richtig!</span>'; 
      addMiniCard(el.bucketOk, card, true); 
    } else { 
      bad++; 
      answered++; 
      el.feedback.innerHTML = `<span class="bad">❌ Falsch. Richtige Lösung: <strong>${pretty(card)}</strong></span>`; 
      addMiniCard(el.bucketBad, card, false); 
    }
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
      return `<div class="res-card"><h3>${title}</h3><table><thead><tr><th>EN</th><th>DE (Lösung)</th><th>Eingabe</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    };
    el.results.innerHTML = table(right,'Richtig') + table(wrong,'Falsch');
    el.results.classList.add('show');
  }
  
  function start(){
    if(idx >= 0) return;
    deck = shuffle(CARDS);
    idx = -1; 
    answered = ok = bad = 0; 
    locked = false; 
    awaitNext = false;
    history.length = 0;
    el.bucketOk.innerHTML = ''; 
    el.bucketBad.innerHTML = '';
    el.results.classList.remove('show'); 
    el.results.innerHTML = '';
    if(el.startRow) el.startRow.style.display = 'none';
    if(el.startBtn) el.startBtn.style.display = 'none';
    updateProgress();
    nextCard();
  }
  
  function finish(){
    enableInputs(false);
    el.cardText.textContent = 'Fertig!';
    el.cardHint.textContent = `Ergebnis: ${ok} ✅ · ${bad} ❌`;
    el.feedback.innerHTML = '';
    renderResults();
    el.restart.style.display = 'inline-block';
    awaitNext = false;
  }

  // ---------- Events ----------
  function initEvents() {
    // Start
    el.startBtn.addEventListener('click', start);
    
    // Enter/S startet; Enter während awaitNext => nächste Karte
    document.addEventListener('keydown', (e)=>{
      if(idx < 0 && (e.key === 'Enter' || e.key.toLowerCase() === 's')) { 
        e.preventDefault(); 
        start(); 
        return; 
      }
      if(awaitNext && e.key === 'Enter'){ 
        e.preventDefault(); 
        awaitNext=false; 
        nextCard(); 
      }
    });
    
    // Extra: Klick irgendwo auf Karte startet ebenfalls
    el.card.addEventListener('click', ()=>{ if(idx < 0) start(); });

    // Training
    el.form.addEventListener('submit', (e)=>{ e.preventDefault(); checkAnswer(); });
    
    el.reveal.addEventListener('click', ()=>{
      if(idx < 0 || awaitNext) return;
      const letter = firstLetter(deck[idx]);
      el.feedback.innerHTML = `<span class="pill">Tipp: Erster Buchstabe: <strong>${letter}</strong></span>`;
    });
    
    el.skip.addEventListener('click', ()=>{
      if(idx < 0 || awaitNext) return;
      history.push({ en:deck[idx].en, de:deck[idx].de, input:'(übersprungen)', correct:false });
      bad++; 
      answered++; 
      addMiniCard(el.bucketBad, deck[idx], false); 
      updateProgress(); 
      nextCard();
    });
    
    el.restart.addEventListener('click', ()=>{
      idx = -1; 
      answered = ok = bad = 0; 
      history.length = 0;
      el.cardText.textContent = 'Vokabel-Trainer';
      el.cardHint.textContent = 'Klicke auf Start, dann erscheint ein englisches Wort... tippe die deutsche Übersetzung (mit Artikel) ein und drücke Enter.';
      el.restart.style.display = 'none'; 
      enableInputs(false);
      el.input.value = ''; 
      el.feedback.innerHTML = ''; 
      el.results.classList.remove('show'); 
      el.results.innerHTML='';
      if(el.fx) el.fx.innerHTML = '';
      el.startRow.style.display = 'flex';
      el.startBtn.style.display = 'block';
      updateProgress();
    });

    // Komfort
    document.addEventListener('keydown', (e)=>{ 
      if(e.key === 'Escape') el.input.blur(); 
      if(e.key === 'ArrowUp') el.input.focus(); 
    });
  }

  // ---------- Init ----------
  function init() {
    enableInputs(false); 
    updateProgress();
    initEvents();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
