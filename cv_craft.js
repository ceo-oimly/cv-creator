/* CV CRAFT - Core Application JavaScript */

// Sample pre-filled data for instant user wow-factor
const SAMPLE_CV_DATA = {
  id: 'sample-cv-1',
  title: 'Senior Software Engineer CV',
  updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  template: 'professional',
  colorTheme: '#2563eb',
  fontFamily: "'Inter', sans-serif",
  personal: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  summary: 'Results-driven Senior Full Stack Engineer with 7+ years of experience designing and scaling web applications. Expert in React, Node.js, TypeScript, and cloud architecture. Passionate about building elegant user experiences and optimizing application performance.',
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'TechFlow Solutions',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      description: '• Architected microservices migration using Node.js & Docker, reducing latency by 35%.\n• Led frontend team of 6 engineers building next-gen React dashboard used by 100k+ daily users.\n• Implemented automated CI/CD pipelines cut release cycles from 2 weeks to 2 hours.'
    },
    {
      id: 'exp-2',
      jobTitle: 'Frontend Software Engineer',
      company: 'Apex Digital Labs',
      location: 'Austin, TX',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      current: false,
      description: '• Developed responsive SaaS web applications using TypeScript, React, and Redux.\n• Improved lighthouse performance score from 62 to 98 through code splitting & image optimization.\n• Collaborated with UX designers to establish company-wide accessible component design system.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: 'Sep 2015',
      endDate: 'May 2019',
      description: 'Graduated Magna Cum Laude. President of Web Development Club. TA for Data Structures.'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'JavaScript / TypeScript', level: 'Expert' },
    { id: 'sk-2', name: 'React.js & Next.js', level: 'Expert' },
    { id: 'sk-3', name: 'Node.js & Express', level: 'Advanced' },
    { id: 'sk-4', name: 'Python & Django', level: 'Intermediate' },
    { id: 'sk-5', name: 'Docker & Kubernetes', level: 'Advanced' },
    { id: 'sk-6', name: 'PostgreSQL & MongoDB', level: 'Advanced' }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'DevMetrics - Analytics Platform',
      link: 'github.com/alexm/devmetrics',
      tools: 'React, Node.js, GraphQL, PostgreSQL',
      description: 'Open-source developer performance dashboard with over 2.4k GitHub stars.'
    }
  ],
  certifications: [
    { id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
    { id: 'cert-2', name: 'Professional Scrum Master (PSM I)', issuer: 'Scrum.org', date: '2022' }
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Native' },
    { id: 'lang-2', name: 'Spanish', proficiency: 'Conversational' }
  ]
};

// Global App State
let state = {
  currentCv: JSON.parse(JSON.stringify(SAMPLE_CV_DATA)),
  savedCvs: [],
  currentTab: 'personal',
  zoomLevel: 100,
  activeView: 'homepage'
};

// DOM Content Loaded Initializer
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  checkUrlHashData();
  bindEvents();
  renderSavedCvsDashboard();
  renderForm();
  updateLivePreview();
  lucide.createIcons();
});

// Storage Helper
function initStorage() {
  const localSaved = localStorage.getItem('cv_craft_saved_list');
  if (localSaved) {
    try {
      state.savedCvs = JSON.parse(localSaved);
    } catch (e) {
      state.savedCvs = [SAMPLE_CV_DATA];
    }
  } else {
    state.savedCvs = [SAMPLE_CV_DATA];
    saveToLocalStorage();
  }

  const currentDraft = localStorage.getItem('cv_craft_current_draft');
  if (currentDraft) {
    try {
      state.currentCv = JSON.parse(currentDraft);
    } catch (e) { }
  }
}

function saveToLocalStorage() {
  localStorage.setItem('cv_craft_saved_list', JSON.stringify(state.savedCvs));
  localStorage.setItem('cv_craft_current_draft', JSON.stringify(state.currentCv));

  // Show save indicator
  const statusEl = document.getElementById('save-status');
  if (statusEl) {
    statusEl.style.opacity = '1';
    setTimeout(() => {
      statusEl.style.opacity = '0.7';
    }, 1000);
  }
}

// Check for encoded CV URL hash (Share Link functionality)
function checkUrlHashData() {
  if (window.location.hash && window.location.hash.startsWith('#cv=')) {
    try {
      const encoded = window.location.hash.replace('#cv=', '');
      const decoded = JSON.parse(atob(encoded));
      if (decoded && decoded.personal) {
        state.currentCv = decoded;
        switchView('editor');
        showToast('CV loaded successfully from share link!');
      }
    } catch (e) {
      console.error('Failed to parse share URL', e);
    }
  }
}

