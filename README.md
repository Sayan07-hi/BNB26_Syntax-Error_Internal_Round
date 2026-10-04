FairDrop
BNB26 Syntax Error — BIT N BUILD 2026 Internal Round
A fair, secure and concurrency-aware registration and allocation platform for high-demand events.

Problem Statement
Web/App — PS 3: Fair Drop
Develop a high-demand sale and registration platform where automated clients cannot gain a significant advantage through speed, request volume, or repeated attempts.
The system must remain reliable during a simulated flash crowd while maintaining consistent allocation and user state.
What is FairDrop?
FairDrop is a registration and allocation platform designed for high-demand events where many users attempt to register within a short period.
Instead of relying purely on first-come-first-served registration, FairDrop separates the process into two controlled stages:
Registration → Registration Closes → Fair Allocation → Result
Users register during a controlled registration window. Once registration closes, the eligible participant pool is finalized and seats are allocated separately.
Key Features
- 🔐 JWT Authentication — authenticated users and protected admin actions.
- 👥 Multiple Users & Admins — separate user and staff/admin capabilities.
- 🎟️ Multiple Drops — each Drop has its own capacity, registration window and allocation state.
- 🛡️ Duplicate Protection — one registration per user per Drop.
- ⏱️ Server-Side Registration Control — registration timing is enforced by the backend.
- 🚦 Redis Rate Limiting — 30 requests/minute per authenticated user.
- ⚡ Concurrent Traffic Simulation — real authenticated users send concurrent HTTP requests to the actual registration API.
- 📊 Performance Metrics — success/failure count, average latency, P95 latency and total execution time.
- 🔒 Controlled Allocation — allocation starts only after registration closes.
- 📱 Allocation Status — users can see whether they are awaiting allocation, allocated or not allocated.
System Workflow
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   JWT Login      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Select a Drop   │
                    └────────┬─────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Registration Window Open?   │
              └──────────────┬──────────────┘
                             │ Yes
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
                    │  Store Entry     │
                    └────────┬─────────┘
                             │
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

Tech Stack
Layer	Technology
Frontend	React, Vite, JavaScript, CSS
Frontend Routing	React Router
Backend	Django 6.1.1
API	Django REST Framework 3.18.1
Authentication	JWT / SimpleJWT 5.5.1
Rate Limiting	django-ratelimit 4.1.0
Fast State & Rate Control	Redis 8.1.0
Database	SQLite
Simulation	Python
Communication	REST API / HTTP
Version Control	Git + GitHub


Dependencies
Backend
The backend is built using Python and Django.
Core Dependencies
Django==6.1.1
djangorestframework==3.18.1
djangorestframework-simplejwt==5.5.1
django-ratelimit==4.1.0
redis==8.1.0

Install backend dependencies:
cd backend
pip install -r requirements.txt

Dependency Roles
Dependency	Purpose
Django	Backend framework and application structure
Django REST Framework	REST API development
SimpleJWT	JWT-based authentication
django-ratelimit	Request rate limiting
Redis	Fast temporary state and rate-limit tracking
SQLite	Local database


Frontend
The frontend uses:
React
React DOM
React Router
Vite

Install dependencies:
cd frontend
npm install

Run the development server:
npm run dev

Simulation Dependencies
The traffic simulation uses Python and communicates with the backend through real HTTP requests.
The simulator uses:
- Authenticated simulation users
- JWT tokens
- Concurrent requests
- Real registration API calls
- Latency and success/failure measurement
Architecture
                         ┌─────────────────────┐
                         │    React + Vite     │
                         │      Frontend       │
                         └──────────┬──────────┘
                                    │
                                REST / JWT
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Django + DRF     │
                         │       Backend       │
                         │                     │
                         │ Authentication      │
                         │ Registration        │
                         │ Validation          │
                         │ Rate Limiting       │
                         │ Allocation          │
                         └──────┬───────┬──────┘
                                │       │
                           Redis│       │Database
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

Core Protection Model
FairDrop uses multiple layers of protection rather than relying on a single mechanism:
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

This prevents simply sending more requests or repeatedly attempting registration from automatically providing an advantage.
Authentication & Authorization
Authentication
FairDrop uses JWT-based authentication.
Users must authenticate before accessing protected functionality.
Authorization
Administrative operations are protected using Django staff/admin permissions.
Only authorized staff/admin users can perform administrative operations such as creating and managing Drops and starting allocation.
Normal users cannot perform administrative actions.
Multiple Drops
FairDrop supports multiple independent Drops.
Each Drop maintains its own:
- Name
- Description
- Seat capacity
- Registration start time
- Registration end time
- Participant pool
- Allocation state
Users can browse available Drops and register for the Drop they choose.
Different Drops remain independent from one another.
Duplicate Registration Protection
A user can register only once for the same Drop.
This is enforced at the database level using a unique constraint:
(user, drop)

Conceptually:
User A → Drop 1 → Registration ✓
User A → Drop 1 → Registration ✗
User A → Drop 2 → Registration ✓

This means application-level checks are backed by a database constraint.
Rate Limiting
FairDrop applies rate limiting on authenticated registration requests.
Current prototype limit:
30 requests / minute / authenticated user

Redis is used to support fast rate-limit tracking.
This prevents a single authenticated client from continuously flooding the registration endpoint.
Server-Side Registration Control
The registration window is controlled by the backend.
The backend checks whether registration is currently allowed before accepting an entry.
The frontend cannot override these checks.
This ensures that:
Registration Start
        ↓
Registration Allowed
        ↓
Registration End
        ↓
New Registration Rejected

