async function fetchPortfolio() {
    try {
        // Try Express API endpoint first (for local node server)
        let response = await fetch('/api/portfolio');
        if (!response.ok) {
            // Fall back to static JSON file (for GitHub Pages)
            response = await fetch('./data/portfolio.json');
        }
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        // Fallback fetch if /api/portfolio throws a network error
        const fallback = await fetch('./data/portfolio.json');
        return fallback.ok ? await fallback.json() : null;
    }
}

function setText(selector, text) {
  const el = document.getElementById(selector);
  if (el) el.textContent = text || '';
}

function normalizeSentenceSpacing(text = '') {
  return String(text)
    .replace(/\s+/g, ' ')
    .replace(/([.!?])(?=\S)/g, '$1 ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatAboutText(text = '') {
  const normalized = normalizeSentenceSpacing(text);
  return normalized.replace(/([.!?])\s+/g, '$1<br>');
}

function setLink(selector, url, text) {
  const el = document.getElementById(selector);
  if (el) {
    el.href = url || '#';
    el.textContent = text || el.textContent;
  }
}

function setImage(selector, url) {
  const el = document.getElementById(selector);
  if (el) {
    el.src = url || '/assets/profile.jpg';
  }
}

function getStatMeta(label) {
  const value = (label || '').toLowerCase();
  if (value.includes('aws')) {
    return { icon: 'fa-brands fa-aws', badge: 'CLOUD PLATFORM' };
  }
  if (value.includes('ci') || value.includes('cd')) {
    return { icon: 'fa-solid fa-code-branch', badge: 'PIPELINE AUTO' };
  }
  if (value.includes('container') || value.includes('docker') || value.includes('kubernetes')) {
    return { icon: 'fa-solid fa-cubes', badge: 'ORCHESTRATION' };
  }
  return { icon: 'fa-solid fa-microchip', badge: 'CORE STACK' };
}

function renderStats(stats) {
  const container = document.getElementById('stats-container');
  if (!container) return;
  container.innerHTML = '';
  stats.forEach(stat => {
    const meta = getStatMeta(stat.label);
    const card = document.createElement('div');
    card.className = 'stats-card';
    card.innerHTML = `
      <div class="stat-card-header">
        <div class="stat-heading">
          <span class="stat-icon"><i class="${meta.icon}"></i></span>
          <h3>${stat.label}</h3>
        </div>
        <span class="stat-badge">${meta.badge}</span>
      </div>
      <p class="stat-description">${stat.description}</p>
    `;
    container.appendChild(card);
  });
}

function getSkillStyle(item = '') {
  const key = String(item).toLowerCase();

  if (key.includes('aws') || key.includes('ec2') || key.includes('s3') || key.includes('iam') || key.includes('vpc')) {
    return { icon: 'fa-brands fa-aws', color: '#FF9900' };
  }
  if (key.includes('github') || key.includes('git')) {
    return { icon: 'fa-brands fa-github', color: '#F5F5F5' };
  }
  if (key.includes('docker') || key.includes('container')) {
    return { icon: 'fa-brands fa-docker', color: '#2496ED' };
  }
  if (key.includes('kubernetes') || key.includes('pod') || key.includes('deploy') || key.includes('service') || key.includes('secret') || key.includes('pv') || key.includes('pvc')) {
    return { icon: 'fa-solid fa-dharmachakra', color: '#326CE5' };
  }
  if (key.includes('terraform') || key.includes('ansible') || key.includes('iac')) {
    return { icon: 'fa-solid fa-server', color: '#7B42BC' };
  }
  if (key.includes('prometheus') || key.includes('grafana') || key.includes('cloudwatch')) {
    return { icon: 'fa-solid fa-chart-line', color: '#E6522C' };
  }
  if (key.includes('sonar') || key.includes('security') || key.includes('iam')) {
    return { icon: 'fa-solid fa-shield-alt', color: '#4E9A51' };
  }
  if (key.includes('python') || key.includes('bash') || key.includes('javascript')) {
    return { icon: 'fa-brands fa-python', color: '#3776AB' };
  }
  if (key.includes('linux') || key.includes('ubuntu')) {
    return { icon: 'fa-brands fa-linux', color: '#FCC624' };
  }
  if (key.includes('copilot') || key.includes('chatgpt') || key.includes('k8sgpt') || key.includes('ai')) {
    return { icon: 'fa-solid fa-robot', color: '#7C3AED' };
  }
  if (key.includes('jenkins') || key.includes('ci') || key.includes('cd')) {
    return { icon: 'fa-solid fa-code-branch', color: '#D24939' };
  }
  return { icon: 'fa-solid fa-certificate', color: '#00FF88' };
}

function renderSkills(skills) {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  const categoryOrder = [
    { key: 'cloud', title: 'CLOUD PLATFORMS', icon: 'fa-brands fa-aws', color: '#FF9900' },
    { key: 'devops', title: 'CI/CD & AUTOMATION', icon: 'fa-brands fa-github', color: '#F5F5F5' },
    { key: 'containers', title: 'CONTAINERIZATION & ORCHESTRATION', icon: 'fa-brands fa-docker', color: '#2496ED' },
    { key: 'iac', title: 'INFRASTRUCTURE AS CODE', icon: 'fa-solid fa-server', color: '#7B42BC' },
    { key: 'kubernetes', title: 'KUBERNETES & PLATFORM', icon: 'fa-solid fa-dharmachakra', color: '#326CE5' },
    { key: 'monitoring', title: 'MONITORING & OBSERVABILITY', icon: 'fa-solid fa-chart-line', color: '#E6522C' },
    { key: 'security', title: 'DEVSECOPS & SECURITY', icon: 'fa-solid fa-shield-alt', color: '#4E9A51' },
    { key: 'programming', title: 'SCRIPTING & OPERATING SYSTEMS', icon: 'fa-brands fa-python', color: '#3776AB' }
  ];

  const normalizedSkills = { ...skills };
  if (!normalizedSkills.monitoring) normalizedSkills.monitoring = ['Prometheus', 'Grafana', 'CloudWatch'];
  if (!normalizedSkills.security) normalizedSkills.security = ['IAM', 'Secrets', 'Security Groups'];
  if (!normalizedSkills.ai) normalizedSkills.ai = ['K8sGPT', 'Copilot', 'AI Automation'];

  container.innerHTML = '';
  categoryOrder.forEach((category) => {
    const items = Array.isArray(normalizedSkills[category.key]) ? normalizedSkills[category.key] : [];
    if (items.length === 0) return;

    const card = document.createElement('div');
    card.className = 'skill-card';
    card.style.setProperty('--skill-category-color', category.color);
    card.innerHTML = `
      <div class="skill-card-header">
        <div class="skill-title-wrap">
          <span class="skill-icon" style="color: ${category.color}; border-color: ${category.color}33;"><i class="${category.icon}"></i></span>
          <h3>${category.title}</h3>
        </div>
      </div>
      <div class="tags">
        ${items.map(item => {
          const style = getSkillStyle(item);
          return `
            <span class="tag" style="--tag-color: ${style.color};">
              <span class="tag-icon" style="color: ${style.color}; border-color: ${style.color}33;"><i class="${style.icon}"></i></span>
              <span class="tag-label">${item}</span>
            </span>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container) return;
  container.innerHTML = '';
  projects.filter(p => p.featured).forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.shortDescription}</p>
      <div class="tags">${(project.technologies || []).map(tech => `<span class="tag">${tech}</span>`).join('')}</div>
      <p><a href="${project.github || '#'}" target="_blank">GitHub</a> · <a href="${project.liveDemo || '#'}" target="_blank">Live Demo</a></p>
    `;
    container.appendChild(card);
  });
}

function renderExperience(experience) {
  const container = document.getElementById('experience-list');
  if (!container) return;
  container.innerHTML = '';
  experience.forEach(item => {
    const node = document.createElement('div');
    node.className = 'timeline-item';
    node.innerHTML = `
      <h3>${item.role} @ ${item.company}</h3>
      <time>${item.startDate} — ${item.endDate || 'Present'}</time>
      <p>${item.description}</p>
      <div class="tags">${(item.technologies || []).map(tech => `<span class="tag">${tech}</span>`).join('')}</div>
    `;
    container.appendChild(node);
  });
}

function renderTraining(training) {
  const container = document.getElementById('training-list');
  if (!container) return;
  container.innerHTML = '';
  training.forEach(entry => {
    const techs = entry.tags || entry.technologies || [];
    const card = document.createElement('div');
    card.className = 'training-card';
    card.innerHTML = `
      <div class="training-header">
        <div>
          <h3>${entry.title || 'Hands-on Training'}</h3>
        </div>
      </div>
      <p class="training-description">${entry.description || ''}</p>
      <div class="training-tags">
        ${(techs || []).map(tech => {
          const style = getSkillStyle(tech);
          return `
            <span class="tag" style="--tag-color: ${style.color};">
              <span class="tag-icon" style="color: ${style.color}; border-color: ${style.color}33;"><i class="${style.icon}"></i></span>
              <span class="tag-label">${tech}</span>
            </span>
          `;
        }).join('')}
      </div>
      <div class="training-actions">
        <a class="training-btn training-btn-primary" href="${entry.pdfUrl || '/assets/aws hands-on.pdf'}" target="_blank" rel="noopener noreferrer">
          <i class="fa-solid fa-file-pdf"></i>
          <span>View Hands-On PDF Document</span>
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderCertifications(certifications) {
  const container = document.getElementById('certifications-list');
  if (!container) return;
  container.innerHTML = '';
  certifications.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.innerHTML = `
    <div style="display: flex; align-items: center; gap: 20px; padding: 10px;">
        ${cert.badgeImage ? `
            <div style="width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
                <img src="${cert.badgeImage}" alt="${cert.name} Badge" style="width: 100%; height: 100%; object-fit: contain; ${cert.name.toLowerCase().includes('oracle') ? 'transform: scale(1.35);' : ''}">
            </div>
        ` : ''}
        <div>
            <h3 style="margin: 0 0 5px 0;">${cert.name}</h3>
            <p style="margin: 0 0 8px 0; color: #a0aec0;">${cert.issuer} • ${cert.date}</p>
            <p style="margin: 0;"><a href="${cert.credentialUrl || '#'}" target="_blank">View Credential</a></p>
        </div>
    </div>
`;
    container.appendChild(card);
  });
}