// Global Event Binding
function bindEvents() {
  // Mobile Header Navigation Menu Toggle
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileNavToggle.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }

  // Navigation Links
  document.querySelectorAll('[data-target-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-target-view');
      switchView(target);
      if (navMenu) navMenu.classList.remove('active');
    });
  });

  // Template select cards on Homepage
  document.querySelectorAll('.template-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tpl = btn.getAttribute('data-template');
      state.currentCv.template = tpl;
      switchView('editor');
      document.getElementById('template-select').value = tpl;
      updateLivePreview();
    });
  });

  // Editor Toolbar Controls
  const docTitleInput = document.getElementById('doc-title');
  if (docTitleInput) {
    docTitleInput.value = state.currentCv.title || 'My CV';
    docTitleInput.addEventListener('input', (e) => {
      state.currentCv.title = e.target.value;
      saveToLocalStorage();
    });
  }

  const tplSelect = document.getElementById('template-select');
  if (tplSelect) {
    tplSelect.value = state.currentCv.template;
    tplSelect.addEventListener('change', (e) => {
      state.currentCv.template = e.target.value;
      saveToLocalStorage();
      updateLivePreview();
    });
  }

  const fontSelect = document.getElementById('font-select');
  if (fontSelect) {
    fontSelect.value = state.currentCv.fontFamily || "'Inter', sans-serif";
    fontSelect.addEventListener('change', (e) => {
      state.currentCv.fontFamily = e.target.value;
      saveToLocalStorage();
      updateLivePreview();
    });
  }

  // Color Palette Swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      state.currentCv.colorTheme = color;
      saveToLocalStorage();
      updateLivePreview();
    });
  });

  // Form Section Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      state.currentTab = tabId;
      const targetSec = document.getElementById(`sec-${tabId}`);
      if (targetSec) targetSec.classList.add('active');
    });
  });

  // Zoom Controls
  document.getElementById('zoom-in')?.addEventListener('click', () => adjustZoom(10));
  document.getElementById('zoom-out')?.addEventListener('click', () => adjustZoom(-10));
  document.getElementById('zoom-reset')?.addEventListener('click', () => resetZoom());

  // Action Buttons
  document.getElementById('btn-load-sample')?.addEventListener('click', () => {
    if (confirm('Load sample CV data? This will overwrite your current draft.')) {
      state.currentCv = JSON.parse(JSON.stringify(SAMPLE_CV_DATA));
      state.currentCv.id = 'cv-' + Date.now();
      renderForm();
      updateLivePreview();
      saveToLocalStorage();
      showToast('Sample data loaded!');
    }
  });

  document.getElementById('btn-clear-data')?.addEventListener('click', () => {
    if (confirm('Clear all form fields and start fresh?')) {
      state.currentCv = {
        id: 'cv-' + Date.now(),
        title: 'Untitled CV',
        updatedAt: new Date().toLocaleDateString('en-US'),
        template: state.currentCv.template || 'minimal',
        colorTheme: state.currentCv.colorTheme || '#2563eb',
        fontFamily: "'Inter', sans-serif",
        personal: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '', photo: '' },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: []
      };
      renderForm();
      updateLivePreview();
      saveToLocalStorage();
      showToast('Form cleared!');
    }
  });

  // Export & Download Modals
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-docx')?.addEventListener('click', exportDOCX);
  document.getElementById('btn-share-link')?.addEventListener('click', openShareModal);

  // Create New CV button in Dashboard
  document.getElementById('btn-create-new-cv')?.addEventListener('click', createNewCv);

  // Mobile Panel Toggle
  document.getElementById('btn-mobile-form')?.addEventListener('click', () => {
    document.querySelector('.form-panel')?.classList.remove('mobile-hidden');
    document.querySelector('.preview-panel')?.classList.add('mobile-hidden');
    document.getElementById('btn-mobile-form')?.classList.add('active');
    document.getElementById('btn-mobile-preview')?.classList.remove('active');
  });

  document.getElementById('btn-mobile-preview')?.addEventListener('click', () => {
    document.querySelector('.form-panel')?.classList.add('mobile-hidden');
    document.querySelector('.preview-panel')?.classList.remove('mobile-hidden');
    document.getElementById('btn-mobile-preview')?.classList.add('active');
    document.getElementById('btn-mobile-form')?.classList.remove('active');
    autoFitMobilePreview();
  });

  // Window Resize Listener
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      document.querySelector('.form-panel')?.classList.remove('mobile-hidden');
      document.querySelector('.preview-panel')?.classList.remove('mobile-hidden');
      if (navMenu) navMenu.classList.remove('active');
    } else if (state.activeView === 'editor') {
      const previewPanel = document.querySelector('.preview-panel');
      if (previewPanel && !previewPanel.classList.contains('mobile-hidden')) {
        autoFitMobilePreview();
      }
    }
  });
}

