export default function SidebarStats({ stats }: { stats: { tokens: number; symbols: number; valid: number; errors: number } }) {
  return (
    <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#1e1e1e', border: '1px solid #2d2d2d' }}>
      <h3 className="text-lg font-semibold mb-4">Statistics</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span style={{ color: '#9aa0a6' }}>Total Tokens:</span>
          <span className="font-semibold">{stats.tokens}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#9aa0a6' }}>Total Symbols:</span>
          <span className="font-semibold">{stats.symbols}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#9aa0a6' }}>Valid Expressions:</span>
          <span className="font-semibold" style={{ color: '#6A9955' }}>{stats.valid}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#9aa0a6' }}>Total Errors:</span>
          <span className="font-semibold" style={{ color: '#F14C4C' }}>{stats.errors}</span>
        </div>
      </div>
    </div>
  );
}


