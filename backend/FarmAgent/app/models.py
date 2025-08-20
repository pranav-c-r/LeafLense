from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import uuid

class Farmer(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    phone: str
    whatsapp_opt_in: bool = True
    district: Optional[str] = None
    lat: float
    lon: float
    crop: str
    growth_stage: str = "vegetative"
    language: str = "en"

class Alert(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    farmer_id: uuid.UUID = Field(foreign_key="farmer.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    risk_json: str | None = None
    message: str
    channel: str = "whatsapp"
    status: str = "sent"