// View Switcher
function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewName}`);
  if (viewEl) viewEl.classList.add('active');

  const navEl = document.querySelector(`.nav-link[data-target-view="${viewName}"]`);
  if (navEl) navEl.classList.add('active');

  // Handle Mobile Editor Panel view defaults
  if (viewName === 'editor' && window.innerWidth <= 768) {
    const formPanel = document.querySelector('.form-panel');
    const previewPanel = document.querySelector('.preview-panel');
    const btnForm = document.getElementById('btn-mobile-form');
    const btnPreview = document.getElementById('btn-mobile-preview');
    if (formPanel && previewPanel) {
      formPanel.classList.remove('mobile-hidden');
      previewPanel.classList.add('mobile-hidden');
      btnForm?.classList.add('active');
      btnPreview?.classList.remove('active');
    }
  }

  if (viewName === 'dashboard') {
    renderSavedCvsDashboard();
  }
}

// Auto-fit A4 paper canvas inside mobile viewport
function autoFitMobilePreview() {
  if (window.innerWidth <= 768) {
    const wrapper = document.querySelector('.preview-scroll-wrapper');
    const scaler = document.getElementById('paper-scaler');
    const label = document.getElementById('zoom-value');
    if (wrapper && scaler) {
      const wrapperWidth = wrapper.clientWidth - 24; // 12px padding margin
      const paperWidth = 794; // ~210mm width in pixels at standard 96dpi
      if (wrapperWidth > 0 && wrapperWidth < paperWidth) {
        const scaleRatio = Math.max(35, Math.min(100, Math.floor((wrapperWidth / paperWidth) * 100)));
        state.zoomLevel = scaleRatio;
        scaler.style.transform = `scale(${state.zoomLevel / 100})`;
        if (label) label.textContent = `${state.zoomLevel}%`;
      }
    }
  }
}

// Zoom Functions
function adjustZoom(delta) {
  state.zoomLevel = Math.min(150, Math.max(50, state.zoomLevel + delta));
  const scaler = document.getElementById('paper-scaler');
  const label = document.getElementById('zoom-value');
  if (scaler) scaler.style.transform = `scale(${state.zoomLevel / 100})`;
  if (label) label.textContent = `${state.zoomLevel}%`;
}

function resetZoom() {
  state.zoomLevel = 100;
  adjustZoom(0);
}

// Dynamic Form Renderer
function renderForm() {
  const p = state.currentCv.personal || {};
  document.getElementById('input-fullname').value = p.fullName || '';
  document.getElementById('input-jobtitle').value = p.jobTitle || '';
  document.getElementById('input-email').value = p.email || '';
  document.getElementById('input-phone').value = p.phone || '';
  document.getElementById('input-location').value = p.location || '';
  document.getElementById('input-website').value = p.website || '';
  document.getElementById('input-linkedin').value = p.linkedin || '';

  const photoPreview = document.getElementById('photo-preview-img');
  if (p.photo) {
    photoPreview.src = p.photo;
    photoPreview.style.display = 'block';
  } else {
    photoPreview.style.display = 'none';
  }

  // Summary
  document.getElementById('input-summary').value = state.currentCv.summary || '';

  // Render Dynamic Items Lists
  renderExperienceList();
  renderEducationList();
  renderSkillsList();
  renderProjectsList();
  renderCertificationsList();

  // Attach Input Listeners for Personal & Summary
  document.querySelectorAll('.personal-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const field = e.target.getAttribute('data-field');
      state.currentCv.personal[field] = e.target.value;
      saveToLocalStorage();
      updateLivePreview();
    });
  });

  const photoInput = document.getElementById('input-photo');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          state.currentCv.personal.photo = evt.target.result;
          document.getElementById('photo-preview-img').src = evt.target.result;
          document.getElementById('photo-preview-img').style.display = 'block';
          saveToLocalStorage();
          updateLivePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  document.getElementById('input-summary').addEventListener('input', (e) => {
    state.currentCv.summary = e.target.value;
    saveToLocalStorage();
    updateLivePreview();
  });
}

/* Dynamic Item Rendering & Logic */

// Experience
function renderExperienceList() {
  const container = document.getElementById('exp-list-container');
  if (!container) return;
  container.innerHTML = '';

  (state.currentCv.experience || []).forEach((exp, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${exp.jobTitle || 'Job Role'} ${exp.company ? 'at ' + exp.company : ''}</span>
        <div class="item-card-actions">
          <button class="btn-icon danger" onclick="removeExperience('${exp.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Job Title</label>
          <input type="text" class="form-control" value="${exp.jobTitle || ''}" oninput="updateExpField('${exp.id}', 'jobTitle', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Company</label>
          <input type="text" class="form-control" value="${exp.company || ''}" oninput="updateExpField('${exp.id}', 'company', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="text" class="form-control" placeholder="e.g. Jan 2020" value="${exp.startDate || ''}" oninput="updateExpField('${exp.id}', 'startDate', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="text" class="form-control" placeholder="e.g. Present" value="${exp.endDate || ''}" oninput="updateExpField('${exp.id}', 'endDate', this.value)">
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Key Responsibilities & Accomplishments</label>
          <textarea class="form-control" placeholder="• Led team of engineers...\n• Increased conversion by 20%..." oninput="updateExpField('${exp.id}', 'description', this.value)">${exp.description || ''}</textarea>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  lucide.createIcons();
}

function addExperience() {
  if (!state.currentCv.experience) state.currentCv.experience = [];
  state.currentCv.experience.push({
    id: 'exp-' + Date.now(),
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: 'Present',
    description: ''
  });
  renderExperienceList();
  saveToLocalStorage();
  updateLivePreview();
}

function updateExpField(id, field, value) {
  const item = state.currentCv.experience.find(e => e.id === id);
  if (item) {
    item[field] = value;
    saveToLocalStorage();
    updateLivePreview();
  }
}

function removeExperience(id) {
  state.currentCv.experience = state.currentCv.experience.filter(e => e.id !== id);
  renderExperienceList();
  saveToLocalStorage();
  updateLivePreview();
}

// Education
function renderEducationList() {
  const container = document.getElementById('edu-list-container');
  if (!container) return;
  container.innerHTML = '';

  (state.currentCv.education || []).forEach((edu) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${edu.degree || 'Degree'} ${edu.school ? 'at ' + edu.school : ''}</span>
        <div class="item-card-actions">
          <button class="btn-icon danger" onclick="removeEducation('${edu.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Degree / Field of Study</label>
          <input type="text" class="form-control" value="${edu.degree || ''}" oninput="updateEduField('${edu.id}', 'degree', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">School / University</label>
          <input type="text" class="form-control" value="${edu.school || ''}" oninput="updateEduField('${edu.id}', 'school', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="text" class="form-control" value="${edu.startDate || ''}" oninput="updateEduField('${edu.id}', 'startDate', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="text" class="form-control" value="${edu.endDate || ''}" oninput="updateEduField('${edu.id}', 'endDate', this.value)">
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function addEducation() {
  if (!state.currentCv.education) state.currentCv.education = [];
  state.currentCv.education.push({
    id: 'edu-' + Date.now(),
    degree: '',
    school: '',
    startDate: '',
    endDate: ''
  });
  renderEducationList();
  saveToLocalStorage();
  updateLivePreview();
}

function updateEduField(id, field, value) {
  const item = state.currentCv.education.find(e => e.id === id);
  if (item) {
    item[field] = value;
    saveToLocalStorage();
    updateLivePreview();
  }
}

function removeEducation(id) {
  state.currentCv.education = state.currentCv.education.filter(e => e.id !== id);
  renderEducationList();
  saveToLocalStorage();
  updateLivePreview();
}

// Skills
function renderSkillsList() {
  const container = document.getElementById('skills-list-container');
  if (!container) return;
  container.innerHTML = '';

  (state.currentCv.skills || []).forEach((sk) => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.gap = '0.5rem';
    card.style.marginBottom = '0.5rem';
    card.innerHTML = `
      <input type="text" class="form-control" placeholder="Skill (e.g. JavaScript)" value="${sk.name || ''}" oninput="updateSkill('${sk.id}', this.value)">
      <button class="btn-icon danger" onclick="removeSkill('${sk.id}')"><i data-lucide="trash-2"></i></button>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function addSkill() {
  if (!state.currentCv.skills) state.currentCv.skills = [];
  state.currentCv.skills.push({ id: 'sk-' + Date.now(), name: '' });
  renderSkillsList();
  saveToLocalStorage();
  updateLivePreview();
}

