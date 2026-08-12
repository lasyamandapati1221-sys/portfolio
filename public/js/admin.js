const state = {
  data: null,
  section: 'dashboard',
  unsaved: false,
};

const sections = {
  dashboard: document.getElementById('dashboard-panel'),
  personal: document.getElementById('personal-section'),
  about: document.getElementById('about-section'),
  statistics: document.getElementById('statistics-section'),
  skills: document.getElementById('skills-section'),
  experience: document.getElementById('experience-section'),
  training: document.getElementById('training-section'),
  projects: document.getElementById('projects-section'),
  certifications: document.getElementById('certifications-section'),
  education: document.getElementById('education-section'),
  social: document.getElementById('social-section'),
  settings: document.getElementById('settings-section'),
};

function showSection(name) {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.section === name));
  document.getElementById('section-title').textContent = name.charAt(0).toUpperCase() + name.slice(1);
  Object.entries(sections).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('hidden', key !== name);
  });
  state.section = name;
}

function showMessage(text, isError = false) {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function markUnsaved(value) {
  state.unsaved = value;
}

window.addEventListener('beforeunload', event => {
  if (state.unsaved) {
    event.preventDefault();
    event.returnValue = '';
  }
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  return response.json();
}

async function loadStatus() {
  const status = await requestJson('/api/auth/status');
  return status.authenticated;
}

function bindSectionButtons() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (!btn.dataset.section) return;
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });
  document.getElementById('logout-button').addEventListener('click', async () => {
    await requestJson('/api/auth/logout', { method: 'POST' });
    window.location.reload();
  });
}

