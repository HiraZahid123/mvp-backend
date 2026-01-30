# Oflem Platform Deployment Guide

This guide covers the essential steps to deploy the Oflem platform to a production environment.

## 1. Server Requirements
Ensure your server meets the following requirements:
- **PHP**: >= 8.2 (with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML)
- **Composer**: Latest version
- **Node.js**: >= 18.x & **NPM**
- **Database**: MySQL 8.0+ or MariaDB 10.x
- **Web Server**: Nginx (Recommended) or Apache
- **Supervisor**: For managing queue workers and Reverb (WebSockets)

## 2. Environment Configuration
Clone your repository and conduct the following setup in your project root.

1.  **Copy Environment File:**
    ```bash
    cp .env.example .env
    ```

2.  **Edit `.env` for Production:**
    Update the following keys in your `.env` file. **Crucial for security and functionality.**

    ```ini
    APP_NAME=Oflem
    APP_ENV=production
    APP_KEY=  # Run 'php artisan key:generate' to fill this
    APP_DEBUG=false
    APP_URL=https://your-domain.com

    # Database
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=oflem_db
    DB_USERNAME=your_db_user
    DB_PASSWORD=your_db_password

    # Broadcast (Reverb)
    BROADCAST_CONNECTION=reverb
    REVERB_APP_ID=your_app_id
    REVERB_APP_KEY=your_app_key
    REVERB_APP_SECRET=your_app_secret
    REVERB_HOST="your-domain.com"
    REVERB_PORT=8080 # Or 443 if proxied via Nginx
    REVERB_SCHEME=https

    # Stripe (Use Live Keys)
    STRIPE_KEY=pk_live_...
    STRIPE_SECRET=sk_live_...
    STRIPE_WEBHOOK_SECRET=whsec_...

    # Mail
    MAIL_MAILER=smtp
    # ... configure your SMTP provider ...
    ```

## 3. Installation & Build

Run the following commands to install dependencies and build assets.

```bash
# 1. Install PHP dependencies (optimized for production)
composer install --no-dev --optimize-autoloader

# 2. Generate App Key (if you haven't already)
php artisan key:generate

# 3. Create Storage Symlink (Important for file uploads)
php artisan storage:link

# 4. Database Migration
# standard production migration (preserves data)
php artisan migrate --force 

# ONLY use this if this is the VERY FIRST install and you want dummy data:
# php artisan migrate:fresh --seed --force

# 5. Install Node dependencies
npm install

# 6. Build Frontend Assets (Vite)
# This compiles your React/Tailwind code into static files in /public
npm run build
```

## 4. Optimization (Critical for Speed)

Run these commands to cache configuration and routes. **Run these every time you deploy updates.**

```bash
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache
```

## 5. Directory Permissions

Ensure your web server (e.g., `www-data` or `nginx`) has write access to storage:

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## 6. Background Processes (Supervisor)

Since you are using **Laravel Reverb** (WebSockets) and likely have asynchronous tasks (emails, Stripe webhooks), you **must** keep these processes running.

Install Supervisor on your server (e.g., `apt-get install supervisor`) and create configuration files in `/etc/supervisor/conf.d/`.

### A. Queue Worker (`oflem-worker.conf`)
Handles emails, notifications, and background jobs.
```ini
[program:oflem-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/project/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/worker.log
stopwaitsecs=3600
```

### B. Reverb Server (`oflem-reverb.conf`)
Handles real-time chat and updates.
```ini
[program:oflem-reverb]
process_name=%(program_name)s
command=php /path/to/your/project/artisan reverb:start
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/your/project/storage/logs/reverb.log
```

After modifying configs, run:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

## 7. Web Server Configuration (Nginx Example)

Ensure your Nginx config points to the `public` directory.

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/project/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
