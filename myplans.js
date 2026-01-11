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

// Parse legacy key format for migration
function parseKey(key){
  const parts = key.split(":");
  return {
    sport: parts[1],
    dag: parts[2],
    tijd: parts[3] + ":" + parts[4] + ":" + parts[5],
    groep: parts[6],
    geslacht: parts[7]
  };
}

// Create a consistent key from object schema for count storage
function makeKey(obj){ return `signups:${obj.sport}:${obj.dag}:${obj.tijd}:${obj.groep}:${obj.geslacht}`; }

// Migration: Convert old key-string format to new object schema with ISO dates
function migrateJoinedData(joined){
  if (!Array.isArray(joined)) {
    console.warn('Invalid joined data format, resetting');
    return [];
  }
  
  return joined.map(item => {
    try {
      // If already an object with correct schema including ISO fields, return as-is
      if (typeof item === 'object' && item.sport && item.dag && item.tijd && item.groep && item.geslacht && item.startISO && item.endISO) {
        // Validate ISO strings are valid dates
        const startDate = new Date(item.startISO);
        const endDate = new Date(item.endISO);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('Invalid ISO dates for item, regenerating:', item);
          const { startISO, endISO } = getNextOccurrence(item.dag, item.tijd);
          return { ...item, startISO, endISO };
        }
        return item;
      }
      
      // Otherwise, parse old key format or partial object
      let parsed;
      if (typeof item === 'string') {
        try {
          parsed = parseKey(item);
        } catch (e) {
          console.warn('Failed to parse key:', item, e);
          return null;
        }
      } else if (typeof item === 'object' && item.sport && item.dag && item.tijd && item.groep && item.geslacht) {
        // Has schema but missing ISO fields
        parsed = item;
      } else {
        console.warn('Invalid item format, skipping:', item);
        return null;
      }
      
      // Calculate next occurrence and generate ISO fields
      const { startISO, endISO } = getNextOccurrence(parsed.dag, parsed.tijd);
      
      return {
        sport: parsed.sport,
        dag: parsed.dag,
        tijd: parsed.tijd,
        groep: parsed.groep,
        geslacht: parsed.geslacht,
        startISO,
        endISO
      };
    } catch (error) {
      console.error('Error migrating item:', item, error);
      return null;
    }
  }).filter(item => item !== null);
}

function getCountForKey(key){ return parseInt(localStorage.getItem(key)||"0",10); }
function changeCountForKey(key, delta){
  const cur = getCountForKey(key); const next = Math.max(0, cur + delta);
  localStorage.setItem(key, String(next)); return next;
}

// Day order mapping for date calculation
const DAY_ORDER = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const DAY_TO_WEEKDAY = { 'Maandag': 1, 'Dinsdag': 2, 'Woensdag': 3, 'Donderdag': 4, 'Vrijdag': 5, 'Zaterdag': 6, 'Zondag': 0 };

// Get the next occurrence of a training session given day name and time
function getNextOccurrence(dag, tijd){
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetWeekday = DAY_TO_WEEKDAY[dag];
  const currentWeekday = today.getDay();
  
  // Calculate days until target day
  let daysUntilTarget = (targetWeekday - currentWeekday + 7) % 7;
  
  // Parse time to check if it's still in the future today
  const [startTimeStr, endTimeStr] = tijd.split('–');
  const [startHour, startMin] = startTimeStr.trim().split(':').map(Number);
  
  // If target day is today, check if time hasn't passed yet
  if (daysUntilTarget === 0) {
    const now = new Date();
    const sessionStart = new Date(today);
    sessionStart.setHours(startHour, startMin, 0, 0);
    
    if (now < sessionStart) {
      daysUntilTarget = 0;
    } else {
      daysUntilTarget = 7;
    }
  }
  
  // Calculate the date
  const trainingDate = new Date(today);
  trainingDate.setDate(trainingDate.getDate() + daysUntilTarget);
  
  // Parse end time
  const [endHour, endMin] = endTimeStr.trim().split(':').map(Number);
  
  // Create startISO and endISO
  const startISO = new Date(trainingDate);
  startISO.setHours(startHour, startMin, 0, 0);
  
  const endISO = new Date(trainingDate);
  endISO.setHours(endHour, endMin, 0, 0);
  
  return {
    startISO: startISO.toISOString(),
    endISO: endISO.toISOString()
  };
}

