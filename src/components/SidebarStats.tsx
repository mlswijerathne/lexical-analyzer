export default function SidebarStats({ stats }: { stats: { tokens: number; symbols: number; valid: number; errors: number } }) {
  const successRate = stats.tokens > 0 ? Math.round((stats.valid / (stats.valid + stats.errors)) * 100) : 0;
  
  return (
    <div className="rounded-xl shadow-xl p-6 border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
      <h3 className="text-xl font-semibold mb-6 text-white">Statistics</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="text-gray-300">Total Tokens</span>
          </div>
          <span className="font-bold text-blue-400 text-lg">{stats.tokens}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20 border border-purple-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-gray-300">Unique Symbols</span>
          </div>
          <span className="font-bold text-purple-400 text-lg">{stats.symbols}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/20 border border-green-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-gray-300">Valid Expressions</span>
          </div>
          <span className="font-bold text-green-400 text-lg">{stats.valid}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-900/20 border border-red-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-gray-300">Total Errors</span>
          </div>
          <span className="font-bold text-red-400 text-lg">{stats.errors}</span>
        </div>

        <div className="pt-4 border-t border-gray-600/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Success Rate</span>
            <span className="font-bold text-white">{successRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}


