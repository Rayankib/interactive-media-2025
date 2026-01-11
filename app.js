document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".sport-card");

  // Hero CTA: scroll to sports grid when present
  const cta = document.querySelector('#ctaChoose');
  if (cta) {
    cta.addEventListener('click', () => {
      const grid = document.getElementById('sports');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Move focus to first sport card for keyboard users
      const first = document.querySelector('.sport-card');
      if (first) first.focus();
    });
  }

  // Redirect bij klik
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const sport = card.dataset.sport;
      if (!sport) return;
      card.classList.add("clicked");
      setTimeout(() => {
        card.classList.remove("clicked");
        window.location.href = `planner.html?sport=${encodeURIComponent(sport)}`;
      }, 200);
    });
  });

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
