"""Initial PostGIS migration

Revision ID: 001_initial_postgis
Revises: 
Create Date: 2026-09-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision = '001_initial_postgis'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")

    # 2. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('organization', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 3. Projects Table
    op.create_table(
        'projects',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('project_type', sa.String(length=100), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False),
        sa.Column('region', sa.String(length=150), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('standard', sa.String(length=100), nullable=False),
        sa.Column('target_carbon_offset', sa.Float(), nullable=False),
        sa.Column('created_by', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('ix_projects_name', 'projects', ['name'])
    op.create_index('ix_projects_country', 'projects', ['country'])

    # 4. Sites Table with PostGIS Polygon Geometry
    op.create_table(
        'sites',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('project_id', sa.String(length=36), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('site_code', sa.String(length=50), nullable=False, unique=True),
        sa.Column('geometry', Geometry(geometry_type='POLYGON', srid=4326, spatial_index=True), nullable=False),
        sa.Column('area_hectares', sa.Float(), nullable=False),
        sa.Column('elevation_meters', sa.Float(), nullable=True),
        sa.Column('canopy_cover_percent', sa.Float(), nullable=True),
        sa.Column('soil_type', sa.String(length=255), nullable=True),
        sa.Column('biome', sa.String(length=255), nullable=True),
        sa.Column('baseline_year', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('ix_sites_project_id', 'sites', ['project_id'])
    op.create_index('ix_sites_site_code', 'sites', ['site_code'])

    # 5. Measurements Table
    op.create_table(
        'measurements',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('site_id', sa.String(length=36), sa.ForeignKey('sites.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ndvi', sa.Float(), nullable=False),
        sa.Column('canopy_density_percent', sa.Float(), nullable=False),
        sa.Column('biomass_density_t_ha', sa.Float(), nullable=False),
        sa.Column('carbon_stock_tco2e', sa.Float(), nullable=False),
        sa.Column('soil_organic_carbon_percent', sa.Float(), nullable=False),
        sa.Column('species_richness_index', sa.Float(), nullable=False),
        sa.Column('tree_loss_alerts', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('precipitation_mm', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('ix_measurements_site_id', 'measurements', ['site_id'])
    op.create_index('ix_measurements_recorded_at', 'measurements', ['recorded_at'])

def downgrade() -> None:
    op.drop_table('measurements')
    op.drop_table('sites')
    op.drop_table('projects')
    op.drop_table('users')
