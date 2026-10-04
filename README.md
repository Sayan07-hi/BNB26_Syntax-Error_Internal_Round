# FairDrop

### BNB26 Syntax Error — BIT N BUILD 2026 Internal Round

> **A fair, secure and concurrency-aware registration and allocation platform for high-demand events.**

---

## Problem Statement

### Web/App — PS 3: Fair Drop

Develop a high-demand sale and registration platform where automated clients cannot gain a significant advantage through speed, request volume, or repeated attempts.

The system must remain reliable during a simulated flash crowd while maintaining consistent allocation and user state.

---

## What is FairDrop?

FairDrop is a registration and allocation platform designed for high-demand events where many users attempt to register within a short period.

Instead of relying purely on first-come-first-served registration, FairDrop separates the process into two controlled stages:

**Registration → Registration Closes → Fair Allocation → Result**

Users register during a controlled registration window. Once registration closes, the eligible participant pool is finalized and seats are allocated separately.

---

## Key Features

- 🔐 **JWT Authentication** — secure authentication for users and administrators.
- 👥 **Multiple Users & Admins** — separate user and staff/admin capabilities.
- 🎟️ **Multiple Drops** — independent Drops with their own capacity and registration state.
- 🛡️ **Duplicate Protection** — one registration per user per Drop.
- ⏱️ **Server-Side Registration Control** — registration timing is enforced by the backend.
- 🚦 **Redis Rate Limiting** — 30 requests/minute per authenticated user.
- ⚡ **Concurrent Traffic Simulation** — real authenticated users send concurrent HTTP requests to the actual registration API.
- 📊 **Performance Metrics** — success/failure count, average latency, P95 latency and total execution time.
- 🔒 **Controlled Allocation** — allocation starts only after registration closes.
- 📱 **Allocation Status** — users can see whether they are awaiting allocation, allocated or not allocated.

---

## System Workflow

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    JWT Login     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Select Drop    │
                    └────────┬─────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Registration Window Open?   │
              └──────────────┬──────────────┘
                             │
                            Yes
                             │
                             ▼
                    ┌──────────────────┐
                    │ Rate Limiting +  │
                    │ Server Validation│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Duplicate Check  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Store Entry    │
                    └────────┬─────────┘
                             │
                             ▼
                    Registration Closes
                             │
                             ▼
                    ┌──────────────────┐
                    │  Freeze Pool     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Fair Allocation  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ User sees Result │
                    └──────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Routing | React Router |
| Backend | Django 6.1.1 |
| API | Django REST Framework 3.18.1 |
| Authentication | JWT / SimpleJWT 5.5.1 |
| Rate Limiting | django-ratelimit 4.1.0 |
| Fast State | Redis 8.1.0 |
| Database | SQLite |
| Simulation | Python |
| Communication | REST API / HTTP |
| Version Control | Git + GitHub |

---

## Dependencies

### Backend

```text
Django==6.1.1
djangorestframework==3.18.1
djangorestframework-simplejwt==5.5.1
django-ratelimit==4.1.0
redis==8.1.0
```

Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

Main frontend dependencies:

```text
React
React DOM
React Router
Vite
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

---

## Architecture

```text
                    ┌─────────────────────┐
                    │    React + Vite     │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                           REST / JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Django + DRF    │
                    │       Backend       │
                    │                     │
                    │ Authentication      │
                    │ Registration        │
                    │ Validation          │
                    │ Rate Limiting       │
                    │ Allocation          │
                    └──────┬───────┬──────┘
                           │       │
                       Redis       │
                           │       │
                           ▼       ▼
                    ┌──────────┐ ┌──────────┐
                    │  Redis   │ │  SQLite  │
                    │          │ │          │
                    │Rate      │ │ Users    │
                    │Limiting  │ │ Drops    │
                    │Fast State│ │ Entries  │
                    └──────────┘ │ Seats    │
                                 └──────────┘

                    ┌─────────────────────┐
                    │ Python Simulation   │
                    │ Concurrent Clients  │
                    └──────────┬──────────┘
                               │
                               ▼
                         Django REST API
```

---

## Core Protection Model

FairDrop uses multiple layers of protection:

```text
JWT Authentication
        ↓
Per-User Rate Limiting
        ↓
Server-Side Validation
        ↓
Database Duplicate Protection
        ↓
Controlled Registration Window
        ↓
Registration Closure
        ↓
