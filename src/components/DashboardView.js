import React from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function DashboardView({ territorios, percentualGeral, restricoes }) {
  return html`
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h2 className="font-bold text-base text-[#1e3a5f]">
            Progresso Geral do Território da Congregação
          </h2>
          <p className="text-xs text-slate-500">
            Contabilização consolidada de todos os 15 mapas da Congregação Arpoador
          </p>
        </div>
        <div className="text-2xl font-extrabold text-[#24558f]">${percentualGeral}% Concluído</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${territorios.map(t => {
          const perc = Math.round((t.trabalhadas.length / t.totalQuadras) * 100);
          const restMapa = restricoes.filter(r => r.mapa === t.numero);
          return html`
            <div key=${t.numero} className="bg-white rounded-xl shadow-sm border p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#1e3a5f]">
                  Mapa ${t.numero} -${t.nome}
                </span>
                <span className="font-extrabold text-blue-800">${perc}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full" style=${{ width: `${perc}%` }}></div>
              </div>
              <p className="text-slate-600">
                Última vez: <strong>${t.ultimaData}</strong> (${t.ultimoDirigente})
              </p>
              <p className="text-slate-500 italic">"${t.ultimaObs}"</p>
              <p className="text-[11px] text-red-700 font-semibold">
                🛑 Casas Restritas: ${restMapa.length}
              </p>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}