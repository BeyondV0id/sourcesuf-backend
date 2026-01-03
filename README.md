# SourceSurf Backend

Backend API for SourceSurf - a source discovery and curation platform.

## Features

- Repository discovery and trending analysis
- YC company data integration
- User authentication and authorization
- Advanced search and filtering
- Curated collections management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

```bash
npm install
```

### Setup Environment

Create a `.env.local` file with the following variables:

```
DATABASE_URL=postgresql://...
GITHUB_TOKEN=your_token_here
```

### Database Migrations

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

## Project Structure

```
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── db/              # Database setup and schemas
│   ├── lib/             # Utilities and helpers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── index.ts         # Entry point
├── scripts/             # Utility scripts
├── drizzle/             # Database migrations
└── package.json
```

## API Routes

- `/api/discover` - Discover repositories
- `/api/trending` - Trending repositories
- `/api/auth` - Authentication endpoints

## License

MIT
