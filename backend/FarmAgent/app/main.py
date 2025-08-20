from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Session, create_engine, select
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from .models import Farmer, Alert
from .scheduler import init_scheduler, run_pipeline_once

load_dotenv()
DB_URL = os.getenv("DB_URL", "sqlite:///./agri.db")
engine = create_engine(DB_URL, echo=False)

app = FastAPI(title="Agri-Agent Backend", version="0.1.0")

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
    init_scheduler(engine)

class FarmerIn(BaseModel):
    name: str
    phone: str
    whatsapp_opt_in: bool = True
    district: str | None = None
    lat: float
    lon: float
    crop: str
    growth_stage: str = "vegetative"
    language: str = "en"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/farmers")
def add_farmer(data: FarmerIn, session: Session = Depends(get_session)):
    farmer = Farmer(**data.model_dump())
    session.add(farmer)
    session.commit()
    session.refresh(farmer)
    return farmer

@app.get("/farmers")
def list_farmers(session: Session = Depends(get_session)):
    return session.exec(select(Farmer)).all()

@app.post("/run-now")
def run_now(session: Session = Depends(get_session)):
    count = run_pipeline_once(engine)
    return {"triggered": count}

@app.get("/alerts")
def list_alerts(session: Session = Depends(get_session)):
    return session.exec(select(Alert).order_by(Alert.created_at.desc())).all()
