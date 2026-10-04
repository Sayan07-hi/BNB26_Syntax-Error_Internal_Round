# Fair-Drop — Civic Resource Allocation Platform

> **A verifiable, equitable, and privacy-preserving public allocation protocol and frontend platform.**

Fair-Drop solves the critical challenges of opaque public resource distribution, arbitrary queueing, and subjective denials. By combining client-side Zero-Knowledge proof verification with deterministic public ledger queueing, Fair-Drop guarantees that every eligible applicant receives their rightful share without systemic bias or raw personal data exposure.

---

## 🌟 Key Features

1. **Public-Facing Civic Portal**
   - Modern, accessible landing page with step-by-step process breakdowns (Registration → Verification → Eligibility → Deterministic Queueing → Allocation → Confirmation).
   - Dedicated informational modules: *About*, *How It Works*, *Eligibility Guide*, *FAQ*, and *Contact Support*.
   - Production-ready 2-step onboarding flow with client-side Zero-Knowledge consent.

2. **User Waiting & Queue Experience (`/dashboard`)**
   - Real-time queue progress visualizer mapping active placement against total eligible cohorts (e.g. `Position 451 / 5,000`).
   - Comprehensive status cards, verification metrics, and journey milestones.
   - Verifiable ledger disclaimer clarifying that the frontend visualizes deterministic ledger data.

3. **Interactive Verification Center (`/verification`)**
   - Detailed requirements tracking (*Identity*, *Residency*, *Income ZKP*, *Disbursement Account*).
   - Dynamic status badges: `Verified`, `Under Review`, `Action Required`, `Pending`.
   - Contextual actions: View, Update, and Correct Information.

4. **Resource Allocation Hub (`/my-allocation`)**
   - Complete state machine covering: *Not Eligible*, *Waiting*, *Allocation Available*, *Reviewing*, *Confirmation Modal*, and *Confirmed*.
   - Generates verifiable confirmation receipts with transaction timestamps and payout destination details.
   - Built-in **Demo State Switcher** for instantaneous hackathon demonstrations.

5. **Fairness & Transparency Analytics (`/transparency` / `/reports`)**
   - Public audit feed with Gini parity metrics, queue latency cohorts, and regional municipal distribution audits.
   - Multi-segmented verification engine analysis (*Automated ZKP*, *Secondary Gateway*, *Manual Exceptions*).
   - Real-time watchdog anomaly detection feed with severity alerts.

6. **Interactive Allocation Simulator (`/simulation`)**
   - 6-stage algorithmic cycle simulator with deterministic candidate cohorts.
   - Live candidate ledger stream, speed controls (1x, 2x, 4x), progress trackers, and real-time terminal execution log.

7. **Authority Admin Portal (`/admin`)**
   - Isolated dark-theme layout with dedicated navigation.
   - Interactive Candidate Search, Status Filtering, and Instant Inspection modal.
   - Live queue monitoring with dynamic simulated activity streaming.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- `npm` (bundled with Node.js)

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

The application will launch locally at `http://localhost:5173/`.

---

## 📂 Architecture & Folder Structure

```
fair-drop/
├── public/
│   └── vite.svg                  # Civic platform favicon
├── src/
│   ├── assets/                   # Static branding assets
│   ├── components/               # Reusable UI component library
│   │   ├── Badge.jsx & .css      # Semantic status badges
│   │   ├── Button.jsx & .css     # Standardized button variants & sizes
│   │   ├── Card.jsx & .css       # Modular card containers (Header, Content, Footer)
│   │   ├── Navbar.jsx & .css     # Sticky responsive navigation with mobile drawer
│   │   ├── Footer.jsx & .css     # Public platform footer
│   │   └── Timeline.jsx & .css   # Interactive process journey milestones
│   ├── data/                     # Deterministic mock datasets
│   │   └── mockData.js
│   ├── hooks/                    # Custom React utility hooks
│   │   └── useWindowSize.js
│   ├── layouts/                  # Top-level framing layouts
│   │   ├── MainLayout.jsx        # Public portal framing (Navbar + Main + Footer)
│   │   └── AdminLayout.jsx       # Isolated authority control center with sidebar
│   ├── pages/                    # Route page components
│   │   ├── Home.jsx              # Landing page & hero walkthrough
│   │   ├── About.jsx             # Mission & transparency problem
│   │   ├── HowItWorks.jsx        # Technical pipeline & cryptographic queuing
│   │   ├── Eligibility.jsx       # Program guidelines & criteria pre-check
│   │   ├── FAQ.jsx               # Common inquiries
│   │   ├── Contact.jsx           # Interactive support ticket system
│   │   ├── Login.jsx             # Authentication & State Gateway login
│   │   ├── Register.jsx          # 2-stage civic onboarding flow
│   │   ├── Dashboard.jsx         # User waiting & queue visualizer
│   │   ├── Verification.jsx      # Requirements audit & proof submission
│   │   ├── MyAllocation.jsx      # Claim execution & confirmation receipt
│   │   ├── Allocations.jsx       # Public resource grant catalog
│   │   ├── TransparencyAnalytics.jsx # Fairness metrics, regional parity, & charts
│   │   ├── Simulation.jsx        # Interactive 6-stage algorithmic simulator
│   │   ├── NotFound.jsx          # 404 handler
│   │   └── admin/                # Authority oversight views
│   │       ├── AdminOverview.jsx # High-level KPIs & system activity
│   │       ├── AdminApplications.jsx # Candidate audit table with inspection modal
│   │       ├── AdminMonitoring.jsx   # Live event stream & real-time charts
│   │       └── AdminPlaceholder.jsx  # Graceful placeholder for modular expansion
│   ├── routes/
│   │   └── AppRoutes.jsx         # Complete client-side routing tree
│   ├── styles/
│   │   ├── variables.css         # Design tokens (colors, typography, elevation)
│   │   └── global.css            # Global CSS reset and utilities
│   ├── utilities/
│   │   └── helpers.js            # Formatting and helper utilities
│   ├── App.jsx                   # BrowserRouter root
│   └── main.jsx                  # React DOM entrypoint
├── index.html                    # HTML5 shell
├── vite.config.js                # Vite configuration
└── package.json                  # Dependencies & npm scripts
```

---

## 🔒 Privacy & Simulation Integrity
- **Frontend Demonstration:** All metrics, queues, and proofs are driven by structured, deterministic mock state.
- **Privacy Standard:** Demonstrates Zero-Knowledge proof compliance with zero collection or persistence of raw PII.
