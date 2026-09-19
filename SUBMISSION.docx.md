# DARUKAA.EARTH — Hackathon Submission Document
**Platform:** Enterprise Geospatial Data Analytics Platform for Carbon Credit & Biodiversity Projects  
**Author / Team:** DARUKAA.EARTH Engineering Team  
**Reviewers Access:** `ankita.dasgupta@darukaa.com`, `harsh.kumar@darukaa.com`, `utkarsh.gauniyal@darukaa.com`, `guneet.mutreja@darukaa.com`  

---

## 1. Executive Summary
DARUKAA.EARTH is a comprehensive, production-ready geospatial platform designed to solve the integrity crisis in nature-based carbon markets. By integrating high-resolution satellite imagery (Copernicus Sentinel-2), NASA GEDI LiDAR canopy modeling, and strict spatial database constraints (PostgreSQL + PostGIS 3.4), the platform provides cryptographically traceable MRV (Monitoring, Reporting, and Verification) from parcel polygon delineation to credit issuance.

## 2. Key Architecture Highlights
1. **Frontend:** React 18 with Vite, Tailwind CSS v4, Mapbox GL JS with `@mapbox/mapbox-gl-draw`, Chart.js longitudinal analytics.
2. **Backend:** FastAPI (Python 3.11) with Pydantic v2 data validation and JWT bearer authentication.
3. **Spatial Persistence:** PostgreSQL 16 with PostGIS 3.4 (`geometry(Polygon, 4326)` with `GIST` R-Tree spatial indexing).
4. **Geodesic Accuracy:** Geodesic ellipsoidal area computation via `ST_Area(geometry::geography) / 10000.0`.
5. **DevOps & CI/CD:** Docker Compose orchestration, GitHub Actions automated CI/CD pipeline, and Husky pre-commit hooks.

## 3. Reviewer Verification Steps
1. **Access Web Application:**
   Open the application in your browser (default port 3000).
2. **Authentication:**
   Login using the administrator credentials:
   - **Email:** `admin@darukaa.earth`
   - **Password:** `Admin@12345`
   *(Or click "Use Demo Credentials" on the login screen).*
3. **Inspect Interactive Mapbox Engine:**
   - Navigate to the **Map View**.
   - Review pre-loaded PostGIS polygons across the Amazon, Sundarbans, and Scottish Highlands.
   - Toggle between **Dark**, **Satellite**, and **Terrain** basemaps.
   - Click **"Draw Site Polygon"** to plot custom parcel boundaries. Real-time geodesic area in hectares will be computed.
   - Save the site to store the polygon geometry directly into the database.
4. **Telemetry & Analytics:**
   - Select any site to open its **Site Analytics** dashboard.
   - Inspect the 24-month longitudinal trajectory for NDVI vegetation health, tree canopy density %, biomass density (t/ha), and total carbon stock (tCO2e).
   - Review the ecological carbon pools distribution (AGB, BGB, Soil Carbon, Deadwood) and biodiversity status across trophic taxa.

## 4. GitHub Collaborator Invitations
The repository has been configured to grant collaborator read/write access to:
- `ankita.dasgupta@darukaa.com`
- `harsh.kumar@darukaa.com`
- `utkarsh.gauniyal@darukaa.com`
- `guneet.mutreja@darukaa.com`
