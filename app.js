// ===== STATE MANAGEMENT =====
const DEFAULT_STEPS = [
  {
    id: 'check-registration',
    title: 'Check Registration Status',
    icon: '🔍',
    desc: 'Verify if you are already registered as a voter on the electoral roll.',
    detail: `<p>Visit the National Voter Service Portal (NVSP) at <strong>voters.eci.gov.in</strong> to check your registration status.</p>
      <ul><li>Search by EPIC number (Voter ID number)</li><li>Or search by name & address</li><li>Download your digital Voter ID (e-EPIC) if available</li></ul>`,
    firstTimeExtra: '💡 First-time voter tip: Even if you recently turned 18, check the rolls — your name may have been added during a revision drive.',
    urgencyNote: ''
  },
  {
    id: 'register',
    title: 'Register to Vote',
    icon: '📝',
    desc: 'Submit Form 6 to register as a new voter with the Election Commission.',
    detail: `<p>Fill <strong>Form 6</strong> online at voters.eci.gov.in or visit your nearest Electoral Registration Office.</p>
      <ul><li>Upload passport-size photo</li><li>Provide age proof (Aadhaar, birth certificate, etc.)</li><li>Provide address proof</li><li>Processing takes 15–30 days</li></ul>`,
    firstTimeExtra: '💡 First-time voter tip: Keep your Aadhaar and a recent passport-size photo ready. You can also use the Voter Helpline App to submit Form 6.',
    urgencyNote: '⚠️ You must register before the deadline — this is urgent!'
  },
  {
    id: 'verify-eligibility',
    title: 'Verify Eligibility',
    icon: '✅',
    desc: 'Confirm you meet all eligibility criteria to vote in the upcoming election.',
    detail: `<p>To be eligible to vote in India you must:</p>
      <ul><li>Be a citizen of India</li><li>Be 18 years or older on the qualifying date (1st January of the year of revision)</li><li>Be a resident of the constituency where you are registered</li><li>Not be disqualified under any law</li></ul>`,
    firstTimeExtra: '💡 First-time voter tip: Your qualifying date is January 1st of the revision year. If you turned 18 after that, you\'ll be eligible in the next revision.',
    urgencyNote: ''
  },
  {
    id: 'find-polling',
    title: 'Find Your Polling Station',
    icon: '📍',
    desc: 'Locate your assigned polling booth so you know exactly where to go on election day.',
    detail: `<p>Find your polling station via:</p>
      <ul><li><strong>NVSP Portal</strong> — Search by EPIC number</li><li><strong>Voter Helpline App</strong> — GPS-enabled booth finder</li><li><strong>SMS</strong> — Send EPIC number to 1950</li><li>Check the Election Commission notice board in your area</li></ul>`,
    firstTimeExtra: '💡 First-time voter tip: Visit your polling station a day before election day to familiarize yourself with the location and avoid last-minute confusion.',
    urgencyNote: ''
  },
  {
    id: 'prepare-docs',
    title: 'Prepare Required Documents',
    icon: '📄',
    desc: 'Gather your Voter ID (EPIC) and other accepted photo ID proofs.',
    detail: `<p>On election day, carry one of these photo IDs:</p>
      <ul><li>Voter ID Card (EPIC) — preferred</li><li>Aadhaar Card</li><li>Passport</li><li>Driving License</li><li>PAN Card</li><li>Service ID (for government employees)</li></ul>
      <p>💡 You can also show your <strong>e-EPIC</strong> (digital voter ID) on your phone.</p>`,
    firstTimeExtra: '💡 First-time voter tip: Download your e-EPIC from the Voter Helpline App as a backup. Keep a photocopy of your voter ID at home.',
    urgencyNote: ''
  },
  {
    id: 'vote',
    title: 'Cast Your Vote! 🗳️',
    icon: '🗳️',
    desc: 'Go to your polling station and cast your vote using the EVM.',
    detail: `<p>On election day:</p>
      <ul><li>Polling hours: typically <strong>7:00 AM – 6:00 PM</strong></li><li>Carry your photo ID</li><li>Your name will be verified against the electoral roll</li><li>You'll receive indelible ink mark on your finger</li><li>Press the button next to your chosen candidate on the <strong>EVM</strong></li><li>Verify your vote on the <strong>VVPAT</strong> slip</li></ul>`,
    firstTimeExtra: '💡 First-time voter tip: Don\'t be nervous! The booth officers will guide you. The EVM is simple — one button press is all it takes.',
    urgencyNote: ''
  }
];

