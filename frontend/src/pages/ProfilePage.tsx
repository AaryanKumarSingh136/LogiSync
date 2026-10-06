import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-4 max-w-xl space-y-3">
      <h2 className="font-black text-lg">Profile Settings</h2>
      <div className="p-4 rounded-2xl liquid-glass border text-sm space-y-2">
        <div>Name: {user?.name}</div>
        <div>Email: {user?.email} <span className="opacity-50">(locked — Change via OTP)</span></div>
        <div>Role: {user?.role}</div>
        <div>Port: {(user as any)?.assigned_port_id || '—'}</div>
      </div>
    </div>
  );
}
