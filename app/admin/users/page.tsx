const mockUsers = [
  { name: 'Yuki Kobayashi', email: 'yuki@example.com', coins: 30, joined: '2026-04-12' },
  { name: 'Aiden Cho', email: 'aiden@example.com', coins: 180, joined: '2026-05-02' },
  { name: 'Mei Tanaka', email: 'mei@example.com', coins: 5, joined: '2026-06-18' },
  { name: 'Sora Lin', email: 'sora@example.com', coins: 420, joined: '2026-07-01' }
];

export default function AdminUsersPage() {
  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold">Users</h2>
      <p className="mb-4 text-sm text-ink-soft dark:text-white/50">
        Illustrative only — real user accounts need the `profiles` table wired up to Supabase Auth.
      </p>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-black/[0.02] text-xs uppercase tracking-wide text-ink-soft dark:bg-white/5 dark:text-white/50">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Coin Balance</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((u) => (
              <tr key={u.email} className="border-t border-black/5 dark:border-white/10">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-gold text-xs font-bold text-white">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-ink-soft dark:text-white/40">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">🪙 {u.coins}</td>
                <td className="px-4 py-3 text-xs text-ink-soft dark:text-white/40">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
