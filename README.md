# Lead Intake & Qualification System

A full-stack TypeScript application built with Next.js that accepts, enriches, scores, and displays leads through a user-friendly dashboard.

## 🚀 Features

- **Lead Submission**: Form-based lead intake with client-side validation
- **Data Enrichment**: Automatic enrichment via AnyMail Finder API
- **Lead Scoring**: Scoring based on configurable rules
- **Protected Dashboard**: View and filter leads with authentication
- **Persistent Storage**: SQLite database with Prisma ORM
- **Type Safety**: Full TypeScript implementation

## 📋 Pre-requisites

- Node.js 18+ 
- npm or yarn
- AnyMail Finder API key (optional for demo)

## 🛠️ Installation Guide

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lead-intake-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   ```env
   # AnyMail Finder API Key (optional - system works without it)
   ANYMAIL_FINDER_API_KEY=your_api_key_here
   
   # JWT Secret (change this!!!)
   JWT_SECRET=your-super-secret-key-change-this
   
   # Dashboard credentials (customize as needed)
   DASHBOARD_USERNAME=admin
   DASHBOARD_PASSWORD=password123
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: TailwindCSS
- **Validation**: Zod
- **Authentication**: JWT with httpOnly cookies

### Project Structure

```
lead-intake-system/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Login endpoint
│   │   │   └── logout/route.ts     # Logout endpoint
│   │   └── leads/route.ts          # Lead CRUD operations
│   ├── dashboard/
│   │   └── page.tsx                # Protected dashboard
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home/submission page
├── lib/
│   ├── auth.ts                     # Authentication utilities
│   ├── enrichment.ts               # AnyMail Finder integration
│   ├── prisma.ts                   # Prisma client
│   ├── scoring.ts                  # Lead scoring logic
│   └── validations.ts              # Zod schemas
├── prisma/
│   └── schema.prisma               # Database schema
├── types/
│   └── lead.ts                     # TypeScript types
└── middleware.ts                   # Route protection
```

### Data Flow

1. **Lead Submission** → Form validation (client + server)
2. **Duplicate Check** → Query database for existing email
3. **Data Enrichment** → Call AnyMail Finder API (with fallback)
4. **Score Calculation** → Apply scoring rules
5. **Persistence** → Store in SQLite database
6. **Dashboard Display** → Fetch and render leads

## 🔐 Authentication

The dashboard is protected with basic authentication:

- **Method**: JWT tokens stored in httpOnly cookies
- **Credentials**: Configured via environment variables
- **Default**: username: `admin`, password: `password123`
- **Middleware**: Automatic redirect to login for unauthenticated users

### Security Considerations

This implementation uses **basic authentication** suitable for:
- Internal tools
- MVP/prototype applications
- Development environments

For production, consider:
- Hashed passwords (bcrypt)
- OAuth integration
- Rate limiting on login attempts
- Session management with refresh tokens

## 📊 Lead Scoring System

### Scoring Logic

The scoring algorithm assigns points based on available data:

| Criteria | Points |
|----------|--------|
| Has website | +10 |
| Company size 11-50 | +20 |
| Company size 51-200 | +15 |
| Company size 201+ | +10 |
| Country (US/UK/CA) | +10 |
| Missing company name | -5 |
| Missing company size | -5 |
| Missing industry | -5 |
| Missing country | -5 |

**Qualification Threshold**: 25 points

### Assumptions & Trade-offs

**Assumptions:**
1. Website presence indicates business legitimacy (+10 points)
2. Mid-sized companies (11-50) are ideal targets (+20 points)
3. Geographic focus on English-speaking markets
4. Missing data reduces lead quality

**Trade-offs:**
- **Simplicity vs. Sophistication**: Linear scoring is easy to understand but doesn't capture complex relationships
- **Static vs. Dynamic**: Rules are hardcoded; a production system might use ML or configurable rules
- **Binary vs. Probabilistic**: Qualified/unqualified is binary; could use confidence scores instead

**What I'd Improve:**
- Make scoring rules configurable (database or config file)
- Add scoring based on business priorities
- Implement A/B testing for scoring variations
- Track conversion rates to optimize thresholds

## 🔄 AnyMail Finder Integration

### How It Works

AnyMail Finder is a professional email enrichment service that provides:
- Company information
- Social media profiles
- Job titles
- Phone numbers

**API Documentation**: https://anymailfinder.com/api/

### Implementation Details

```typescript
// API Call
const response = await fetch(
  `https://api.anymailfinder.com/v5.0/search/person.json?email=${email}`,
  {
    headers: { 'X-API-KEY': apiKey }
  }
);
```

### Error Handling

The system gracefully handles enrichment failures:

1. **Missing API Key**: Logs warning, continues without enrichment
2. **API Errors** (401, 429, 500): Logs error, returns null
3. **Network Failures**: Catches exception, returns null
4. **Partial Data**: Accepts incomplete enrichment data

**Critical Design Decision**: Leads are **always stored** even if enrichment fails. This ensures no data loss and allows for retry logic later.

### Mock Implementation

For development/testing without an API key, the system includes `mockEnrichLeadData()`:
- Simulates API latency (500ms delay)
- Returns randomized enrichment data
- Fails 20% of the time to test error handling

**To switch to real API**: Update `/app/api/leads/route.ts`:
```typescript
// Change from:
let enrichmentData = await mockEnrichLeadData(email);

