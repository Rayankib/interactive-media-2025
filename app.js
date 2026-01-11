/* Debug helper: Press D to toggle debug-click class which highlights overlays */
document.addEventListener('keydown', (e) => {
  if (e.key === 'D' || e.key === 'd') {
    document.body.classList.toggle('debug-click');
    console.log('[DEBUG] Mode:', document.body.classList.contains('debug-click') ? 'ON (red=overlay)' : 'OFF');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // =============================================================================
  // SINGLE SELECTION SYSTEM: sport chips only
  // =============================================================================
  const STORAGE_KEY = 'fitplanner:lastSport';
  const cards = document.querySelectorAll(".sport-card");
  const viewBtn = document.getElementById('viewPlannerBtn');
  const clearBtn = document.getElementById('clearSelectionBtn');
  const toastEl = document.getElementById('toast');
  const selectionHint = document.getElementById('selectionHint');
  const hintSport = document.getElementById('hintSport');

  // ERROR CHECK: Ensure CTA button exists
  if (!viewBtn) {
    console.error('❌ CRITICAL: #viewPlannerBtn not found in DOM. CTA will not work.');
  } else {
    console.log('✓ CTA button found: #viewPlannerBtn');
  }

  let selectedSport = '';

  // Helper: show toast message
  function showToast(msg, timeout=2200){
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.hidden = false; toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(()=>{ toastEl.classList.remove('show'); toastEl._t2 = setTimeout(()=>{ toastEl.hidden = true },220); }, timeout);
  }

  // Helper: update visual state and enabled state
  function updateUI(){
    // Update CTA button disabled state
    if (viewBtn) viewBtn.disabled = !selectedSport;
    // Update "Wis keuze" visibility
    if (clearBtn) clearBtn.hidden = !selectedSport;
    // Update selection hint
    if (selectionHint && hintSport) {
      if (selectedSport) {
        const sportName = Array.from(cards).find(c => c.dataset.sport === selectedSport)?.querySelector('h2')?.textContent || selectedSport;
        hintSport.textContent = sportName;
        selectionHint.hidden = false;
      } else {
        selectionHint.hidden = true;
      }
    }
    // Save to localStorage
    if (selectedSport) {
      try { localStorage.setItem(STORAGE_KEY, selectedSport); } catch(e){}
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    }
  }

  // Helper: clear all selections
  function clearSelection(){
    cards.forEach(c=>{ 
      c.classList.remove('selected'); 
      c.setAttribute('aria-pressed','false'); 
    });
    selectedSport = '';
  }

  // Initialize: restore persisted selection on page load
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const match = Array.from(cards).find(c => c.dataset.sport === saved);
    if (match) {
      selectedSport = saved;
      match.classList.add('selected');
      match.setAttribute('aria-pressed','true');
    }
  }

  // Setup chip click handlers (ONE listener per card, no duplication)
  cards.forEach((card) => {
    card.setAttribute('role','button');
    card.setAttribute('aria-pressed','false');

    card.addEventListener('click', (e) => {
      // CRITICAL: Use event.currentTarget to ensure we get the button, not a child element
      const clickedCard = e.currentTarget;
      const sport = clickedCard.dataset.sport;
      if (!sport) return;

      console.log('✓ chip clicked:', sport);

      // TRUE SINGLE-CHOICE: Deselect ALL cards first, then select only this one
      cards.forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
      });

      // Select only the clicked card
      clickedCard.classList.add('selected');
      clickedCard.setAttribute('aria-pressed', 'true');
      selectedSport = sport;

      console.log('  → selectedSport is now:', selectedSport || '(none)');
      console.log('  → CTA button enabled:', !!selectedSport, '| Only one .selected:', document.querySelectorAll('.sport-card.selected').length === 1);
      updateUI();
      clickedCard.focus();
    });

    // touchstart for mobile responsiveness
    card.addEventListener('touchstart', (e)=>{ 
      e.currentTarget.click(); 
    }, { passive:true });
  });

  // CTA button: navigate to planner with selected sport
  if (viewBtn){
    viewBtn.disabled = !selectedSport;  // Start disabled
    console.log('✓ CTA click handler attached | Initial state: disabled=' + viewBtn.disabled);
    
    viewBtn.addEventListener('click', ()=>{
      console.log('→ CTA clicked | selectedSport:', selectedSport || '(none)', '| disabled:', viewBtn.disabled);
      if (!selectedSport){
        showToast('Kies eerst een sport');
        return;
      }
      const sportName = Array.from(cards).find(c => c.dataset.sport === selectedSport)?.querySelector('h2')?.textContent || selectedSport;
      console.log('→ navigating to planner.html?sport=' + encodeURIComponent(selectedSport));
      window.location.href = `planner.html?sport=${encodeURIComponent(selectedSport)}`;
    });
  } else {
    console.error('❌ CTA button listener NOT attached - #viewPlannerBtn not found');
  }

  // Clear selection button
  if (clearBtn){
    clearBtn.hidden = !selectedSport;  // Start hidden if nothing selected
    clearBtn.addEventListener('click', ()=>{
      clearSelection();
      selectedSport = '';
      updateUI();
      showToast('Keuze verwijderd');
    });
  }

  // Initial UI update
  updateUI();

  // Subtle 3D-tilt on pointer devices with reduced effect; avoid on touch/when reduced motion
  const mediaReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (!mediaReduce.matches && isFinePointer) {
    cards.forEach((card) => {
      const maxTilt = 8; // milder tilt for touch comfort
      let onMove = (e) => {
        // handle touch events gracefully by using changedTouches
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const r = card.getBoundingClientRect();
        const px = (clientX - r.left) / r.width;
        const py = (clientY - r.top) / r.height;
        const rotY = (px - 0.5) * (maxTilt * 2);
        const rotX = (0.5 - py) * (maxTilt * 2);
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      };
      const reset = () => { card.style.transform = ""; };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("touchmove", onMove, { passive: true });
      card.addEventListener("mouseleave", reset);
      card.addEventListener("touchend", reset);
      card.addEventListener("blur", reset);
    });
  }

  // Bottom navigation active state based on current URL
  const bn = document.querySelectorAll('.bottom-nav .bn-item');
  if (bn.length) {
    const cur = location.pathname + location.search;
    bn.forEach(a => {
      try{
        const href = new URL(a.href, location.origin).pathname + new URL(a.href, location.origin).search;
        if (href === cur) { 
          a.classList.add('active'); 
          a.setAttribute('aria-current','page'); 
        }
        else { 
          a.classList.remove('active'); 
          a.removeAttribute('aria-current'); 
        }
      }catch(e){}
    });
  }
});
