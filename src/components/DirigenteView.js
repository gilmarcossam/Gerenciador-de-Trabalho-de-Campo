import React from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function DirigenteView({
  currentUser,
  isMaster,
  mesVigenteInfo,
  programacaoVigente,
  saidas,
  onChangeConfirmacao
}) {
  const minhasSaidas = programacaoVigente.filter(
    p => p.dirigente === currentUser?.nome || isMaster
  );

  return html`
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <div className="border-b pb-2">
        <h2 className="font-bold text-base text-[#1e3a5f]">
          Minhas Designações no Mês Vigente (${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano})
        </h2>
        <p className="text-xs text-slate-500">
          Confirme sua presença ou informe caso não possa dirigir para que o administrador providencie substituição.
        </p>
      </div>

      <div className="space-y-2">
        ${minhasSaidas.map(item => {
          const s = saidas.find(x => x.id === Number(item.saidaId));
          return html`
            <div
              key=${item.id}
              className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-bold text-[#1e3a5f]">
                  Dia ${String(item.dia).padStart(2, "0")} (${item.semana}) -${item.hora}
                </span>
                <p className="text-slate-600">
                  Mapa ${item.mapa} • Local: ${s?.nome || "Grupos"} • Dirigente: 
                  <strong>${item.dirigente}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className=${`px-2 py-0.5 rounded font-bold ${
                    item.confirmacao === "Confirmado"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.confirmacao === "Recusado"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  ${item.confirmacao}
                </span>
                <button
                  onClick=${() => onChangeConfirmacao(item.id, "Confirmado")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-bold"
                >
                  Confirmar
                </button>
                <button
                  onClick=${() => onChangeConfirmacao(item.id, "Recusado")}
                  className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded font-bold"
                >
                  Não Posso
                </button>
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}