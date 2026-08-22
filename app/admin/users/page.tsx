import { createSupabaseAdminClient } from '@/lib/supabaseAdmin';

// Without this, Next.js can statically generate this page at build time
// since it has no dynamic route segments — which would freeze the user
// list at whatever existed during the build, never showing anyone who
// signs up afterward. This forces a fresh fetch on every single visit.
export const dynamic = 'force-dynamic';

type UserRow = {
  id: string;
  username: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  wallets: { coin_balance: number } | { coin_balance: number }[] | null;
};

async function getUsers(): Promise<UserRow[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, is_admin, created_at, wallets(coin_balance)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load users:', error.message);
      return [];
    }
    return (data ?? []) as unknown as UserRow[];
  } catch (err: any) {
    console.error('getUsers failed:', err.message ?? err);
    return [];
  }
}

function coinBalanceOf(row: UserRow): number {
  const w = row.wallets;
  if (!w) return 0;
  return Array.isArray(w) ? (w[0]?.coin_balance ?? 0) : w.coin_balance;
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h2 className="mb-1 font-display text-lg font-bold">Users</h2>
      <p className="mb-4 text-sm text-ink-soft dark:text-white/50">
        Real signed-up accounts. Passwords are never shown here — Supabase only stores a one-way hash of them,
        which can't be reversed by anyone, including this dashboard.
      </p>

      {users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/10 p-6 text-sm text-ink-soft dark:border-white/10 dark:text-white/50">
          No users yet — once someone signs up through <code>/signup</code>, they'll appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-ink-soft dark:bg-white/5 dark:text-white/50">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Coin Balance</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-gold text-xs font-bold text-white">
                        {(u.username || u.email || '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="font-semibold">{u.username || '(no username)'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-soft dark:text-white/40">{u.email || '—'}</td>
                  <td className="px-4 py-3">🪙 {coinBalanceOf(u)}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-bold text-coral-deep">Admin</span>
                    ) : (
                      <span className="text-xs text-ink-soft dark:text-white/40">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-soft dark:text-white/40">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
