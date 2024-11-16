# Employee Management System

## Development Environment Setup

### Prerequisites
- Node.js (v16 or later)
- Docker and Docker Compose
- PostgreSQL 13
- AWS CLI
- Terraform

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/employee-management.git
cd employee-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start development environment:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

### Environment Files

#### /employee-management/.env.example
```plaintext
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_management
DB_USER=postgres
DB_PASSWORD=postgres
DB_LOGGING=true

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=15m

# AWS
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=employee-management-uploads

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-new-relic-key

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

#### /employee-management/docker-compose.dev.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"
    environment:
      - NODE_ENV=development
    command: npm run dev
    depends_on:
      - db
      - redis

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=employee_management
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

#### /employee-management/Dockerfile.dev
```dockerfile
FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000 9229

CMD ["npm", "run", "dev"]
```

#### /employee-management/.vscode/launch.json
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Docker: Attach to Node",
            "remoteRoot": "/usr/src/app",
            "port": 9229,
            "skipFiles": [
                "<node_internals>/**"
            ]
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Jest: Current File",
            "program": "${workspaceFolder}/node_modules/.bin/jest",
            "args": [
                "${fileBasename}",
                "--config",
                "jest.config.js"
            ],
            "console": "integratedTerminal",
            "windows": {
                "program": "${workspaceFolder}/node_modules/jest/bin/jest"
            }
        }
    ]
}
```

#### /employee-management/.vscode/settings.json
```json
{
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "javascript.format.enable": false,
    "typescript.format.enable": false,
    "eslint.validate": [
        "javascript",
        "typescript"
    ],
    "[javascript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "[typescript]": {
        "editor.defaultFormatter": "dbaeumer.vscode-eslint"
    },
    "files.exclude": {
        "**/.git": true,
        "**/.DS_Store": true,
        "node_modules": true,
        "dist": true,
        "coverage": true
    }
}
```

### Scripts Section in package.json
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon --inspect=0.0.0.0:9229 src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,md}\"",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "seed:undo": "sequelize-cli db:seed:undo:all",
    "docker:build": "docker-compose -f docker-compose.dev.yml build",
    "docker:up": "docker-compose -f docker-compose.dev.yml up",
    "docker:down": "docker-compose -f docker-compose.dev.yml down",
    "prepare": "husky install"
  }
}
```

### Git Hooks Configuration
#### /employee-management/.husky/pre-commit
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test
```

#### /employee-management/.husky/commit-msg
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit $1
```

### IDE Extensions (VS Code)
Required extensions for optimal development experience:
- ESLint
- Prettier
- Docker
- GitLens
- Jest
- REST Client
- Terraform
- AWS Toolkit

### Development Tools Setup
1. Install global dependencies:
```bash
npm install -g sequelize-cli
npm install -g nodemon
```

2. Setup Git hooks:
```bash
npm run prepare
```

3. Initialize database:
```bash
npm run migrate
npm run seed
```

4. Start development environment:
```bash
npm run docker:up
```

### Recommended Development Workflow
1. Create a new feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and ensure tests pass:
```bash
npm run test:watch
```

3. Lint and format code:
```bash
npm run lint:fix
npm run format
```

4. Commit changes following conventional commits:
```bash
git commit -m "feat: add new feature"
```

5. Push changes and create a pull request:
```bash
git push origin feature/your-feature-name
```