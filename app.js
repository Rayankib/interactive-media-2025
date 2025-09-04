const app = document.getElementById('app');

window.addEventListener('load', () => {
  if (!location.hash) location.hash = '#/';
  render();
});
window.addEventListener('hashchange', render);
document.addEventListener('click', (e) => {
  const r = e.target.getAttribute?.('data-route');
  if (r) location.hash = r;
});

/* ---------- Views ---------- */
function HomeView(){
  return `
    <section class="hero">
      <h1>Your Eye Health Companion</h1>
      <p>Start a quick check and get simple tips. (~2–3 minutes)</p>
    </section>

    <section class="grid">
      <article class="card">
        <div class="icon">❓</div>
        <h3>Quiz</h3>
        <p>Short lifestyle quiz with practical advice.</p>
        <button class="btn" data-route="#/quiz">Start Quiz</button>
      </article>

      <article class="card">
        <div class="icon">🟢</div>
        <h3>Color Test</h3>
        <p>Quick indication of color vision patterns.</p>
        <button class="btn" data-route="#/color">Start Color Test</button>
      </article>

      <article class="card">
        <div class="icon">👁️</div>
        <h3>Sharpness Test</h3>
        <p>Move a slider to check readability at different blur levels.</p>
        <button class="btn" data-route="#/sharpness">Start Sharpness</button>
      </article>
    </section>
  `;
}

/* Quiz */
function QuizView(){
  const q = [
    { id:'q1', text:'Do you work behind a screen for more than 4 hours/day?', a:['Yes','No'] },
    { id:'q2', text:'Do you often play sports outdoors in bright sunlight?', a:['Yes','No'] },
    { id:'q3', text:'Do your eyes feel tired regularly?', a:['Yes','No'] },
  ];
  return `
    <section class="hero"><h1>Quiz</h1><p>Answer 3 quick questions.</p></section>
    <div class="card">
      <form id="quizForm">
        ${q.map(item => `
          <p><strong>${item.text}</strong><br/>
            ${item.a.map(opt => `
              <label><input type="radio" name="${item.id}" value="${opt}" required> ${opt}</label>
            `).join(' ')}
          </p>
        `).join('')}
        <button class="btn" type="submit">Show advice</button>
        <button class="btn ghost" data-route="#/">Back</button>
      </form>
      <div id="quizResult" class="section hidden"></div>
    </div>
  `;
}
function quizLogic(){
  const form = document.getElementById('quizForm');
  if (!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const ans = Object.fromEntries(data.entries());
    const tips = [];
    if (ans.q1 === 'Yes') tips.push('Use the 20–20–20 rule or consider a blue-light filter.');
    if (ans.q2 === 'Yes') tips.push('Wear UV protection in bright sunlight.');
    if (ans.q3 === 'Yes') tips.push('Take short breaks and check screen brightness.');
    if (!tips.length) tips.push('Looks fine for now. Re-test periodically and watch symptoms.');
    const box = document.getElementById('quizResult');
    box.innerHTML = `<h3>Advice</h3><ul>${tips.map(t=>`<li>${t}</li>`).join('')}</ul>`;
    box.classList.remove('hidden');
  });
}

/* Color Test (demo with 2 simple plates) */
const colorPlates = [
  { id:1, question:'Do you see the number 12?', correct:'12', options:['12','17','— I see nothing —'] },
  { id:2, question:'Do you see the number 29?', correct:'29', options:['29','70','— I see nothing —'] },
];
function ColorView(){
  return `
    <section class="hero"><h1>Color Test</h1><p>Demo version — indicative only.</p></section>
    <div class="card">
      <form id="colorForm">
        ${colorPlates.map((p,i)=>`
          <fieldset>
            <legend>Plate ${i+1}</legend>
            <p><strong>${p.question}</strong></p>
            ${p.options.map(opt=>`
              <label><input type="radio" name="p${p.id}" value="${opt}" required> ${opt}</label>
            `).join('<br/>')}
          </fieldset>
        `).join('')}
        <button class="btn" type="submit">Show result</button>
        <button class="btn ghost" data-route="#/">Back</button>
      </form>
      <div id="colorResult" class="section hidden"></div>
    </div>
  `;
}
function colorLogic(){
  const form = document.getElementById('colorForm');
  if (!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    let score = 0;
    colorPlates.forEach(p => { if (data.get(`p${p.id}`) === p.correct) score++; });
    const conf = score === colorPlates.length ? 'high' : (score === 0 ? 'low' : 'medium');
    const res = document.getElementById('colorResult');
    res.innerHTML = `
      <h3>Result</h3>
      <p>Correct: ${score}/${colorPlates.length} • Confidence: ${conf}</p>
      <p><small>EyeGuide is guidance, not a diagnosis. If you have concerns, visit an optician.</small></p>
      <button class="btn" data-route="#/color">Try again</button>
    `;
    res.classList.remove('hidden');
  });
}

/* Sharpness Test */
function SharpnessView(){
  return `
    <section class="hero"><h1>Sharpness Test</h1><p>Adjust blur and check readability.</p></section>
    <div class="card">
      <label>Sharpness:
        <input id="sharpRange" type="range" min="0" max="6" value="0">
      </label>
      <div id="sharpTarget" style="filter: blur(0px); margin-top:12px;">
        <h3>Sample text</h3>
        <p>The quick brown fox jumps over the lazy dog 0123456789.</p>
        <p style="font-size:12px;">Small text for testing.</p>
      </div>
      <div id="sharpResult" class="section">Current blur: 0px</div>
      <button class="btn ghost" data-route="#/">Back</button>
    </div>
  `;
}
function sharpnessLogic(){
  const range = document.getElementById('sharpRange');
  const target = document.getElementById('sharpTarget');
  const out = document.getElementById('sharpResult');
  if (!range) return;
  const update = () => {
    const px = range.value;
    target.style.filter = `blur(${px}px)`;
    out.textContent = `Current blur: ${px}px`;
  };
  range.addEventListener('input', update);
  update();
}

/* ---------- Router ---------- */
function render(){
  const route = location.hash.replace('#','');
  let html = '';
  if (route === '/' || route === '') html = HomeView();
  else if (route.startsWith('/quiz')) html = QuizView();
  else if (route.startsWith('/color')) html = ColorView();
  else if (route.startsWith('/sharpness')) html = SharpnessView();
  else html = `<section class="hero"><h1>404</h1><p>Page not found.</p></section>`;
  app.innerHTML = html;

  // activate per-view logic
  quizLogic(); colorLogic(); sharpnessLogic();
}
