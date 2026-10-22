import React, { useState } from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function CalendarioView({
  mesVigenteInfo,
  programacaoVigente,
  saidas,
  territorios,
  grupos,
  diaSelecionado,
  setDiaSelecionado
}) {
  const [diaDetalheModal, setDiaDetalheModal] = useState(null);

  const diasDaSemanaCabecalho = [
    "DOM",
    "SEG",
    "TER",
    "QUA",
    "QUI",
    "SEX",
    "SÁB"
  ];

  // Agrupa todas as saídas programadas por número do dia (suporta múltiplos turnos no mesmo dia)
  const saidasPorDia = {};
  programacaoVigente.forEach(item => {
    if (!saidasPorDia[item.dia]) {
      saidasPorDia[item.dia] = [];
    }
    saidasPorDia[item.dia].push(item);
  });

  const diasUnicos = Object.keys(saidasPorDia)
    .map(Number)
    .sort((a, b) => a - b);

  // Descobre em qual dia da semana (0=Dom a 6=Sáb) começa o dia 1 do mês para alinhar os quadradinhos
  const mapaIndiceSemana = {
    DOMINGO: 0,
    Segunda: 1,
    Terça: 2,
    Quarta: 3,
    Quinta: 4,
    Sexta: 5,
    Sábado: 6
  };
  const primeiroDiaSemanaTexto = saidasPorDia[1]?.[0]?.semana || "Segunda";
  const espacosVaziosInicio =
    mapaIndiceSemana[primeiroDiaSemanaTexto] !== undefined
      ? mapaIndiceSemana[primeiroDiaSemanaTexto]
      : 1;

  const abrirDia = d => {
    setDiaSelecionado(d);
    setDiaDetalheModal(d);
  };

  const saidasDoDiaModal = diaDetalheModal ? saidasPorDia[diaDetalheModal] || [] : [];

  return html`
    <div className="space-y-4">
      <!-- Cabeçalho Oficial da Lista de Campo do Mês -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-[#1e3a5f] px-2.5 py-0.5 rounded">
            Calendário Mensal de Pregação
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1e3a5f] mt-1">
            📅 Lista de Campo — ${mesVigenteInfo?.mesNome} de ${mesVigenteInfo?.ano}
          </h2>
          <p className="text-xs text-slate-600 italic mt-0.5">
            “O homem não deve viver somente de pão, mas de toda palavra que vem da boca de Jeová.” — <strong>Mateus 4:4</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border">
            <span className="w-3 h-3 rounded bg-white border border-slate-400 inline-block"></span>
            Campo Normal
          </span>
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
            Domingo em Grupos
          </span>
          <button
            type="button"
            onClick=${() => window.print()}
            className="bg-[#1e3a5f] hover:bg-[#24558f] text-white px-3 py-1.5 rounded-lg shadow-sm transition no-print"
          >
            🖨️ Imprimir Calendário
          </button>
        </div>
      </div>

      <!-- Dica simples de uso -->
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-[#1e3a5f]">
        💡 <strong>Toque em qualquer dia do calendário</strong> para abrir as informações da saída daquele dia.
      </div>

      <!-- GRADE DO CALENDÁRIO (APENAS OS DIAS CENTRALIZADOS NOS QUADRADOS) -->
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <!-- Cabeçalho dos Dias da Semana -->
        <div className="grid grid-cols-7 bg-[#1e3a5f] text-white text-center text-[11px] sm:text-xs font-extrabold py-2.5">
          ${diasDaSemanaCabecalho.map(
            (sem, idx) => html`
              <div
                key=${sem}
                className=${idx === 0 ? "text-amber-300" : "text-white"}
              >
                ${sem}
              </div>
            `
          )}
        </div>

        <!-- Quadradinhos dos Dias (Apenas o número do dia centralizado) -->
        <div className="grid grid-cols-7 gap-px bg-slate-200 border-t border-slate-200">
          <!-- Espaços vazios antes do dia 1 para alinhar com o dia da semana correto -->
          ${Array.from({ length: espacosVaziosInicio }).map(
            (_, idx) => html`
              <div key=${`vazio-${idx}`} className="bg-slate-50/70 h-14 sm:h-20"></div>
            `
          )}

          <!-- Dias do Mês -->
          ${diasUnicos.map(d => {
            const listaTurnos = saidasPorDia[d] || [];
            const turnoPrincipal = listaTurnos[0];
            const isGrupo = turnoPrincipal?.tipo === "Grupos";
            const isDomingo = turnoPrincipal?.semana === "DOMINGO";
            const isSelecionado = d === diaSelecionado;

            return html`
              <button
                type="button"
                key=${d}
                onClick=${() => abrirDia(d)}
                className=${`h-14 sm:h-20 flex items-center justify-center transition ${
                  isSelecionado
                    ? "bg-amber-50 ring-2 ring-inset ring-[#24558f]"
                    : isGrupo
                    ? "bg-blue-50/70 hover:bg-blue-100/80"
                    : "bg-white hover:bg-slate-100"
                }`}
              >
                <span
                  className=${`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-extrabold transition ${
                    isSelecionado
                      ? "bg-[#1e3a5f] text-white shadow-md"
                      : isGrupo
                      ? "bg-blue-600 text-white shadow-sm"
                      : isDomingo
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-[#1e3a5f]"
                  }`}
                >
                  ${String(d).padStart(2, "0")}
                </span>
              </button>
            `;
          })}
        </div>
      </div>

      <!-- Card do Arranjo de Cartas via Zoom posicionado abaixo do calendário -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-extrabold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded">
            Toda Segunda-Feira
          </span>
          <h3 className="font-extrabold text-sm sm:text-base text-[#1e3a5f]">
            💻 Arranjo de Cartas via Zoom
          </h3>
          <p className="text-slate-600">
            Programação dos dirigentes responsáveis pela sala do Zoom nas segundas-feiras deste mês:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full lg:w-auto flex-1 max-w-2xl">
          ${[
            { dia: "01", nome: "Antônio Xavier" },
            { dia: "08", nome: "Isac Menezes" },
            { dia: "15", nome: "Antônio Xavier" },
            { dia: "22", nome: "Isac Menezes" },
            { dia: "29", nome: "Antônio Xavier" }
          ].map(
            item => html`
              <div
                key=${item.dia}
                className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-2.5 text-center"
              >
                <span className="text-[10px] font-extrabold uppercase text-indigo-700 block">
                  Dia ${item.dia}
                </span>
                <span className="font-bold text-[#1e3a5f] text-xs mt-0.5 block">
                  ${item.nome}
                </span>
              </div>
            `
          )}
        </div>
      </div>

      <!-- MODAL POPUP COM AS INFORMAÇÕES DA SAÍDA DO DIA CLICADO -->
      ${diaDetalheModal && html`
        <div
          onClick=${() => setDiaDetalheModal(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 z-50 overflow-y-auto"
        >
          <div
            onClick=${e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <!-- Cabeçalho do Popup do Dia -->
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-[#1e3a5f] px-2.5 py-0.5 rounded">
                  ${saidasDoDiaModal[0]?.semana} • ${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano}
                </span>
                <h3 className="text-lg font-extrabold text-[#1e3a5f] mt-1">
                  📅 Campo do Dia ${String(diaDetalheModal).padStart(2, "0")}
                </h3>
              </div>
              <button
                type="button"
                onClick=${() => setDiaDetalheModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <!-- Conteúdo Direto do Dia -->
            <div className="space-y-3 text-xs">
              ${saidasDoDiaModal.map((turno, idx) => {
                if (turno.tipo === "Grupos") {
                  return html`
                    <div key=${turno.id || idx} className="space-y-2.5">
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-[#1e3a5f] font-extrabold text-sm">
                        👥 Domingo de Saída em Grupos (${turno.hora})
                      </div>

                      <div className="space-y-2">
                        ${grupos.map(g => {
                          const sGrupo = saidas.find(s => s.id === Number(g.saidaId));
                          const enderecoUsado = g.saidaProvisoriaAtiva
                            ? g.saidaProvisoriaEndereco
                            : sGrupo?.endereco;
                          const nomeLocalUsado = g.saidaProvisoriaAtiva
                            ? `${g.saidaProvisoriaNome} (Provisório)`
                            : sGrupo?.nome;

                          return html`
                            <div
                              key=${g.id}
                              className="border rounded-xl p-3 bg-slate-50 space-y-1.5"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-sm text-[#1e3a5f]">
                                  ${g.nome}
                                </span>
                                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                                  🕒 ${g.horario}
                                </span>
                              </div>
                              <p className="text-slate-700">
                                <strong>👤 Dirigentes:</strong> ${g.anciao} /${g.ajudante}
                              </p>
                              <p className="text-slate-700">
                                <strong>📍 Local:</strong> ${nomeLocalUsado}
                              </p>
                              <p className="text-slate-600">
                                <strong>🏠 Endereço:</strong> ${enderecoUsado}
                              </p>
                              <div className="pt-1">
                                <a
                                  href=${`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    (enderecoUsado || "") + ", Mongaguá - SP"
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px]"
                                >
                                  📍 Abrir no GPS
                                </a>
                              </div>
                            </div>
                          `;
                        })}
                      </div>
                    </div>
                  `;
                }

                const localTurno = saidas.find(s => s.id === Number(turno.saidaId));
                const terrTurno =
                  territorios.find(t => t.numero === turno.mapa) || territorios[0];

                return html`
                  <div
                    key=${turno.id || idx}
                    className="border rounded-xl p-4 bg-slate-50 space-y-2.5"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-extrabold text-blue-700 uppercase">
                        🕒 ${turno.periodo || "Saída"} às ${turno.hora}
                      </span>
                      <span className="bg-[#1e3a5f] text-white text-[11px] font-bold px-2.5 py-0.5 rounded">
                        Mapa ${terrTurno.numero}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-800 text-xs sm:text-sm">
                      <p>
                        <strong>📍 Local da Saída:</strong> ${localTurno?.nome}
                      </p>
                      <p>
                        <strong>👤 Dirigente:</strong> ${turno.dirigente}
                      </p>
                      <p className="text-slate-600 text-xs">
                        <strong>🏠 Endereço:</strong> ${localTurno?.endereco}
                      </p>
                    </div>

                    <div className="pt-1">
                      <a
                        href=${`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          (localTurno?.endereco || "") + ", Mongaguá - SP"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm"
                      >
                        📍 Abrir Endereço no GPS
                      </a>
                    </div>
                  </div>
                `;
              })}
            </div>

            <!-- Botão único de Fechar no Rodapé do Modal -->
            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick=${() => setDiaDetalheModal(null)}
                className="w-full sm:w-auto px-5 py-2 bg-[#1e3a5f] hover:bg-[#24558f] text-white rounded-xl font-bold text-xs shadow"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}