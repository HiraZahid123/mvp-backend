# Oflem Platform: Strategic Overview & Technical Guide

Welcome to the official documentation for the **Oflem** platform. This guide provides a deep dive into the system's architecture, core modules, and the secure workflows that drive the marketplace.

---

## 🌟 Executive Summary
Oflem is a premium, service-matching ecosystem connecting **Clients** with specialized **Performers**. Built with a "Security-First" philosophy, the platform ensures that every interaction is moderated, every payment is secured via escrow, and every user is verified.

---

## 🛠 Strategic Modules & Features

### 1. Intelligent User Onboarding & Identity
- **Multi-Phase Verification**: Integrates manual email verification (6-digit OTP via `OTPService`) and Social OAuth (Google/Facebook) to ensure identity integrity.
- **Dynamic Role Ecosystem**: Users choose between Client (posting missions) and Performer (applying for missions) roles, with specific interfaces tailored to each.
- **AI-Powered Performer Onboarding**: New performers undergo an automated skill analysis. Our AI categorizes their expertise and suggests profile optimizations to increase their hireability.
- **Lifestyle Features**: Includes "Mood of the Day" and customizable notification preferences (Email/In-App) via `NotificationService`.

### 2. High-Precision Mission Engine
- **Automated Moderation**: All mission content is scanned by the `ModerationService` to filter out inappropriate content, contact info (to prevent platform bypass), or policy violations.
- **AI Brief Optimization**: An integrated "Help me write" feature allows clients to use LLMs to expand simple ideas into professional, high-converting mission descriptions.
- **Advanced Matchmaking & Geofencing**:
    - **Proximity Search**: Uses the Haversine formula for millimetre-perfect distance calculations within a defined radius.
    - **Match Score**: Ranks performers based on distance, category relevance, and past performance.
- **Flexible Pricing**: Supports both fixed-price and negotiable budget missions.

### 3. Secure Messaging & Real-Time Collaboration
- **Encapsulated Chat Rooms**: Every mission spawns a unique, secure chat instance via the `ChatController`.
- **Integrity Shields**: Real-time `ChatModerationService` monitors conversations for sensitive data or illegal activities, flagging users for admin review after repeated "strikes."
- **System Events**: The chat acts as a historical log, automatically injecting status updates (e.g., "Assignment Confirmed," "Work Started") to maintain a clear audit trail.
- **Technical Backbone**: Powered by Laravel Echo and WebSockets for instantaneous messaging.

### 4. Financial Escrow & Stripe Integration
- **Stripe Connect-Ready Architecture**: Managed through a robust `StripeService`.
- **The Escrow Process**:
    1. **Commitment**: Client selects an offer.
    2. **Locking**: Client pays the budget to the platform.
    3. **Guarantee**: Performer sees the "Funds Locked" status, providing confidence to begin work.
    4. **Settlement**: Funds are only released upon Client validation or Admin dispute resolution.
- **Transparent Commissions**: Automated calculation and deduction of platform fees during the payout phase.

### 5. Management & Governance (Admin)
- **Unified Control Panel**: Admins can monitor system health, manage users (ban/suspend), and review flagged content.
- **Dispute Resolution Flow**: A dedicated logic layer for `EN_LITIGE` status allows admins to review chat logs, proof of work, and issue manual payouts or refunds.

---

## 🔄 The Mission Lifecycle (Workflow)

The platform follows a strict state-machine logic (defined in the `Mission` model) to ensure data integrity.

### Workflow Phases:

1.  **Phase 1: Discovery (OUVERTE)**
    - Client posts a task.
    - Performers browse and ask questions or submit offers.
2.  **Phase 2: Negotiation (EN_NEGOCIATION)**
    - Client reviews offers, interviews performers via chat.
    - Selection of the final performer occurs here.
3.  **Phase 3: Security Lock (VERROUILLEE)**
    - Client pays the budget. **Crucial Security Step:** The platform now reveals the *Exact Address* and *Completion Proof requirements* to the performer.
4.  **Phase 4: Execution (EN_COURS)**
    - Performer clicks "Start Work." This notifies the client and marks the official beginning of the service.
5.  **Phase 5: Validation (EN_VALIDATION)**
    - Performer uploads proof (photos/notes) and submits for review.
    - Client has the opportunity to approve or initiate a dispute.
6.  **Phase 6: Fulfillment (TERMINEE)**
    - Client approves. Funds are transferred from escrow to the performer's wallet.
    - Review system opens for both parties.

---

## 🛡 Platform Integrity
- **Address Masking**: Precise locations are never revealed to anyone except the hired performer *post-payment*.
- **Conflict Management**: Built-in Dispute management ensures that no money is lost if a service is not delivered as promised.
- **Modern Stack**: Built on **Laravel 11**, **React.js (Inertia)**, and **MySQL** with full-text indexing for maximum speed and reliability.