let state = loadState();

function getDefaultState() {
  return {
    user: null,
    steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)),
    onboardStep: 0,
    planGenerated: false,
    reminderSet: false
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem('votingAssistantState');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.user && parsed.planGenerated) return parsed;
    }
  } catch (e) { /* ignore */ }
  return getDefaultState();
}

function saveState() {
  localStorage.setItem('votingAssistantState', JSON.stringify(state));
}

function getCompletedCount() {
  return state.steps.filter(s => s.status === 'completed').length;
}

function getNextStep() {
  return state.steps.find(s => s.status !== 'completed' && s.status !== 'skipped');
}

function getActiveStepIndex() {
  return state.steps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped');
}

// ===== ONBOARDING =====
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
  'Jammu & Kashmir','Ladakh','Lakshadweep','Andaman & Nicobar Islands','Dadra & Nagar Haveli and Daman & Diu'
];

function initApp() {
  if (state.user && state.planGenerated) {
    showPlan();
  } else {
    showOnboarding();
  }
}

function showOnboarding() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';
  const onboarding = document.createElement('div');
  onboarding.className = 'onboarding';
  onboarding.id = 'onboarding';
  renderOnboardStep(onboarding, state.onboardStep);
  main.appendChild(onboarding);
  updateBottomBar(false);
}

function renderOnboardStep(container, step) {
  const steps = [renderNameStep, renderStateStep, renderFirstTimeStep, renderRegisteredStep];
  container.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'onboard-card';

  // Step dots
  const dots = document.createElement('div');
  dots.className = 'step-dots';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === step ? ' active' : i < step ? ' done' : '');
    dots.appendChild(d);
  }
  card.appendChild(dots);

  steps[step](card);
  container.appendChild(card);
}

function renderNameStep(card) {
  card.innerHTML += `
    <h2>Welcome, future voter! 🇮🇳</h2>
    <p class="subtitle">Let's create your personal voting plan. What's your name?</p>
    <div class="form-group">
      <label>Your Name</label>
      <input type="text" id="userName" placeholder="Enter your name" value="${state.user?.name || ''}" autofocus />
    </div>
    <button class="btn btn-primary" id="nameNext">Continue →</button>
  `;
  setTimeout(() => {
    document.getElementById('nameNext')?.addEventListener('click', () => {
      const name = document.getElementById('userName').value.trim();
      if (!name) { document.getElementById('userName').focus(); return; }
      if (!state.user) state.user = {};
      state.user.name = name;
      state.onboardStep = 1;
      saveState();
      showOnboarding();
    });
    document.getElementById('userName')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('nameNext')?.click();
    });
  }, 50);
}

function renderStateStep(card) {
  let opts = '<option value="">Select your state/UT</option>';
  INDIAN_STATES.forEach(s => {
    opts += `<option value="${s}" ${state.user?.state === s ? 'selected' : ''}>${s}</option>`;
  });
  card.innerHTML += `
    <h2>Where do you vote? 📍</h2>
    <p class="subtitle">Select your state or union territory.</p>
    <div class="form-group">
      <label>State / Union Territory</label>
      <select id="userState">${opts}</select>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="stateBack">← Back</button>
      <button class="btn btn-primary" id="stateNext">Continue →</button>
    </div>
  `;
  setTimeout(() => {
    document.getElementById('stateBack')?.addEventListener('click', () => { state.onboardStep = 0; saveState(); showOnboarding(); });
    document.getElementById('stateNext')?.addEventListener('click', () => {
      const val = document.getElementById('userState').value;
      if (!val) return;
      state.user.state = val;
      state.onboardStep = 2;
      saveState();
      showOnboarding();
    });
  }, 50);
}