An administrator can also close registration before the originally configured end time.
Registration → Allocation Separation
FairDrop intentionally separates registration from allocation.
Registration Phase
Users submit registrations while the registration window is open.
Valid registrations are added to the participant pool.
Registration Closure
An administrator closes registration.
The eligible participant pool is then finalized.
Allocation Phase
Allocation is started separately after registration closes.
Seats are then assigned to eligible participants.
User Result
Users can see one of three states:
Awaiting Allocation
        ↓
 ┌──────┴──────┐
 ▼             ▼
Allocated   Not Allocated

Allocated users can view their assigned seat.
Concurrent Traffic Simulation
FairDrop includes a Python-based flash-crowd simulation.
The simulation does not directly modify the database.
Instead, it:
1. Creates/uses separate simulation users.
2. Authenticates those users.
3. Generates JWT access tokens.
4. Sends real HTTP requests.
5. Sends requests concurrently.
6. Uses the same registration API as the frontend.
7. Measures the resulting performance.
Simulation Flow
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
Validation
       ↓
Duplicate Protection
       ↓
Database
       ↓
Performance Metrics

Simulation Metrics
The simulator records:
Metric	Meaning
Total Requests	Number of requests sent
Successful	Requests accepted by the API
Failed	Requests rejected or unsuccessful
Average Latency	Average API response time
P95 Latency	Time within which 95% of requests completed
Total Execution Time	Time taken for the simulation


Example prototype measurements:
Average Latency : ~100 ms
P95 Latency     : ~153 ms

These are prototype measurements and should not be interpreted as production-scale capacity claims.
For large-scale load testing, tools such as Locust or k6 would be more appropriate.
Automated Client / Bot Protection
FairDrop uses layered controls against automated clients:
Authentication
      ↓
Per-user Rate Limiting
      ↓
Server Validation
      ↓
Duplicate Protection
      ↓
Controlled Registration
      ↓
Separate Allocation

The current prototype does not claim to be completely bot-proof.
Potential production-level additions include:
- CAPTCHA
- IP-based rate limiting
- Device fingerprinting
- Account verification
- Anomaly detection
- Queue-based admission control
Data Model
Drop
Represents an individual registration event.
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

Entry
Represents a user's registration for a Drop.
Entry
├── drop
├── user
└── joined_at

A database constraint enforces:
One User → One Entry → One Drop

Seat
Represents an available seat belonging to a Drop.
Seat numbers are unique within each Drop.
API Overview
The backend exposes REST APIs for:
- Authentication
- Drop management
- Registration
- Registration closure
- Allocation
- Allocation status
- Allocation metrics
- Simulation
Example registration request:
POST /api/v1/entries/

Request:
{
  "drop": 1
}

The endpoint requires authentication and validates the registration before creating the entry.
Project Structure
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

Local Setup
Prerequisites
Install:
- Python
- Node.js
- npm
- Redis
- Git
1. Clone the Repository
git clone https://github.com/Sayan07-hi/BNB26_Syntax-Error_Internal_Round.git
cd BNB26_Syntax-Error_Internal_Round

2. Backend Setup
cd backend

Create a virtual environment:
python -m venv venv

Activate it on Windows:
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

Run migrations:
python manage.py migrate

Create an admin account:
python manage.py createsuperuser

Create simulation users:
python manage.py ensure_simulation_users

Start Django:
python manage.py runserver

Backend:
http://127.0.0.1:8000/

3. Redis Setup
Redis should be running locally:
127.0.0.1:6379

Redis is used for rate limiting and fast temporary state.
4. Frontend Setup
Open another terminal:
cd frontend

Install dependencies:
npm install

Start the frontend:
npm run dev

Running the Simulation
Ensure the following are running:
Redis
Django Backend
Simulation Users

The simulation runner is located at:
simulation/runner.py

The simulator sends requests to the real backend API.
It does not bypass authentication, registration validation or database constraints.
Testing Scenarios
Normal Registration
Login
  ↓
Select Drop
  ↓
Register
  ↓
Registration Accepted

Duplicate Registration
Register
   ↓
Register Again
   ↓
Rejected

Registration Closed
Registration Window Closed
          ↓
     New Request
          ↓
        Rejected

Rate Limit
Excessive Requests
        ↓
Per-user Rate Limit
        ↓
Requests Throttled

Concurrent Flash Crowd
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

Allocation
Registration Closes
        ↓
Admin Starts Allocation
        ↓
Seats Assigned
        ↓
Users View Result

Scalability
The current system is a working prototype and is not presented as a production-scale load-tested system.
For production deployment, the architecture can be extended to:
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
Current Limitations
- SQLite is used for the current prototype.
- Large-scale traffic such as tens of thousands of concurrent users has not been claimed or validated.
- Advanced bot detection is not implemented.
- Production infrastructure and monitoring are not included.
- Production secrets should be provided through environment variables.
- The current simulator validates smaller-scale concurrent real HTTP traffic.
- Large-scale stress testing would require dedicated tools such as Locust or k6.
Future Improvements
- 🚀 PostgreSQL production database
- 🚦 Distributed Redis infrastructure
- 🤖 Advanced bot detection
- 🧩 CAPTCHA integration
- 🌐 IP/device-based abuse prevention
- 📥 Queue-based admission control
- 📊 Large-scale Locust/k6 testing
- ⚙️ Background allocation workers
- 🔔 Real-time allocation notifications
- 📈 Advanced monitoring and analytics
- 🔐 Stronger production security
- ⛓️ Immutable audit trail / blockchain integration where required
Why FairDrop?
Traditional first-come-first-served systems can reward:
Faster scripts
More requests
Repeated attempts
Lower network latency

FairDrop changes the model:
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

The key principle is:
Being faster at sending requests should not automatically mean being more likely to receive a seat.

Team
Syntax Error
Event: BIT N BUILD 2026 — Internal Round
Project: FairDrop
Problem Statement: Web/App — PS 3: Fair Drop
