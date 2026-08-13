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
    el.src = url || 'assets/profile.jpeg';
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
          <span class="stat-icon">${meta.svg ? `<img src="${meta.svg}" alt="${stat.label} logo" style="width:20px;height:20px;object-fit:contain;">` : `<i class="${meta.icon}"></i>`}</span>
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
  // Prefer official brand SVGs (SimpleIcons) where possible, fall back to FontAwesome classes
  if (key.includes('terraform')) return { svg: 'https://cdn.simpleicons.org/terraform/7B42BC', color: '#7B42BC' };
  if (key.includes('kubernetes') || key.includes('k8s')) return { svg: 'https://cdn.simpleicons.org/kubernetes/326CE5', color: '#326CE5' };
  if (key.includes('jenkins')) return { svg: 'https://cdn.simpleicons.org/jenkins/D24939', color: '#D24939' };
  if (key.includes('prometheus')) return { svg: 'https://cdn.simpleicons.org/prometheus/FF6A00', color: '#FF6A00' };
  if (key.includes('grafana')) return { svg: 'https://cdn.simpleicons.org/grafana/FB542B', color: '#FB542B' };
  if (key.includes('ansible')) return { svg: 'https://cdn.simpleicons.org/ansible/EE0000', color: '#EE0000' };
  if (key.includes('docker') || key.includes('container')) return { svg: 'https://cdn.simpleicons.org/docker/2496ED', color: '#2496ED' };
  // Use the SAME AWS FontAwesome icon implementation as the Cloud Platforms header (do not change that header)
  if (key.includes('aws') || key.includes('ec2') || key.includes('s3') || key.includes('iam') || key.includes('vpc') || key.includes('cloudwatch') || key.includes('cloudtrail') || key.includes('aws cli')) return { icon: 'fa-brands fa-aws', color: '#FF9900' };
  if (key.includes('github') || key.includes('git')) return { svg: 'https://cdn.simpleicons.org/github/F5F5F5', color: '#F5F5F5' };
  if (key.includes('python')) return { svg: 'https://cdn.simpleicons.org/python/3776AB', color: '#3776AB' };
  if (key.includes('linux') || key.includes('ubuntu')) return { svg: 'https://cdn.simpleicons.org/linux/FCC624', color: '#FCC624' };
  // Fallbacks
  if (key.includes('ci') || key.includes('cd')) return { icon: 'fa-solid fa-code-branch', color: '#D24939' };
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
          const iconHtml = style.svg ? `<img src="${style.svg}" alt="${item} logo" style="width:18px;height:18px;object-fit:contain;display:block;">` : `<i class="${style.icon}"></i>`;
          return `
            <span class="tag" style="--tag-color: ${style.color};">
              <span class="tag-icon" style="color: ${style.color}; border-color: ${style.color}33;">${iconHtml}</span>
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
    const techTags = (project.technologies || []).map(tech => {
      const key = String(tech).toLowerCase();
      const awsTerms = ['aws','ec2','s3','iam','vpc','alb','route','route 53','cloudwatch','cloudtrail','lambda'];
      if (awsTerms.some(t => key.includes(t))) {
        const style = getSkillStyle(tech);
        const iconHtml = style.svg ? `<img src="${style.svg}" alt="${tech} logo" style="width:18px;height:18px;object-fit:contain;display:block;">` : `<i class="${style.icon}"></i>`;
        return `<span class="tag" style="--tag-color: ${style.color || '#FF9900'};"><span class="tag-icon" style="color: ${style.color || '#FF9900'}; border-color: ${style.color || '#FF9900'}33;">${iconHtml}</span><span class="tag-label">${tech}</span></span>`;
      }
      return `<span class="tag">${tech}</span>`;
    }).join('');

    card.innerHTML = `
      <h3>${project.title}</h3>
      <p>${project.shortDescription}</p>
      <div class="tags">${techTags}</div>
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
          const iconHtml = style.svg ? `<img src="${style.svg}" alt="${tech} logo" style="width:18px;height:18px;object-fit:contain;display:block;">` : `<i class="${style.icon}"></i>`;
          return `
            <span class="tag" style="--tag-color: ${style.color};">
              <span class="tag-icon" style="color: ${style.color}; border-color: ${style.color}33;">${iconHtml}</span>
              <span class="tag-label">${tech}</span>
            </span>
          `;
        }).join('')}
      </div>
      <div class="training-actions">
        <a class="training-btn training-btn-primary" href="${entry.pdfUrl || 'assets/aws hands-on.pdf'}" target="_blank" rel="noopener noreferrer">
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
  // Remove Experience navigation and hide Experience section entirely (portfolio uses no Experience)
  try {
    document.querySelectorAll('nav a').forEach(a => {
      if (a.textContent && a.textContent.trim().toUpperCase() === 'EXPERIENCE') a.remove();
    });
    const exp = document.getElementById('experience-section') || document.getElementById('experience');
    if (exp) exp.style.display = 'none';
  } catch (e) {
    // ignore if nav not present
  }
}

async function init() {
  const data = await fetchPortfolio();
  if (!data) return;
  setText('hero-title', data.personal.tagline || 'Building, Automating & Deploying Cloud Infrastructure');
  setText('hero-tagline', data.personal.description || 'Premium infrastructure automation and platform delivery.');
  // Ensure the eyebrow/label shows the role/title (e.g., "Cloud & DevOps Engineer")
  try {
    const eyebrow = document.querySelector('.eyebrow');
    if (eyebrow) eyebrow.textContent = data.personal.title || eyebrow.textContent;
  } catch (e) {}
  setLink('resume-link', data.personal.resume || '#', 'Download Resume');
  // Inject architecture image directly after the hero (preserve portfolio layout)
  try {
    if (data.personal && data.personal.architectureImage) {
      if (!document.getElementById('architecture-section')) {
        const html = `
          <section id="architecture-section" class="architecture-preview-section section">
            <div class="architecture-panel panel">
              <img id="architecture-image" class="architecture-img" src="${data.personal.architectureImage}" alt="Architecture Diagram">
            </div>
          </section>`;
        const hero = document.getElementById('hero-section');
        if (hero && hero.parentNode) {
          hero.parentNode.insertBefore(document.createRange().createContextualFragment(html), hero.nextSibling);
        }
      } else {
        const img = document.getElementById('architecture-image');
        if (img) img.src = data.personal.architectureImage;
      }
    }
  } catch (e) {
    // fail quietly if DOM not matching
  }
  // Ensure both hero and footer GitHub/LinkedIn anchors use the correct personal URLs
  try {
    const githubUrl = data.personal.github || (data.socialLinks && data.socialLinks.github) || '#';
    const linkedinUrl = data.personal.linkedin || (data.socialLinks && data.socialLinks.linkedin) || '#';
    document.querySelectorAll('.contact-github').forEach(a => { try { a.href = githubUrl; a.textContent = a.textContent || 'GitHub'; } catch(e){} });
    document.querySelectorAll('.contact-linkedin').forEach(a => { try { a.href = linkedinUrl; a.textContent = a.textContent || 'LinkedIn'; } catch(e){} });
  } catch (e) {
    // ignore
  }
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
  renderTraining(data.training || []);
  renderCertifications(data.certifications || []);
  setContact(data.personal, data.socialLinks || {});
  applySettings(data.settings || {});
}

init().catch(console.error);
