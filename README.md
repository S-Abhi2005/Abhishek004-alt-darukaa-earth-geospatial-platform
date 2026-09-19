# DARUKAA.EARTH — Enterprise Geospatial Data Analytics Platform

[![CI/CD](https://github.com/darukaa-earth/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/darukaa-earth/platform)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![PostGIS](https://img.shields.io/badge/Database-PostgreSQL%2016%20%2B%20PostGIS%203.4-336791.svg)](https://postgis.net/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Mapbox GL](https://img.shields.io/badge/Geospatial-Mapbox%20GL%20JS-000000.svg)](https://www.mapbox.com/)

**DARUKAA.EARTH** is an enterprise-grade geospatial telemetry and analytics platform architected for managing, mapping, verifying, and analyzing high-integrity carbon credit and biodiversity restoration initiatives worldwide.

The platform unifies satellite remote sensing indices (Copernicus Sentinel-2 NDVI), LiDAR canopy models (NASA GEDI), and strict spatial PostGIS boundaries (`SRID 4326`) to ensure cryptographic traceability from polygon boundary creation to verified carbon credit issuance.

---

## 1. Architectural Blueprint

```
+-------------------------------------------------------------------------------------------------+
|                                     CLIENT BROWSERS & FIELD TABLETS                             |
|                           (React 18 + Vite + Tailwind CSS + Mapbox GL JS)                       |
+-------------------------------------------------------------------------------------------------+
                                                 |
                                HTTPS / WSS / REST API (JSON)
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
|                                 API GATEWAY / REVERSE PROXY                                      |
|                             (Nginx / Cloud Run Container Ingress)                               |
+-------------------------------------------------------------------------------------------------+
                         |                                               |
                         v                                               v
+-------------------------------------------------+     +-----------------------------------------+
|        NODE.JS INTEGRATED DEV/SSR ENGINE        |     |      FASTAPI PYTHON BACKEND ENGINE      |
|             (Vite + Express Proxy)              |     |       (Uvicorn + Pydantic v2 + JWT)     |
|   - Real-time dev server & SPA fallback         |     |   - High-throughput REST API endpoints  |
|   - In-memory hot-cache & instant preview       |     |   - Remote sensing telemetry pipelines  |
+-------------------------------------------------+     +-----------------------------------------+
                         |                                               |
                         +-----------------------+-----------------------+
                                                 |
                                                 v
+-------------------------------------------------------------------------------------------------+
|                                  SPATIAL PERSISTENCE LAYER                                      |
|                               (PostgreSQL 16 with PostGIS 3.4)                                  |
|                                                                                                 |
|   - Spatial Column: geometry(Polygon, 4326) with GIST R-Tree Spatial Indexing                  |
|   - Area Calculation: ST_Area(geography(geometry)) for ellipsoidal geodesic accuracy          |
|   - Spatial Queries: ST_Intersects, ST_Contains, ST_Distance                                    |
|   - Models: Users, Projects, Sites (Parcels), Measurements (24-Month Trajectory)                |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Technology Stack

| Layer | Technology | Rationale & Specifications |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 & Vite** | Component-driven architecture with fast HMR and optimized production bundles. |
| **Styling** | **Tailwind CSS v4** | Consistent dark-mode design system with emerald accents and strict typographic scales. |
| **Mapping Engine**| **Mapbox GL JS + Draw** | Vector tile rendering, interactive parcel boundary polygon drawing, and geodesic computation. |
| **Charts** | **Chart.js & react-chartjs-2**| 24-month longitudinal time-series (NDVI, canopy density, biomass, carbon stock). |
| **Backend API** | **FastAPI (Python 3.11)** | Asynchronous Python framework with native Pydantic validation and OpenAPI docs. |
| **ORM & Spatial** | **SQLAlchemy + GeoAlchemy2**| Object-relational mapping with PostGIS spatial geometry and Shapely support. |
| **Database** | **PostgreSQL 16 + PostGIS 3.4**| Production-grade R-Tree spatial indexing (`GIST`) and geodesic spatial queries. |
| **Authentication**| **OAuth2 / JWT (JOSE)** | Stateless cryptographic bearer authentication with role-based access control. |
| **Code Quality** | **Husky + ESLint + Prettier**| Automated pre-commit linting and style enforcement. |
| **CI/CD** | **GitHub Actions** | Automated linting, type-checking, Docker builds, and pytest verification. |

---

## 3. Monorepo Directory Structure

```
darukaa-earth/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated CI (TypeScript lint, build & pytest)
│       └── deploy.yml             # Automated Docker container packaging
├── .husky/
│   └── pre-commit                 # Git pre-commit hook running linting checks
├── backend/
│   ├── alembic/                   # Database schema migrations
│   │   ├── versions/
│   │   │   └── 001_initial_postgis.py # Initial PostGIS extension & tables
│   │   └── env.py
│   ├── app/
│   │   ├── auth/                  # JWT security and password hashing
│   │   │   └── security.py
│   │   ├── database/              # Session and SQLAlchemy base configuration
│   │   │   └── session.py
│   │   ├── models/                # Database models (User, Project, Site, Measurement)
│   │   ├── routes/                # FastAPI endpoints (auth, projects, sites, analytics)
│   │   ├── schemas/               # Pydantic v2 data transfer schemas
│   │   ├── services/              # Analytics & remote sensing telemetry engine
│   │   ├── config.py              # Environment configuration
│   │   └── main.py                # FastAPI app initialization
│   ├── tests/                     # Pytest automated test suite
│   │   ├── test_auth.py
│   │   ├── test_projects.py
│   │   ├── test_sites.py
│   │   └── test_analytics.py
│   ├── Dockerfile                 # Production backend container definition
│   ├── requirements.txt           # Python dependency manifest
│   └── run_seed.py                # Standalone database seeding script
├── src/
│   ├── components/
│   │   ├── Analytics/             # SiteAnalyticsView with Chart.js time-series
│   │   ├── Auth/                  # LoginForm and RegisterForm
│   │   ├── Dashboard/             # DashboardOverview with KPI metric cards
│   │   ├── Map/                   # MapboxViewer, PostGIS layer & CreateSiteModal
│   │   ├── Navigation/            # Responsive Navbar with seed controls
│   │   └── Projects/              # ProjectList, ProjectDetail & CreateProjectModal
│   ├── context/                   # React AuthContext state provider
│   ├── services/                  # Frontend API client communicating with backend
│   ├── types/                     # TypeScript shared interfaces
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React client entry point
├── docker-compose.yml             # Multi-service stack (PostGIS + FastAPI + Vite)
├── Dockerfile.frontend            # Production frontend container
├── metadata.json                  # Application metadata and capabilities
├── package.json                   # Node.js dependencies and run scripts
├── server.ts                      # Express API server with Vite middleware
├── tsconfig.json                  # TypeScript compiler settings
└── README.md                      # Comprehensive project documentation
```

---

## 4. Quick Start Guide

### Option A: Complete Docker Compose Environment (Recommended)

Run the full stack (PostGIS + FastAPI + React UI) with a single command:

```bash
# Clone the repository
git clone https://github.com/darukaa-earth/platform.git
cd darukaa-earth

# Launch services
docker-compose up --build
```

Access the services:
- **Web Platform UI:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostGIS Database:** `localhost:5432` (`postgres` / `postgrespassword`)

---

### Option B: Local Development (Node.js & Python)

#### 1. Start the Live Web Platform & API Server
```bash
# Install Node dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 2. Run the Python FastAPI Backend (Optional Standalone)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Run seed data
python run_seed.py

# Launch FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 5. PostGIS Database Schema & Spatial Mechanics

The platform stores geographic boundaries directly in PostgreSQL using **PostGIS Geometry Type `POLYGON`** anchored to the **WGS 84 spatial reference system (`SRID 4326`)**.

### Spatial Table Definition (`sites`):
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE sites (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    site_code VARCHAR(50) UNIQUE NOT NULL,
    geometry geometry(Polygon, 4326) NOT NULL,
    area_hectares DOUBLE PRECISION NOT NULL,
    canopy_cover_percent DOUBLE PRECISION DEFAULT 75.0,
    elevation_meters DOUBLE PRECISION DEFAULT 150.0,
    biome VARCHAR(255),
    baseline_year INTEGER DEFAULT 2024,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- R-Tree Spatial Index for ultra-fast spatial bounding-box intersections
CREATE INDEX idx_sites_spatial ON sites USING GIST (geometry);
CREATE INDEX idx_sites_project ON sites (project_id);
```

### Geodesic Area Calculation (ST_Area):
```sql
-- Computes true geodesic surface area in hectares across spherical projections:
SELECT 
    id, 
    name, 
    ROUND((ST_Area(geometry::geography) / 10000.0)::numeric, 1) AS calculated_hectares
FROM sites;
```

---

## 6. REST API Endpoints Specification

### Authentication
- `POST /api/auth/register` — Register new organizational account.
- `POST /api/auth/login` — Authenticate and retrieve JWT token.
- `GET /api/auth/me` — Retrieve active profile (requires `Authorization: Bearer <token>`).

### Ecological Projects
- `GET /api/projects` — Retrieve all ecological projects with aggregate hectares and carbon statistics.
- `POST /api/projects` — Create an ecological project.
- `GET /api/projects/{id}` — Retrieve detailed project profile with child sites.
- `DELETE /api/projects/{id}` — Delete project and cascade delete all child parcels.

### PostGIS Sites (Parcels)
- `GET /api/sites` — Retrieve all sites with GeoJSON polygons.
- `GET /api/projects/{id}/sites` — Retrieve all sites within a specific project.
- `POST /api/projects/{id}/sites` — Register a drawn polygon boundary. Automatically calculates area via PostGIS.
- `DELETE /api/sites/{id}` — Remove site boundary parcel.

### Telemetry & Analytics
- `GET /api/sites/{id}/analytics` — Generate 24-month longitudinal remote sensing time-series, carbon pools distribution, and biodiversity taxa health.

### Demo Seed
- `POST /api/seed` — Resets database to pristine multi-continent baseline demonstration dataset.

---

## 7. Default Demonstration Credentials

For instant platform evaluation, use the pre-configured administrator account:

- **Email:** `admin@darukaa.earth`
- **Password:** `Admin@12345`

*Alternatively, click **"Use Demo Credentials"** on the login screen, or register any new email to test the auth flow.*

---

## 8. Automated Testing Suite

Execute the Python backend unit and integration tests:

```bash
cd backend
pytest tests -v
```

Expected output:
```
tests/test_auth.py::test_health_check PASSED
tests/test_auth.py::test_register_and_login_flow PASSED
tests/test_projects.py::test_get_projects_list PASSED
tests/test_projects.py::test_create_project_authenticated PASSED
tests/test_sites.py::test_get_sites_endpoint PASSED
tests/test_sites.py::test_postgis_site_geojson_structure PASSED
tests/test_analytics.py::test_site_analytics_response_structure PASSED
========================== 7 passed in 1.45s ==========================
```

Execute frontend linting and production build verification:
```bash
npm run lint
npm run build
```

---

## 9. Reviewer Repository Access

Per hackathon submission guidelines, invite the following reviewers as Collaborators with **Read/Write** permissions:

1. `ankita.dasgupta@darukaa.com`
2. `harsh.kumar@darukaa.com`
3. `utkarsh.gauniyal@darukaa.com`
4. `guneet.mutreja@darukaa.com`

---

## 10. License

Copyright © 2026 DARUKAA.EARTH. Released under the **Apache License 2.0**.
