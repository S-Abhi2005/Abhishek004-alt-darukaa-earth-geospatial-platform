#!/usr/bin/env python3
"""
Seed script for DARUKAA.EARTH PostgreSQL database with PostGIS extensions.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, engine, Base
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.measurement import Measurement
from app.auth.security import get_password_hash
from geoalchemy2.shape import from_shape
from shapely.geometry import Polygon
from datetime import datetime, timedelta

def run_seed():
    print("Initializing DARUKAA.EARTH PostGIS database tables...")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning creating tables: {e}")

    db = SessionLocal()
    try:
        # 1. Admin User
        admin_email = "admin@darukaa.earth"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                id="usr-001",
                email=admin_email,
                hashed_password=get_password_hash("Admin@12345"),
                full_name="Dr. Aarav Sharma",
                role="admin",
                organization="Darukaa Ecology & Geospatial Institute"
            )
            db.add(admin)
            db.commit()
            print("Created Admin User: admin@darukaa.earth")
        else:
            print("Admin User already exists.")

        # 2. Amazonian Project
        proj_amz = db.query(Project).filter(Project.id == "prj-amazonia-01").first()
        if not proj_amz:
            proj_amz = Project(
                id="prj-amazonia-01",
                name="Amazonian Headwaters Biodiversity Corridor",
                description="High-integrity tropical rainforest preservation and canopy enrichment spanning the Acre and Madre de Dios river basins.",
                project_type="Reforestation",
                category="Dual Benefit",
                country="Brazil",
                region="Southwestern Amazonia, Acre",
                status="Active",
                standard="Verra VCS + CCBA Gold",
                target_carbon_offset=450000.0,
                created_by=admin.id
            )
            db.add(proj_amz)
            db.commit()

            # Add Amazonian Site with PostGIS Polygon
            poly_coords = [
                (-67.84, -9.98),
                (-67.78, -9.98),
                (-67.78, -10.04),
                (-67.84, -10.04),
                (-67.84, -9.98)
            ]
            shapely_poly = Polygon(poly_coords)
            geom_postgis = from_shape(shapely_poly, srid=4326)

            site_amz = Site(
                id="ste-amz-rio-branco",
                project_id=proj_amz.id,
                name="Rio Branco Primary Canopy Sanctuary",
                description="Old-growth canopy corridor hosting unfragmented castanheira stands and feline migration belts.",
                site_code="DKA-AMZ-001",
                geometry=geom_postgis,
                area_hectares=3420.5,
                elevation_meters=185.0,
                canopy_cover_percent=88.5,
                soil_type="Orthic Ferralsols",
                biome="Amazon Moist Deciduous Forest",
                baseline_year=2024
            )
            db.add(site_amz)
            db.commit()
            print("Created Amazonian Project and PostGIS Site: ste-amz-rio-branco")

        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
