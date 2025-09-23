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
    { en:'in the vicinity of', de:'in der Nähe von', sol:[
          'in der Nähe von'
        ] },
    { en:'to like (something)', de:'gefallen (etwas)', sol:[
          'gefallen (etwas)',
          'gefallen',
          'gefallen etwas'
        ] },
    { en:'to consist (of something)', de:'(aus etwas) bestehen', sol:[
          'aus etwas bestehen',
          'bestehen',
          '(aus etwas) bestehen'
        ] },
    { en:'should', de:'sollst = sollen', sol:[
          'sollst',
          'sollen'
        ] },
    { en:'must', de:'must = müssen', sol:[
          'must',
          'müssen'
        ] },
    { en:'I must inform you', de:'Ich muss Sie informieren', sol:[
          'Ich muss Sie informieren'
        ] },
    { en:'previous', de:'vorherig', sol:[
          'vorherig'
        ] },
    { en:'the rest', de:'der Rest', sol:[
          'der Rest'
        ] },
    { en:'just (now)', de:'gerade (eben)', sol:[
          'gerade (eben)',
          'gerade',
          'eben'
        ] },
    { en:'suddenly', de:'plötzlich', sol:[
          'plötzlich'
        ] },
    { en:'no longer', de:'nicht mehr', sol:[
          'nicht mehr'
        ] },
    { en:'exact(ly)', de:'genau', sol:[
          'genau'
        ] },
    { en:'immediately', de:'sofort', sol:[
          'sofort'
        ] },
    { en:'for this reason', de:'aus diesem Grund', sol:[
          'aus diesem Grund'
        ] },
    { en:'finally', de:'endlich', sol:[
          'endlich'
        ] },
    { en:'that depends (on ...)', de:'das hängt (davon) ab', sol:[
          'das hängt (davon) ab',
          'das hängt davon ab',
          'das hängt ab'
        ] },
    { en:'to depend on', de:'abhängen (von)', sol:[
          'abhängen (von)',
          'abhängen von',
          'abhängen'
        ] },
    { en:'to turn (something) off', de:'(etwas) abstellen', sol:[
          'etwas abstellen',
          'abstellen'
        ] },
    { en:'to turn (something) on', de:'(etwas) anstellen', sol:[
          'etwas anstellen',
          'anstellen'
        ] },
    { en:'to arrive', de:'ankommen', sol:[
          'ankommen'
        ] },
    { en:'I’ll pick you up from the airport', de:'Ich werde dich am Flughafen abholen', sol:[
          'Ich werde dich am Flughafen abholen',
          'Ich werde dich abholen',
          'ich werde dich am flughafen abholen'
        ] },
    { en:'to get off / leave a vehicle', de:'aussteigen', sol:[
          'aussteigen'
        ] },
    { en:'to drive by', de:'vorbeifahren', sol:[
          'vorbeifahren'
        ] },
    { en:'to enter', de:'eintreten', sol:[
          'eintreten'
        ] },
    { en:'to deal with', de:'(sich) befassen (mit)', sol:[
          'sich befassen (mit)',
          'sich befassen mit',
          'befassen',
          'befassen mit'
        ] },
    { en:'to complain about', de:'(sich) beschweren (über)', sol:[
          'sich beschweren (über)',
          'sich beschweren über',
          'beschweren'
        ] },
    { en:'to thank (someone) for', de:'(sich) bedanken (bei jmdm) für', sol:[
          'sich bedanken (bei jmdm) für',
          'sich bedanken bei jmdm für',
          'bedanken'
        ] },
    { en:'to apply (for sth)', de:'(sich) bewerben (um etwas)', sol:[
          'sich bewerben (um etwas)',
          'sich bewerben um etwas',
          'bewerben'
        ] },
    { en:'to get excited (about sth) / to be happy', de:'(sich) freuen (über etwas)', sol:[
          'sich freuen (über etwas)',
          'sich freuen über etwas',
          'freuen'
        ] },
    { en:'to remember', de:'(sich) erinnern (an)', sol:[
          'sich erinnern (an)',
          'sich erinnern an',
          'erinnern',
          'erinnern an'
        ] },
    { en:'to be interested (in sth)', de:'(sich) interessieren (für)', sol:[
          'sich interessieren (für)',
          'sich interessieren für',
          'interessieren',
          'interessieren für'
        ] },
    { en:'to move (house)', de:'(um)ziehen', sol:[
          'umziehen',
          'ziehen'
        ] },
    { en:'to meet up', de:'(sich) treffen', sol:[
          'sich treffen',
          'treffen'
        ] },
    { en:'to agree (with s.o.)', de:'(jemandem) zustimmen', sol:[
          'jemandem zustimmen',
          'zustimmen'
        ] },
    { en:'to determine something', de:'(etwas) feststellen', sol:[
          'feststellen',
          'etwas feststellen'
        ] },
    { en:'to offer', de:'(etwas) anbieten', sol:[
          'anbieten',
          'etwas anbieten'
        ] },
    { en:'the offer', de:'das Angebot', sol:[
          'das angebot'
        ] },
    { en:'the result', de:'das Ergebnis', sol:[
          'das ergebnis'
        ] },
    { en:'to pay attention to', de:'aufpassen (auf)', sol:[
          'aufpassen (auf)',
          'aufpassen auf',
          'aufpassen'
        ] },
    { en:'to cancel', de:'absagen', sol:[
          'absagen'
        ] },
    { en:'to promise', de:'versprechen', sol:[
          'versprechen'
        ] },
    { en:'the promise', de:'das Versprechen', sol:[
          'das versprechen'
        ] },
    { en:'a prompt / a reminder', de:'die Erinnerung', sol:[
          'die erinnerung'
        ] },
    { en:'independent / self-employed', de:'selbstständig', sol:[
          'selbstständig',
          'selbststaendig'
        ] },
    { en:'to change (sth)', de:'(etwas) verändern', sol:[
          'etwas verändern',
          'verändern'
        ] },
    { en:'the change', de:'die Veränderung', sol:[
          'die veränderung',
          'die veraenderung'
        ] },
    { en:'to add (sth)', de:'(etwas) hinzufügen', sol:[
          'etwas hinzufügen',
          'hinzufügen',
          'hinzufuegen',
          'etwas hinzufuegen'
        ] },
    { en:'to correct', de:'(etwas) korrigieren', sol:[
          'etwas korrigieren',
          'korrigieren'
        ] },
    { en:'the correction', de:'die Korrektur', sol:[
          'die korrektur'
        ] },
    { en:'first (of all)', de:'zuerst', sol:[
          'zuerst'
        ] },
    { en:'afterwards', de:'danach', sol:[
          'danach'
        ] },
    { en:'meanwhile', de:'inzwischen', sol:[
          'inzwischen'
        ] },
    { en:'at least', de:'mindestens', sol:[
          'mindestens'
        ] },
    { en:'at most', de:'höchstens', sol:[
          'höchstens',
          'hoechstens'
        ] },
    { en:'somehow', de:'irgendwie', sol:[
          'irgendwie'
        ] },
    { en:'anyway / in any case', de:'auf jeden Fall', sol:[
          'auf jeden Fall'
        ] },
    { en:'maybe', de:'vielleicht', sol:[
          'vielleicht'
        ] },
    { en:'possible', de:'möglich', sol:[
          'möglich',
          'moeglich'
        ] },
    { en:'impossible', de:'unmöglich', sol:[
          'unmöglich',
          'unmoeglich'
        ] },
    { en:'fortunately', de:'zum Glück', sol:[
          'zum Glück',
          'zum glueck'
        ] },
    { en:'unfortunately', de:'leider', sol:[
          'leider'
        ] },
    { en:'to be worth it', de:'(sich) lohnen', sol:[
          'lohnt sich',
          'sich lohnen',
          'lohnen'
        ] },
    { en:'advantage', de:'der Vorteil', sol:[
          'der vorteil'
        ] },
    { en:'disadvantage', de:'der Nachteil', sol:[
          'der nachteil'
        ] },
    { en:'to give up', de:'(etwas) aufgeben', sol:[
          'aufgeben',
          'etwas aufgeben'
        ] },
    { en:'to give away', de:'(etwas) weggeben', sol:[
          'weggeben',
          'etwas weggeben'
        ] },
    { en:'to be enough', de:'(etwas) reichen', sol:[
          'etwas reichen',
          'reichen'
        ] },
    { en:'to pass (an exam)', de:'(eine Prüfung) bestehen', sol:[
          'eine Prüfung bestehen',
          'bestehen'
        ] },
    { en:'to cancel (an appointment)', de:'(einen Termin) absagen', sol:[
          'einen Termin absagen',
          'absagen'
        ] },
    { en:'to postpone (an appointment)', de:'(einen Termin) verschieben', sol:[
          'einen Termin verschieben',
          'verschieben'
        ] },
    { en:'to invite (someone)', de:'(jemanden) einladen', sol:[
          'jemanden einladen',
          'einladen'
        ] },
    { en:'invitation', de:'die Einladung', sol:[
          'die Einladung'
        ] },
    { en:'to refuse (sth)', de:'(etwas) verweigern', sol:[
          'etwas verweigern',
          'verweigern'
        ] },
    { en:'to allow (sth)', de:'(etwas) erlauben', sol:[
          'etwas erlauben',
          'erlauben'
        ] },
    { en:'permission', de:'die Erlaubnis', sol:[
          'die erlaubnis'
        ] },
    { en:'to forbid / prohibit', de:'(etwas) verbieten', sol:[
          'etwas verbieten',
          'verbieten'
        ] },
    { en:'the ban / prohibition', de:'das Verbot', sol:[
          'das Verbot'
        ] },
    { en:'to smoke', de:'rauchen', sol:[
          'rauchen'
        ] },
    { en:'smoking', de:'das Rauchen', sol:[
          'das rauchen'
        ] },
    { en:'to quit smoking', de:'mit dem Rauchen aufhören', sol:[
          'mit dem Rauchen aufhören',
          'aufhören zu rauchen',
          'aufhören',
          'aufhoeren'
        ] },
    { en:'to lose weight', de:'abnehmen', sol:[
          'abnehmen'
        ] },
    { en:'to gain weight', de:'zunehmen', sol:[
          'zunehmen'
        ] },
    { en:'to feel better', de:'(sich) besser fühlen', sol:[
          'sich besser fühlen',
          'besser fühlen',
          'fuehlen'
        ] },
    { en:'to feel worse', de:'(sich) schlechter fühlen', sol:[
          'sich schlechter fühlen',
          'schlechter fühlen'
        ] },
    { en:'to be sick (ill)', de:'krank sein', sol:[
          'krank sein'
        ] },
    { en:'healthy', de:'gesund', sol:[
          'gesund'
        ] },
    { en:'the health', de:'die Gesundheit', sol:[
          'die gesundheit'
        ] },
    { en:'to treat (s.o.)', de:'(jemanden) behandeln', sol:[
          'jemanden behandeln',
          'behandeln'
        ] },
    { en:'the treatment', de:'die Behandlung', sol:[
          'die behandlung'
        ] },
    { en:'the appointment (doctor etc.)', de:'der Termin', sol:[
          'der termin'
        ] },
    { en:'the prescription', de:'das Rezept', sol:[
          'das rezept'
        ] },
    { en:'the medication', de:'die Medikamente', sol:[
          'die medikamente'
        ] },
    { en:'the pain', de:'der Schmerz', sol:[
          'der schmerz'
        ] },
    { en:'to hurt / to be painful', de:'wehtun', sol:[
          'wehtun'
        ] },
    { en:'to injure (s.o.)', de:'(jemanden) verletzen', sol:[
          'jemanden verletzen',
          'verletzen'
        ] },
    { en:'the injury', de:'die Verletzung', sol:[
          'die verletzung'
        ] },
    { en:'the accident', de:'der Unfall', sol:[
          'der unfall'
        ] },
    { en:'to happen / occur', de:'passieren', sol:[
          'passieren'
        ] },
    { en:'safe', de:'sicher', sol:[
          'sicher'
        ] },
    { en:'dangerous', de:'gefährlich', sol:[
          'gefährlich',
          'gefaehrlich'
        ] },
    { en:'the danger', de:'die Gefahr', sol:[
          'die gefahr'
        ] },
    { en:'(to) pay attention (watch out!)', de:'Achtung!', sol:[
          'Achtung'
        ] },
    { en:'to be careful', de:'vorsichtig sein', sol:[
          'vorsichtig sein'
        ] },
    { en:'careful', de:'vorsichtig', sol:[
          'vorsichtig'
        ] },
    { en:'careless', de:'unvorsichtig', sol:[
          'unvorsichtig'
        ] },
    { en:'rich', de:'reich', sol:[
          'reich'
        ] },
  ]; // 49 items

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
  function enableInputs(v){ el.input.disabled = el.submit.disabled = el.reveal.disabled = el.skip.disabled = !v; if(v) el.input.focus(); }
  function updateProgress(){ const safe = Math.min(answered, CARDS.length); el.counter.textContent = `${safe} / ${CARDS.length}`; el.bar.style.width = Math.round((safe/CARDS.length)*100)+'%'; }
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
  function addMiniCard(to, card){ const d = document.createElement('div'); d.className = 'mini'; d.innerHTML = `<div class="en">${card.en}</div><div class="de">${card.de}</div>`; to.appendChild(d); }

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
    else { bad++; answered++; el.feedback.innerHTML = `<span class="bad">❌ Falsch. Richtige Lösung: <strong>${pretty(card)}</strong></span>`; addMiniCard(el.bucketBad, card); }
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
    idx = -1; answered = ok = bad = 0; locked = false; awaitNext = false;
    history.length = 0;
    el.bucketOk.innerHTML = ''; el.bucketBad.innerHTML = '';
    el.results.classList.remove('show'); el.results.innerHTML = '';
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
      el.feedback.innerHTML = `<span class="pill">Tipp: Erster Buchstabe: <strong>${letter}</strong></span>`;
    });
    el.skip.addEventListener('click', ()=>{
      if(idx < 0 || awaitNext) return;
      history.push({ en:deck[idx].en, de:deck[idx].de, input:'(übersprungen)', correct:false });
      bad++; answered++; addMiniCard(el.bucketBad, deck[idx]); updateProgress(); nextCard();
    });
    el.restart.addEventListener('click', ()=>{
      idx = -1; answered = ok = bad = 0; history.length = 0;
      el.cardText.textContent = 'Vokabel-Trainer';
      el.cardHint.textContent = 'Klicke auf Start, dann erscheint ein englisches Wort... tippe die deutsche Übersetzung (mit Artikel) ein und drücke Enter.';
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
