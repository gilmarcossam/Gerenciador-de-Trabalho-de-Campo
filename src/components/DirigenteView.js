import React, { useState } from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function DirigenteView({
  currentUser,
  isMaster,
  mesVigenteInfo,
  programacaoVigente,
  saidas,
  grupos = [],
  diaReferencia = 12,
  onPreencherPendencia,
  onChangeConfirmacao
}) {
  const [filtroEscala, setFiltroEscala] = useState("minhas");

  // Monta a lista de saídas (incluindo desdobramento de Domingos de Grupos) para checar pendências
  const todasDesignacoes = [];

  programacaoVigente.forEach(item => {
    if (item.tipo === "Grupos") {
      grupos.forEach(g => {
        const infoRelatoGrupo = item.gruposRelatados?.[g.id];
        const isMeuGrupo =
          g.anciao === currentUser?.nome || g.ajudante === currentUser?.nome;

        todasDesignacoes.push({
          chaveUnica: `dom-${item.dia}-grp-${g.id}`,
          idOriginal: item.id,
          dia: item.dia,
          semana: item.semana,
          hora: g.horario || item.hora,
          periodo: g.nome,
          mapa: g.mapa,
          saidaId: g.saidaId,
          dirigente: `${g.anciao} / ${g.ajudante}`,
          isMinha: isMeuGrupo,
          isGrupo: true,
          grupoId: g.id,
          confirmacao: item.confirmacao || "Confirmado",
          relatado: Boolean(infoRelatoGrupo?.relatado),
          resumoRelatorio: infoRelatoGrupo?.resumo || ""
        });
      });
    } else {
      const isMinhaSaida = item.dirigente === currentUser?.nome;
      todasDesignacoes.push({
        chaveUnica: `normal-${item.id}`,
        idOriginal: item.id,
        dia: item.dia,
        semana: item.semana,
        hora: item.hora,
        periodo: item.periodo || "Manhã",
        mapa: item.mapa,
        saidaId: item.saidaId,
        dirigente: item.dirigente,
        isMinha: isMinhaSaida,
        isGrupo: false,
        grupoId: null,
        confirmacao: item.confirmacao || "Pendente",
        relatado: Boolean(item.relatado),
        resumoRelatorio: item.resumoRelatorio || ""
      });
    }
  });

  // Pendências do dirigente logado (dias até o dia de referência atual que ainda não foram relatados)
  const minhasPendencias = todasDesignacoes.filter(
    d => (d.isMinha || isMaster) && !d.relatado && d.dia <= diaReferencia
  );

  // Lista exibida na tabela de designações abaixo
  const designacoesExibidas =
    filtroEscala === "minhas" && !isMaster
      ? todasDesignacoes.filter(d => d.isMinha)
      : filtroEscala === "minhas" && isMaster
      ? todasDesignacoes.filter(d => d.isMinha)
      : todasDesignacoes;

  return html`
    <div className="space-y-4">
      <!-- Cabeçalho da Área do Dirigente -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-[#1e3a5f] px-2.5 py-0.5 rounded">
            Painel Pessoal do Dirigente
          </span>
          <h2 className="font-extrabold text-base sm:text-lg text-[#1e3a5f] mt-1">
            👤 Área do Dirigente — ${currentUser?.nome}
          </h2>
          <p className="text-xs text-slate-600">
            Confira suas saídas de campo em ${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano} e preencha os relatórios pendentes.
          </p>
        </div>

        <div className="flex gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick=${() => setFiltroEscala("minhas")}
            className=${`px-3 py-1.5 rounded-lg border transition ${
              filtroEscala === "minhas"
                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            Minhas Saídas
          </button>
          <button
            type="button"
            onClick=${() => setFiltroEscala("todas")}
            className=${`px-3 py-1.5 rounded-lg border transition ${
              filtroEscala === "todas"
                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                : "bg-slate-50 text-slate-700"
            }`}
          >
            Ver Mês Inteiro
          </button>
        </div>
      </div>

      <!-- 1. ALERTA DE RELATÓRIOS PENDENTES DO DIRIGENTE -->
      ${minhasPendencias.length === 0
        ? html`
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-950">
              <div>
                <span className="font-extrabold text-sm block text-emerald-900">
                  ✅ Tudo em dia! Nenhuma pendência de preenchimento.
                </span>
                <p className="text-emerald-800 mt-0.5">
                  Todos os seus dias de campo até o dia ${String(diaReferencia).padStart(2, "0")} já foram devidamente relatados.
                </p>
              </div>
            </div>
          `
        : html`
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
                <div>
                  <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                    Atenção • Preenchimento Pendente
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-amber-950 mt-1">
                    ⚠️ Você possui ${minhasPendencias.length} saída(s) aguardando preenchimento de quadras
                  </h3>
                  <p className="text-xs text-amber-900">
                    Por favor, informe as quadras trabalhadas (ou se choveu) nos dias abaixo para manter os mapas atualizados:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                ${minhasPendencias.map(pend => {
                  const localObj = saidas.find(s => s.id === Number(pend.saidaId));
                  return html`
                    <div
                      key=${pend.chaveUnica}
                      className="bg-white border border-amber-300 rounded-xl p-3 flex flex-col justify-between gap-2.5 shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[11px] font-extrabold text-amber-800 uppercase block">
                            Dia ${String(pend.dia).padStart(2, "0")} (${pend.semana}) • 🕒 ${pend.hora}
                          </span>
                          <span className="font-extrabold text-sm text-[#1e3a5f] block">
                            Mapa ${pend.mapa} — ${pend.periodo}
                          </span>
                          <span className="text-xs text-slate-600 block">
                            📍 ${localObj?.nome || "Saída"}
                          </span>
                          ${isMaster && html`
                            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                              👤 Resp.: ${pend.dirigente}
                            </span>
                          `}
                        </div>

                        <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase shrink-0">
                          Pendente
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick=${() => onPreencherPendencia(pend.dia, pend.grupoId)}
                        className="w-full bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-2 px-3 rounded-lg text-xs shadow-sm transition"
                      >
                        ✍️ Preencher Quadras do Dia ${String(pend.dia).padStart(2, "0")} Agora
                      </button>
                    </div>
                  `;
                })}
              </div>
            </div>
          `}

      <!-- 2. TABELA COMPLETA DAS ESCALAS DO DIRIGENTE NO MÊS -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-3 text-xs">
        <h3 className="font-extrabold text-sm sm:text-base text-[#1e3a5f]">
          📋 Escala de Saídas e Status de Relatório (${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano})
        </h3>

        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-2.5">Dia</th>
                <th className="p-2.5">Horário / Turno</th>
                <th className="p-2.5">Local da Saída</th>
                <th className="p-2.5">Mapa</th>
                <th className="p-2.5">Dirigente</th>
                <th className="p-2.5">Relatório de Quadras</th>
                <th className="p-2.5">Ação</th>
              </tr>
            </thead>
            <tbody>
              ${designacoesExibidas.map(d => {
                const localObj = saidas.find(s => s.id === Number(d.saidaId));
                const atrasado = !d.relatado && d.dia <= diaReferencia;

                return html`
                  <tr
                    key=${d.chaveUnica}
                    className=${`border-b ${
                      atrasado ? "bg-amber-50/60" : d.relatado ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <td className="p-2.5 font-extrabold text-[#1e3a5f]">
                      Dia ${String(d.dia).padStart(2, "0")} (${d.semana})
                    </td>
                    <td className="p-2.5 font-semibold">
                      ${d.hora} (${d.periodo})
                    </td>
                    <td className="p-2.5">${localObj?.nome || "-"}</td>
                    <td className="p-2.5">
                      <span className="bg-[#1e3a5f] text-white font-bold px-2 py-0.5 rounded text-[11px]">
                        Mapa ${d.mapa}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-800">${d.dirigente}</td>
                    <td className="p-2.5">
                      ${d.relatado
                        ? html`
                            <div>
                              <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase inline-block">
                                ✅ Preenchido
                              </span>
                              ${d.resumoRelatorio && html`
                                <span className="block text-[10px] text-slate-600 mt-0.5">
                                  ${d.resumoRelatorio}
                                </span>
                              `}
                            </div>
                          `
                        : atrasado
                        ? html`
                            <span className="bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase inline-block">
                              ⚠️ Pendente
                            </span>
                          `
                        : html`
                            <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px] uppercase inline-block">
                              ⏳ Próximo Dia
                            </span>
                          `}
                    </td>
                    <td className="p-2.5">
                      ${!d.relatado
                        ? html`
                            <button
                              type="button"
                              onClick=${() => onPreencherPendencia(d.dia, d.grupoId)}
                              className="bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold px-2.5 py-1 rounded-lg text-[11px]"
                            >
                              ✍️ Preencher
                            </button>
                          `
                        : html`
                            <button
                              type="button"
                              onClick=${() => onPreencherPendencia(d.dia, d.grupoId)}
                              className="text-blue-700 hover:underline font-bold text-[11px]"
                            >
                              Editar
                            </button>
                          `}
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}