function renderFirstTimeStep(card) {
  const ft = state.user?.isFirstTime;
  card.innerHTML += `
    <h2>Is this your first time voting? 🌟</h2>
    <p class="subtitle">We'll add extra guidance if you're a first-time voter.</p>
    <div class="form-group">
      <label>First-time voter?</label>
      <div class="toggle-group">
        <button class="toggle-btn ${ft === true ? 'active' : ''}" data-val="yes" id="ftYes">✨ Yes, first time!</button>
        <button class="toggle-btn ${ft === false ? 'active' : ''}" data-val="no" id="ftNo">🗳️ Voted before</button>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="ftBack">← Back</button>
      <button class="btn btn-primary" id="ftNext">Continue →</button>
    </div>
  `;
  setTimeout(() => {
    document.getElementById('ftYes')?.addEventListener('click', () => {
      state.user.isFirstTime = true;
      document.getElementById('ftYes').classList.add('active');
      document.getElementById('ftNo').classList.remove('active');
    });
    document.getElementById('ftNo')?.addEventListener('click', () => {
      state.user.isFirstTime = false;
      document.getElementById('ftNo').classList.add('active');
      document.getElementById('ftYes').classList.remove('active');
    });
    document.getElementById('ftBack')?.addEventListener('click', () => { state.onboardStep = 1; saveState(); showOnboarding(); });
    document.getElementById('ftNext')?.addEventListener('click', () => {
      if (state.user.isFirstTime === undefined) return;
      state.onboardStep = 3;
      saveState();
      showOnboarding();
    });
  }, 50);
}

function renderRegisteredStep(card) {
  const reg = state.user?.isRegistered;
  card.innerHTML += `
    <h2>Are you already registered? 📋</h2>
    <p class="subtitle">This helps us prioritize the right steps for you.</p>
    <div class="form-group">
      <label>Registration status</label>
      <div class="toggle-group">
        <button class="toggle-btn ${reg === true ? 'active-green' : ''}" data-val="yes" id="regYes">✅ Yes, registered</button>
        <button class="toggle-btn ${reg === false ? 'active' : ''}" data-val="no" id="regNo">❌ Not yet</button>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" id="regBack">← Back</button>
      <button class="btn btn-green" id="regDone">Generate My Plan 🎯</button>
    </div>
  `;
  setTimeout(() => {
    document.getElementById('regYes')?.addEventListener('click', () => {
      state.user.isRegistered = true;
      document.getElementById('regYes').classList.add('active-green');
      document.getElementById('regNo').classList.remove('active');
    });
    document.getElementById('regNo')?.addEventListener('click', () => {
      state.user.isRegistered = false;
      document.getElementById('regNo').classList.add('active');
      document.getElementById('regYes').classList.remove('active-green');
    });
    document.getElementById('regBack')?.addEventListener('click', () => { state.onboardStep = 2; saveState(); showOnboarding(); });
    document.getElementById('regDone')?.addEventListener('click', () => {
      if (state.user.isRegistered === undefined) return;
      generatePlan();
    });
  }, 50);
}

// ===== PLAN GENERATION =====
function generatePlan() {
  state.steps = JSON.parse(JSON.stringify(DEFAULT_STEPS));

  // Mark initial statuses
  state.steps.forEach(s => { s.status = 'pending'; });

  // If already registered, skip registration and auto-complete check
  if (state.user.isRegistered) {
    state.steps[0].status = 'completed'; // check registration
    state.steps[1].status = 'skipped';   // register
  } else {
    // Not registered: mark registration as urgent
    state.steps[1].status = 'urgent';
  }

  // Set the first non-completed step as active
  const nextIdx = getActiveStepIndex();
  if (nextIdx >= 0) state.steps[nextIdx].status = state.steps[nextIdx].status === 'urgent' ? 'urgent' : 'active';

  state.planGenerated = true;
  saveState();
  showPlan();
}

