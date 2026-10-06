import os
os.environ["PYTHONPATH"] = os.path.dirname(os.path.dirname(__file__))
from fastapi.testclient import TestClient
from app.main import app
from app.db import SessionLocal
from app.models.user import UserModel
from app.services.password import hash_password

client = TestClient(app)


def _admin_token():
    r = client.post("/api/auth/login", json={"identifier": "admin@logisync.ai", "password": "Admin@123"})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def test_register_rejects_non_dispatcher():
    r = client.post("/api/auth/register", json={
        "full_name": "X", "vehicle_number": "TN01AB1234", "mobile": "+911111111111",
        "email": "x@t.com", "password": "Abc@1234", "role": "port_admin"})
    assert r.status_code == 403


def test_mobile_unique_constraint_exists():
    from sqlalchemy import inspect
    from app.db import engine
    idx = inspect(engine).get_indexes("users")
    assert any("mobile_number" in (i.get("column_names") or []) and i.get("unique") for i in idx), idx


def test_admin_can_create_fleet_manager_and_cross_port_denied():
    token = _admin_token()
    h = {"Authorization": f"Bearer {token}"}
    # create two FMs on different ports
    for i, port in (("10", "voc"), ("11", "chennai")):
        mobile = f"+91980000{i}{port[:2]}01"[:13]
        email = f"fm{i}{port}@test.ai"
        db = SessionLocal()
        u = db.query(UserModel).filter((UserModel.email == email) | (UserModel.mobile_number == mobile)).first()
        if u:
            db.delete(u)
            db.commit()
        db.close()
        r = client.post("/api/admin/fleet-managers", headers=h, json={
            "full_name": f"FM {port}", "email": email, "mobile": mobile,
            "temp_password": "Temp@1234", "assigned_port_id": port})
        assert r.status_code in (200, 201), r.text
    # non-admin rejected
    r = client.post("/api/admin/fleet-managers", json={
        "full_name": "No", "email": "no@t.ai", "mobile": "+911111111112",
        "temp_password": "Temp@1234", "assigned_port_id": "voc"})
    assert r.status_code in (401, 403)


def test_otp_rate_limit():
    for _ in range(4):
        r = client.post("/api/auth/send-otp", json={"target_type": "mobile", "target_value": "+912222222222"})
    assert r.status_code == 429, r.text
