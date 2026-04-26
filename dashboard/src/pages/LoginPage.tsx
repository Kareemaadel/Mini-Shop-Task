import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CubeIcon } from '@heroicons/react/24/solid';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(email, password);

      // Only allow admin users
      if (data.user.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }

      authService.storeSession(data.access_token, data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/30">
            <CubeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Mini Shop Admin</h1>
          <p className="mt-1 text-slate-400">Sign in to your admin dashboard</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-surface/5 p-8 shadow-xl backdrop-blur-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-surface/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="admin@test.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-surface/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          Admin access only. Contact support if you need access.
        </p>
      </div>
    </div>
  );
}
