# Oflem - Premium Swiss Task-Based Local Services Platform

Oflem is a premium Swiss platform connecting people who need help (**Flemmards**) with those ready to provide it (**Motivés**). Facilitating secure, escrow-based task completion with real-time chat and AI moderation.

---

## 📖 Main Documentation

We have simplified our documentation into two core guides:

1.  **[PROJECT_WALKTHROUGH.md](./PROJECT_WALKTHROUGH.md)**: A technical overview for developers, detailing the technology stack, project structure, and core logic flows.
2.  **[USER_GUIDE.md](./USER_GUIDE.md)**: A tutorial-style guide for Flemmards and Motivés on how to use the platform, post missions, and get tasks completed.

---

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### Installation

```bash
# Clone and enter repository
git clone https://github.com/HiraZahid123/mvp-backend.git
cd mvp-backend

# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Run migrations and build
php artisan migrate --seed
npm run build

# Start services
php artisan serve
php artisan reverb:start
npm run dev
```
