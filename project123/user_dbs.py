import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import BASE_DIR
from models import RawBase

def get_user_raw_engine(username):
    db_uri = 'sqlite:///' + os.path.join(BASE_DIR, f'raw_data_{username}.db')
    engine = create_engine(db_uri, connect_args={'check_same_thread': False})
    RawBase.metadata.create_all(bind=engine)
    return engine

def get_user_anomaly_engine(username):
    db_uri = 'sqlite:///' + os.path.join(BASE_DIR, f'anomaly_data_{username}.db')
    engine = create_engine(db_uri, connect_args={'check_same_thread': False})
    AnomalyBase.metadata.create_all(bind=engine)
    return engine

def get_user_sessions(username):
    raw_engine = get_user_raw_engine(username)
    anomaly_engine = get_user_anomaly_engine(username)
    RawSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=raw_engine)
    AnomalySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=anomaly_engine)
    return RawSessionLocal, AnomalySessionLocal
