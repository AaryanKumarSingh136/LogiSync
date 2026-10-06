"""One-time seed: create the single port_admin account. Run manually:
  .venv\\Scripts\\python.exe scripts\\seed_admin.py --email admin@logisync.ai --password <pw> --mobile +919840000001 --name "Port Admin"
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import Base, engine, SessionLocal
from app.models.user import UserModel
from app.services.password import hash_password, validate_password_constraints


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--email", required=True)
    p.add_argument("--password", required=True)
    p.add_argument("--mobile", required=True)
    p.add_argument("--name", default="Port Admin")
    a = p.parse_args()

    errs = validate_password_constraints(a.password)
    if errs:
        print("Password does not meet constraints:", errs)
        sys.exit(2)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(UserModel).filter(UserModel.role == "port_admin").first():
            print("A port_admin already exists. Aborting (single admin rule).")
            sys.exit(1)
        if db.query(UserModel).filter((UserModel.email == a.email) | (UserModel.mobile_number == a.mobile)).first():
            print("Email or mobile already in use.")
            sys.exit(1)
        admin = UserModel(
            role="port_admin", full_name=a.name, email=a.email,
            email_verified=True, mobile_number=a.mobile, mobile_verified=True,
            password_hash=hash_password(a.password),
            is_active=True, must_change_password=False,
        )
        db.add(admin)
        db.commit()
        print(f"Seeded port_admin {a.email} id={admin.id}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
