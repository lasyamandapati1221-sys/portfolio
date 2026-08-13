const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'lasya123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-secret';
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');
const BACKUP_DIR = path.join(__dirname, 'data', 'backups');
const PUBLIC_DIR = __dirname;

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(PUBLIC_DIR, 'assets')),
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
      cb(null, safeName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));
app.use(express.static(PUBLIC_DIR));

async function ensureBackupDir() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    console.error('Unable to create backup directory', error);
  }
}

function createBackupName() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[:T]/g, '-').split('.')[0];
  return `portfolio-${stamp}.json`;
}

async function backupPortfolio() {
  try {
    await ensureBackupDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const backupPath = path.join(BACKUP_DIR, createBackupName());
    await fs.writeFile(backupPath, data, 'utf8');
    const backups = await fs.readdir(BACKUP_DIR);
    const sorted = backups
      .filter(name => name.startsWith('portfolio-') && name.endsWith('.json'))
      .sort((a, b) => a.localeCompare(b));
    const keepLast = 15;
    if (sorted.length > keepLast) {
      const removeList = sorted.slice(0, sorted.length - keepLast);
      await Promise.all(removeList.map(file => fs.unlink(path.join(BACKUP_DIR, file))));
    }
  } catch (error) {
    console.error('Backup creation failed', error);
  }
}

async function readPortfolio() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Unable to read portfolio.json', error);
    return null;
  }
}

async function writePortfolio(data) {
  try {
    const text = JSON.stringify(data, null, 2);
    await backupPortfolio();
    await fs.writeFile(DATA_FILE, text, 'utf8');
    return true;
  } catch (error) {
    console.error('Unable to write portfolio.json', error);
    return false;
  }
}

function validateEmail(value) {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value);
}

function validateUrl(value) {
  return typeof value === 'string' && /^(https?:\/\/|\/).+/.test(value);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Authentication required' });
}

app.get('/api/portfolio', async (req, res) => {
  const portfolio = await readPortfolio();
  if (!portfolio) {
    return res.status(500).json({ success: false, message: 'Unable to load portfolio data' });
  }
  res.json(portfolio);
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.user = username;
    return res.json({ success: true, message: 'Authenticated' });
  }
  res.status(401).json({ success: false, message: 'Invalid username or password' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Unable to log out' });
    }
    res.json({ success: true, message: 'Logged out' });
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

async function updateSection(req, res, sectionKey, validator) {
  const payload = req.body;
  if (typeof validator === 'function' && !validator(payload)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  const portfolio = await readPortfolio();
  if (!portfolio) {
    return res.status(500).json({ success: false, message: 'Unable to load portfolio data' });
  }
  portfolio[sectionKey] = payload;

  if (!(await writePortfolio(portfolio))) {
    return res.status(500).json({ success: false, message: 'Unable to save portfolio data' });
  }
  res.json({ success: true, message: 'Portfolio updated successfully' });
}

app.put('/api/portfolio/personal', requireAuth, async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid personal data' });
  }
  if (!validateEmail(data.email) && data.email !== '') {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  if (data.resume && !validateUrl(data.resume)) {
    return res.status(400).json({ success: false, message: 'Invalid resume URL' });
  }
  await updateSection(req, res, 'personal', () => true);
});

app.put('/api/portfolio/about', requireAuth, async (req, res) => {
  await updateSection(req, res, 'about', payload => payload && typeof payload.heading === 'string' && typeof payload.description === 'string');
});

app.put('/api/portfolio/statistics', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Statistics must be an array' });
  }
  const valid = payload.every(item => item && typeof item.label === 'string' && typeof item.value === 'string');
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Invalid statistics format' });
  }
  await updateSection(req, res, 'statistics', () => true);
});

app.put('/api/portfolio/skills', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid skills data' });
  }
  await updateSection(req, res, 'skills', () => true);
});

app.put('/api/portfolio/experience', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Experience must be an array' });
  }
  await updateSection(req, res, 'experience', () => true);
});

app.put('/api/portfolio/training', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Training must be an array' });
  }
  await updateSection(req, res, 'training', () => true);
});

app.put('/api/portfolio/projects', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Projects must be an array' });
  }
  await updateSection(req, res, 'projects', () => true);
});

app.put('/api/portfolio/certifications', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Certifications must be an array' });
  }
  await updateSection(req, res, 'certifications', () => true);
});

app.put('/api/portfolio/education', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Education must be an array' });
  }
  await updateSection(req, res, 'education', () => true);
});

app.put('/api/portfolio/social', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid social link data' });
  }
  await updateSection(req, res, 'socialLinks', () => true);
});

app.put('/api/portfolio/settings', requireAuth, async (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid settings data' });
  }
  await updateSection(req, res, 'settings', () => true);
});

app.post('/api/upload/profile', requireAuth, upload.single('profile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Profile upload failed' });
  }
  res.json({ success: true, message: 'Profile uploaded', path: `/assets/${req.file.filename}` });
});

app.post('/api/upload/project', requireAuth, upload.single('projectImage'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Project upload failed' });
  }
  res.json({ success: true, message: 'Project image uploaded', path: `/assets/${req.file.filename}` });
});

app.post('/api/upload/resume', requireAuth, upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Resume upload failed' });
  }
  res.json({ success: true, message: 'Resume uploaded', path: `/assets/${req.file.filename}` });
});

app.post('/api/upload/architecture', requireAuth, upload.single('architecture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Architecture image upload failed' });
  }
  res.json({ success: true, message: 'Architecture image uploaded', path: `/assets/${req.file.filename}` });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
