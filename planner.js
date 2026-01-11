function ucfirst(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function qs(sel, root=document){ return root.querySelector(sel); }

// Day order for proper sorting
const DAY_ORDER = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

// Convert geslacht to user-friendly Dutch label
function getGeslachtLabel(geslacht){
  if (!geslacht) return "Onbekend";
  const map = {
    "Jongens": "Jongens",
    "Meisjes": "Meisjes",
    "Mixed": "Gemengd",
    "gemengd": "Gemengd"
  };
  return map[geslacht] || "Onbekend";
}

const SCHEDULES = {
  // let op: voetbal gescheiden jongens/meisjes
  voetbal: [
    { dag:"Maandag",   tijd:"09:00–10:30", groep:"9–12",  geslacht:"Jongens" },
    { dag:"Maandag",   tijd:"11:00–12:30", groep:"9–12",  geslacht:"Meisjes" },
    { dag:"Woensdag",  tijd:"15:30–17:00", groep:"12–15", geslacht:"Jongens" },
    { dag:"Vrijdag",   tijd:"17:30–19:00", groep:"15–18", geslacht:"Jongens" },
    { dag:"Zaterdag",  tijd:"10:00–11:30", groep:"12–15", geslacht:"Meisjes" },
  ],
  basketbal: [
    { dag:"Dinsdag",   tijd:"16:00–17:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Donderdag", tijd:"18:00–19:30", groep:"15–18", geslacht:"Jongens" },
    { dag:"Zaterdag",  tijd:"12:30–14:00", groep:"9–12",  geslacht:"Meisjes" },
    { dag:"Zondag",    tijd:"10:00–11:30", groep:"12–15", geslacht:"Mixed" },
  ],
  gymnastiek: [
    { dag:"Maandag",   tijd:"10:00–11:30", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Woensdag",  tijd:"14:00–15:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Vrijdag",   tijd:"16:30–18:00", groep:"15–18", geslacht:"Mixed" },
    { dag:"Zaterdag",  tijd:"09:00–10:30", groep:"9–12",  geslacht:"Mixed" },
  ],
  zwemmen: [
    { dag:"Dinsdag",   tijd:"08:00–09:30", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Vrijdag",   tijd:"12:00–13:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Zondag",    tijd:"10:00–11:30", groep:"15–18", geslacht:"Mixed" },
    { dag:"Zondag",    tijd:"12:00–13:30", groep:"9–12",  geslacht:"Mixed" },
  ],
  tennis: [
    { dag:"Maandag",   tijd:"16:00–17:00", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Donderdag", tijd:"17:30–19:00", groep:"12–15", geslacht:"Mixed" },
    { dag:"Zaterdag",  tijd:"13:00–14:30", groep:"15–18", geslacht:"Mixed" },
  ],
  volleybal: [
    { dag:"Woensdag",  tijd:"17:00–18:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Vrijdag",   tijd:"19:00–20:30", groep:"15–18", geslacht:"Mixed" },
    { dag:"Zondag",    tijd:"11:00–12:30", groep:"9–12",  geslacht:"Mixed" },
  ],
  hockey: [
    { dag:"Dinsdag",   tijd:"17:00–18:30", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Donderdag", tijd:"16:30–18:00", groep:"12–15", geslacht:"Mixed" },
    { dag:"Zaterdag",  tijd:"10:00–11:30", groep:"15–18", geslacht:"Mixed" },
  ],
  judo: [
    { dag:"Maandag",   tijd:"18:00–19:00", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Woensdag",  tijd:"18:00–19:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Vrijdag",   tijd:"17:00–18:30", groep:"15–18", geslacht:"Mixed" },
  ],
  atletiek: [
    { dag:"Dinsdag",   tijd:"16:00–17:30", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Donderdag", tijd:"16:30–18:00", groep:"12–15", geslacht:"Mixed" },
    { dag:"Zaterdag",  tijd:"09:30–11:00", groep:"15–18", geslacht:"Mixed" },
  ],
  dans: [
    { dag:"Woensdag",  tijd:"16:00–17:00", groep:"9–12",  geslacht:"Mixed" },
    { dag:"Vrijdag",   tijd:"18:00–19:30", groep:"12–15", geslacht:"Mixed" },
    { dag:"Zondag",    tijd:"13:00–14:30", groep:"15–18", geslacht:"Mixed" },
  ],
};

function keyFor(sport, it){ return `signups:${sport}:${it.dag}:${it.tijd}:${it.groep}:${it.geslacht}`; }
function parseKey(key){
  // key format: signups:sport:dag:tijd:groep:geslacht
  // Note: tijd contains colons (e.g., "17:30–19:00"), so we need to handle this carefully
  const parts = key.split(":");
  // parts[0]=signups, [1]=sport, [2]=dag, [3]=hour, [4]=min–hour, [5]=min, [6]=groep, [7]=geslacht
  return {
    sport: parts[1],
    dag: parts[2],
    tijd: parts[3] + ":" + parts[4] + ":" + parts[5],  // Reconstruct time as HH:MM–HH:MM
    groep: parts[6],
    geslacht: parts[7]
  };
}
function getCountForKey(key){ return parseInt(localStorage.getItem(key)||"0",10); }
function changeCountForKey(key, delta){
  const cur = getCountForKey(key); const next = Math.max(0, cur + delta);
  localStorage.setItem(key, String(next)); return next;
}

// Joined sessions stored per-device under 'joined' as array of keys
function getJoined(){ try{ return JSON.parse(localStorage.getItem('joined')||'[]') }catch(e){ return [] } }
function saveJoined(arr){ localStorage.setItem('joined', JSON.stringify(arr)); }
function isJoinedKey(key){ return getJoined().includes(key); }
function joinSlot(sport, it){ const key = keyFor(sport,it); if (isJoinedKey(key)) return false; const arr = getJoined(); arr.push(key); saveJoined(arr); changeCountForKey(key, +1); return true; }
function unjoinByKey(key){ if (!isJoinedKey(key)) return false; const arr = getJoined().filter(k=>k!==key); saveJoined(arr); changeCountForKey(key, -1); return true; }

// Toast helper: accessible feedback for mobile parents
function showToast(message, timeout=2200){
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message; el.hidden = false; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.classList.remove('show'); el._t2 = setTimeout(()=>{ el.hidden = true },220); }, timeout);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  let sport = (params.get("sport")||"").toLowerCase();
  const title = qs("#plannerTitle");
  const container = qs("#scheduleContainer");
  const sportSelector = qs("#sportDropdown");

  // Initialize sport selector with all available sports
  if (sportSelector) {
    Object.keys(SCHEDULES).sort().forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = ucfirst(s);
      sportSelector.appendChild(opt);
    });
    // Set current sport
    if (sport && SCHEDULES[sport]) {
      sportSelector.value = sport;
    }
    // Listen for sport changes
    sportSelector.addEventListener('change', (e) => {
      const newSport = e.currentTarget.value;
      if (newSport && SCHEDULES[newSport]) {
        sport = newSport;
        // Update URL without reloading
        window.history.replaceState(null, '', `?sport=${encodeURIComponent(newSport)}`);
        // Reset filters and re-render
        if (daySelect) daySelect.value = '';
        if (ageSelect) ageSelect.value = '';
        if (typeSelect) typeSelect.value = '';
        masterList = Array.isArray(SCHEDULES[sport]) ? SCHEDULES[sport].slice() : [];
        title.textContent = `Weekplanner – ${ucfirst(sport)}`;
        populateFilterOptions();
        applyAndRender();
      }
    });
  }

  // Toggle controls: sport and filters are secondary actions
  const toggleSportBtn = qs('#toggleSportBtn');
  const toggleFiltersBtn = qs('#toggleFiltersBtn');
  const filtersEl = qs('#plannerFilters');

  if (toggleSportBtn && sportSelector) {
    toggleSportBtn.addEventListener('click', () => {
      const now = sportSelector.hidden;
      sportSelector.hidden = !now ? true : false; // toggle
      sportSelector.hidden = !now;
      if (!sportSelector.hidden) sportSelector.focus();
    });
  }

  if (toggleFiltersBtn && filtersEl) {
    toggleFiltersBtn.addEventListener('click', () => {
      const now = filtersEl.hidden;
      filtersEl.hidden = !now ? true : false;
      filtersEl.hidden = !now;
      if (!filtersEl.hidden) {
        // populate when shown
        populateFilterOptions();
      }
    });
  }

  if (!sport || !SCHEDULES[sport]) {
    title.textContent = "Weekplanner";
    container.innerHTML = `<div class="empty">Geen planning gevonden. <a href="index.html">Kies een sport</a>.</div>`;
    return;
  }

  title.textContent = `Weekplanner – ${ucfirst(sport)}`;

  // Filters: create UI wiring and render helper (do not change stored data)
  let masterList = Array.isArray(SCHEDULES[sport]) ? SCHEDULES[sport].slice() : [];
  // filtersEl already referenced above
  const daySelect = qs('#dayFilter');
  const ageSelect = qs('#ageFilter');
  const typeSelect = qs('#typeFilter');
  const resetBtn = qs('#resetFiltersBtn');

  function populateFilterOptions(){
    if (!daySelect || !ageSelect) return;
    const days = Array.from(new Set(masterList.map(it=>it.dag)));
    days.sort((a,b)=> DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    const groups = Array.from(new Set(masterList.map(it=>it.groep)));
    groups.sort((x,y)=>{
      const ax = parseInt((x||'').match(/\d+/)?.[0]||0,10);
      const ay = parseInt((y||'').match(/\d+/)?.[0]||0,10);
      return ax - ay;
    });

    daySelect.innerHTML = '<option value="">Alles</option>';
    ageSelect.innerHTML = '<option value="">Alles</option>';
    days.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; daySelect.appendChild(o); });
    groups.forEach(g=>{ const o=document.createElement('option'); o.value=g; o.textContent=g; ageSelect.appendChild(o); });
  }

  function renderSchedule(list){
    container.innerHTML = '';
    const resultCount = qs('#resultCount');
    
    if (!Array.isArray(list) || list.length === 0){
      const empty = document.createElement('div'); empty.className='empty';
      empty.innerHTML = `<p>Geen trainingen gevonden met deze filters</p>`;
      container.appendChild(empty);
      if (resetBtn) resetBtn.hidden = false;
      if (resultCount) resultCount.textContent = '0 trainingen';
      return;
    }

    // Update result count
    if (resultCount) {
      const count = list.length;
      resultCount.textContent = `${count} ${count === 1 ? 'training' : 'trainingen'}`;
    }

    const perDag = {};
    list.forEach(it=>{ (perDag[it.dag] ??= []).push(it); });
    const ordered = Object.keys(perDag).sort((a,b)=> DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
    ordered.forEach(dag=>{
      const section = document.createElement('section'); section.className='day-section';
      section.innerHTML = `<h3>${dag}</h3><div class="slot-list"></div>`;
      const listEl = section.querySelector('.slot-list');

      perDag[dag].forEach(it=>{
        const card = document.createElement('article'); card.className='slot';
        const key = keyFor(sport,it);
        const count = getCountForKey(key);
        const joined = isJoinedKey(key);
        const tagClass = (it.geslacht && it.geslacht.toLowerCase().startsWith('m')) ? 'tag-mixed' : (it.geslacht === 'Jongens' ? 'tag-boys' : 'tag-girls');
        card.innerHTML = `
          <div class="slot-meta">
            <div class="slot-time">${it.tijd}</div>
            <div class="slot-tags">
              <span class="tag">Leeftijd ${it.groep}</span>
              <span class="tag ${tagClass}">${getGeslachtLabel(it.geslacht)}</span>
            </div>
          </div>
          <div class="slot-actions">
            <button class="join-btn ${joined ? '' : 'primary'}" type="button">${joined ? 'Aangemeld ✓' : 'Deelnemen'}</button>
            <div>
              <div class="count" aria-live="polite">👥 <span>${count}</span></div>
              <div class="slot-help">Je kunt je inschrijving later annuleren.</div>
            </div>
          </div>
        `;
        const btn = card.querySelector('.join-btn');
        const cnt = card.querySelector('.count span');
        if (joined) btn.disabled = true;
        btn.addEventListener('click', ()=>{
          if (isJoinedKey(key)) return;
          const added = joinSlot(sport,it);
          if (added){ cnt.textContent = getCountForKey(key); btn.disabled = true; btn.textContent='Aangemeld ✓'; card.classList.add('flash'); setTimeout(()=>card.classList.remove('flash'),420); showToast(`Klaar! Je kind staat ingeschreven voor ${ucfirst(sport)}`); }
        });
        listEl.appendChild(card);
      });

      container.appendChild(section);
    });

    const allLink = document.createElement('div'); allLink.className='all-link';
    allLink.innerHTML = `<a href="myplans.html" class="ghost">Bekijk mijn plannen</a>`;
    container.appendChild(allLink);
    if (resetBtn) resetBtn.hidden = true;
  }

  function applyAndRender(){
    const dayVal = daySelect ? daySelect.value : '';
    const ageVal = ageSelect ? ageSelect.value : '';
    const typeVal = typeSelect ? typeSelect.value : '';
    let filtered = masterList.slice();
    if (dayVal) filtered = filtered.filter(it=>it.dag===dayVal);
    if (ageVal) filtered = filtered.filter(it=>it.groep===ageVal);
    if (typeVal) filtered = filtered.filter(it=> (it.geslacht||'').toLowerCase()===typeVal.toLowerCase());
    renderSchedule(filtered);
  }

  if (filtersEl){
    filtersEl.hidden = false; populateFilterOptions();
    if (daySelect) daySelect.addEventListener('change', applyAndRender);
    if (ageSelect) ageSelect.addEventListener('change', applyAndRender);
    if (typeSelect) typeSelect.addEventListener('change', applyAndRender);
    if (resetBtn) resetBtn.addEventListener('click', ()=>{ if (daySelect) daySelect.value=''; if (ageSelect) ageSelect.value=''; if (typeSelect) typeSelect.value=''; applyAndRender(); });
  }

  renderSchedule(masterList);
});