function updateSkill(id, value) {
  const item = state.currentCv.skills.find(s => s.id === id);
  if (item) {
    item.name = value;
    saveToLocalStorage();
    updateLivePreview();
  }
}

function removeSkill(id) {
  state.currentCv.skills = state.currentCv.skills.filter(s => s.id !== id);
  renderSkillsList();
  saveToLocalStorage();
  updateLivePreview();
}

// Projects
function renderProjectsList() {
  const container = document.getElementById('projects-list-container');
  if (!container) return;
  container.innerHTML = '';

  (state.currentCv.projects || []).forEach((p) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${p.title || 'Project Title'}</span>
        <button class="btn-icon danger" onclick="removeProject('${p.id}')"><i data-lucide="trash-2"></i></button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Project Title</label>
          <input type="text" class="form-control" value="${p.title || ''}" oninput="updateProject('${p.id}', 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Tools / Tech Stack</label>
          <input type="text" class="form-control" placeholder="e.g. React, Node.js" value="${p.tools || ''}" oninput="updateProject('${p.id}', 'tools', this.value)">
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Description & Achievements</label>
          <textarea class="form-control" oninput="updateProject('${p.id}', 'description', this.value)">${p.description || ''}</textarea>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function addProject() {
  if (!state.currentCv.projects) state.currentCv.projects = [];
  state.currentCv.projects.push({ id: 'proj-' + Date.now(), title: '', tools: '', description: '' });
  renderProjectsList();
  saveToLocalStorage();
  updateLivePreview();
}

function updateProject(id, field, value) {
  const p = state.currentCv.projects.find(x => x.id === id);
  if (p) {
    p[field] = value;
    saveToLocalStorage();
    updateLivePreview();
  }
}

function removeProject(id) {
  state.currentCv.projects = state.currentCv.projects.filter(x => x.id !== id);
  renderProjectsList();
  saveToLocalStorage();
  updateLivePreview();
}

// Certifications
function renderCertificationsList() {
  const container = document.getElementById('cert-list-container');
  if (!container) return;
  container.innerHTML = '';

  (state.currentCv.certifications || []).forEach((c) => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.gap = '0.5rem';
    card.style.marginBottom = '0.5rem';
    card.innerHTML = `
      <input type="text" class="form-control" placeholder="Certification Name" value="${c.name || ''}" oninput="updateCert('${c.id}', 'name', this.value)">
      <input type="text" class="form-control" placeholder="Issuer / Year" value="${c.issuer || ''}" oninput="updateCert('${c.id}', 'issuer', this.value)">
      <button class="btn-icon danger" onclick="removeCert('${c.id}')"><i data-lucide="trash-2"></i></button>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

function addCertification() {
  if (!state.currentCv.certifications) state.currentCv.certifications = [];
  state.currentCv.certifications.push({ id: 'cert-' + Date.now(), name: '', issuer: '' });
  renderCertificationsList();
  saveToLocalStorage();
  updateLivePreview();
}

function updateCert(id, field, value) {
  const c = state.currentCv.certifications.find(x => x.id === id);
  if (c) {
    c[field] = value;
    saveToLocalStorage();
    updateLivePreview();
  }
}

function removeCert(id) {
  state.currentCv.certifications = state.currentCv.certifications.filter(x => x.id !== id);
  renderCertificationsList();
  saveToLocalStorage();
  updateLivePreview();
}

/* ==================== TEMPLATE LIVE PREVIEW ENGINE ==================== */
function updateLivePreview() {
  const paper = document.getElementById('cv-paper');
  if (!paper) return;

  const cv = state.currentCv;
  const p = cv.personal || {};
  const themeColor = cv.colorTheme || '#2563eb';
  const fontFamily = cv.fontFamily || "'Inter', sans-serif";
  const tpl = cv.template || 'professional';

  paper.style.setProperty('--cv-primary', themeColor);
  paper.style.setProperty('--cv-font', fontFamily);
  paper.className = `cv-paper template-${tpl}`;

  // Helper formatting for bullet descriptions
  const formatDesc = (text) => {
    if (!text) return '';
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 1 || lines[0].trim().startsWith('•') || lines[0].trim().startsWith('-')) {
      return `<ul class="cv-bullet-list">${lines.map(l => `<li>${l.replace(/^[•\-]\s*/, '')}</li>`).join('')}</ul>`;
    }
    return `<div class="cv-desc">${text}</div>`;
  };

  // Build HTML based on template style
  let html = '';

  if (tpl === 'minimal') {
    html = `
      <div class="cv-header">
        <div>
          <h1 class="cv-name">${p.fullName || 'Your Name'}</h1>
          <div class="cv-job-title">${p.jobTitle || 'Job Title'}</div>
        </div>
        <div class="cv-contact-list">
          ${p.email ? `<span>${p.email}</span>` : ''}
          ${p.phone ? `<span>${p.phone}</span>` : ''}
          ${p.location ? `<span>${p.location}</span>` : ''}
          ${p.website ? `<span>${p.website}</span>` : ''}
        </div>
      </div>

      ${cv.summary ? `
        <div class="cv-section">
          <div class="cv-section-title">Professional Summary</div>
          <div class="cv-desc">${cv.summary}</div>
        </div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        <div class="cv-section">
          <div class="cv-section-title">Work Experience</div>
          ${cv.experience.map(exp => `
            <div class="cv-item">
              <div class="cv-item-header">
                <div>
                  <span class="cv-item-title">${exp.jobTitle || ''}</span>
                  ${exp.company ? `<span class="cv-item-subtitle"> — ${exp.company}</span>` : ''}
                </div>
                <div class="cv-item-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''}</div>
              </div>
              ${formatDesc(exp.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${(cv.education && cv.education.length) ? `
        <div class="cv-section">
          <div class="cv-section-title">Education</div>
          ${cv.education.map(edu => `
            <div class="cv-item">
              <div class="cv-item-header">
                <div>
                  <span class="cv-item-title">${edu.degree || ''}</span>
                  ${edu.school ? `<span class="cv-item-subtitle">, ${edu.school}</span>` : ''}
                </div>
                <div class="cv-item-date">${edu.startDate || ''} ${edu.endDate ? '- ' + edu.endDate : ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${(cv.skills && cv.skills.length) ? `
        <div class="cv-section">
          <div class="cv-section-title">Skills</div>
          <div class="cv-skills-flex">
            ${cv.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${(cv.projects && cv.projects.length) ? `
        <div class="cv-section">
          <div class="cv-section-title">Key Projects</div>
          ${cv.projects.map(pj => `
            <div class="cv-item">
              <div class="cv-item-header">
                <span class="cv-item-title">${pj.title}</span>
                <span class="cv-item-subtitle">${pj.tools || ''}</span>
              </div>
              ${formatDesc(pj.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } else if (tpl === 'professional') {
    html = `
      <div class="cv-sidebar">
        ${p.photo ? `<div class="cv-avatar-box"><img src="${p.photo}"></div>` : ''}
        
        <div class="sidebar-section">
          <div class="sidebar-title">Contact</div>
          ${p.email ? `<div class="sidebar-contact-item">✉ ${p.email}</div>` : ''}
          ${p.phone ? `<div class="sidebar-contact-item">📞 ${p.phone}</div>` : ''}
          ${p.location ? `<div class="sidebar-contact-item">📍 ${p.location}</div>` : ''}
          ${p.website ? `<div class="sidebar-contact-item">🌐 ${p.website}</div>` : ''}
          ${p.linkedin ? `<div class="sidebar-contact-item">💼 ${p.linkedin}</div>` : ''}
        </div>

        ${(cv.skills && cv.skills.length) ? `
          <div class="sidebar-section">
            <div class="sidebar-title">Skills</div>
            ${cv.skills.map(s => `<span class="sidebar-skill-pill">${s.name}</span>`).join('')}
          </div>
        ` : ''}

        ${(cv.certifications && cv.certifications.length) ? `
          <div class="sidebar-section">
            <div class="sidebar-title">Certifications</div>
            ${cv.certifications.map(c => `
              <div class="sidebar-contact-item"><strong>${c.name}</strong><br>${c.issuer || ''}</div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="cv-main">
        <div class="cv-main-header">
          <h1 class="cv-main-name">${p.fullName || 'Your Name'}</h1>
          <div class="cv-main-role">${p.jobTitle || 'Job Role'}</div>
        </div>

        ${cv.summary ? `
          <div class="main-section">
            <div class="main-section-title">Profile Summary</div>
            <div class="cv-desc">${cv.summary}</div>
          </div>
        ` : ''}

        ${(cv.experience && cv.experience.length) ? `
          <div class="main-section">
            <div class="main-section-title">Experience</div>
            ${cv.experience.map(exp => `
              <div class="cv-item">
                <div class="cv-item-header">
                  <div>
                    <span class="cv-item-title">${exp.jobTitle || ''}</span>
                    <span class="cv-item-subtitle"> | ${exp.company || ''}</span>
                  </div>
                  <div class="cv-item-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''}</div>
                </div>
                ${formatDesc(exp.description)}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(cv.education && cv.education.length) ? `
          <div class="main-section">
            <div class="main-section-title">Education</div>
            ${cv.education.map(edu => `
              <div class="cv-item">
                <div class="cv-item-header">
                  <div>
                    <span class="cv-item-title">${edu.degree || ''}</span>
                    <span class="cv-item-subtitle">, ${edu.school || ''}</span>
                  </div>
                  <div class="cv-item-date">${edu.startDate || ''} ${edu.endDate ? '- ' + edu.endDate : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(cv.projects && cv.projects.length) ? `
          <div class="main-section">
            <div class="main-section-title">Projects</div>
            ${cv.projects.map(pj => `
              <div class="cv-item">
                <div class="cv-item-header">
                  <span class="cv-item-title">${pj.title}</span>
                  <span class="cv-item-subtitle">${pj.tools || ''}</span>
                </div>
                ${formatDesc(pj.description)}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  } else if (tpl === 'creative') {
    html = `
      <div class="creative-header">
        <div>
          <h1 class="creative-name">${p.fullName || 'Your Name'}</h1>
          <div class="creative-role">${p.jobTitle || 'Job Title'}</div>
        </div>
        <div class="creative-contacts">
          ${p.email ? `<div>${p.email}</div>` : ''}
          ${p.phone ? `<div>${p.phone}</div>` : ''}
          ${p.location ? `<div>${p.location}</div>` : ''}
          ${p.website ? `<div>${p.website}</div>` : ''}
        </div>
      </div>
      <div class="creative-body">
        ${cv.summary ? `
          <div class="cv-section">
            <div class="creative-section-title">About Me</div>
            <div class="cv-desc">${cv.summary}</div>
          </div>
        ` : ''}

        ${(cv.experience && cv.experience.length) ? `
          <div class="cv-section">
            <div class="creative-section-title">Work Experience</div>
            ${cv.experience.map(exp => `
              <div class="creative-entry">
                <div class="cv-item-header">
                  <span class="cv-item-title">${exp.jobTitle || ''} @ ${exp.company || ''}</span>
                  <span class="cv-item-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''}</span>
                </div>
                ${formatDesc(exp.description)}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(cv.education && cv.education.length) ? `
          <div class="cv-section">
            <div class="creative-section-title">Education</div>
            ${cv.education.map(edu => `
              <div class="creative-entry">
                <div class="cv-item-header">
                  <span class="cv-item-title">${edu.degree || ''}</span>
                  <span class="cv-item-date">${edu.startDate || ''} ${edu.endDate ? '- ' + edu.endDate : ''}</span>
                </div>
                <div class="cv-item-subtitle">${edu.school || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(cv.skills && cv.skills.length) ? `
          <div class="cv-section">
            <div class="creative-section-title">Skills & Expertise</div>
            <div class="template-minimal .cv-skills-flex" style="display:flex; flex-wrap:wrap; gap:6px;">
              ${cv.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else if (tpl === 'tech') {
    html = `
      <div class="tech-header">
        <h1 class="tech-name">${p.fullName || 'Your Name'}</h1>
        <div class="tech-role">${p.jobTitle || 'Full Stack Engineer'}</div>
        <div style="font-size:11px; color:#475569; margin-top:8px;">
          ${[p.email, p.phone, p.location, p.website, p.linkedin].filter(Boolean).join(' | ')}
        </div>
      </div>

      ${cv.summary ? `
        <div class="cv-section">
          <div class="tech-section-title">// SUMMARY</div>
          <div class="cv-desc">${cv.summary}</div>
        </div>
      ` : ''}

      ${(cv.skills && cv.skills.length) ? `
        <div class="cv-section">
          <div class="tech-section-title">// TECHNICAL SKILLS</div>
          <div>
            ${cv.skills.map(s => `<span class="tech-badge">${s.name}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        <div class="cv-section">
          <div class="tech-section-title">// EXPERIENCE HISTORY</div>
          ${cv.experience.map(exp => `
            <div class="cv-item" style="margin-bottom:14px;">
              <div class="cv-item-header">
                <span class="cv-item-title">${exp.jobTitle} @ ${exp.company}</span>
                <span class="cv-item-date">${exp.startDate} - ${exp.endDate}</span>
              </div>
              ${formatDesc(exp.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${(cv.projects && cv.projects.length) ? `
        <div class="cv-section">
          <div class="tech-section-title">// FEATURED PROJECTS</div>
          ${cv.projects.map(pj => `
            <div class="cv-item">
              <div class="cv-item-header">
                <span class="cv-item-title">${pj.title}</span>
                <span class="tech-badge">${pj.tools}</span>
              </div>
              ${formatDesc(pj.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } else if (tpl === 'student') {
    html = `
      <div class="student-header">
        <h1 class="student-name">${p.fullName || 'Your Name'}</h1>
        <div style="font-weight:600; color:#475569;">${p.jobTitle || 'Student / Graduate'}</div>
        <div class="student-contacts">
          ${[p.email, p.phone, p.location, p.website].filter(Boolean).map(x => `<span>${x}</span>`).join(' • ')}
        </div>
      </div>

      ${(cv.education && cv.education.length) ? `
        <div class="cv-section">
          <div class="student-section-title">Education</div>
          ${cv.education.map(edu => `
            <div class="cv-item">
              <div class="cv-item-header">
                <span class="cv-item-title">${edu.degree}</span>
                <span class="cv-item-date">${edu.startDate} - ${edu.endDate}</span>
              </div>
              <div class="cv-item-subtitle">${edu.school}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${(cv.skills && cv.skills.length) ? `
        <div class="cv-section">
          <div class="student-section-title">Key Competencies</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${cv.skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        <div class="cv-section">
          <div class="student-section-title">Experience & Internships</div>
          ${cv.experience.map(exp => `
            <div class="cv-item">
              <div class="cv-item-header">
                <span class="cv-item-title">${exp.jobTitle} — ${exp.company}</span>
                <span class="cv-item-date">${exp.startDate} - ${exp.endDate}</span>
              </div>
              ${formatDesc(exp.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  } else if (tpl === 'executive') {
    html = `
      <div class="exec-header">
        <h1 class="exec-name">${p.fullName || 'YOUR NAME'}</h1>
        <div class="exec-title">${p.jobTitle || 'EXECUTIVE LEADER'}</div>
        <div style="font-size:11px; font-family:sans-serif; color:#475569; margin-top:8px;">
          ${[p.email, p.phone, p.location, p.linkedin].filter(Boolean).join('  |  ')}
        </div>
        <div class="exec-divider"></div>
      </div>

      ${cv.summary ? `
        <div class="cv-section">
          <div class="exec-section-title">Executive Summary</div>
          <div class="cv-desc" style="font-style:italic;">${cv.summary}</div>
        </div>
      ` : ''}

      ${(cv.experience && cv.experience.length) ? `
        <div class="cv-section">
          <div class="exec-section-title">Professional Experience</div>
          ${cv.experience.map(exp => `
            <div class="cv-item" style="margin-bottom:16px;">
              <div class="cv-item-header">
                <span class="cv-item-title" style="font-weight:700;">${exp.jobTitle}</span>
                <span class="cv-item-date" style="font-family:sans-serif;">${exp.startDate} – ${exp.endDate}</span>
              </div>
              <div class="cv-item-subtitle" style="font-weight:600; font-family:sans-serif; margin-bottom:4px;">${exp.company}</div>
              ${formatDesc(exp.description)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${(cv.education && cv.education.length) ? `
        <div class="cv-section">
          <div class="exec-section-title">Education & Credentials</div>
          ${cv.education.map(edu => `
            <div class="cv-item">
              <div class="cv-item-header">
                <span class="cv-item-title">${edu.degree}</span>
                <span class="cv-item-date" style="font-family:sans-serif;">${edu.startDate} – ${edu.endDate}</span>
              </div>
              <div class="cv-item-subtitle">${edu.school}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;
  }

  paper.innerHTML = html;
}

/* Dashboard Saved CVs Grid */
function renderSavedCvsDashboard() {
  const container = document.getElementById('saved-cvs-grid');
  if (!container) return;

  if (!state.savedCvs || state.savedCvs.length === 0) {
    container.innerHTML = `
      <div class="create-cv-card" id="btn-create-new-cv">
        <div class="create-cv-icon"><i data-lucide="plus"></i></div>
        <div style="font-weight:700;">Create New CV</div>
        <div style="font-size:0.8125rem; color:var(--text-muted);">Start building your job-winning resume</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let html = `
    <div class="create-cv-card" onclick="createNewCv()">
      <div class="create-cv-icon"><i data-lucide="plus"></i></div>
      <div style="font-weight:700;">Create New CV</div>
      <div style="font-size:0.8125rem; color:var(--text-muted);">Start from scratch or pick template</div>
    </div>
  `;

  state.savedCvs.forEach(cv => {
    html += `
      <div class="cv-card">
        <div class="cv-card-header">
          <div>
            <div class="cv-card-title">${cv.title || 'Untitled CV'}</div>
            <div class="cv-card-subtitle">${cv.personal?.jobTitle || 'Resume'}</div>
          </div>
          <span class="cv-meta-pill" style="text-transform:capitalize;">${cv.template || 'minimal'}</span>
        </div>
        <div class="cv-card-meta">
          <span class="cv-meta-pill">📅 ${cv.updatedAt || 'Recent'}</span>
        </div>
        <div class="cv-card-actions">
          <button class="btn btn-outline btn-sm" onclick="editCv('${cv.id}')"><i data-lucide="edit-3"></i> Edit</button>
          <button class="btn btn-outline btn-sm" onclick="duplicateCv('${cv.id}')" title="Duplicate"><i data-lucide="copy"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteCv('${cv.id}')" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function createNewCv() {
  const newCv = JSON.parse(JSON.stringify(SAMPLE_CV_DATA));
  newCv.id = 'cv-' + Date.now();
  newCv.title = 'My New CV';
  newCv.updatedAt = new Date().toLocaleDateString('en-US');

  state.savedCvs.unshift(newCv);
  state.currentCv = newCv;
  saveToLocalStorage();

  switchView('editor');
  renderForm();
  updateLivePreview();
  showToast('New CV created!');
}

function editCv(id) {
  const target = state.savedCvs.find(c => c.id === id);
  if (target) {
    state.currentCv = JSON.parse(JSON.stringify(target));
    switchView('editor');
    renderForm();
    updateLivePreview();
  }
}

function duplicateCv(id) {
  const target = state.savedCvs.find(c => c.id === id);
  if (target) {
    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = 'cv-' + Date.now();
    cloned.title = (cloned.title || 'CV') + ' (Copy)';
    cloned.updatedAt = new Date().toLocaleDateString('en-US');
    state.savedCvs.unshift(cloned);
    saveToLocalStorage();
    renderSavedCvsDashboard();
    showToast('CV duplicated!');
  }
}

function deleteCv(id) {
  if (confirm('Are you sure you want to delete this CV?')) {
    state.savedCvs = state.savedCvs.filter(c => c.id !== id);
    saveToLocalStorage();
    renderSavedCvsDashboard();
    showToast('CV deleted');
  }
}

/* ==================== EXPORT SYSTEM ==================== */

// 1. PDF Export
function exportPDF() {
  const paper = document.getElementById('cv-paper');
  if (!paper) return;

  showToast('Generating crisp PDF...');

  // Reset zoom scale temporarily for accurate html2pdf render
  const scaler = document.getElementById('paper-scaler');
  const prevTransform = scaler ? scaler.style.transform : '';
  if (scaler) scaler.style.transform = 'scale(1)';

  const opt = {
    margin: 0,
    filename: `${(state.currentCv.personal?.fullName || 'CV').replace(/\s+/g, '_')}_Resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (window.html2pdf) {
    html2pdf().set(opt).from(paper).save().then(() => {
      if (scaler) scaler.style.transform = prevTransform;
      showToast('PDF downloaded successfully!');
    }).catch(err => {
      console.error(err);
      window.print();
    });
  } else {
    window.print();
  }
}

// 2. Word DOCX Export
function exportDOCX() {
  const paper = document.getElementById('cv-paper');
  if (!paper) return;

  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:w='urn:schemas-microsoft-com:office:word' " +
    "xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>Resume</title><style>" +
    "body{font-family:Arial,sans-serif; margin:20px;} h1{color:#2563eb;}" +
    "</style></head><body>";
  const footer = "</body></html>";
  const sourceHTML = header + paper.innerHTML + footer;

  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(state.currentCv.personal?.fullName || 'CV').replace(/\s+/g, '_')}_Resume.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Word document downloaded!');
}

// 3. Shareable Link Modal
function openShareModal() {
  const jsonStr = JSON.stringify(state.currentCv);
  const encoded = btoa(jsonStr);
  const shareUrl = `${window.location.origin}${window.location.pathname}#cv=${encoded}`;

  const modal = document.getElementById('share-modal');
  const input = document.getElementById('share-url-input');
  if (modal && input) {
    input.value = shareUrl;
    modal.classList.add('active');
  }
}

function copyShareUrl() {
  const input = document.getElementById('share-url-input');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value);
    showToast('Link copied to clipboard!');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Toast Notification
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #0f172a;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 9999;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(10px);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}