Separate Fair Allocation
```

The goal is to ensure that sending more requests or repeatedly attempting registration does not automatically provide an advantage.

---

## Authentication & Authorization

### Authentication

FairDrop uses JWT-based authentication.

Users must authenticate before accessing protected functionality.

### Authorization

Administrative operations are protected using Django staff/admin permissions.

Only authorized staff/admin users can perform administrative operations such as:

- Creating Drops
- Managing Drops
- Closing registration
- Starting allocation

Normal users cannot perform administrative operations.

---

## Multiple Drops

FairDrop supports multiple independent Drops.

Each Drop has its own:

- Name
- Description
- Seat capacity
- Registration start time
- Registration end time
- Participant pool
- Allocation state

Users can browse available Drops and select the Drop they want to register for.

Different Drops remain independent from one another.

---

## Duplicate Registration Protection

A user can register only once for the same Drop.

This is enforced at the database level using a unique constraint:

```text
(user, drop)
```

Example:

```text
User A → Drop 1 → Registration ✓
User A → Drop 1 → Registration ✗
User A → Drop 2 → Registration ✓
```

This means duplicate protection is backed by the database rather than relying only on frontend checks.

---

## Rate Limiting

FairDrop applies rate limiting to authenticated registration requests.

Current prototype limit:

```text
30 requests / minute / authenticated user
```

Redis is used for fast rate-limit tracking.

This prevents a single authenticated client from continuously flooding the registration endpoint.

---

## Server-Side Registration Control

Registration timing is controlled by the backend.

The backend validates whether registration is currently allowed before accepting an entry.

```text
Registration Start
        ↓
Registration Allowed
        ↓
Registration End / Closed
        ↓
New Registration Rejected
```

An administrator can also close registration before the originally configured end time.

---

## Registration & Allocation

FairDrop intentionally separates registration from allocation.

### Registration Phase

Users register while the registration window is open.

Valid registrations are added to the participant pool.

### Registration Closure

An administrator closes registration.

The eligible participant pool is finalized.

### Allocation Phase

Allocation is performed separately after registration closes.

Seats are then assigned to eligible participants.

### User Result

Users can see:

```text
Awaiting Allocation
        ↓
   ┌────┴────┐
   ▼         ▼
Allocated   Not Allocated
```

Allocated users can view their assigned seat.

---

## Concurrent Traffic Simulation

FairDrop includes a Python-based flash-crowd simulation.

The simulator communicates with the actual Django API rather than directly modifying the database.

### Simulation Flow

```text
Simulation Users
       ↓
JWT Authentication
       ↓
Concurrent HTTP Requests
       ↓
Django Registration API
       ↓
Rate Limiting
       ↓
Server Validation
       ↓
Duplicate Protection
       ↓
Database
       ↓
Performance Metrics
```

The simulation uses separate authenticated users and real JWT tokens to reproduce concurrent client traffic.

---

## Simulation Metrics

The simulator measures:

| Metric | Description |
|---|---|
| Total Requests | Number of requests sent |
| Successful Requests | Requests accepted by the API |
| Failed Requests | Requests rejected or unsuccessful |
| Average Latency | Average API response time |
| P95 Latency | Time within which 95% of requests completed |
| Total Execution Time | Total simulation duration |

Example prototype measurements:

```text
Average Latency : ~100 ms
P95 Latency     : ~153 ms
```

These are prototype measurements and are not a claim of production-scale capacity.

For large-scale load testing, tools such as **Locust** or **k6** would be more appropriate.

---

## Automated Client / Bot Protection

FairDrop uses multiple layers against automated clients:

```text
Authentication
      ↓
Per-User Rate Limiting
      ↓
Server Validation
      ↓
Duplicate Protection
      ↓
Controlled Registration
      ↓