// ===== SHOW PLAN =====
function showPlan() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  // Check if all done
  const completed = getCompletedCount();
  const total = state.steps.filter(s => s.status !== 'skipped').length;

  if (completed === total) {
    showCompletionScreen(main);
    updateBottomBar(false);
    return;
  }

  // Progress section
  const progress = document.createElement('div');
  progress.className = 'progress-section';
  const pct = Math.round((completed / total) * 100);
  progress.innerHTML = `
    <div class="progress-header">
      <h3>Your Progress</h3>
      <span>${completed}/${total} steps done</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${pct}%"></div>
    </div>
  `;
  main.appendChild(progress);

  // Plan title
  const title = document.createElement('div');
  title.className = 'plan-title';
  title.innerHTML = `<span class="icon">🎯</span> Your Personal Voting Plan`;
  main.appendChild(title);

  // Steps timeline
  const timeline = document.createElement('div');
  timeline.className = 'steps-timeline';

  state.steps.forEach((step, i) => {
    if (step.status === 'skipped') return;

    const item = document.createElement('div');
    item.className = 'step-item';
    item.id = `step-${step.id}`;

    // Node
    const nodeClass = step.status === 'completed' ? 'completed' :
                      step.status === 'urgent' ? 'urgent' :
                      step.status === 'active' ? 'active' : 'pending';
    const nodeText = step.status === 'completed' ? '✓' : (state.steps.filter(s => s.status !== 'skipped').indexOf(step) + 1);

    // Card class
    const cardClass = step.status === 'completed' ? 'completed-card' :
                      step.status === 'urgent' ? 'urgent-card' :
                      step.status === 'active' ? 'active-card' : '';

    // Badge
    let badge = '';
    if (step.status === 'completed') badge = '<span class="step-badge badge-done">✅ Done</span>';
    else if (step.status === 'urgent') badge = '<span class="step-badge badge-urgent">⚠️ Urgent</span>';
    else if (step.status === 'active') badge = '<span class="step-badge badge-next">👉 Next</span>';

    // Deadline badge for registration
    if (step.id === 'register' && step.status !== 'completed' && step.status !== 'skipped') {
      badge += ' <span class="step-badge badge-deadline">⏳ Register ASAP</span>';
    }

    // Extra guidance for first-time voters
    let extra = '';
    if (state.user.isFirstTime && step.firstTimeExtra && step.status !== 'completed') {
      extra = `<div class="step-extra"><span class="extra-label">First-time voter guide</span>${step.firstTimeExtra}</div>`;
    }

    item.innerHTML = `
      <div class="step-node ${nodeClass}">${nodeText}</div>
      <div class="step-card ${cardClass}" data-step-index="${i}">
        <div class="step-title-row">
          <span class="step-title">${step.icon} ${step.title}</span>
          <div>${badge}</div>
        </div>
        <div class="step-desc">${step.desc}</div>
        ${extra}
        <div class="step-detail" id="detail-${step.id}">
          <div class="step-detail-content">
            ${step.detail}
            <div class="step-actions">
              ${step.status !== 'completed' ? `<button class="step-action-btn mark-done" data-idx="${i}">✅ Mark as done</button>` : ''}
              <button class="step-action-btn" onclick="scrollToNext()">👉 What's next?</button>
            </div>
          </div>
        </div>
      </div>
    `;

    timeline.appendChild(item);
  });

  main.appendChild(timeline);
  updateBottomBar(true);

  // Attach card click listeners
  setTimeout(() => {
    document.querySelectorAll('.step-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.step-action-btn')) return;
        const idx = parseInt(card.dataset.stepIndex);
        const detailId = `detail-${state.steps[idx].id}`;
        const detail = document.getElementById(detailId);
        if (detail) detail.classList.toggle('open');
      });
    });

    document.querySelectorAll('.step-action-btn.mark-done').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        markStepDone(idx);
      });
    });
  }, 50);

  // Scroll to active step
  setTimeout(() => {
    const active = document.querySelector('.step-card.active-card, .step-card.urgent-card');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 400);
}

