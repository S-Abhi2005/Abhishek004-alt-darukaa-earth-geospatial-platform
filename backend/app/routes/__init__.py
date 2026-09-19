from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.sites import router as sites_router
from app.routes.analytics import router as analytics_router

__all__ = ["auth_router", "projects_router", "sites_router", "analytics_router"]
