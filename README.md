# BOLDAFRICA Adventures - Safari Tour Booking Platform

[![CI](https://github.com/nmwakuni/boldafricaadventures-client/workflows/CI/badge.svg)](https://github.com/nmwakuni/boldafricaadventures-client/actions/workflows/ci.yml)
[![Security Checks](https://github.com/nmwakuni/boldafricaadventures-client/workflows/Security%20Checks/badge.svg)](https://github.com/nmwakuni/boldafricaadventures-client/actions/workflows/security.yml)
[![PR Checks](https://github.com/nmwakuni/boldafricaadventures-client/workflows/PR%20Checks/badge.svg)](https://github.com/nmwakuni/boldafricaadventures-client/actions/workflows/pr-checks.yml)

A modern, full-stack web application for Bold africa Adventures, a Kenyan safari tour operator. This platform enables customers to browse, book, and manage safari tours while providing administrators with comprehensive tools for managing tours, bookings, destinations, and content.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## Features

### Public-Facing Features

- **Tour Discovery**: Browse and search safari tours with advanced filtering (price, duration, category, destination)
- **Tour Details**: Comprehensive tour information with itineraries, pricing, and image galleries
- **Destination Showcase**: Featured destinations with detailed information and photo galleries
- **Booking System**: Complete booking flow with guest information, date selection, and payment processing
- **Payment Integration**: Secure payment processing with multiple payment methods
- **Booking Management**: View booking history, status tracking, and invoice generation
- **Blog & Content**: Travel tips and articles about safari experiences
- **Contact & Inquiries**: Contact forms for general inquiries and tour-specific questions

### Admin Dashboard

- **Analytics Dashboard**:
  - Revenue charts and trends
  - Booking statistics
  - Top-performing tours
  - Popular destinations
  - Key business metrics

- **Content Management**:
  - Tour CRUD operations
  - Destination management
  - Blog article creation and editing
  - Media library

- **Booking Management**:
  - View all bookings with filtering
  - Status updates
  - Payment tracking
  - Booking cancellation

- **User Management**:
  - User list and roles
  - Profile management
  - Access control

## Technology Stack

### Core Framework

- **Next.js 15.5.4** - React framework with App Router and Turbopack
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe development

### UI & Styling

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Headless component library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### State Management & Data Fetching

- **@tanstack/react-query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Context API** - Authentication state

### Additional Libraries

- **Axios** - HTTP client
- **TipTap** - Rich text editor
- **Swiper** - Carousels and sliders
- **jsPDF** - PDF generation for invoices
- **date-fns** - Date utilities

### Development & Quality Tools

- **ESLint 9** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Jest** - Testing framework
- **React Testing Library** - Component testing

### Monitoring & Analytics

- **Sentry** - Error tracking and monitoring
- **PostHog** - Product analytics and session tracking

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd boldafricaadventures-client
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
boldafricaadventures-client/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/            # Public routes
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── tours/           # Tour listing & details
│   │   │   ├── destinations/    # Destination pages
│   │   │   ├── blog/            # Blog articles
│   │   │   └── bookings/        # Booking management
│   │   ├── (admin)/             # Admin dashboard
│   │   │   └── admin/
│   │   │       ├── dashboard/   # Analytics
│   │   │       ├── tours/       # Tour management
│   │   │       ├── bookings/    # Booking management
│   │   │       └── ...
│   │   ├── auth/                # Authentication routes
│   │   └── api/                 # API routes
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   ├── public/              # Public-facing components
│   │   └── admin/               # Admin components
│   │
│   ├── lib/                     # Utilities & libraries
│   │   ├── api/                 # API client & modules
│   │   │   ├── client.ts        # Axios configuration
│   │   │   ├── tours.ts         # Tours API
│   │   │   ├── bookings.ts      # Bookings API
│   │   │   └── ...
│   │   └── utils/               # Utility functions
│   │
│   ├── contexts/                # React Context
│   │   └── AuthContext.tsx      # Authentication
│   │
│   └── providers/               # App providers
│       ├── queryprovider.tsx    # React Query
│       └── posthog.tsx          # PostHog analytics
│
├── public/                      # Static assets
├── jest.config.ts               # Jest configuration
├── jest.setup.ts                # Jest setup
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack

# Building
npm run build            # Create production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # TypeScript type checking

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report

# Quality Checks
npm run check-all        # Run all checks (lint, format, type-check, test)
```

### Code Style

This project uses ESLint and Prettier with pre-commit hooks via Husky:

- Code is automatically formatted on commit
- ESLint errors must be fixed before committing
- TypeScript types are strictly enforced

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass: `npm run check-all`
4. Commit your changes (pre-commit hooks will run)
5. Push and create a pull request

## Testing

This project uses Jest and React Testing Library for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual functions and API modules
  - Location: `src/lib/**/__tests__/`

- **Component Tests**: Test React components
  - Location: `src/components/**/__tests__/`

### Writing Tests

Example component test:

```typescript
import { render, screen } from '@/lib/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

Example API test:

```typescript
import { myApi } from '../myApi';
import { apiClient } from '../client';

jest.mock('../client');

describe('myApi', () => {
  it('should fetch data', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const result = await myApi.getData();
    expect(result).toEqual({ id: 1 });
  });
});
```

## CI/CD

This project uses GitHub Actions for continuous integration and deployment automation.

### Automated Workflows

**Main CI Workflow** (`ci.yml`):
- Runs on push to main/develop branches and all pull requests
- Tests on Node.js 18.x and 20.x
- Executes linting, formatting checks, type checking, and tests
- Builds the application and uploads artifacts
- Generates test coverage reports

**PR Checks** (`pr-checks.yml`):
- Provides detailed PR statistics (files changed, lines added/removed)
- Reports test coverage metrics
- Analyzes bundle size

**Security Checks** (`security.yml`):
- Runs dependency audits
- CodeQL security analysis
- Secret scanning with TruffleHog
- Scheduled weekly scans

**Lint Reports** (`lint-report.yml`):
- Detailed ESLint and Prettier reports on PRs
- Comments formatting issues with fix instructions

### Dependabot

Automated dependency updates are configured via `dependabot.yml`:
- Weekly updates on Mondays
- Separate groups for production and development dependencies
- Automatic GitHub Actions updates

### Setting Up CI/CD

1. **GitHub Actions** are enabled by default
2. **Add secrets** in repository Settings → Secrets and variables → Actions:
   ```
   NEXT_PUBLIC_API_URL
   NEXT_PUBLIC_SENTRY_DSN
   NEXT_PUBLIC_POSTHOG_KEY
   NEXT_PUBLIC_POSTHOG_HOST
   CODECOV_TOKEN (optional)
   ```

3. **Enable branch protection** for `main` branch (recommended):
   - Require status checks to pass before merging
   - Require PR reviews

For detailed workflow documentation, see [`.github/workflows/README.md`](.github/workflows/README.md)

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel Deployment

This project is optimized for Vercel:

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables
4. Deploy

### Environment-Specific Builds

The application adapts based on `NODE_ENV`:

- **Development**: Uses API proxy to localhost
- **Production**: Direct API calls to production backend

## Environment Variables

### Required Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.boldafricaadventures.com

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-token>

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

### Development vs Production

**Development** (`.env.development`):
```env
NEXT_PUBLIC_API_URL=https://boldafricaadventures-api-production.up.railway.app
```

**Production** (`.env.production`):
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.boldafricaadventures.com
API_URL=https://api.boldafricaadventures.com
```

## API Integration

### API Client Configuration

The project uses Axios with a centralized client configuration:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Credentials**: Cookies are sent with all requests (`withCredentials: true`)
- **Interceptors**: Automatic 401 handling with redirect to login

### API Modules

Each feature has its own API module in `src/lib/api/`:

- `tours.ts` - Tour operations
- `bookings.ts` - Booking management
- `destinations.ts` - Destination data
- `blog.ts` - Blog articles
- `auth.ts` - Authentication
- `payments.ts` - Payment processing
- `users.ts` - User management

### Usage Example

```typescript
import { toursApi } from '@/lib/api/tours';

// Fetch all tours
const tours = await toursApi.getAll({ page: 1, limit: 10 });

// Fetch single tour
const tour = await toursApi.getBySlug('safari-adventure');

// Create tour (admin only)
const newTour = await toursApi.create(tourData);
```

## Contributing

### Development Guidelines

1. Follow the existing code style (enforced by ESLint/Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Ensure all checks pass before submitting PR
5. Use meaningful commit messages

### Commit Message Format

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
style: Format code
chore: Update dependencies
```

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Run `npm run check-all`
4. Push and create PR
5. Wait for review and address feedback

## License

This project is proprietary and confidential.

## Support

For issues, questions, or support:

- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ by the BOLDAFRICA Adventures Team**
