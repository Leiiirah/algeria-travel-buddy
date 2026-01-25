# El Hikma Backend API

NestJS backend for El Hikma Travel Agency management system.

## Features

- 🔐 JWT Authentication
- 👥 User Management (Admin/Employee roles)
- 📋 Services Management (Visa, Residence, Tickets, Dossier)
- 🏢 Suppliers Management with Balance Tracking
- 📦 Commands/Orders with Accounting
- 💰 Payments Tracking
- 📄 Document Management with File Upload
- 📊 Analytics & Dashboard Stats

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

1. **Clone and navigate to server folder:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create PostgreSQL database:**
   ```bash
   createdb elhikma
   ```

5. **Run migrations:**
   ```bash
   npm run migration:run
   ```

6. **Start the server:**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `PATCH /users/:id/status` - Toggle user status
- `DELETE /users/:id` - Delete user

### Services
- `GET /services` - List all services
- `GET /services/active` - List active services only
- `POST /services` - Create service
- `PATCH /services/:id` - Update service
- `PATCH /services/:id/status` - Toggle service status

### Suppliers
- `GET /suppliers` - List all suppliers
- `GET /suppliers/:id` - Get supplier by ID
- `GET /suppliers/:id/balance` - Get supplier balance
- `POST /suppliers` - Create supplier
- `PATCH /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Commands
- `GET /commands` - List commands (with filters)
- `GET /commands/:id` - Get command by ID
- `GET /commands/stats` - Get command statistics
- `POST /commands` - Create command
- `PATCH /commands/:id` - Update command
- `PATCH /commands/:id/status` - Update command status
- `DELETE /commands/:id` - Delete command

### Payments
- `GET /payments` - List all payments
- `GET /payments/command/:commandId` - Get payments for a command
- `POST /payments` - Create payment
- `DELETE /payments/:id` - Delete payment

### Supplier Transactions
- `GET /supplier-transactions` - List all transactions
- `GET /supplier-transactions/supplier/:supplierId` - Get transactions for supplier
- `POST /supplier-transactions` - Create transaction
- `DELETE /supplier-transactions/:id` - Delete transaction

### Documents
- `GET /documents` - List documents (with optional category filter)
- `POST /documents/upload` - Upload document
- `PATCH /documents/:id` - Update document metadata
- `DELETE /documents/:id` - Delete document
- `GET /documents/:id/download` - Download document

### Analytics
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /analytics/revenue` - Revenue over time
- `GET /analytics/suppliers` - Supplier statistics
- `GET /analytics/services` - Service statistics

## Default Admin User

On first run, a default admin user is created:
- Email: `admin@elhikma.dz`
- Password: `Admin@123`

**⚠️ Change this password immediately in production!**

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | `elhikma` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

## License

Private - El Hikma Travel Agency
