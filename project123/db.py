import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ✅ Get absolute path for database file
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "instance", "database.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"
TEMP_DB_URL = "sqlite:///:memory:"  # Temporary database

# ✅ Create database connections
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
temp_engine = create_engine(TEMP_DB_URL, connect_args={"check_same_thread": False})

# ✅ Session factories
MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
TempSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=temp_engine)

# ✅ Declare base for models
MainBase = declarative_base()
TempBase = declarative_base()


print(f"🔍 Using database file: {DATABASE_PATH}")

def initialize_db():
    from models import User, IPAddress, ScrapedData
    from models import TempScrapedData  # ✅ Import models only when initializing
    print("📢 Initializing database tables...")
    MainBase.metadata.create_all(bind=engine)
    TempBase.metadata.create_all(bind=temp_engine)  # ✅ Ensures tables are created
    print("✅ Database tables initialized!")

# ✅ Call database initialization on import
initialize_db()

TempBase.metadata.create_all(bind=temp_engine)