// To:
let enrichmentData = await enrichLeadData(email);
```

### Rate Limits

AnyMail Finder free tier:
- 50 requests/month
- Consider implementing request caching
- Add retry logic with exponential backoff

## 🎨 Frontend Features

### Lead Submission Form

**Validation:**
- Client-side: Immediate feedback, prevents bad requests
- Server-side: Security layer, Zod schema validation

**UX Features:**
- Loading states during submission
- Clear error messages per field
- Success confirmation with auto-redirect
- Disabled inputs during submission

### Dashboard

**Features:**
- Sortable columns (score, date)
- Filter qualified/unqualified leads
- Responsive card layout
- Real-time data from database

**Error Handling:**
- Loading spinner during fetch
- Retry button on errors
- Graceful degradation
- Empty state messaging

## 🗄️ Database Schema

```prisma
model Lead {
  id          String   @id @default(uuid())
  name        String
  email       String   @unique
  website     String?
  
  // Enrichment
  companyName String?
  companySize String?
  industry    String?
  country     String?
  
  // Scoring
  score       Int      @default(0)
  qualified   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Why SQLite:**
- Zero configuration
- File-based (portable)
- Perfect for demos/MVPs
- Easy migration to PostgreSQL/MySQL

**Why Prisma:**
- Type-safe database client
- Automatic migrations
- Great developer experience
- Works with multiple databases

## 🧪 API Endpoints

### POST `/api/leads`
Submit a new lead

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "website": "https://example.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "lead": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "score": 35,
    "qualified": true
  }
}
```

**Error Responses:**
- 400: Validation failed
- 409: Duplicate email
- 500: Server error

### GET `/api/leads`
Retrieve all leads

**Query Parameters:**
- `qualified=true`: Filter qualified leads only
- `sort=score|createdAt`: Sort field
- `order=asc|desc`: Sort direction

**Response (200):**
```json
{
  "leads": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "website": "https://example.com",
      "companyName": "TechCorp",
      "companySize": "11-50",
      "industry": "Technology",
      "country": "US",
      "score": 40,
      "qualified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/auth/login`
Authenticate user

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

### POST `/api/auth/logout`
End user session

## 📝 Key Architectural Decisions

### 1. Next.js App Router
**Why**: Modern Next.js approach with better performance, streaming, and server components

**Trade-off**: Newer API, less community examples compared to Pages Router

### 2. Server-Side Enrichment
**Why**: Keeps API keys secure, centralized error handling

**Trade-off**: Slower response times vs. client-side calls

### 3. Synchronous Enrichment
**Why**: Simpler implementation, immediate feedback

**Trade-off**: Could use async jobs (background workers) for better scalability

### 4. In-Request Enrichment
**Why**: Atomic operation, no orphaned records

**Trade-off**: Longer request times; could implement retry queue

### 5. Mock Enrichment Fallback
**Why**: Development without API key, predictable testing

**Trade-off**: Need to remember to switch for production

### 6. Basic Authentication
**Why**: Meets bonus requirement, simple to implement

**Trade-off**: Less secure than OAuth, not suitable for multi-tenant

### 7. SQLite with Prisma
**Why**: Zero config, type safety, easy migration path

**Trade-off**: Not suitable for high concurrency (but fine for this use case)

## 🚧 Future Improvements

### With More Time

**High Priority:**
1. **Background Job Processing**: Move enrichment to async queue (Bull/BullMQ)
2. **Retry Logic**: Automatic retry for failed enrichments with exponential backoff
3. **API Rate Limiting**: Prevent abuse on submission endpoint
4. **Comprehensive Testing**: Unit tests (Jest), integration tests (Playwright)
5. **Error Logging**: Structured logging with service like Sentry

**Medium Priority:**
6. **Advanced Authentication**: OAuth, role-based access control
7. **Enrichment Caching**: Cache enrichment results to reduce API calls
8. **Webhook Support**: Notify external systems on new qualified leads
9. **Lead Deduplication**: Fuzzy matching for similar emails/names
10. **Export Functionality**: CSV/Excel export of leads

**Nice to Have:**
11. **Analytics Dashboard**: Charts showing lead trends, qualification rates
12. **Bulk Import**: CSV upload for multiple leads
13. **Lead Editing**: Update lead information post-submission
14. **Email Notifications**: Alert on qualified leads
15. **API Documentation**: OpenAPI/Swagger spec

### Scalability Considerations

For production scale:
- **Database**: Migrate to PostgreSQL with read replicas
- **Caching**: Redis for session storage and data caching
- **Queue**: RabbitMQ/SQS for background jobs
- **Monitoring**: DataDog/New Relic for performance tracking
- **CDN**: Cloudflare for static assets
- **Deployment**: Containerization (Docker) + Kubernetes

## 🧪 Testing the Application

### Manual Testing Checklist

**Lead Submission:**
- [ ] Submit with valid data → Success
- [ ] Submit with invalid email → Error
- [ ] Submit duplicate email → 409 error
- [ ] Submit without required fields → Validation error
- [ ] Submit with optional website → Stored correctly

**Dashboard:**
- [ ] Access without login → Redirected to login
- [ ] Login with correct credentials → Access granted
- [ ] Login with wrong credentials → Error
- [ ] Filter qualified only → Shows correct leads
- [ ] Sort by score → Correct order
- [ ] Logout → Redirected to login

**Enrichment:**
- [ ] Lead with enrichment → Score calculated correctly
- [ ] Lead without enrichment → Still stored
- [ ] Check mock data randomness

## 📦 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Note**: SQLite doesn't persist on Vercel. For production:
- Use Vercel Postgres, or
- Connect to external PostgreSQL (Supabase, PlanetScale, etc.)

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## 🤝 Contributing

This is a technical test project, but suggestions are welcome!

## 📄 License

MIT

---

**Built with** ❤️ **for the Full-Stack Developer Technical Test**
