# cPanel Deployment Guide for Oflem

Deploying a modern Laravel app (with Vite & Reverb) to cPanel shared hosting requires specific adaptation, as shared hosts often lack support for long-running processes (Reverb) and Node.js build tools.

## 1. ⚠️ CRITICAL: WebSockets (Reverb vs. Pusher)

**Problem:** Your project currently uses **Laravel Reverb**, which requires a long-running server command (`php artisan reverb:start`) and open ports (8080). **This typically DOES NOT WORK on cPanel shared hosting.**

**Solution:** Switch to **Pusher (SaaS)** (free tier available).

### Step A: Update Frontend Code (COMPLETED)
I have already modified `resources/js/bootstrap.js` to support both Reverb and Pusher dynamically. It will now automatically use Pusher if `VITE_BROADCAST_CONNECTION=pusher` is set in your `.env`.

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Determine if we are using Reverb or Pusher based on config
// If you are on cPanel, you likely need 'pusher'
const broadcaster = import.meta.env.VITE_BROADCAST_CONNECTION || 'reverb';

if (broadcaster === 'reverb') {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
} else {
    // PUSHER CONFIGURATION
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true
    });
}
```

### Step B: Update `.env` (COMPLETED)
I have already updated your `.env` file with Pusher placeholders and set the connection to `pusher`. You just need to fill in your Pusher credentials.
```ini
BROADCAST_CONNECTION=pusher
VITE_BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your_id_from_pusher_com
PUSHER_APP_KEY=your_key_from_pusher_com
PUSHER_APP_SECRET=your_secret_from_pusher_com
PUSHER_APP_CLUSTER=mt1

# Frontend needs these too (Vite hardcodes them at build time, see below)
VITE_PUSHER_APP_KEY=your_key_from_pusher_com
VITE_PUSHER_APP_CLUSTER=mt1
```

## 2. 🏗️ Build Assets LOCALLY

cPanel usually cannot run `npm run build`. You must do this **on your computer** before uploading.

1.  **Configure Local .env**: Ensure your LOCAL `.env` has the correct `VITE_PUSHER_APP_KEY` (if using Pusher) because Vite **bakes these values into the Javascript files**.
2.  **Run Build**:
    ```bash
    npm run build
    ```
    This creates/updates the `public/build` directory.
3.  **Zip & Upload**: Zip your project (excluding `node_modules`). Ensure `public/build` is included.

## 3. 📂 Folder Structure (Secure Method)

Do not just dump everything into `public_html`.

1.  **Create Project Folder**: Creating a folder `repositories/oflem` (or similar) outside or parallel to `public_html`.
2.  **Upload Code**: Extract your project zip there.
3.  **Link Public**: Delete the default `public_html` folder (if empty) and create a symbolic link.
    *   **Terminal Command**:
        ```bash
        ln -s /home/your_user/repositories/oflem/public /home/your_user/public_html
        ```
    *   *Alternative (Copy Method)*: Valid but messier. Copy contents of `public` to `public_html`. Edit `index.php` to point to `../repositories/oflem/bootstrap/app.php`.

## 4. 🗄️ Database & Migrations

**Do NOT run `migrate:fresh`**. That deletes all data.

1.  **Create DB**: Use cPanel "MySQL Database Wizard".
2.  **Edit .env**: Update DB credentials.
3.  **Migrate**: Run this via SSH Terminal:
    ```bash
    php artisan migrate --force
    ```
    *If you need initial data (seeds), run specific seeders ONCE:*
    ```bash
    php artisan db:seed --class=DatabaseSeeder --force
    ```

## 5. ⏰ Scheduler (Mandatory)

You have hourly/daily tasks configured (Mission Autocomplete, OTP Cleanup). You **must** add a Cron Job.

1.  Go to **cPanel > Cron Jobs**.
2.  Add a new Cron Job (runs once per minute `* * * * *`).
3.  Command:
    ```bash
    cd /home/your_user/repositories/oflem && php artisan schedule:run >> /dev/null 2>&1
    ```
    *(Adjust path to match where you uploaded the code)*.

## 6. 📨 Queue Worker

Since you don't have Supervisor on shared hosting, use the Cron to process queues.

1.  Add another Cron Job (runs once per minute `* * * * *`).
2.  Command:
    ```bash
    cd /home/your_user/repositories/oflem && php artisan queue:work --stop-when-empty
    ```

## 7. 🔗 Storage Link

Files uploaded to `storage/app/public` won't be visible unless linked.
Run via Terminal:
```bash
php artisan storage:link
```