function setContact(personal, social) {
  setText('contact-name', personal.name);
  setText('contact-title', personal.title);
  setText('contact-location', personal.location);
  const emailEl = document.getElementById('contact-email');
  if (emailEl) {
    emailEl.href = `mailto:${personal.email}`;
    emailEl.textContent = personal.email;
  }
  setLink('contact-github', social.github, 'GitHub');
  setLink('contact-linkedin', social.linkedin, 'LinkedIn');
}

function applySettings(settings) {
  document.title = settings.siteTitle || 'Portfolio';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.content = settings.siteDescription || '';
  }
  document.getElementById('hero-section').style.display = settings.showHero ? 'grid' : 'none';
  document.getElementById('projects-section').style.display = settings.showProjects ? 'block' : 'none';
  document.getElementById('skills-section').style.display = settings.showSkills ? 'block' : 'none';
  document.getElementById('certifications-section').style.display = settings.showCertifications ? 'block' : 'none';
  document.getElementById('contact').style.display = settings.showContact ? 'block' : 'none';
}

async function init() {
  const data = await fetchPortfolio();
  if (!data) return;
  setText('hero-title', data.personal.tagline || 'Building, Automating & Deploying Cloud Infrastructure');
  setText('hero-tagline', data.personal.description || 'Premium infrastructure automation and platform delivery.');
  setLink('resume-link', data.personal.resume || '#', 'Download Resume');
  const headingHtml = data.about.heading ? `<h3>${data.about.heading}</h3>` : '';
  const bodyHtml = (data.about.description || '')
    .split('\n')
    .filter(paragraph => paragraph.trim() !== '')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
  document.getElementById('about-text').innerHTML = headingHtml + bodyHtml;
  setImage('profile-image', data.personal.profileImage);
  renderStats(data.statistics || []);
  renderSkills(data.skills || {});
  renderProjects(data.projects || []);
  renderExperience(data.experience || []);
  renderTraining(data.training || []);
  renderCertifications(data.certifications || []);
  setContact(data.personal, data.socialLinks || {});
  applySettings(data.settings || {});
}

init().catch(console.error);
