import { memo } from "react";

export const GameGuide = memo(function GameGuide() {
  return (
    <div className="w-full glass-card rounded-2xl p-6 animate-fade-in space-y-4 text-slate-200">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="text-2xl">📜</span> How to Play
      </h2>
      
      <div className="space-y-4 text-sm leading-relaxed">
        <section>
          <h3 className="font-semibold text-blue-400 mb-1">Objective</h3>
          <p>
            Be the first player to connect <strong className="text-white">4 discs</strong> of your color in a row.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-violet-400 mb-1">Directions</h3>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Vertically ↕️</li>
            <li>Horizontally ↔️</li>
            <li>Diagonally ↗️ ↘️</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-amber-400 mb-1">Rules</h3>
          <ul className="list-disc pl-4 space-y-2 text-slate-400">
            <li>Players take turns dropping one disc at a time into any of the 7 columns.</li>
            <li>The disc falls to the lowest available space in that column.</li>
            <li>The game ends when a player connects 4 or the board is full (Draw).</li>
          </ul>
        </section>

        <div className="pt-2 border-t border-slate-700/50 mt-4">
          <p className="text-xs text-slate-500 italic">
            Tip: Plan ahead and block your opponent's moves!
          </p>
        </div>
      </div>
    </div>
  );
});
