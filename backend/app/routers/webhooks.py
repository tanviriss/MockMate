from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.stripe_service import handle_webhook_event
from app.logging_config import logger

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")

    db: Session = SessionLocal()
    try:
        handle_webhook_event(payload, sig_header, db)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()
