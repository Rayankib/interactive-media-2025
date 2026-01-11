// Helper functions (shared with planner.js)
function ucfirst(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function qs(sel, root=document){ return root.querySelector(sel); }

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

// Sport emojis and colors for visual identity
const SPORT_META = {
  voetbal: { emoji: '⚽', color: '#10b981' },
  basketbal: { emoji: '🏀', color: '#f59e0b' },
  gymnastiek: { emoji: '🤸', color: '#8b5cf6' },
  zwemmen: { emoji: '🏊', color: '#06b6d4' },
  tennis: { emoji: '🎾', color: '#eab308' },
  volleybal: { emoji: '🏐', color: '#3b82f6' },
  hockey: { emoji: '🏑', color: '#ec4899' },
  judo: { emoji: '🥋', color: '#d97706' },
  atletiek: { emoji: '🏃', color: '#f97316' },
  dans: { emoji: '💃', color: '#e91e63' },
};

// Parse key format: signups:sport:dag:tijd:groep:geslacht
// Note: tijd contains colons (e.g., "17:30–19:00"), so we need to handle this carefully
function parseKey(key){
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

function getJoined(){ try{ return JSON.parse(localStorage.getItem('joined')||'[]') }catch(e){ return [] } }
function saveJoined(arr){ localStorage.setItem('joined', JSON.stringify(arr)); }

function unjoinByKey(key){ 
  if (!getJoined().includes(key)) return false; 
  const arr = getJoined().filter(k=>k!==key); 
  saveJoined(arr); 
  changeCountForKey(key, -1); 
  return true; 
}

// Toast helper
function showToast(message, timeout=2200){
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message; el.hidden = false; el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=>{ el.classList.remove('show'); el._t2 = setTimeout(()=>{ el.hidden = true },220); }, timeout);
}

document.addEventListener("DOMContentLoaded", () => {
  const container = qs("#plansContainer");
  const joined = getJoined();
  const summaryBlock = qs("#summaryBlock");
  const summaryText = qs("#summaryText");

  if (!joined.length) {
    // Strong empty state
    container.innerHTML = `
      <div class="empty-hero">
        <div class="empty-icon">✨</div>
        <h2>Nog geen trainingen ingepland</h2>
        <p>Zoek een sport hieronder en meld je kind aan voor een training.</p>
        <a href="index.html" class="btn-primary">Ga naar sportoverzicht</a>
      </div>
    `;
    summaryBlock.hidden = true;
    return;
  }

  // Show summary block
  summaryBlock.hidden = false;
  const count = joined.length;
  summaryText.textContent = `Je hebt ${count} ${count === 1 ? 'training' : 'trainingen'} ingepland`;

  // Build groups by day then sport
  const groups = {};
  joined.forEach(key => {
    const p = parseKey(key);
    (groups[p.dag] ??= []).push({ key, ...p });
  });

  container.innerHTML = '';
  
  // Render each day section
  Object.keys(groups).forEach(dag => {
    const section = document.createElement('section');
    section.className = 'day-section';
    section.innerHTML = `<h3 class="day-title">${dag}</h3><div class="plans-list"></div>`;
    const list = section.querySelector('.plans-list');

    groups[dag].forEach(item => {
      const card = document.createElement('article');
      card.className = 'plan-card';
      const sportName = ucfirst(item.sport);
      const meta = SPORT_META[item.sport] || { emoji: '🎯', color: '#0b76c9' };
      const count = getCountForKey(item.key);
      const geslachtLabel = getGeslachtLabel(item.geslacht);
      
      card.innerHTML = `
        <div class="plan-card-content">
          <div class="plan-card-top">
            <div class="plan-sport-badge" style="background: ${meta.color}14; border-color: ${meta.color}">
              <span class="plan-emoji">${meta.emoji}</span>
            </div>
            <div class="plan-sport-name">${sportName}</div>
          </div>
          
          <div class="plan-time-row">
            <span class="plan-time-label">⏰</span>
            <span class="plan-time-value">${item.tijd}</span>
          </div>
          
          <div class="plan-details-row">
            <span class="plan-gender-tag" title="Groep">${geslachtLabel}</span>
            <span class="plan-count" aria-live="polite">👥 ${count}</span>
          </div>
        </div>
        
        <button class="plan-remove-btn" aria-label="Annuleren voor ${sportName}">
          <span class="btn-text">Annuleren</span>
        </button>
      `;

      const removeBtn = card.querySelector('.plan-remove-btn');
      removeBtn.addEventListener('click', () => {
        const ok = unjoinByKey(item.key);
        if (ok) {
          card.classList.add('removing');
          setTimeout(() => {
            card.remove();
            showToast(`${sportName} geannuleerd`);
            // If list is empty after removal, re-render
            if (!container.querySelectorAll('.plan-card').length) {
              location.reload(); // Simple re-render
            }
          }, 300);
        }
      });

      list.appendChild(card);
    });

    container.appendChild(section);
  });
});
