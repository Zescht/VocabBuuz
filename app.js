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

  // ---------- Data (50) ----------
  const CARDS = [
    { en:'car', de:'das Auto', sol:['das auto'] },
    { en:'house', de:'das Haus', sol:['das haus'] },
    { en:'dog', de:'der Hund', sol:['der hund'] },
    { en:'cat', de:'die Katze', sol:['die katze'] },
    { en:'apple', de:'der Apfel', sol:['der apfel'] },
    { en:'book', de:'das Buch', sol:['das buch'] },
    { en:'water', de:'das Wasser', sol:['das wasser'] },
    { en:'chair', de:'der Stuhl', sol:['der stuhl'] },
    { en:'table', de:'der Tisch', sol:['der tisch'] },
    { en:'bed', de:'das Bett', sol:['das bett'] },
    { en:'city', de:'die Stadt', sol:['die stadt'] },
    { en:'country', de:'das Land', sol:['das land'] },
    { en:'friend', de:'der Freund / die Freundin', sol:['der freund','die freundin'] },
    { en:'mother', de:'die Mutter', sol:['die mutter'] },
    { en:'father', de:'der Vater', sol:['der vater'] },
    { en:'brother', de:'der Bruder', sol:['der bruder'] },
    { en:'sister', de:'die Schwester', sol:['die schwester'] },
    { en:'child', de:'das Kind', sol:['das kind'] },
    { en:'school', de:'die Schule', sol:['die schule'] },
    { en:'work', de:'die Arbeit', sol:['die arbeit'] },
    { en:'money', de:'das Geld', sol:['das geld'] },
    { en:'time', de:'die Zeit', sol:['die zeit'] },
    { en:'day', de:'der Tag', sol:['der tag'] },
    { en:'night', de:'die Nacht', sol:['die nacht'] },
    { en:'morning', de:'der Morgen', sol:['der morgen'] },
    { en:'evening', de:'der Abend', sol:['der abend'] },
    { en:'week', de:'die Woche', sol:['die woche'] },
    { en:'year', de:'das Jahr', sol:['das jahr'] },
    { en:'road', de:'die Straße', sol:['die straße','die strasse'] },
    { en:'train', de:'der Zug', sol:['der zug'] },
    { en:'bus', de:'der Bus', sol:['der bus'] },
    { en:'airplane', de:'das Flugzeug', sol:['das flugzeug'] },
    { en:'bicycle', de:'das Fahrrad / das Rad', sol:['das fahrrad','das rad'] },
    { en:'ship', de:'das Schiff', sol:['das schiff'] },
    { en:'window', de:'das Fenster', sol:['das fenster'] },
    { en:'door', de:'die Tür', sol:['die tür','die tuer'] },
    { en:'computer', de:'der Computer', sol:['der computer'] },
    { en:'phone', de:'das Telefon / das Handy', sol:['das telefon','das handy'] },
    { en:'key', de:'der Schlüssel', sol:['der schlüssel','der schluessel'] },
    { en:'bread', de:'das Brot', sol:['das brot'] },
    { en:'milk', de:'die Milch', sol:['die milch'] },
    { en:'coffee', de:'der Kaffee', sol:['der kaffee'] },
    { en:'tea', de:'der Tee', sol:['der tee'] },
    { en:'sugar', de:'der Zucker', sol:['der zucker'] },
    { en:'salt', de:'das Salz', sol:['das salz'] },
    { en:'rain', de:'der Regen', sol:['der regen'] },
    { en:'snow', de:'der Schnee', sol:['der schnee'] },
    { en:'sun', de:'die Sonne', sol:['die sonne'] },
    { en:'moon', de:'der Mond', sol:['der mond'] },
    { en:'star', de:'der Stern', sol:['der stern'] },
  ];

  // ---------- State & Elements ----------
  let deck=[], idx=-1, answered=0, ok=0, bad=0, locked=false, awaitNext=false;
  const history=[];
  const el = {
    card: $('#card'), cardText: $('#card-text'), cardHint: $('#card-hint'),
    startRow: $('#start-row'), startBtn: $('#start-btn'), fx: $('#fx'),
    input: $('#answer-input'), submit: $('#submit-btn'), reveal: $('#reveal-btn'), skip: $('#skip-btn'),
    feedback: $('#feedback'), counter: $('#counter'), bar: $('#bar-fill'),
    bucketOk: $('#bucket-correct'), bucketBad: $('#bucket-wrong'),
    results: $('#results'), restart: $('#restart-btn'), form: $('#answer-form')
  };

  // ---------- UI helpers ----------
  function enableInputs(v){
    el.input.disabled = el.submit.disabled = el.reveal.disabled = el.skip.disabled = !v;
    if(v) el.input.focus();
  }
  function updateProgress(){
    const safe = Math.min(answered, CARDS.length);
    el.counter.textContent = `${safe} / ${CARDS.length}`;
    const pct = Math.round((safe/CARDS.length)*100);
    el.bar.style.width = pct + '%';
  }
  function showWord(){
    const c = deck[idx];
    el.cardText.textContent = c.en;
    el.cardHint.textContent = '';      // Hinweis ausblenden
    awaitNext = false;
    el.input.value = ''; el.feedback.innerHTML = '';
    if(el.fx) el.fx.innerHTML = '';    // altes Bild weg
    enableInputs(true);
  }
  function nextCard(){
    idx++;
    if(idx >= deck.length){ finish(); return; }
    showWord();
  }
  function addMiniCard(to, card, isOk){
    const d = document.createElement('div');
    d.className = 'mini-card ' + (isOk? 'ok':'bad');
    d.innerHTML = `<div class="en">${card.en}</div><div class="de">${card.de}</div>`;
    to.appendChild(d);
  }
  const pretty = card => card.de.split('|').join(' / ');
  function firstLetter(card){
    let variant = card.de.split('/')[0].split('|')[0].trim();
    const lower = variant.toLowerCase();
    if(lower.startsWith('der ')) variant = variant.slice(4);
    else if(lower.startsWith('die ')) variant = variant.slice(4);
    else if(lower.startsWith('das ')) variant = variant.slice(4);
    for(const ch of variant){ if(/[a-zA-ZäöüÄÖÜß]/.test(ch)) return ch.toUpperCase(); }
    return '';
  }
  function showSolution(card){
    el.cardText.textContent = pretty(card); // DE-Lösung anzeigen
    el.cardHint.textContent = 'Drücke ENTER um zum nächsten Wort zu gelangen';
    awaitNext = true;
  }
  function showFx(kind){
    if(!el.fx) return;
    const src = kind==='ok' ? 'https://i.imgur.com/RQ3mDTH.png'
                            : 'https://i.imgur.com/9BACXIX.png';
    el.fx.innerHTML = '';
    const img = document.createElement('img');
    img.src = src; img.alt = kind; img.className = 'pop-img';
    el.fx.appendChild(img);
    img.addEventListener('animationend', ()=>{ if(el.fx.contains(img)) el.fx.removeChild(img); });
  }

  // ---------- Core ----------
  function checkAnswer(){
    if(locked || idx < 0) return;
    locked = true;

    const userRaw = el.input.value.trim();
    const user = norm(userRaw);
    const card = deck[idx];
    const solutions = (card.sol || card.de.split('|')).map(norm);
    const correct = solutions.includes(user);

    enableInputs(false);

    if(correct){ ok++; answered++; el.feedback.innerHTML = `<span class="ok">✅ Richtig!</span>`; addMiniCard(el.bucketOk, card, true); showFx('ok'); }
    else { bad++; answered++; el.feedback.innerHTML = `<span class="bad">❌ Falsch.</span> Richtig: <strong>${pretty(card)}</strong>`; addMiniCard(el.bucketBad, card, false); showFx('bad'); }

    history.push({en:card.en, de:card.de, input:userRaw||'—', correct});
    updateProgress();

    locked = false;
    showSolution(card); // warten auf ENTER
  }

  function renderResults(){
    const right = history.filter(h=>h.correct);
    const wrong = history.filter(h=>!h.correct);
    const table = (list,title)=>{
      const rows = list.map(h=>`<tr><td>${h.en}</td><td>${h.de}</td><td>${h.input||'—'}</td></tr>`).join('');
      return `<div class="res-card"><h3>${title} (${list.length})</h3><table><thead><tr><th>EN</th><th>DE (Lösung)</th><th>Eingabe</th></tr></thead><tbody>${rows || '<tr><td colspan="3">—</td></tr>'}</tbody></table></div>`;
    };
    el.results.innerHTML = table(right,'Richtig') + table(wrong,'Falsch');
    el.results.classList.add('show');
  }

  function start(){
    if(idx >= 0) return;           // bereits gestartet
    deck = shuffle(CARDS);
    idx = -1; answered = ok = bad = 0; locked = false; awaitNext = false;
    history.length = 0;
    el.bucketOk.innerHTML = ''; el.bucketBad.innerHTML = '';
    el.results.classList.remove('show'); el.results.innerHTML='';
    if(el.startRow) el.startRow.style.display = 'none';
    updateProgress(); enableInputs(true); nextCard();
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
  document.addEventListener('DOMContentLoaded', () => {
    // Start
    el.startBtn.addEventListener('click', start);
    // Enter/S startet; Enter während awaitNext => nächste Karte
    document.addEventListener('keydown', (e)=>{
      if(idx < 0 && (e.key === 'Enter' || e.key.toLowerCase() === 's')) { e.preventDefault(); start(); return; }
      if(awaitNext && e.key === 'Enter'){ e.preventDefault(); awaitNext=false; nextCard(); }
    });
    // Extra: Klick irgendwo auf Karte startet ebenfalls
    el.card.addEventListener('click', ()=>{ if(idx < 0) start(); });

    // Training
    el.form.addEventListener('submit', (e)=>{ e.preventDefault(); checkAnswer(); });
    el.reveal.addEventListener('click', ()=>{
      if(idx < 0 || awaitNext) return;
      const letter = firstLetter(deck[idx]);
      el.feedback.innerHTML = `💡 Anfangsbuchstabe: <strong>${letter}</strong>`;
      el.input.focus();
    });
    el.skip.addEventListener('click', ()=>{
      if(locked || idx < 0) return; locked = true; enableInputs(false);
      const c = deck[idx];
      el.feedback.innerHTML = `<span class="bad">⏭ Übersprungen.</span>`;
      if(answered < CARDS.length){ bad++; answered++; }
      addMiniCard(el.bucketBad, c, false);
      history.push({en:c.en, de:c.de, input:'(übersprungen)', correct:false});
      updateProgress();
      locked = false;
      showSolution(c); showFx('bad'); // warten auf ENTER
    });
    el.restart.addEventListener('click', ()=>{
      idx = -1;
      if(el.startRow) el.startRow.style.display = 'flex';
      el.cardText.textContent = 'Vokabel-Trainer';
      el.cardHint.textContent = 'Klicke auf Start, dann erscheint ein englisches Wort. Tipp die deutsche Übersetzung (mit Artikel) ein und drücke Enter.';
      el.restart.style.display = 'none'; enableInputs(false);
      el.input.value = ''; el.feedback.innerHTML = ''; el.results.classList.remove('show'); el.results.innerHTML='';
      if(el.fx) el.fx.innerHTML = '';
      updateProgress();
    });

    // Komfort
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') el.input.blur(); if(e.key === 'ArrowUp') el.input.focus(); });

    // Init
    enableInputs(false); updateProgress();
  });
})();
