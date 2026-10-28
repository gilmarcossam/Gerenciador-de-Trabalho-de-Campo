import React, { useState } from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function HomeView({
  campanha,
  mesVigenteInfo,
  programacaoVigente,
  diaSelecionado,
  setDiaSelecionado,
  isDiaDeGrupos,
  grupoSelecionadoId,
  setGrupoSelecionadoId,
  saidaAtual,
  territorioAtual,
  localSaidaAtual,
  grupos,
  particulares,
  restricoes,
  zoomConfig,
  onOpenReportModal
}) {
  const [quadraFocada, setQuadraFocada] = useState(null);
  const [zoomImgUrl, setZoomImgUrl] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  const diasUnicos = Array.from(new Set(programacaoVigente.map(p => p.dia))).sort(
    (a, b) => a - b
  );

  // Quadras sem moradores cadastradas neste mapa
  const entradasSemMoradores = Object.entries(territorioAtual.semMoradores || {});

  // Quadras em Território Particular ativas neste mapa
  const quadrasParticularesMapa = {};
  (particulares || [])
    .filter(p => p.mapa === territorioAtual.numero)
    .forEach(p => {
      p.quadras.forEach(q => {
        if (!p.concluidas?.[q]) {
          quadrasParticularesMapa[q] = p.usuarioNome;
        }
      });
    });
  const entradasParticulares = Object.entries(quadrasParticularesMapa);

  // Quadras Parciais deste mapa
  const entradasParciais = Object.entries(territorioAtual.parciais || {});

  // Casas Restritas deste mapa
  const restricoesDoMapa = (restricoes || []).filter(
    r => r.mapa === territorioAtual.numero
  );

  // Grupo selecionado (quando for domingo de grupos)
  const grupoAtivo =
    grupos.find(g => g.id === Number(grupoSelecionadoId)) || grupos[0];

  const nomeLocalExibido =
    isDiaDeGrupos && grupoAtivo?.saidaProvisoriaAtiva
      ? `${grupoAtivo.saidaProvisoriaNome} (Provisório)`
      : localSaidaAtual?.nome || "Local a definir";

  const enderecoLocalExibido =
    isDiaDeGrupos && grupoAtivo?.saidaProvisoriaAtiva
      ? grupoAtivo.saidaProvisoriaEndereco
      : localSaidaAtual?.endereco || "";

  return html`
    <div className="space-y-4">
      <!-- Banner de Campanha Especial (se estiver ativa) -->
      ${campanha?.ativa && html`
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-xl shadow-sm text-xs">
          <span className="font-extrabold text-amber-900 uppercase block">
            📢 ${campanha.nome} (${campanha.dataInicio} a ${campanha.dataFim})
          </span>
          <p className="text-amber-800 mt-0.5">${campanha.observacao}</p>
        </div>
      `}

      <!-- Barra de Seleção de Dia do Mês (Clean) + Atalhos de Teste -->
      <div className="bg-white rounded-xl shadow-sm border p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">
            Dia de ${mesVigenteInfo?.mesNome || "Junho"}:
          </span>
          <select
            value=${diaSelecionado}
            onChange=${e => {
              setDiaSelecionado(Number(e.target.value));
              setQuadraFocada(null);
            }}
            className="border rounded-lg px-3 py-1.5 font-bold text-[#1e3a5f] bg-slate-50"
          >
            ${diasUnicos.map(d => {
              const infoDia = programacaoVigente.find(p => p.dia === d);
              return html`
                <option key=${d} value=${d}>
                  Dia ${String(d).padStart(2, "0")} - ${infoDia?.semana || ""}
                </option>
              `;
            })}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick=${() => {
              setDiaSelecionado(12);
              setQuadraFocada(null);
            }}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-lg"
          >
            Dia 12 (Com Particular/Escola)
          </button>
          <button
            type="button"
            onClick=${() => {
              setDiaSelecionado(2);
              setQuadraFocada(null);
            }}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-lg"
          >
            Dia 02 (Mapa Limpo)
          </button>
          <button
            type="button"
            onClick=${() => {
              setDiaSelecionado(14);
              setQuadraFocada(null);
            }}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold px-2.5 py-1 rounded-lg"
          >
            Dia 14 (Domingo de Grupos)
          </button>
        </div>
      </div>

      <!-- CARD DE CAMPO NO ZOOM (Aparece automaticamente nos dias configurados pelo Admin) -->
      ${(zoomConfig?.dias || [])
        .filter(z => Number(z.dia) === Number(diaSelecionado))
        .map(
          zDia => html`
            <div
              key=${zDia.id}
              className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
                    💻 Campo via Zoom Hoje (Dia ${String(zDia.dia).padStart(2, "0")})
                  </span>
                  <span className="text-xs font-extrabold text-indigo-950">
                    🕒 Horário: ${zDia.horario || zoomConfig?.horarioPadrao || "09:30"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#1e3a5f]">
                  👤 Dirigente do Zoom: <span className="text-indigo-900 font-extrabold">${zDia.dirigente}</span>
                </p>
              </div>

              ${(zDia.link || zoomConfig?.linkPadrao) && html`
                <a
                  href=${zDia.link || zoomConfig?.linkPadrao}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow transition"
                >
                  🔗 Entrar na Sala do Zoom
                </a>
              `}
            </div>
          `
        )}

      <!-- SE FOR DOMINGO DE GRUPOS: Botões de Seleção de Grupo -->
      ${isDiaDeGrupos && html`
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[#1e3a5f]">
              👥 Domingo de Saída em Grupos — Selecione o seu Grupo:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            ${grupos.map(
              g => html`
                <button
                  type="button"
                  key=${g.id}
                  onClick=${() => {
                    setGrupoSelecionadoId(g.id);
                    setQuadraFocada(null);
                  }}
                  className=${`p-3 rounded-xl border text-left transition ${
                    Number(grupoSelecionadoId) === g.id
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md"
                      : "bg-white text-slate-800 hover:bg-blue-100/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs sm:text-sm">${g.nome}</span>
                    <span
                      className=${`text-[10px] font-bold px-2 py-0.5 rounded ${
                        Number(grupoSelecionadoId) === g.id
                          ? "bg-blue-800 text-blue-100"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Mapa ${g.mapa}
                    </span>
                  </div>
                  <p
                    className=${`text-[11px] mt-1 truncate ${
                      Number(grupoSelecionadoId) === g.id ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    👤 ${g.anciao} / ${g.ajudante}
                  </p>
                </button>
              `
            )}
          </div>
        </div>
      `}

      <!-- CARD PRINCIPAL DO TERRITÓRIO DO DIA -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-5">
        <!-- Cabeçalho do Mapa, Local da Saída e Dirigente (Sem caracteres {" "}!) -->
        <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-4">
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-blue-700 uppercase block">
              ${saidaAtual?.periodo || "MANHÃ"} • ${saidaAtual?.hora || "09:00"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e3a5f]">
              Mapa ${territorioAtual.numero} - ${territorioAtual.nome}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              <strong>Local da Saída:</strong> ${nomeLocalExibido} — ${enderecoLocalExibido}
            </p>
            <div className="pt-1">
              <a
                href=${`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  enderecoLocalExibido + ", Mongaguá - SP"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs shadow-sm transition"
              >
                📍 Abrir Endereço da Saída no GPS
              </a>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">
              Dirigente Designado
            </span>
            <span className="font-extrabold text-sm text-[#1e3a5f]">
              ${saidaAtual?.dirigente}
            </span>
          </div>
        </div>

        <!-- 1. SITUAÇÃO DAS QUADRAS -->
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold uppercase text-[#1e3a5f] tracking-wide">
                SITUAÇÃO DAS QUADRAS
              </h3>
              <span className="bg-[#1e3a5f] text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full shadow-sm">
                Ciclo ${territorioAtual.rodada}
              </span>
            </div>

            <!-- Legenda Limpa (Sem números de quadras nos rótulos) -->
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border shadow-sm text-slate-700">
                <span className="w-4 h-4 rounded bg-white border-2 border-slate-400 inline-block"></span>
                Disponível
              </span>
              <span className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 shadow-sm text-amber-900">
                <span className="w-4 h-4 rounded bg-amber-400 border border-amber-600 inline-block"></span>
                Parcial
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-sm text-emerald-900">
                <span className="w-4 h-4 rounded bg-emerald-600 inline-block"></span>
                Trabalhada
              </span>

              ${entradasSemMoradores.map(
                ([qNum, nomeCadastrado]) => html`
                  <span
                    key=${`leg-sm-${qNum}`}
                    className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 shadow-sm text-slate-700"
                  >
                    <span className="w-4 h-4 rounded bg-slate-200 border-2 border-dashed border-slate-500 inline-block"></span>
                    ${nomeCadastrado}
                  </span>
                `
              )}

              ${entradasParticulares.length > 0 && html`
                <span className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-300 shadow-sm text-purple-900">
                  <span className="w-4 h-4 rounded bg-purple-100 border-2 border-dashed border-purple-600 inline-block"></span>
                  Particular — Não Fazer
                </span>
              `}
            </div>
          </div>

          <!-- Grade de Botões das Quadras -->
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-2.5">
            ${Array.from({ length: territorioAtual.totalQuadras }, (_, i) => i + 1).map(q => {
              const motivoSemMorador =
                territorioAtual.semMoradores?.[q] ||
                territorioAtual.semMoradores?.[String(q)];
              const isSemMorador = Boolean(motivoSemMorador);
              const donoParticular = quadrasParticularesMapa[q];
              const isParticular = !isSemMorador && Boolean(donoParticular);
              const detalheParcial =
                territorioAtual.parciais?.[q] || territorioAtual.parciais?.[String(q)];
              const isParcial = !isSemMorador && !isParticular && Boolean(detalheParcial);
              const isFeita =
                !isSemMorador &&
                !isParticular &&
                !isParcial &&
                territorioAtual.trabalhadas.includes(q);

              return html`
                <button
                  type="button"
                  key=${q}
                  onClick=${() => setQuadraFocada(quadraFocada === q ? null : q)}
                  className=${`h-12 sm:h-14 rounded-xl font-extrabold text-sm sm:text-base flex flex-col items-center justify-center transition relative ${
                    quadraFocada === q ? "ring-4 ring-blue-400 scale-105 z-10 " : ""
                  }${
                    isSemMorador
                      ? "bg-slate-200/80 text-slate-500 border-2 border-dashed border-slate-400"
                      : isParticular
                      ? "bg-purple-100 text-purple-900 border-2 border-dashed border-purple-500"
                      : isParcial
                      ? "bg-amber-400 text-amber-950 border-2 border-amber-600 shadow-sm"
                      : isFeita
                      ? "bg-emerald-600 text-white border-2 border-emerald-700 shadow-sm"
                      : "bg-white text-slate-800 border-2 border-slate-300 hover:border-blue-500 shadow-sm"
                  }`}
                >
                  <span>${q}</span>
                  ${isSemMorador && html`
                    <span className="text-[8px] font-bold uppercase truncate max-w-[90%] leading-none mt-0.5">
                      ${motivoSemMorador}
                    </span>
                  `}
                  ${isParticular && html`
                    <span className="text-[8px] font-bold uppercase leading-none mt-0.5">
                      Não Fazer
                    </span>
                  `}
                </button>
              `;
            })}
          </div>

          <!-- Painel de Detalhe ao Clicar numa Quadra Específica -->
          ${quadraFocada && html`
            <div className="bg-white border-2 border-blue-200 rounded-xl p-3 text-xs flex justify-between items-center">
              <div>
                <strong className="text-[#1e3a5f] text-sm">
                  Quadra ${quadraFocada}:
                </strong> 
                ${territorioAtual.semMoradores?.[quadraFocada]
                  ? html`<span className="text-slate-700 font-bold">Quadra sem moradores (${territorioAtual.semMoradores[quadraFocada]}) — Não trabalhar.</span>`
                  : quadrasParticularesMapa[quadraFocada]
                  ? html`<span className="text-purple-800 font-bold">Quadra em Território Particular (${quadrasParticularesMapa[quadraFocada]}) — Não fazer no campo normal.</span>`
                  : territorioAtual.parciais?.[quadraFocada]
                  ? html`<span className="text-amber-900 font-bold">Parcial — Falta concluir: ${territorioAtual.parciais[quadraFocada]}</span>`
                  : territorioAtual.trabalhadas.includes(quadraFocada)
                  ? html`<span className="text-emerald-700 font-bold">✅ Quadra já trabalhada neste ciclo.</span>`
                  : html`<span className="text-slate-700 font-bold">⬜ Quadra disponível para ser trabalhada hoje!</span>`}
              </div>
              <button
                type="button"
                onClick=${() => setQuadraFocada(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2"
              >
                ✕
              </button>
            </div>
          `}

          <!-- Resumo de Quadras Parciais, Último Trabalho e Casas Restritas (Sem caracteres {" "}!) -->
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="space-y-2 text-xs">
              ${entradasParciais.length > 0 && html`
                <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-amber-950 space-y-1">
                  <span className="font-extrabold block">
                    🟨 Quadras Parciais (Onde continuar hoje):
                  </span>
                  <ul className="space-y-1">
                    ${entradasParciais.map(
                      ([qNum, det]) => html`
                        <li key=${qNum}>
                          • <strong>Quadra ${qNum}:</strong> ${det}
                        </li>
                      `
                    )}
                  </ul>
                </div>
              `}

              <div className="bg-white border p-3 rounded-xl text-slate-700 space-y-1">
                <span className="font-bold text-[#1e3a5f] block">
                  📌 Histórico Recente deste Mapa:
                </span>
                <p>
                  <strong>Último trabalho:</strong> ${territorioAtual.ultimaData} (${territorioAtual.ultimoDirigente})
                </p>
                <p>
                  <strong>Observação anterior:</strong> "${territorioAtual.ultimaObs}"
                </p>
              </div>
            </div>

            <!-- Casas Restritas Limpas (Sem {" "}!) -->
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs space-y-1.5">
              <span className="font-extrabold text-red-900 block">
                🛑 Casas Restritas (Não Bater) - Mapa ${territorioAtual.numero}:
              </span>
              ${restricoesDoMapa.length === 0
                ? html`
                    <p className="text-slate-600">
                      Nenhuma restrição cadastrada neste mapa.
                    </p>
                  `
                : html`
                    <ul className="space-y-1 text-red-900 font-bold">
                      ${restricoesDoMapa.map(
                        r => html`
                          <li key=${r.id}>
                            📍 ${r.rua}, Nº ${r.numero} <span className="font-normal text-red-700">(${r.data})</span>
                          </li>
                        `
                      )}
                    </ul>
                  `}
            </div>
          </div>
        </div>

        <!-- 2. Imagem do Mapa Exposta Logo Abaixo das Quadras -->
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase text-[#1e3a5f]">
              🗺️ Imagem do Mapa ${territorioAtual.numero} (${territorioAtual.nome})
            </h3>
            <span className="text-[11px] font-semibold text-blue-700">
              🔍 Toque na imagem para abrir e dar zoom
            </span>
          </div>

          <div className=${`grid grid-cols-1 ${territorioAtual.imagens.length > 1 ? "md:grid-cols-2" : ""} gap-3`}>
            ${territorioAtual.imagens.map((url, idx) => {
              const isDataUrl = url.startsWith("data:image");
              const idMatch = !isDataUrl && url.match(/id=([^&]+)/);
              const thumbUrl = idMatch
                ? `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`
                : url;
              return html`
                <div
                  key=${idx}
                  onClick=${() => {
                    setZoomScale(1);
                    setZoomImgUrl(thumbUrl);
                  }}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:border-blue-400 transition"
                >
                  ${territorioAtual.imagens.length > 1 && html`
                    <div className="bg-slate-100 px-3 py-1.5 border-b flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">
                        Mapa ${territorioAtual.numero} - Parte ${idx + 1}
                      </span>
                      <span className="text-[11px] text-blue-700 font-bold">🔍 Toque para ampliar</span>
                    </div>
                  `}
                  <img
                    src=${thumbUrl}
                    alt=${`Mapa ${territorioAtual.numero}`}
                    className="w-full max-h-96 object-contain bg-slate-900/5"
                  />
                </div>
              `;
            })}
          </div>
        </div>

        <!-- 3. Botão de Preencher Território Trabalhado Hoje (Enxuto para UX Mobile) -->
        <button
          onClick=${onOpenReportModal}
          className="w-full bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-3 px-4 rounded-xl shadow flex items-center justify-center gap-2 text-xs sm:text-sm transition"
        >
          <span>
            ✍️ Preencher Território Trabalhado Hoje${
              isDiaDeGrupos && grupoAtivo?.nome ? ` — ${grupoAtivo.nome}` : ""
            }
          </span>
        </button>
      </div>

      <!-- Modal Popup de Zoom da Foto do Mapa -->
      ${zoomImgUrl && html`
        <div
          onClick=${() => setZoomImgUrl(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-2 sm:p-4 z-50"
        >
          <div
            onClick=${e => e.stopPropagation()}
            className="max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            <div className="p-3 bg-[#1e3a5f] text-white flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
              <span>🗺️ Mapa ${territorioAtual.numero} — ${territorioAtual.nome}</span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick=${() => setZoomScale(s => Math.max(1, Number((s - 0.5).toFixed(1))))}
                  className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded text-white font-extrabold"
                >
                  🔍 -
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomScale(1)}
                  className="bg-white/15 hover:bg-white/25 px-2 py-1 rounded text-white"
                >
                  ${Math.round(zoomScale * 100)}%
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomScale(s => Math.min(3, Number((s + 0.5).toFixed(1))))}
                  className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded text-white font-extrabold"
                >
                  🔍 +
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomImgUrl(null)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded ml-2"
                >
                  Fechar ✕
                </button>
              </div>
            </div>

            <div className="overflow-auto bg-slate-900/90 flex-1 flex items-center justify-center p-2">
              <img
                src=${zoomImgUrl}
                alt="Mapa Ampliado"
                onClick=${() => setZoomScale(s => (s >= 2.5 ? 1 : Number((s + 0.75).toFixed(2))))}
                style=${{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center",
                  transition: "transform 0.2s ease"
                }}
                className="max-h-[80vh] w-auto object-contain cursor-zoom-in"
              />
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}