from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.businesses import router as businesses_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.finances import router as finances_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.advisor import router as advisor_router
from app.api.v1.market import router as market_router
from app.api.v1.schemes import router as schemes_router
from app.api.v1.documents import router as documents_router
from app.api.v1.business_plans import router as business_plans_router
from app.api.v1.festivals import router as festivals_router
from app.api.v1.dashboard import router as dashboard_router

api_v1_router = APIRouter(prefix="/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(profiles_router)
api_v1_router.include_router(businesses_router)
api_v1_router.include_router(transactions_router)
api_v1_router.include_router(finances_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(advisor_router)
api_v1_router.include_router(market_router)
api_v1_router.include_router(schemes_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(business_plans_router)
api_v1_router.include_router(festivals_router)
api_v1_router.include_router(dashboard_router)