// ===== MARK STEP DONE =====
function markStepDone(index) {
  state.steps[index].status = 'completed';

  // Find next pending/active/urgent step
  const nextIdx = state.steps.findIndex(s => s.status !== 'completed' && s.status !== 'skipped');
  if (nextIdx >= 0) {
    state.steps[nextIdx].status = 'active';
  }

  saveState();
  showToast(`✅ "${state.steps[index].title}" marked complete!`);
  showPlan();

  // Check if all done
  const completed = getCompletedCount();
  const total = state.steps.filter(s => s.status !== 'skipped').length;
  if (completed === total) {
    launchConfetti();
  }
}

// ===== SCROLL TO NEXT =====
function scrollToNext() {
  const next = getNextStep();
  if (next) {
    const el = document.getElementById(`step-${next.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = el.querySelector('.step-card');
      if (card) {
        card.style.transition = 'box-shadow 0.3s ease';
        card.style.boxShadow = '0 0 20px rgba(255, 153, 51, 0.3)';
        setTimeout(() => { card.style.boxShadow = ''; }, 1500);
      }
    }
  }
}

// ===== BOTTOM BAR =====
function updateBottomBar(showBar) {
  const bar = document.getElementById('bottomBar');
  if (!showBar) { bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');

  const next = getNextStep();
  const banner = document.getElementById('nextStepBanner');
  const actions = document.getElementById('bottomActions');

  if (next) {
    banner.innerHTML = `
      <span class="ns-icon">🎯</span>
      <span class="ns-text"><strong>Your next step:</strong> ${next.title} — ${next.desc}</span>
    `;
    actions.innerHTML = `
      <button class="btn btn-green" id="btnMarkNext">✅ Mark Done</button>
      <button class="btn btn-ghost" id="btnWhatsNext">👉 Next</button>
      <button class="btn btn-ghost" id="btnRemind">⏰ Remind</button>
    `;
    setTimeout(() => {
      document.getElementById('btnMarkNext')?.addEventListener('click', () => {
        const idx = state.steps.indexOf(next);
        if (idx >= 0) markStepDone(idx);
      });
      document.getElementById('btnWhatsNext')?.addEventListener('click', scrollToNext);
      document.getElementById('btnRemind')?.addEventListener('click', setReminder);
    }, 50);
  } else {
    banner.innerHTML = `<span class="ns-icon">🎉</span><span class="ns-text"><strong>All steps completed!</strong> You're ready to vote!</span>`;
    actions.innerHTML = '';
  }
}

// ===== REMINDER =====
function setReminder() {
  state.reminderSet = true;
  saveState();
  showToast('⏰ Reminder set! We\'ll remind you when you return.');
}

// ===== TOAST =====
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== CONFETTI =====
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#FF9933', '#FFFFFF', '#138808', '#000080', '#ffd700'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 2 + 's';
    c.style.width = (Math.random() * 8 + 4) + 'px';
    c.style.height = (Math.random() * 8 + 4) + 'px';
    container.appendChild(c);
  }
  setTimeout(() => container.remove(), 4000);
}

// ===== COMPLETION =====
function showCompletionScreen(main) {
  main.innerHTML = `
    <div class="completion-screen">
      <div class="completion-icon">🇮🇳</div>
      <h2>You're Ready to Vote!</h2>
      <p>Congratulations, <strong>${state.user.name}</strong>! You've completed all the steps.<br>
      Your voice matters — go cast your vote with confidence! 🗳️</p>
      <br>
      <button class="btn btn-primary" id="btnReset" style="max-width:260px;margin:0 auto;">🔄 Start Over</button>
    </div>
  `;
  setTimeout(() => {
    document.getElementById('btnReset')?.addEventListener('click', resetApp);
  }, 50);
  launchConfetti();
}

// ===== RESET =====
function resetApp() {
  localStorage.removeItem('votingAssistantState');
  state = getDefaultState();
  showOnboarding();
}

// ===== CHECK REMINDER ON LOAD =====
function checkReminder() {
  if (state.reminderSet && state.planGenerated) {
    const next = getNextStep();
    if (next) {
      setTimeout(() => {
        showToast(`⏰ Welcome back, ${state.user.name}! Next: ${next.title}`);
      }, 800);
    }
    state.reminderSet = false;
    saveState();
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  checkReminder();
});
