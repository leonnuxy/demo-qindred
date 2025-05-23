# Qindred Deployment Guide

## Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- npm
- Git
- Web server (Apache/Nginx)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd qindred
   ```

2. Install dependencies:
   ```bash
   composer install --no-dev --optimize-autoloader
   npm install
   ```

3. Configure environment:
   - Copy production.env.template to .env
   - Update the values with your production settings
   - Generate application key: `php artisan key:generate`

4. Build frontend assets:
   ```bash
   npm run build
   ```

5. Set up the database:
   ```bash
   php artisan migrate
   ```

## Manual Deployment

1. Set up your web server (Apache/Nginx) to point to the `/public` directory

2. Configure PHP-FPM (if using)

3. Set proper permissions:
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

4. Optimize Laravel:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Automated Deployment via GitHub Actions

The project includes a GitHub Actions workflow that:
1. Builds the application
2. Creates a deployment artifact
3. Makes it available for download

To use automated deployment:

1. Set up GitHub Secrets:
   - `ENV_FILE`: Your complete production .env file

2. Set up GitHub Environments:
   - Create a "production" environment
   - Add appropriate protection rules

3. When code is pushed to main:
   - Workflow will create a build artifact
   - Download and extract the artifact on your server
   - Update your web server configuration if needed

## Deployment Checklist

Before deploying:
- [ ] Update APP_ENV to 'production'
- [ ] Set APP_DEBUG to 'false'
- [ ] Configure proper logging
- [ ] Set up proper database credentials
- [ ] Configure mail settings
- [ ] Update APP_URL to your domain
- [ ] Set secure CORS settings if needed

## Troubleshooting

### Common Issues

1. **Storage Permission Issues**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

2. **Cache Issues**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan view:clear
   ```

3. **Database Issues**
   ```bash
   php artisan migrate:status
   ```

### Health Check

Visit `/api/health` to verify the application status.

## Support

For deployment issues:
1. Check the logs in `storage/logs`
2. Review the GitHub Actions workflow runs
3. Create an issue in the repository
