from app.models.truck import TruckModel
from app.models.slot import SlotModel
from app.models.container import ContainerModel
from app.models.shipment import ShipmentModel
from app.models.audit import AuditModel
from app.models.settings import SettingsModel
from app.models.user import UserModel
from app.models.otp import OtpVerificationModel
from app.models.booking import BookingModel
from app.models.status_log import StatusUpdateLogModel

__all__ = [
    "TruckModel",
    "SlotModel",
    "ContainerModel",
    "ShipmentModel",
    "AuditModel",
    "SettingsModel",
    "UserModel",
    "OtpVerificationModel",
    "BookingModel",
    "StatusUpdateLogModel",
]