Separate Allocation
```

The current prototype does **not** claim to be completely bot-proof.

Possible production-level additions include:

- CAPTCHA
- IP-based rate limiting
- Device fingerprinting
- Account verification
- Anomaly detection
- Queue-based admission control

---

## Data Model

### Drop

Represents an individual registration event.

```text
Drop
├── name
├── description
├── total_seats
├── registration_start
├── registration_end
├── is_active
├── is_allocation_complete
├── allocation_started
└── created_at
```

### Entry

Represents a user's registration for a Drop.

```text
Entry
├── drop
├── user
└── joined_at
```

A database constraint ensures one user can have only one entry for a particular Drop.

### Seat

Represents an available seat belonging to a Drop.

Seat numbers are unique within each Drop.

---

## API Overview

The backend provides REST APIs for:

- Authentication
- Drop management
- Registration
- Registration closure
- Allocation
- Allocation status
- Allocation metrics
- Simulation

Example registration endpoint:

```http
POST /api/v1/entries/
```

Example request:

```json
{
  "drop": 1
}
```

The request requires authentication and is validated by the backend before the entry is created.

---

## Project Structure

```text
BNB26_Syntax-Error_Internal_Round/
│
├── backend/
│   ├── config/
│   ├── drops/
│   ├── users/
│   │   └── management/
│   ├── allocations/
│   ├── abuse/
│   ├── reservations/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
│
├── simulation/
│   └── runner.py
│
├── docs/
│
├── .gitignore
└── README.md
```

---

## Local Setup

### Prerequisites

Install:

- Python
- Node.js
- npm
- Redis
- Git

---

### 1. Clone Repository

```bash
git clone https://github.com/Sayan07-hi/BNB26_Syntax-Error_Internal_Round.git
cd BNB26_Syntax-Error_Internal_Round
```

---

### 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create an admin account:

```bash
python manage.py createsuperuser
```

Create simulation users:

```bash
python manage.py ensure_simulation_users
```

Start Django:

```bash
python manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000/
```

---

### 3. Redis Setup

Redis should be running locally at:

```text
127.0.0.1:6379
```

Redis is used for rate limiting and fast temporary state.

---

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## Running the Simulation

Make sure the following are running:

```text
Redis
Django Backend
Simulation Users
```

The simulation runner is located at:

```text
simulation/runner.py
```

The simulator sends requests to the real backend registration API.

It does not bypass:

- Authentication
- Rate limiting
- Server-side validation
- Duplicate protection
- Database constraints

---

## Testing Scenarios

### Normal Registration

```text
Login
  ↓
Select Drop
  ↓
Register
  ↓
Registration Accepted
```

### Duplicate Registration

```text
Register
   ↓
Register Again
   ↓
Rejected
```

### Registration Closed

```text
Registration Closed
        ↓
   New Request
        ↓
      Rejected
```

### Rate Limit

```text
Excessive Requests
        ↓
Per-User Rate Limit
        ↓
Requests Throttled
```

### Concurrent Flash Crowd

```text
Multiple Authenticated Users
          ↓
Concurrent HTTP Requests
          ↓
       Django API
          ↓
Validation + Rate Limiting
          ↓
        Database
          ↓
   Performance Metrics
```

### Allocation

```text
Registration Closes
        ↓
Admin Starts Allocation
        ↓
Seats Assigned
        ↓
Users View Result
```

---

## Scalability

The current system is a **working prototype**, not a production-scale load-tested deployment.

A production architecture could use:

```text
                       Load Balancer
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Django API     Django API     Django API
             │              │              │
             └──────────────┼──────────────┘
                            │
                     Managed Redis
                            │
                        PostgreSQL
                            │
                   Background Workers
```

Potential production improvements:

- PostgreSQL instead of SQLite
- Managed Redis
- Horizontal Django scaling
- Load balancing
- Background workers
- Distributed rate limiting
- Locust/k6 load testing
- HTTPS
- Environment-based secrets
- Centralized monitoring
- Logging and observability

---

## Current Limitations

- SQLite is used for the current prototype.
- Large-scale traffic such as tens of thousands of concurrent users has not been claimed or validated.
- Advanced bot detection is not implemented.
- Production infrastructure and monitoring are not included.
- Production secrets should be provided through environment variables.
- The current simulator validates smaller-scale concurrent real HTTP traffic.
- Large-scale stress testing would require dedicated tools such as Locust or k6.

---

## Future Improvements

- PostgreSQL production database
- Distributed Redis infrastructure
- Advanced bot detection
- CAPTCHA integration
- IP and device-based abuse prevention
- Queue-based admission control
- Large-scale Locust/k6 testing
- Background allocation workers
- Real-time allocation notifications
- Advanced monitoring and analytics
- Stronger production security
- Immutable audit trail / blockchain integration where required

---

## Why FairDrop?

Traditional first-come-first-served systems can reward:

```text
Faster scripts
More requests
Repeated attempts
Lower network latency
```

FairDrop changes the model:

```text
Authenticate
     ↓
Register During Valid Window
     ↓
Protect The Registration System
     ↓
Close Registration
     ↓
Allocate Separately
     ↓
Show Result
```

The key principle is:

> **Being faster at sending requests should not automatically mean being more likely to receive a seat.**

---

## Team

### Syntax Error

**Event:** BIT N BUILD 2026 — Internal Round

**Project:** FairDrop

**Problem Statement:** Web/App — PS 3: Fair Drop

---

## Repository

**GitHub:**  
https://github.com/Sayan07-hi/BNB26_Syntax-Error_Internal_Round

---

## Built With

**React • Vite • Django • Django REST Framework • JWT • Redis • SQLite • Python • REST API**