// Format ISO date string for readable display (e.g., "wo 14 jan")
function formatDateBadge(isoString){
  if (!isoString) return '';
  const date = new Date(isoString);
  const dayNames = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
  const monthNames = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const day = dayNames[date.getDay()];
  const date_num = date.getDate();
  const month = monthNames[date.getMonth()];
  return `${day} ${date_num} ${month}`;
}

// Format ISO date for group header
function formatDateGroupLabel(isoString){
  if (!isoString) return '';
  const date = new Date(isoString);
  const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const day = dayNames[date.getDay()];
  const date_num = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${date_num} ${month} ${year}`;
}

// Get simple date key for grouping (YYYY-MM-DD)
function getDateKey(isoString){
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// Joined sessions with consistent schema: { sport, dag, tijd, groep, geslacht, startISO, endISO }
function getJoined(){
  try {
    const raw = localStorage.getItem('joined');
    if (!raw) {
      return [];
    }
    
    let joined = JSON.parse(raw);
    if (!Array.isArray(joined)) {
      console.warn('Joined data is not an array, resetting');
      localStorage.removeItem('joined');
      return [];
    }
    
    // Migrate old key format to new object schema
    const migrated = migrateJoinedData(joined);
    
    // Re-save if migration occurred
    try {
      if (JSON.stringify(migrated) !== JSON.stringify(joined)) {
        saveJoined(migrated);
      }
    } catch (e) {
      console.warn('Could not compare data, saving migrated version:', e);
      saveJoined(migrated);
    }
    
    return migrated;
  } catch (e) {
    console.error('Error parsing joined data from localStorage:', e);
    try {
      // Try to clear corrupted data
      localStorage.removeItem('joined');
    } catch (clearError) {
      console.error('Could not clear corrupted data:', clearError);
    }
    return [];
  }
}

function saveJoined(arr){ localStorage.setItem('joined', JSON.stringify(arr)); }

function unjoinByKey(key){
  const obj = parseKey(key);
  const arr = getJoined();
  const index = arr.findIndex(item => item.sport === obj.sport && item.dag === obj.dag && item.tijd === obj.tijd && item.groep === obj.groep && item.geslacht === obj.geslacht);
  if (index === -1) return false;
  arr.splice(index, 1);
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

// Filter state
let filterState = {
  search: '',
  date: '',
  sport: ''
};

// Extract unique dates and sports from joined plans
function extractFilterOptions(plans) {
  const dates = new Set();
  const sports = new Set();
  
  plans.forEach(item => {
    if (item.startISO) {
      dates.add(getDateKey(item.startISO));
    }
    if (item.sport) {
      sports.add(item.sport);
    }
  });
  
  return {
    dates: Array.from(dates).sort(),
    sports: Array.from(sports).map(s => ucfirst(s)).sort()
  };
}

// Apply filters to plans (returns filtered array without modifying original)
function applyFilters(plans) {
  return plans.filter(item => {
    // Search filter (case-insensitive)
    if (filterState.search) {
      const searchLower = filterState.search.toLowerCase();
      const sportMatch = (item.sport || '').toLowerCase().includes(searchLower);
      if (!sportMatch) return false;
    }
    
    // Date filter
    if (filterState.date) {
      const itemDateKey = getDateKey(item.startISO);
      if (itemDateKey !== filterState.date) return false;
    }
    
    // Sport filter
    if (filterState.sport) {
      if (item.sport !== filterState.sport.toLowerCase()) return false;
    }
    
    return true;
  });
}

// Update filter options selects based on available data
function updateFilterUI(plans) {
  const { dates, sports } = extractFilterOptions(plans);
  
  // Create sport chips
  const sportChipsContainer = qs('#sportChipsContainer');
  if (sportChipsContainer) {
    sportChipsContainer.innerHTML = '';
    
    // "Alle sporten" chip
    const allChip = createChip('Alle sporten', '', 'sport', !filterState.sport);
    sportChipsContainer.appendChild(allChip);
    
    // Individual sport chips
    sports.forEach(sport => {
      const sportLower = sport.toLowerCase();
      const isActive = filterState.sport === sportLower;
      const chip = createChip(sport, sportLower, 'sport', isActive);
      sportChipsContainer.appendChild(chip);
    });
  }
  
  // Create date chips
  const dateChipsContainer = qs('#dateChipsContainer');
  if (dateChipsContainer) {
    dateChipsContainer.innerHTML = '';
    
    // "Alle datums" chip
    const allChip = createChip('Alle datums', '', 'date', !filterState.date);
    dateChipsContainer.appendChild(allChip);
    
    // Individual date chips
    dates.forEach(dateKey => {
      const label = formatDateGroupLabel(new Date(dateKey + 'T00:00:00').toISOString());
      const isActive = filterState.date === dateKey;
      const chip = createChip(label, dateKey, 'date', isActive);
      dateChipsContainer.appendChild(chip);
    });
  }
  
  // Update active filters display
  updateActiveFiltersDisplay();
}

// Create a filter chip element
function createChip(label, value, filterType, isActive) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = `filter-chip ${isActive ? 'active' : ''}`;
  chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  chip.textContent = label;
  
  chip.addEventListener('click', () => {
    if (filterType === 'sport') {
      filterState.sport = value;
    } else if (filterType === 'date') {
      filterState.date = value;
    }
    updateFilterUI(qs('#plansContainer')?.data?.joined || getJoined());
    renderFilteredPlans(getJoined());
  });
  
  return chip;
}

// Display active filters as a summary line
function updateActiveFiltersDisplay() {
  const activeFilters = qs('#activeFilters');
  const activeFiltersList = qs('#activeFiltersList');
  const resetBtn = qs('#resetFiltersBtn');
  
  if (!activeFilters || !activeFiltersList) return;
  
  const parts = [];
  
  if (filterState.sport) {
    parts.push(`Sport: <strong>${ucfirst(filterState.sport)}</strong>`);
  }
  
  if (filterState.date) {
    const dateLabel = formatDateGroupLabel(new Date(filterState.date + 'T00:00:00').toISOString());
    parts.push(`Datum: <strong>${dateLabel}</strong>`);
  }
  
  if (parts.length > 0) {
    activeFiltersList.innerHTML = parts.join(' • ');
    activeFilters.hidden = false;
    if (resetBtn) resetBtn.hidden = false;
  } else {
    activeFilters.hidden = true;
    if (resetBtn) resetBtn.hidden = true;
  }
}

// Update filter options selects based on available data (DEPRECATED - kept for reference)
function updateFilterOptions(plans) {
  const { dates, sports } = extractFilterOptions(plans);
  
  // Update date filter
  const dateSelect = qs('#dateFilter');
  const currentDateValue = dateSelect?.value || '';
  if (dateSelect) {
    const existingOptions = dateSelect.querySelectorAll('option:not([value=""])');
    existingOptions.forEach(opt => opt.remove());
    
    dates.forEach(dateKey => {
      const label = formatDateGroupLabel(new Date(dateKey + 'T00:00:00').toISOString());
      const option = document.createElement('option');
      option.value = dateKey;
      option.textContent = label;
      dateSelect.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentDateValue && dates.includes(currentDateValue)) {
      dateSelect.value = currentDateValue;
    }
  }
  
  // Update sport filter
  const sportSelect = qs('#sportFilter');
  const currentSportValue = sportSelect?.value || '';
  if (sportSelect) {
    const existingOptions = sportSelect.querySelectorAll('option:not([value=""])');
    existingOptions.forEach(opt => opt.remove());
    
    sports.forEach(sport => {
      const option = document.createElement('option');
      option.value = sport.toLowerCase();
      option.textContent = sport;
      sportSelect.appendChild(option);
    });
    
    // Restore previous selection if still valid
    if (currentSportValue && sports.map(s => s.toLowerCase()).includes(currentSportValue)) {
      sportSelect.value = currentSportValue;
    }
  }
}

// Re-render plans based on current filter state
function renderFilteredPlans(allPlans) {
  try {
    const filtered = applyFilters(allPlans);
    const container = qs('#plansContainer');
    const resetBtn = qs('#resetFiltersBtn');
    
    if (!filtered.length) {
      // Show no results state
      container.innerHTML = `
        <div class="empty-hero">
          <div class="empty-icon">🔍</div>
          <h2>Geen plannen gevonden</h2>
          <p>Pas je zoekopdracht of filters aan.</p>
        </div>
      `;
      if (resetBtn && (filterState.search || filterState.date || filterState.sport)) {
        resetBtn.hidden = false;
      }
      return;
    }
    
    // Hide reset button if no active filters
    if (resetBtn) {
      resetBtn.hidden = !(filterState.search || filterState.date || filterState.sport);
    }
    
    // Group filtered plans by date
    const groups = {};
    const sorted = [...filtered].sort((a, b) => {
      const timeA = new Date(a.startISO).getTime();
      const timeB = new Date(b.startISO).getTime();
      return timeA - timeB;
    });
    
    sorted.forEach(obj => {
      try {
        const dateKey = getDateKey(obj.startISO);
        if (!groups[dateKey]) {
          groups[dateKey] = {
            label: formatDateGroupLabel(obj.startISO),
            items: []
          };
        }
        groups[dateKey].items.push(obj);
      } catch (e) {
        console.error('Error grouping filtered item:', obj, e);
      }
    });
    
    // Render groups
    container.innerHTML = '';
    try {
      Object.keys(groups).sort().forEach(dateKey => {
        try {
          const group = groups[dateKey];
          const section = document.createElement('section');
          section.className = 'day-section';
          section.innerHTML = `<h3 class="day-title">${group.label}</h3><div class="plans-list"></div>`;
          const list = section.querySelector('.plans-list');

          group.items.forEach(item => {
            try {
              const card = document.createElement('article');
              card.className = 'plan-card';
              
              const sportName = ucfirst(item.sport || 'Onbekend');
              const meta = SPORT_META[item.sport] || { emoji: '🎯', color: '#0b76c9' };
              const key = makeKey(item);
              const count = getCountForKey(key);
              const geslachtLabel = getGeslachtLabel(item.geslacht);
              const dateBadge = formatDateBadge(item.startISO) || 'Onbekende datum';
              
              card.innerHTML = `
                <div class="plan-card-content">
                  <div class="plan-card-top">
                    <div class="plan-sport-badge" style="background: ${meta.color}14; border-color: ${meta.color}">
                      <span class="plan-emoji">${meta.emoji}</span>
                    </div>
                    <div class="plan-sport-info">
                      <div class="plan-sport-name">${sportName}</div>
                      <span class="plan-date-badge">${dateBadge}</span>
                    </div>
                  </div>
                  
                  <div class="plan-time-row">
                    <span class="plan-time-label">⏰</span>
                    <span class="plan-time-value">${item.tijd || '--:-- '}</span>
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
                try {
                  const key = makeKey(item);
                  const confirmMsg = `Weet je zeker dat je de inschrijving voor ${sportName} wilt annuleren? Je kunt je kind later eenvoudig weer inschrijven.`;
                  if (!window.confirm(confirmMsg)) return;
                  const ok = unjoinByKey(key);
                  if (ok) {
                    card.classList.add('removing');
                    setTimeout(() => {
                      card.remove();
                      showToast(`Afgemeld voor ${sportName}`);
                      if (!container.querySelectorAll('.plan-card').length) {
                        location.reload();
                      }
                    }, 300);
                  }
                } catch (e) {
                  console.error('Error removing plan:', e);
                  showToast('Kon niet afmelden. Probeer opnieuw.');
                }
              });

              list.appendChild(card);
            } catch (itemError) {
              console.error('Error rendering filtered item:', item, itemError);
            }
          });

          container.appendChild(section);
        } catch (groupError) {
          console.error('Error rendering filtered group:', dateKey, groupError);
        }
      });
    } catch (renderError) {
      console.error('Error rendering filtered plans:', renderError);
      container.innerHTML = `
        <div class="error-state">
          <p>Er is een fout opgetreden bij het laden van je plannen.</p>
        </div>
      `;
    }
  } catch (e) {
    console.error('Error in renderFilteredPlans:', e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = qs("#plansContainer");
  const joined = getJoined();
  const dashboardBlock = qs("#dashboardBlock");
  const summaryText = qs("#summaryText");
  const nextTrainingCard = qs("#nextTrainingCard");
  const nextTrainingContent = qs("#nextTrainingContent");
  const filterSection = qs("#filterSection");
  const resetFiltersBtn = qs("#resetFiltersBtn");

  // Store joined data on container for access in chip callbacks
  if (container) {
    container.data = { joined };
  }

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
    dashboardBlock.hidden = true;
    if (filterSection) filterSection.hidden = true;
    return;
  }

  // Show dashboard and filter section
  dashboardBlock.hidden = false;
  if (filterSection) filterSection.hidden = false;
  
  const count = joined.length;
  summaryText.textContent = `Je hebt ${count} ${count === 1 ? 'geplande activiteit' : 'geplande activiteiten'}`;

  // Update filter UI with chips
  updateFilterUI(joined);

  // Initial render with all plans
  renderFilteredPlans(joined);

  // Render next training card (first item chronologically)
  try {
    if (joined.length > 0) {
      const sorted = [...joined].sort((a, b) => {
        const timeA = new Date(a.startISO).getTime();
        const timeB = new Date(b.startISO).getTime();
        return timeA - timeB;
      });
      
      const nextTraining = sorted[0];
      
      if (nextTraining && nextTraining.sport && nextTraining.startISO) {
        const sportName = ucfirst(nextTraining.sport);
        const meta = SPORT_META[nextTraining.sport] || { emoji: '🎯', color: '#0b76c9' };
        const geslachtLabel = getGeslachtLabel(nextTraining.geslacht);
        const dateBadge = formatDateBadge(nextTraining.startISO);
        
        nextTrainingContent.innerHTML = `
          <div class="next-training-info">
            <div class="next-sport-row">
              <span class="next-sport-emoji">${meta.emoji}</span>
              <span class="next-sport-name">${sportName}</span>
            </div>
            <div class="next-details">
              <div class="next-detail-row">
                <span class="next-detail-label">📅</span>
                <span class="next-detail-value">${dateBadge}</span>
              </div>
              <div class="next-detail-row">
                <span class="next-detail-label">⏰</span>
                <span class="next-detail-value">${nextTraining.tijd}</span>
              </div>
              <div class="next-detail-row">
                <span class="next-detail-label">👥</span>
                <span class="next-detail-value">${geslachtLabel} • ${nextTraining.groep}</span>
              </div>
            </div>
          </div>
        `;
      }
    }
  } catch (e) {
    console.error('Error rendering next training card:', e);
  }

  // Set up filter event listeners
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      filterState = { search: '', date: '', sport: '' };
      updateFilterUI(joined);
      renderFilteredPlans(joined);
    });
  }
});
