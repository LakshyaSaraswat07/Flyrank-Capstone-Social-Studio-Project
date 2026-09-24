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
