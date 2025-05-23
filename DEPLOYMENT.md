# Qindred Deployment Guide

## Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- npm
- Git

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd qindred
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   composer install
   npm install
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Set up the database:
   ```bash
   php artisan migrate
   ```

## Local Development

1. Start the development server:
   ```bash
   php artisan serve
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Environment Variables

Ensure the following environment variables are set in your production environment:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (generated using `php artisan key:generate`)
- Database credentials
- Any third-party service credentials

### Deployment Steps

1. Build frontend assets:
   ```bash
   npm run build
   ```

2. Optimize Laravel:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. Set proper permissions:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

### Deployment Using GitHub Actions

The project includes GitHub Actions workflows for automated deployment:

1. The `ci.yml` workflow runs on every push and pull request to main and develop branches:
   - Runs PHP tests
   - Runs ESLint
   - Builds frontend assets

2. The `deploy.yml` workflow runs on pushes to the main branch:
   - Builds the application
   - Deploys to the production environment

### Required Secrets

Set the following secrets in your GitHub repository:

- `ENV_FILE`: Your complete production .env file
- `DIGITALOCEAN_ACCESS_TOKEN`: Your DigitalOcean API token
- `DIGITALOCEAN_APP_ID`: Your DigitalOcean App ID

## Troubleshooting

### Common Issues

1. **Storage Permission Issues**
   ```bash
   chmod -R 775 storage bootstrap/cache
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
   php artisan migrate:fresh --seed
   ```

### Health Checks

1. Verify the application is running:
   ```bash
   curl https://your-domain.com/health
   ```

2. Check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```

## Rollback Procedure

1. Identify the last working deployment
2. Use Git to revert to the last known good commit
3. Run deployment workflow
4. Verify application functionality

## Monitoring

- Set up application monitoring using Laravel Telescope
- Configure error tracking (e.g., Sentry)
- Set up server monitoring (e.g., New Relic)

## Support

For deployment issues or questions, please:
1. Check the logs in storage/logs
2. Review the GitHub Actions workflow runs
3. Create an issue in the repository
