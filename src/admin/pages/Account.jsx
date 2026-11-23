import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../AdminApp';
import { useToast } from '../fields';

export default function Account() {
  const { admin } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return toast('New passwords do not match', 'err');
    setBusy(true);
    try {
      await api('/auth/change-password', { method: 'POST', auth: true, body: { currentPassword: f.currentPassword, newPassword: f.newPassword } });
      toast('Password changed');
      setF({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid2">
      <div className="card">
        <h2>Your account</h2>
        <dl className="kv"><dt>Name</dt><dd>{admin?.name}</dd><dt>Email</dt><dd>{admin?.email}</dd><dt>Role</dt><dd>{admin?.role}</dd></dl>
      </div>
      <form className="card" onSubmit={submit} style={{ display: 'grid', gap: '.9rem' }}>
        <h2>Change password</h2>
        {[['currentPassword', 'Current password', 'current-password'], ['newPassword', 'New password (min. 10 characters, letters and numbers)', 'new-password'], ['confirm', 'Confirm new password', 'new-password']].map(([k, l, ac]) => (
          <div className="f" key={k}><label htmlFor={k}>{l}</label><input id={k} className="inp" type="password" autoComplete={ac} required value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
        ))}
        <button className="btn btn--green btn--sm" style={{ justifySelf: 'start' }} disabled={busy}><KeyRound size={15} /> Update password</button>
      </form>
    </div>
  );
}
