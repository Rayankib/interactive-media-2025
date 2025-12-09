function ucfirst(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function qs(sel, root=document){ return root.querySelector(sel); }

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
function getCount(sport, it){ return parseInt(localStorage.getItem(keyFor(sport,it))||"0",10); }
function addSignup(sport, it){
  const k = keyFor(sport,it); const next = getCount(sport,it)+1;
  localStorage.setItem(k, String(next)); return next;
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const sport = (params.get("sport")||"").toLowerCase();
  const title = qs("#plannerTitle");
  const container = qs("#scheduleContainer");

  if (!sport || !SCHEDULES[sport]) {
    title.textContent = "Weekplanner";
    container.innerHTML = `<div class="empty">Geen planning gevonden. <a href="index.html">Kies een sport</a>.</div>`;
    return;
  }

  title.textContent = `Weekplanner – ${ucfirst(sport)}`;

  // groepeer per dag
  const perDag = {};
  SCHEDULES[sport].forEach(it => { (perDag[it.dag] ??= []).push(it); });

  Object.keys(perDag).forEach(dag => {
    const section = document.createElement("section");
    section.className = "day-section";
    section.innerHTML = `<h3>${dag}</h3><div class="slot-list"></div>`;
    const list = section.querySelector(".slot-list");

    perDag[dag].forEach(it => {
      const card = document.createElement("article");
      card.className = "slot";
      const count = getCount(sport, it);
      const tagClass = it.geslacht === "Mixed" ? "tag-mixed" : (it.geslacht === "Jongens" ? "tag-boys" : "tag-girls");
      card.innerHTML = `
        <div class="slot-meta">
          <div class="slot-time">${it.tijd}</div>
          <div class="slot-tags">
            <span class="tag">Leeftijd ${it.groep}</span>
            <span class="tag ${tagClass}">${it.geslacht}</span>
          </div>
        </div>
        <div class="slot-actions">
          <button class="join-btn" type="button">Deelnemen</button>
          <div class="count" aria-live="polite">👥 <span>${count}</span></div>
        </div>
      `;
      const btn = card.querySelector(".join-btn");
      const cnt = card.querySelector(".count span");
      btn.addEventListener("click", () => {
        const n = addSignup(sport, it);
        cnt.textContent = n;
        btn.disabled = true; btn.textContent = "Aangemeld ✓";
        card.classList.add("flash"); setTimeout(()=>card.classList.remove("flash"), 400);
      });
      list.appendChild(card);
    });

    container.appendChild(section);
  });
});
