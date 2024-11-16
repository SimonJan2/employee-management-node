# Starting the Employee Management System

## 1. Initial Setup

First, clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/employee-management.git
cd employee-management
npm install
```

## 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```plaintext
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key

# AWS (if using S3 for file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
```

## 3. Start the Application

### Option 1: Using Docker (Recommended)

```bash
# Start all services (database, redis, and application)
docker-compose up -d

# Watch the logs
docker-compose logs -f app
```

### Option 2: Local Development

```bash
# Start PostgreSQL (if not using Docker)
pg_ctl -D /usr/local/var/postgres start

# Run database migrations
npm run migrate

# Seed the database with initial data
npm run seed

# Start the application in development mode
npm run dev
```

### Option 3: Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

## 4. Access the Application

Once started, you can access the application at:

- Web Interface: http://localhost:3000
- API Endpoints: http://localhost:3000/api/v1

## 5. Default Admin Login

Use these credentials to log in as admin:
- Email: simonj@gmail.com
- Password: 123456

## 6. Available NPM Scripts

```bash
# Development with hot reload
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Database migrations
npm run migrate

# Database seeding
npm run seed

# Production build
npm run build

# Production start
npm start
```

## 7. Development Tools

### Database Management
Access Adminer (database management interface):
- URL: http://localhost:8080
- System: PostgreSQL
- Server: db
- Username: postgres
- Password: postgres
- Database: employee_management

### API Documentation
Access Swagger documentation:
- URL: http://localhost:3000/api-docs

### Monitoring
Access monitoring dashboards:
- Application Metrics: http://localhost:3000/metrics
- Health Check: http://localhost:3000/health

## 8. Troubleshooting

### Reset Database
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
npm run migrate
npm run seed
```

### Clear Application Cache
```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### View Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# All services
docker-compose logs -f
```

### Common Issues

1. Database Connection Issues
```bash
# Check database status
docker-compose ps db
# or
pg_isready -h localhost -p 5432
```

2. Port Conflicts
```bash
# Check ports in use
netstat -tulpn | grep LISTEN
```

3. Permission Issues
```bash
# Fix file permissions
chmod -R 777 storage/
```

## 9. Updates and Maintenance

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update with breaking changes
npm install <package>@latest
```

### Backup Database
```bash
# Create backup
npm run db:backup

# Restore from backup
npm run db:restore
```

## 10. Additional Resources

- Project Documentation: `/docs`
- API Documentation: `/docs/api.md`
- Contributing Guide: `/CONTRIBUTING.md`
- Change Log: `/CHANGELOG.md`