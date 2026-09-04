'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] px-4">
      <form onSubmit={handleLogin} className="max-w-sm w-full bg-[#12151C] p-6 border border-neutral-800 rounded space-y-4">
        <h1 className="headline-font text-xl font-bold text-white text-center">Zen-G Editorial Login</h1>
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white" />
        <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white" />
        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white font-bold rounded text-xs uppercase">{loading ? 'Verifying...' : 'Sign In'}</button>
      </form>
    </div>
  );
}
