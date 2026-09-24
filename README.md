````markdown
# FlyRank Capstone — Social Media Studio

A backend system that converts a single blog post into a multi-platform social media campaign.

The system accepts a blog post, generates platform-specific variants, validates them against platform constraints, allows human approval, schedules approved posts, and publishes them through a common publisher interface.

---

## 🚀 Project Overview

The goal of this project is to build a reliable social media publishing system.

### Main Workflow

```text
Blog Post
    ↓
Post Ingestion
    ↓
Variant Generation
    ↓
Constraint Validation
    ↓
Human Review
    ↓
Approval
    ↓
Scheduling
    ↓
SocialPublisher Interface
    ↓
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Telegram / Discord  │ Mock X Publisher    │ Mock LinkedIn       │
│ Real Publisher      │                     │ Publisher           │
└─────────────────────┴─────────────────────┴─────────────────────┘
    ↓
Publish History
````

The system is designed around:

* Platform-specific content constraints
* Human review and approval
* Adapter architecture
* Idempotent publishing
* Durable scheduling
* Publish history
* Secure environment variables

---

## ✨ Features

### 1. Post Ingestion

The system accepts a blog post as:

* URL
* Pasted Markdown

The original post is stored and acts as the source of truth for content generation.

---

### 2. Platform Variants

The system generates a separate version of the post for each configured platform.

Each platform has its own constraint profile, including:

* Maximum length
* Tone
* Hashtag count

A variant that violates the platform rules is rejected before it reaches the review stage.

---

### 3. Review Workflow

Every generated variant follows a controlled workflow:

```text
Draft
  ↓
Approved / Rejected
  ↓
Published
```

Only approved variants can be scheduled.

An unapproved variant cannot be scheduled.

---

### 4. Publisher Adapter Architecture

The application uses a common `SocialPublisher` interface.

Example adapters:

```text
SocialPublisher
│
├── TelegramPublisher
├── MockXPublisher
└── MockLinkedInPublisher
```

The business logic communicates with the common interface instead of directly depending on a specific social media platform.

This makes it possible to change the publishing platform without changing the core business logic.

---

### 5. Idempotent Publishing

The publishing system uses an idempotency key based on the variant and scheduled slot.

The same variant should not be published twice for the same scheduled slot, even if a publish operation is retried.

Example:

```text
Variant: 123
Slot: 2026-09-25 18:00

First attempt  → Published
Retry           → No duplicate publication
```

---

### 6. Durable Scheduling

Scheduled jobs are stored persistently so that the scheduler can continue safely after a worker restart.

The system is designed to prevent duplicate posts when a worker stops during a batch.

---

### 7. Publish History

Every publish attempt is recorded with its result.

Example:

```text
Variant ID
Platform
Scheduled Time
Attempt Time
Status
Result
```

---

# 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │    Blog Post     │
                         │ URL / Markdown   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Ingestion    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Variant Generator│
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Validation    │
                         │ Length / Tone /  │
                         │ Hashtags         │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Review Workflow │
                         │ Draft / Approved │
                         │ / Rejected       │
                         └────────┬─────────┘
                                  │
                              Approved
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Scheduler     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ SocialPublisher  │
                         │    Interface     │
                         └────────┬─────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Telegram   │  │    Mock X    │  │ Mock LinkedIn│
        │    Adapter   │  │   Adapter    │  │   Adapter    │
        └──────────────┘  └──────────────┘  └──────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Publish History  │
                         └──────────────────┘
```

---

# 🛠️ Technology Stack

| Component             | Technology                           |
| --------------------- | ------------------------------------ |
| Backend               | Node.js + Express / Python + FastAPI |
| Database              | SQLite / PostgreSQL                  |
| Scheduler             | BullMQ + Redis / APScheduler         |
| Real Platform         | Telegram / Discord / Mastodon        |
| Mock Platforms        | Mock X + Mock LinkedIn               |
| AI Generation         | Gemini / Ollama / Templates          |
| Environment Variables | `.env`                               |

---

# 📁 Project Structure

