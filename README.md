# Cloud & DevOps Portfolio CMS

A premium Cloud & DevOps portfolio website with an authenticated admin dashboard. The public website loads content from `data/portfolio.json`, while the admin dashboard securely updates the JSON data through a Node.js + Express backend.

## Project Structure

```
portfolio/
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   ├── js/
│   │   ├── app.js
│   │   └── admin.js
│   └── assets/
│       ├── profile.jpg
│       ├── resume.pdf
│       └── favicon.png
├── data/
│   ├── portfolio.json
│   └── backups/
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file in the project root with:

```env
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=change-this-secret
```

## Start

```bash
npm start
```

Open the website:

```text
http://localhost:3000
```

Admin login:

```text
http://localhost:3000/admin.html
```

## Features

- Public portfolio loads from `/api/portfolio`
- Admin login with secure server-side authentication
- Admin dashboard for editing personal info, about, statistics, skills, experience, training, projects, certifications, education, social links, and settings
- JSON storage in `data/portfolio.json`
- Backend file upload support for resume and assets
- Backup files created before JSON overwrites
- HTTP-only session cookie authentication
- No React/Vue/Angular or database dependency

## Admin Usage

1. Open `/admin.html`
2. Enter username and password
3. Edit content in the dashboard sections
4. Save changes with AJAX
5. Logout when finished

### Editable content

- Personal information
- About section
- Statistics
- Skills by category
- Experience
- Training
- Projects
- Certifications
- Education
- Social links
- Site settings

## Notes

- The public website is static HTML/CSS/JS, but the complete app requires Node.js to update `portfolio.json` securely.
- For production, enable HTTPS and use a secure deployment environment.
