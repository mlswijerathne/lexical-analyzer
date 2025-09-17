export default function SidebarStats({ stats }: { stats: { tokens: number; symbols: number; valid: number; errors: number } }) {
  const successRate = stats.tokens > 0 ? Math.round((stats.valid / (stats.valid + stats.errors)) * 100) : 0;
  
  return (
    <div className="card rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6 text-primary">Statistics</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-tertiary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
            <span className="text-secondary">Total Tokens</span>
          </div>
          <span className="font-bold text-lg accent-primary">{stats.tokens}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-tertiary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full text-secondary"></div>
            <span className="text-secondary">Unique Symbols</span>
          </div>
          <span className="font-bold text-secondary text-lg">{stats.symbols}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-tertiary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-success)' }}></div>
            <span className="text-secondary">Valid Expressions</span>
          </div>
          <span className="font-bold text-lg accent-success">{stats.valid}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-tertiary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-error)' }}></div>
            <span className="text-secondary">Total Errors</span>
          </div>
          <span className="font-bold text-lg accent-error">{stats.errors}</span>
        </div>

        <div className="pt-4 border-t border-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-secondary text-sm">Success Rate</span>
            <span className="font-bold text-primary">{successRate}%</span>
          </div>
          <div className="w-full bg-tertiary rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${successRate}%`,
                backgroundColor: 'var(--accent-success)'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}


