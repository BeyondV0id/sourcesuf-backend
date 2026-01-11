# SourceSurf Backend

Backend API for SourceSurf - A powerful platform for discovering, tracking, and curating open-source projects.

## Features

- **Trending Repositories**: Track trending repos with historical data (`daily`, `weekly`, `monthly`).
- **Discovery Engine**: Advanced search and discovery for GitHub repositories.
- **YC Integration**: Discover open-source projects from Y Combinator companies.
- **Issue Finder**: Find good first issues and other contributions (`/api/findIssues`).
- **User Authentication**: Secure authentication via GitHub OAuth using Better-Auth.
- **Webhooks**: Handling external events (`/api/webhooks`).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **API Integration**: Octokit (GitHub REST API)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- npm or yarn

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

Create a `.env` file in the root of the `backend` directory with the following variables:

```env
# Server
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sourcesurf"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your_generated_secret"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth (for User Auth)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# GitHub API (for Data Fetching)
GITHUB_TOKEN="your_personal_access_token"
```

### Database Migrations

Use Drizzle Kit to manage the database schema:

```bash
# Generate migrations
npm run generate

# Apply migrations
npm run migrate

# Open Drizzle Studio (Database GUI)
npm run studio
```

### Running the Server

**Development Mode:**
```bash
npm run dev
```

**Production Start:**
```bash
npm start
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/trending` | Get trending repositories |
| GET | `/api/discover` | Discover repositories with filters |
| GET | `/api/yc-oss` | Get YC open-source projects |
| GET | `/api/findIssues` | Find issues in repositories |
| POST | `/api/webhooks` | Webhook handler |
| * | `/auth/*` | Authentication endpoints (signin, signout, etc.) |

## License

ISC