function mapForm(form) {
  const data = {};
  const elements = Array.from(form.elements).filter(el => el.name);
  elements.forEach(el => {
    if (el.type === 'checkbox') {
      data[el.name] = el.checked;
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

function setFormValues(form, values) {
  if (!form) return;
  Object.entries(values).forEach(([key, value]) => {
    const el = form.elements.namedItem(key);
    if (el) {
      if (el.type === 'checkbox') {
        el.checked = Boolean(value);
      } else {
        el.value = value || '';
      }
    }
  });
}

function createListItem(fields, values, onRemove) {
  const item = document.createElement('div');
  item.className = 'list-item';
  item.innerHTML = fields.map(field => {
    const value = values[field.name] || '';
    if (field.type === 'textarea') {
      return `<label>${field.label}<textarea name="${field.name}">${value}</textarea></label>`;
    }
    if (field.type === 'checkbox') {
      return `<label><input type="checkbox" name="${field.name}" ${value ? 'checked' : ''}/> ${field.label}</label>`;
    }
    return `<label>${field.label}<input type="text" name="${field.name}" value="${value}" /></label>`;
  }).join('');
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn-secondary small';
  removeButton.textContent = 'Delete';
  removeButton.addEventListener('click', () => onRemove(item));
  actions.appendChild(removeButton);
  item.appendChild(actions);
  return item;
}

function getListData(container, fields) {
  return Array.from(container.children).map(item => {
    const data = { id: item.dataset.id ? Number(item.dataset.id) : Date.now() + Math.random() };
    fields.forEach(field => {
      const input = item.querySelector(`[name="${field.name}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          data[field.name] = input.checked;
        } else {
          data[field.name] = input.value;
        }
      }
    });
    return data;
  });
}

function renderLists() {
  const statsList = document.getElementById('statistics-list');
  statsList.innerHTML = '';
  (state.data.statistics || []).forEach(stat => {
    const card = createListItem(
      [
        { name: 'label', label: 'Label' },
        { name: 'value', label: 'Value' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ],
      stat,
      item => item.remove()
    );
    statsList.appendChild(card);
  });

  const skillsEditor = document.getElementById('skills-editor');
  skillsEditor.innerHTML = '';
  Object.entries(state.data.skills || {}).forEach(([category, items]) => {
    const card = document.createElement('div');
    card.className = 'list-item';
    card.innerHTML = `
      <h3>${category}</h3>
      <label>Skills<textarea name="${category}">${(items || []).join(', ')}</textarea></label>
    `;
    skillsEditor.appendChild(card);
  });

  const experienceList = document.getElementById('experience-list');
  experienceList.innerHTML = '';
  (state.data.experience || []).forEach(item => {
    const card = createListItem(
      [
        { name: 'company', label: 'Company' },
        { name: 'role', label: 'Role' },
        { name: 'startDate', label: 'Start Date' },
        { name: 'endDate', label: 'End Date' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' }
      ],
      item,
      removeItem => removeItem.remove()
    );
    card.dataset.id = item.id || '';
    experienceList.appendChild(card);
  });

  const trainingList = document.getElementById('training-list');
  trainingList.innerHTML = '';
  (state.data.training || []).forEach(item => {
    const card = createListItem(
      [
        { name: 'title', label: 'Training Title' },
        { name: 'organization', label: 'Organization' },
        { name: 'duration', label: 'Duration' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' }
      ],
      item,
      removeItem => removeItem.remove()
    );
    card.dataset.id = item.id || '';
    trainingList.appendChild(card);
  });

  const projectsList = document.getElementById('projects-list');
  projectsList.innerHTML = '';
  (state.data.projects || []).forEach(item => {
    const card = createListItem(
      [
        { name: 'title', label: 'Title' },
        { name: 'projectNumber', label: 'Project Number' },
        { name: 'shortDescription', label: 'Short Description' },
        { name: 'description', label: 'Full Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' },
        { name: 'github', label: 'GitHub URL' },
        { name: 'liveDemo', label: 'Live Demo URL' },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        { name: 'image', label: 'Image Path' },
        { name: 'architecture', label: 'Architecture Description', type: 'textarea' }
      ],
      item,
      removeItem => removeItem.remove()
    );
    card.dataset.id = item.id || '';
    projectsList.appendChild(card);
  });

  const certificationsList = document.getElementById('certifications-list');
  certificationsList.innerHTML = '';
  (state.data.certifications || []).forEach(item => {
    const card = createListItem(
      [
        { name: 'name', label: 'Certification Name' },
        { name: 'issuer', label: 'Issuer' },
        { name: 'date', label: 'Date' },
        { name: 'credentialUrl', label: 'Credential URL' }
      ],
      item,
      removeItem => removeItem.remove()
    );
    card.dataset.id = item.id || '';
    certificationsList.appendChild(card);
  });

  const educationList = document.getElementById('education-list');
  educationList.innerHTML = '';
  (state.data.education || []).forEach(item => {
    const card = createListItem(
      [
        { name: 'degree', label: 'Degree' },
        { name: 'institution', label: 'Institution' },
        { name: 'startYear', label: 'Start Year' },
        { name: 'graduationYear', label: 'Graduation Year' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ],
      item,
      removeItem => removeItem.remove()
    );
    card.dataset.id = item.id || '';
    educationList.appendChild(card);
  });
}

function setDashboardSummary() {
  document.getElementById('admin-name').textContent = state.data.personal.name || 'Admin';
  document.getElementById('summary-projects').textContent = (state.data.projects || []).length;
  const skillCount = Object.values(state.data.skills || {}).reduce((sum, arr) => sum + (arr.length || 0), 0);
  document.getElementById('summary-skills').textContent = skillCount;
  document.getElementById('summary-certs').textContent = (state.data.certifications || []).length;
}

async function loadPortfolio() {
  const response = await fetch('/api/portfolio');
  if (!response.ok) {
    showMessage('Unable to load portfolio data', true);
    return;
  }
  state.data = await response.json();
  setFormValues(document.getElementById('personal-form'), state.data.personal);
  setFormValues(document.getElementById('about-form'), state.data.about);
  setFormValues(document.getElementById('social-form'), state.data.socialLinks);
  setFormValues(document.getElementById('settings-form'), state.data.settings);
  renderLists();
  setDashboardSummary();
}

function initializeEvents() {
  document.getElementById('login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = { username: formData.get('username'), password: formData.get('password') };
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById('login-panel').classList.add('hidden');
      document.getElementById('dashboard-panel').classList.remove('hidden');
      document.getElementById('editor-panel').classList.remove('hidden');
      await loadPortfolio();
      showSection('dashboard');
    } else {
      const msg = document.getElementById('login-message');
      msg.textContent = result.message;
      msg.classList.add('error');
    }
  });

  document.getElementById('save-personal').addEventListener('click', async () => {
    const payload = mapForm(document.getElementById('personal-form'));
    showMessage('Saving...');
    const response = await fetch('/api/portfolio/personal', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    showMessage(result.message, !result.success);
    if (result.success) {
      state.data.personal = payload;
      markUnsaved(false);
    }
  });

  document.getElementById('reset-personal').addEventListener('click', () => setFormValues(document.getElementById('personal-form'), state.data.personal));
  document.getElementById('upload-profile').addEventListener('click', async () => {
    const fileInput = document.getElementById('profile-upload');
    const file = fileInput.files[0];
    if (!file) {
      showMessage('Select a profile image first', true);
      return;
    }
    const formData = new FormData();
    formData.append('profile', file);
    const response = await fetch('/api/upload/profile', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      setFormValues(document.getElementById('personal-form'), { ...state.data.personal, profileImage: result.path });
      state.data.personal.profileImage = result.path;
      showMessage('Profile image uploaded successfully');
    } else {
      showMessage(result.message, true);
    }
  });
  document.getElementById('save-about').addEventListener('click', async () => {
    const payload = mapForm(document.getElementById('about-form'));
    showMessage('Saving...');
    const result = await requestJson('/api/portfolio/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });
  document.getElementById('reset-about').addEventListener('click', () => setFormValues(document.getElementById('about-form'), state.data.about));
  document.getElementById('add-statistic').addEventListener('click', () => {
    const list = document.getElementById('statistics-list');
    const card = createListItem(
      [
        { name: 'label', label: 'Label' },
        { name: 'value', label: 'Value' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ],
      { label: '', value: '', description: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-statistics').addEventListener('click', async () => {
    const payload = getListData(document.getElementById('statistics-list'), [
      { name: 'label' },
      { name: 'value' },
      { name: 'description' }
    ]);
    const result = await requestJson('/api/portfolio/statistics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('save-skills').addEventListener('click', async () => {
    const payload = {};
    document.querySelectorAll('#skills-editor textarea').forEach(el => {
      payload[el.name] = el.value.split(',').map(item => item.trim()).filter(Boolean);
    });
    const result = await requestJson('/api/portfolio/skills', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('add-experience').addEventListener('click', () => {
    const list = document.getElementById('experience-list');
    const card = createListItem(
      [
        { name: 'company', label: 'Company' },
        { name: 'role', label: 'Role' },
        { name: 'startDate', label: 'Start Date' },
        { name: 'endDate', label: 'End Date' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' }
      ],
      { company: '', role: '', startDate: '', endDate: '', description: '', technologies: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-experience').addEventListener('click', async () => {
    const raw = getListData(document.getElementById('experience-list'), [
      { name: 'company' },
      { name: 'role' },
      { name: 'startDate' },
      { name: 'endDate' },
      { name: 'description' },
      { name: 'technologies' }
    ]);
    const payload = raw.map(entry => ({
      ...entry,
      technologies: (entry.technologies || '').split(',').map(item => item.trim()).filter(Boolean)
    }));
    const result = await requestJson('/api/portfolio/experience', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('add-training').addEventListener('click', () => {
    const list = document.getElementById('training-list');
    const card = createListItem(
      [
        { name: 'title', label: 'Training Title' },
        { name: 'organization', label: 'Organization' },
        { name: 'duration', label: 'Duration' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' }
      ],
      { title: '', organization: '', duration: '', description: '', technologies: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-training').addEventListener('click', async () => {
    const raw = getListData(document.getElementById('training-list'), [
      { name: 'title' },
      { name: 'organization' },
      { name: 'duration' },
      { name: 'description' },
      { name: 'technologies' }
    ]);
    const payload = raw.map(entry => ({
      ...entry,
      technologies: (entry.technologies || '').split(',').map(item => item.trim()).filter(Boolean)
    }));
    const result = await requestJson('/api/portfolio/training', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('add-project').addEventListener('click', () => {
    const list = document.getElementById('projects-list');
    const card = createListItem(
      [
        { name: 'title', label: 'Title' },
        { name: 'projectNumber', label: 'Project Number' },
        { name: 'shortDescription', label: 'Short Description' },
        { name: 'description', label: 'Full Description', type: 'textarea' },
        { name: 'technologies', label: 'Technologies (comma separated)' },
        { name: 'github', label: 'GitHub URL' },
        { name: 'liveDemo', label: 'Live Demo URL' },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        { name: 'image', label: 'Image Path' },
        { name: 'architecture', label: 'Architecture Description', type: 'textarea' }
      ],
      { title: '', projectNumber: '', shortDescription: '', description: '', technologies: '', github: '', liveDemo: '', featured: false, image: '', architecture: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-projects').addEventListener('click', async () => {
    const raw = getListData(document.getElementById('projects-list'), [
      { name: 'title' },
      { name: 'projectNumber' },
      { name: 'shortDescription' },
      { name: 'description' },
      { name: 'technologies' },
      { name: 'github' },
      { name: 'liveDemo' },
      { name: 'featured' },
      { name: 'image' },
      { name: 'architecture' }
    ]);
    const payload = raw.map(entry => ({
      ...entry,
      projectNumber: Number(entry.projectNumber) || 0,
      featured: Boolean(entry.featured),
      technologies: (entry.technologies || '').split(',').map(item => item.trim()).filter(Boolean)
    }));
    const result = await requestJson('/api/portfolio/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('add-certification').addEventListener('click', () => {
    const list = document.getElementById('certifications-list');
    const card = createListItem(
      [
        { name: 'name', label: 'Certification Name' },
        { name: 'issuer', label: 'Issuer' },
        { name: 'date', label: 'Date' },
        { name: 'credentialUrl', label: 'Credential URL' }
      ],
      { name: '', issuer: '', date: '', credentialUrl: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-certifications').addEventListener('click', async () => {
    const payload = getListData(document.getElementById('certifications-list'), [
      { name: 'name' },
      { name: 'issuer' },
      { name: 'date' },
      { name: 'credentialUrl' }
    ]);
    const result = await requestJson('/api/portfolio/certifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('add-education').addEventListener('click', () => {
    const list = document.getElementById('education-list');
    const card = createListItem(
      [
        { name: 'degree', label: 'Degree' },
        { name: 'institution', label: 'Institution' },
        { name: 'startYear', label: 'Start Year' },
        { name: 'graduationYear', label: 'Graduation Year' },
        { name: 'description', label: 'Description', type: 'textarea' }
      ],
      { degree: '', institution: '', startYear: '', graduationYear: '', description: '' },
      item => item.remove()
    );
    list.appendChild(card);
  });
  document.getElementById('save-education').addEventListener('click', async () => {
    const payload = getListData(document.getElementById('education-list'), [
      { name: 'degree' },
      { name: 'institution' },
      { name: 'startYear' },
      { name: 'graduationYear' },
      { name: 'description' }
    ]);
    const result = await requestJson('/api/portfolio/education', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('save-social').addEventListener('click', async () => {
    const payload = mapForm(document.getElementById('social-form'));
    const result = await requestJson('/api/portfolio/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.getElementById('upload-resume').addEventListener('click', async () => {
    const fileInput = document.getElementById('resume-upload');
    const file = fileInput.files[0];
    if (!file) {
      showMessage('Select a resume PDF first', true);
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    const response = await fetch('/api/upload/resume', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      setFormValues(document.getElementById('personal-form'), { ...state.data.personal, resume: result.path });
      state.data.personal.resume = result.path;
      showMessage('Resume uploaded successfully');
    } else {
      showMessage(result.message, true);
    }
  });
  document.getElementById('upload-architecture').addEventListener('click', async () => {
    const fileInput = document.getElementById('architecture-upload');
    const file = fileInput.files[0];
    if (!file) {
      showMessage('Select an architecture image first', true);
      return;
    }
    const formData = new FormData();
    formData.append('architecture', file);
    const response = await fetch('/api/upload/architecture', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      setFormValues(document.getElementById('personal-form'), { ...state.data.personal, architectureImage: result.path });
      state.data.personal.architectureImage = result.path;
      showMessage('Architecture image uploaded successfully');
    } else {
      showMessage(result.message, true);
    }
  });
  document.getElementById('upload-project').addEventListener('click', async () => {
    const fileInput = document.getElementById('project-upload');
    const file = fileInput.files[0];
    if (!file) {
      showMessage('Select a project image first', true);
      return;
    }
    const formData = new FormData();
    formData.append('projectImage', file);
    const response = await fetch('/api/upload/project', { method: 'POST', body: formData });
    const result = await response.json();
    if (result.success) {
      showMessage(`Project image uploaded: ${result.path}`);
    } else {
      showMessage(result.message, true);
    }
  });
  document.getElementById('save-settings').addEventListener('click', async () => {
    const payload = mapForm(document.getElementById('settings-form'));
    const result = await requestJson('/api/portfolio/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showMessage(result.message, !result.success);
  });

  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => markUnsaved(true));
  });
}

async function initAdmin() {
  bindSectionButtons();
  initializeEvents();
  const authenticated = await loadStatus();
  if (authenticated) {
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('dashboard-panel').classList.remove('hidden');
    document.getElementById('editor-panel').classList.remove('hidden');
    await loadPortfolio();
  } else {
    document.getElementById('login-panel').classList.remove('hidden');
    document.getElementById('dashboard-panel').classList.add('hidden');
    document.getElementById('editor-panel').classList.add('hidden');
  }
}

initAdmin().catch(console.error);
