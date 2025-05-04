from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from db import MainBase, TempBase

class User(MainBase):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="regular")

    ips = relationship("IPAddress", back_populates="user")

class IPAddress(MainBase):
    __tablename__ = "ip_addresses"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="ips")

class TempScrapedData(MainBase):
    __tablename__ = "temp_scraped_data"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, ForeignKey("ip_addresses.ip"))
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class ScrapedData(MainBase):
    __tablename__ = "scraped_data"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, ForeignKey("ip_addresses.ip"))
    data = Column(JSON)
    anomaly = Column(Integer, default=0)  # ✅ 1 = Anomalous, 0 = Normal
    timestamp = Column(DateTime, default=datetime.utcnow)