```text
flyrank-capstone-social-studio/
│
├── src/
│   ├── adapters/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scheduler/
│   └── utils/
│
├── tests/
│
├── README.md
├── EVIDENCE.md
├── BUILDLOG.md
├── .env.example
├── .gitignore
│
└── package.json
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/LakshyaSaraswat07/flyrank-capstone-social-studio.git
```

## 2. Enter the Project Directory

```bash
cd flyrank-capstone-social-studio
```

## 3. Install Dependencies

### Node.js

```bash
npm install
```

### Python

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=YOUR_DATABASE_URL
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID
```

Never commit your `.env` file to GitHub.

Use `.env.example` to document the required variables without exposing real credentials.

---

# ▶️ Running the Application

## Start the Application

### Node.js

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### Python

```bash
python app.py
```

---

# 🌱 Seed / Sample Data

If the project includes seed data, run:

```bash
npm run seed
```

---

# 🧪 Testing

Run the test suite using:

```bash
npm test
```

The important scenarios include:

1. Blog post ingestion
2. Variant generation
3. Constraint validation
4. Rejection of invalid variants
5. Approval workflow
6. Blocking unapproved scheduling
7. Successful scheduling
8. Idempotent publishing
9. Worker restart recovery
10. Adapter switching

---

# 🔄 Example Workflow

### Step 1 — Add a Blog Post

```text
POST /posts
```

The system stores the blog post.

### Step 2 — Generate Variants

```text
POST /posts/{id}/variants
```

Platform-specific variants are generated.

### Step 3 — Validate Variants

Each variant is checked against its platform constraint profile.

### Step 4 — Review

A user can:

```text
Approve
Edit
Reject
```

### Step 5 — Schedule

Only an approved variant can be scheduled.

### Step 6 — Publish

The scheduler publishes the approved variant through the selected adapter.

### Step 7 — History

The publish attempt is recorded in the publish history.

---

# 🔒 Security

The project follows these security practices:

* Secrets are stored in environment variables.
* `.env` is excluded from Git.
* `.env.example` contains only placeholder values.
* Real API credentials are never committed.
* Real social publishing is limited to accounts owned by the developer.

---

# ♻️ Idempotency

The publisher uses an idempotency key to prevent duplicate publishing.

Conceptually:

```text
idempotency_key =
    variant_id + scheduled_slot
```

If the same publish operation is retried:

```text
First Request
     ↓
Publish
     ↓
Record Success

Retry Request
     ↓
Check Idempotency Key
     ↓
Already Published
     ↓
Do Not Publish Again
```

This protects the system from duplicate posts caused by retries or worker failures.

---

# 🧩 Adapter Design

The application uses a common publisher interface.

```text
SocialPublisher
       │
       ├── TelegramPublisher
       │
       ├── MockXPublisher
       │
       └── MockLinkedInPublisher
```

Adding a new platform should require creating a new adapter rather than rewriting the application's business logic.

---

# 📊 Evidence

Detailed verification results are available in:

```text
EVIDENCE.md
```

The evidence should demonstrate:

* Constraint validation
* Unapproved scheduling rejection
* Successful publishing
* Idempotent retry behavior
* Durable scheduling
* Adapter switching

---

# 🤖 AI Usage

AI assistance used during development is documented in:

```text
BUILDLOG.md
```

The build log records:

* Where AI helped
* What AI-generated suggestions were used
* Errors or incorrect suggestions
* Changes made by the developer

---

# ⚠️ Known Limitations

Current limitations:

* Real publishing is limited to the configured free platform.
* X and LinkedIn use mock adapters.
* Image generation is outside the project scope.
* Analytics are outside the project scope.
* Engagement tracking is outside the project scope.
* Real Instagram publishing is not included.

---

# 📌 Project Requirements

The project demonstrates:

* Post ingestion
* Platform-specific variants
* Constraint enforcement
* Human approval workflow
* Adapter architecture
* Idempotent publishing
* Durable scheduling
* Publish history
* Secure secret management

---

# 👨‍💻 Author

**Lakshya Saraswat**

B.Tech — Electronics & Communication Engineering

GitHub:
[https://github.com/LakshyaSaraswat07](https://github.com/LakshyaSaraswat07)

---

# 📄 License

This project was created as part of the FlyRank Internship Backend Track Capstone.

```
```
