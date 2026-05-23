# StockSense AI Lite

StockSense AI Lite is a dark-themed stock tracking web application built with React. The app is designed to help users search stocks, view stock details, manage watchlists, create price alerts, read market news, and view AI-style market insights.

This project is being developed as a capstone/group project.

---

## Project Status

Current completed setup:

- React + Vite project setup
- React Router navigation
- Dark-themed layout
- Sidebar and top navbar
- Login page
- Registration page
- localStorage-based mock authentication
- Protected dashboard routes
- Logout functionality
- GitHub branch and pull request workflow

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- React Router DOM
- Lucide React Icons
- Recharts
- CSS

### Planned Backend / API

- Node.js
- Express.js
- Stock market API such as Finnhub or Alpha Vantage

### Tools

- VS Code
- Git
- GitHub
- npm
- Browser DevTools

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/UserXX7/stocksense-ai-lite.git
```

### 2. Go into the project folder

```bash
cd stocksense-ai-lite
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the app

Usually the app will run at:

```txt
http://localhost:5173/
```

If that port is busy, Vite may use another port such as:

```txt
http://localhost:5174/
```

---

## Important Note About Login/Register

This project currently uses `localStorage` for mock authentication.

To test login:

1. Go to the registration page.
2. Create a new account.
3. You will be redirected to the dashboard.
4. Log out.
5. Login again with the same email and password.

Because `localStorage` is based on the browser and port, an account created on `localhost:5173` will not automatically exist on `localhost:5174`.

---

## Main Project Structure

```txt
src/
├── components/
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   └── Sidebar.jsx
│
├── pages/
│   ├── AIInsights.jsx
│   ├── Alerts.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── News.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   ├── Search.jsx
│   ├── Settings.jsx
│   ├── StockDetails.jsx
│   └── Watchlist.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## Team Workflow

Do not work directly on the `main` branch.

Before starting your task, create your own feature branch.

### Step 1: Make sure main is updated

```bash
git checkout main
git pull origin main
```

### Step 2: Create your feature branch

Example:

```bash
git checkout -b feature/dashboard-watchlist
```

### Step 3: Work on your assigned files

Only edit the files assigned to your task unless discussed with the team lead.

### Step 4: Save your work

```bash
git status
git add .
git commit -m "Add dashboard and watchlist UI"
```

### Step 5: Push your branch

```bash
git push -u origin feature/dashboard-watchlist
```

### Step 6: Open a Pull Request

On GitHub:

```txt
your branch → main
```

Then request review before merging.

---

## Team Task Split

### Lead Developer / Architecture

Responsible for:

```txt
src/App.jsx
src/main.jsx
src/index.css
src/components/Layout.jsx
src/components/Navbar.jsx
src/components/Sidebar.jsx
src/components/ProtectedRoute.jsx
```

Also responsible for:

- API setup
- Backend setup later
- Final merge review
- Deployment
- Bug fixing

---

### Teammate 1: Dashboard + Watchlist

Branch name:

```bash
feature/dashboard-watchlist
```

Assigned files:

```txt
src/pages/Dashboard.jsx
src/pages/Watchlist.jsx
```

Tasks:

- Build dashboard market overview section
- Add top movers section
- Add watchlist preview
- Build watchlist table/cards
- Use static sample stock data for now

---

### Teammate 2: Search + Stock Details

Branch name:

```bash
feature/search-stock-details
```

Assigned files:

```txt
src/pages/Search.jsx
src/pages/StockDetails.jsx
```

Tasks:

- Build search page UI
- Add sample search results
- Build stock details page
- Add chart placeholder
- Add key statistics section
- Add company overview section

---

### Teammate 3: News + AI Insights + Alerts

Branch name:

```bash
feature/news-ai-alerts
```

Assigned files:

```txt
src/pages/News.jsx
src/pages/AIInsights.jsx
src/pages/Alerts.jsx
```

Tasks:

- Build news cards
- Build AI insight cards
- Build alerts list
- Build create-alert form UI
- Use static sample data for now

---

## Files Teammates Should Avoid Editing

To reduce merge conflicts, do not edit these files unless assigned:

```txt
src/App.jsx
src/main.jsx
src/index.css
src/components/Layout.jsx
src/components/Navbar.jsx
src/components/Sidebar.jsx
src/components/ProtectedRoute.jsx
```

If changes are needed in these files, discuss with the team lead first.

---

## Commit Message Examples

Use clear commit messages.

Good examples:

```bash
git commit -m "Add dashboard market overview cards"
git commit -m "Build watchlist table UI"
git commit -m "Add search results layout"
git commit -m "Create stock details page sections"
git commit -m "Add news and AI insight cards"
git commit -m "Build alerts page UI"
```

Avoid vague messages like:

```bash
git commit -m "update"
git commit -m "changes"
git commit -m "fix"
```

---

## Pull Request Rules

Before opening a pull request:

- Make sure the app runs with `npm run dev`
- Make sure your assigned page does not break the layout
- Make sure there are no console errors
- Make sure you are pushing your own feature branch, not `main`

Pull request title examples:

```txt
Add dashboard and watchlist UI
Add search and stock details pages
Add news, alerts, and AI insights UI
```

---

## Current Pages

The app currently includes:

- Login
- Register
- Dashboard
- Search
- Stock Details
- Watchlist
- Alerts
- News
- AI Insights
- Profile
- Settings

---

## Future Features

Planned next features:

- Real stock API integration
- Real-time quote data
- Search by ticker symbol
- Stock detail charts
- Watchlist persistence
- Price alert logic
- Market news API
- AI-style stock summaries
- Profile and settings improvements
- Deployment

---

## Project Goal

The goal of StockSense AI Lite is to create a clean, modern, portfolio-ready stock dashboard that demonstrates frontend development, routing, authentication flow, API integration, UI/UX design, and team-based GitHub collaboration.
