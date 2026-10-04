# FairDrop

### BNB26 Syntax Error — BIT N BUILD 2026 Internal Round

> **A fair, secure and concurrency-aware registration and allocation platform for high-demand events.**

---

## Problem Statement

### Web/App — PS 3: Fair Drop

Develop a high-demand sale and registration platform where automated clients cannot gain a significant advantage through speed, request volume, or repeated attempts.

The system must remain reliable during a simulated flash crowd while maintaining consistent allocation and user state.

---

# About FairDrop

FairDrop is a registration and allocation platform designed for high-demand events where a large number of users may attempt to register within a short period of time.

Instead of relying purely on first-come-first-served registration, FairDrop separates the process into two controlled stages:

1. **Registration** — authenticated users register during a defined registration window.
2. **Allocation** — after registration closes, available seats are fairly allocated among eligible participants.

The system combines authentication, server-side validation, database-level duplicate protection, Redis-based rate limiting, concurrent traffic simulation and transparent allocation status.

---

# Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication.
- Separate user and administrator capabilities.
- Only authorized staff/admin users can create Drops.
- Normal users can register for available Drops.

### 🎟️ Multiple Drops

Administrators can create multiple independent Drops.

Each Drop has its own:

- Name
- Description
- Seat capacity
- Registration window
- Participant pool
- Allocation state

Users can browse available Drops and select the Drop they want to register for.

### 🛡️ Duplicate Registration Protection

A user can register only once for the same Drop.

Duplicate protection is enforced at the database level using a unique constraint on:

```text
(user, drop)
