# ProcureFlow AI: Intelligent RFP Management System

ProcureFlow AI is an enterprise-grade procurement platform designed to streamline the Request for Proposal (RFP) lifecycle. By leveraging advanced Generative AI (Google Gemini), it automates the creation of structured requirements, parses unstructured vendor proposals, and provides intelligent, data-driven comparison metrics to accelerate decision-making.

## Key Features

### 1. AI-Driven RFP Generation
Transforms natural language descriptions into professional, structured RFP documents. Users can input rough requirements (e.g., "I need 50 laptops for engineering"), and the system automatically generates detailed specifications, budget estimates, and warranty requirements.

### 2. Intelligent Proposal Parsing
Eliminates manual data entry by extracting key information from unstructured vendor proposals. The system identifies pricing, delivery timelines, warranty terms, and technical specifications, standardizing disparate data formats into a unified schema.

### 3. Automated Comparative Analysis
Provides a side-by-side comparison of all vendor bids. The AI Engine scores proposals based on:
- **Price Competitiveness**: Quantitative analysis against the estimated budget.
- **Technical Compliance**: Qualitative assessment of item specifications.
- **Vendor Reliability**: Evaluation of warranty terms and delivery schedules.
It concludes with a recommended vendor and a detailed justification for the selection.

### 4. Vendor Management & Communication
Maintains a centralized database of active vendors. The system includes an integrated email dispatch service to send RFPs to multiple vendors simultaneously and track their responses.

## Technical Architecture

### Core Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom Design System)
- **Database**: SQLite (via Prisma ORM)
- **AI Model**: Google Gemini 1.5 Flash
- **Email Service**: Nodemailer

### Design Principles
- **Type Safety**: Strictly typed interfaces for all data models and API responses.
- **Performance**: Server-Side Rendering (SSR) for critical dashboards and optimized API routes.
- **Modularity**: Component-based architecture with separation of concerns between UI, business logic, and data access layers.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/manasvi1684/Request-for-proposal.git
   cd Request-for-proposal
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `frontend` directory based on `.env.example`:
   ```env
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_api_key_here"
   SMTP_HOST="smtp.example.com"
   SMTP_USER="user@example.com"
   SMTP_PASS="password"
   ```

4. Initialize the Database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the Development Server:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

## API Documentation

The application exposes several RESTful endpoints for integration:

- `GET /api/rfps`: Retrieve all active RFPs.
- `POST /api/rfps/from-text`: Generate structured data from natural language.
- `POST /api/proposals/parse`: Analyze text input as a formal proposal.
- `GET /api/proposals/compare/:id`: Run the comparison engine for a specific RFP.

## License

This project is licensed under the MIT License.
