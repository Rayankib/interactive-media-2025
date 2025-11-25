document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".sport-card");

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

  // Subtiel 3D-tilt op hover (desktop/pointer: fine)
  const mediaReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (!mediaReduce.matches && isFinePointer) {
    cards.forEach((card) => {
      const maxTilt = 12; // graden
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rotY = (px - 0.5) * (maxTilt * 2);
        const rotX = (0.5 - py) * (maxTilt * 2);
        card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      };
      const reset = () => { card.style.transform = ""; };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", reset);
      card.addEventListener("blur", reset);
    });
  }
});
