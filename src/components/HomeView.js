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
  particulares = [],
  restricoes = [],
  zoomConfig,
  onOpenReportModal
}) {
  const [zoomModalInfo, setZoomModalInfo] = useState(null); // { url, idx }
  const [zoomScale, setZoomScale] = useState(1);

  // Grupo ativo (quando for Domingo de Grupos)
  const grupoAtivo =
    grupos.find(g => g.id === Number(grupoSelecionadoId)) || grupos[0] || null;

  // Verifica se o grupo de domingo tem saída provisória ativa hoje
  const usandoSaidaProvisoria =
    isDiaDeGrupos &&
    grupoAtivo?.saidaProvisoriaAtiva &&
    grupoAtivo?.saidaProvisoriaNome;

  const nomeSaidaExibido = usandoSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaNome
    : localSaidaAtual?.nome || "Saída";

  const enderecoSaidaExibido = usandoSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaEndereco
    : localSaidaAtual?.endereco || "";

  const quadraSaidaExibida = usandoSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaQuadra || "-"
    : localSaidaAtual?.quadraLocal || "-";

  // Lista de quadras sem moradores do território atual (ex: UPA, Escola)
  const entradasSemMoradores = Object.entries(territorioAtual.semMoradores || {});

  // Quadras em Território Particular ativas (ainda não concluídas) neste mapa
  const mapaParticularesAtivos = {};
  particulares
    .filter(p => p.mapa === territorioAtual.numero)
    .forEach(p => {
      (p.quadras || []).forEach(q => {
        if (!p.concluidas?.[q]) {
          mapaParticularesAtivos[q] = p.usuarioNome;
        }
      });
    });
  const entradasParticulares = Object.entries(mapaParticularesAtivos);

  // Converte coordenadas salvas pelo Admin em lista de vértices [{x, y}, ...]
  const obterVerticesQuadra = pos => {
    if (!pos) return null;
    if (Array.isArray(pos.pts) && pos.pts.length >= 3) return pos.pts;
    const x = pos.x ?? 10;
    const y = pos.y ?? 10;
    const w = pos.w ?? 6;
    const h = pos.h ?? 6;
    return [
      { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) },
      { x: Number((x + w).toFixed(1)), y: Number(y.toFixed(1)) },
      { x: Number((x + w).toFixed(1)), y: Number((y + h).toFixed(1)) },
      { x: Number(x.toFixed(1)), y: Number((y + h).toFixed(1)) }
    ];
  };

  const coordsMapa = territorioAtual.coordenadasQuadras || {};
  const temPoligonosNoMapa = Object.keys(coordsMapa).length > 0;
  const totalQuadrasExibidas =
    Object.keys(coordsMapa).length > 0
      ? Object.keys(coordsMapa).length
      : territorioAtual.totalQuadras || 0;

  // Renderiza a camada de polígonos coloridos (sem bordas) + números soltos sobre a imagem do mapa
  const renderizarCamadaVetorial = (idxImagem, isAmpliado = false) => {
    const entradasDaImagem = Object.entries(coordsMapa).filter(
      ([, pos]) => (pos.imgIdx || 0) === idxImagem
    );
    if (entradasDaImagem.length === 0) return null;

    return html`
      <${React.Fragment}>
        <!-- Polígonos Vetoriais sem bordas (incorporados à imagem) -->
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          ${entradasDaImagem.map(([qNumStr, pos]) => {
            const qNum = Number(qNumStr);
            const pts = obterVerticesQuadra(pos);
            if (!pts) return null;

            const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");
            const isSemMorador = Boolean(
              territorioAtual.semMoradores?.[qNum] ||
                territorioAtual.semMoradores?.[String(qNum)]
            );
            const isParticular =
              !isSemMorador && Boolean(mapaParticularesAtivos[qNum]);
            const isParcial =
              !isSemMorador &&
              !isParticular &&
              Boolean(
                territorioAtual.parciais?.[qNum] ||
                  territorioAtual.parciais?.[String(qNum)]
              );
            const isFeita =
              !isSemMorador &&
              !isParticular &&
              !isParcial &&
              territorioAtual.trabalhadas.includes(qNum);

            const fillColor = isSemMorador
              ? "rgba(100, 116, 139, 0.48)"
              : isParticular
              ? "rgba(147, 51, 234, 0.45)"
              : isParcial
              ? "rgba(251, 191, 36, 0.55)"
              : isFeita
              ? "rgba(16, 185, 129, 0.55)"
              : "rgba(255, 255, 255, 0.32)";

            return html`
              <polygon
                key=${`home-poly-${qNum}`}
                points=${pointsStr}
                fill=${fillColor}
                stroke="none"
                strokeWidth="0"
              />
            `;
          })}
        </svg>

        <!-- Números das Quadras Soltos e Maiores no Centro de cada Polígono -->
        ${entradasDaImagem.map(([qNumStr, pos]) => {
          const qNum = Number(qNumStr);
          const pts = obterVerticesQuadra(pos);
          if (!pts) return null;

          const centerX = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
          const centerY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;

          return html`
            <span
              key=${`home-num-${qNum}`}
              style=${{
                left: `${centerX}%`,
                top: `${centerY}%`,
                transform: "translate(-50%, -50%)",
                textShadow:
                  "0 0 4px #ffffff, 0 0 4px #ffffff, 0 1px 2px rgba(0,0,0,0.45)"
              }}
              className=${`absolute pointer-events-none font-black leading-none select-none text-slate-950 ${
                isAmpliado ? "text-base sm:text-xl" : "text-sm sm:text-base"
              }`}
            >
              ${qNum}
            </span>
          `;
        })}
      </${React.Fragment}>
    `;
  };

  return html`
    <div className="space-y-4">
      <!-- Banner de Campanha Ativa -->
      ${campanha?.ativa && html`
        <div className="bg-amber-600 text-white p-3 rounded-xl shadow flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded">
              Campanha Ativa
            </span>
            <h2 className="font-bold text-sm sm:text-base mt-0.5">${campanha.nome}</h2>
            <p className="text-xs text-amber-100">${campanha.observacao}</p>
          </div>
        </div>
      `}

      <!-- Seletor de Dia (Clean) + Botões Rápidos de Teste -->
      <div className="bg-white p-3 rounded-xl shadow-sm border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            Dia de ${mesVigenteInfo?.mesNome}:
          </span>
          <select
            value=${diaSelecionado}
            onChange=${e => setDiaSelecionado(Number(e.target.value))}
            className="border rounded-lg px-3 py-1.5 font-bold text-[#1e3a5f] bg-slate-50 text-xs sm:text-sm"
          >
            ${Array.from(new Set(programacaoVigente.map(p => p.dia))).map(d => {
              const info = programacaoVigente.find(p => p.dia === d);
              return html`
                <option key=${d} value=${d}>
                  Dia ${String(d).padStart(2, "0")} - ${info?.semana}
                </option>
              `;
            })}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick=${() => setDiaSelecionado(12)}
            className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold"
          >
            Dia 12 (Com Particular/Escola)
          </button>
          <button
            type="button"
            onClick=${() => setDiaSelecionado(2)}
            className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-bold"
          >
            Dia 02 (Mapa Limpo)
          </button>
          <button
            type="button"
            onClick=${() => setDiaSelecionado(14)}
            className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-bold"
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

      <!-- SE FOR DOMINGO DE GRUPOS: Seletor de Grupo + Avisos do Grupo -->
      ${isDiaDeGrupos && html`
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold bg-[#1e3a5f] text-white px-2.5 py-0.5 rounded">
                Saída em Grupos • Domingo
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-[#1e3a5f] mt-1">
                👥 Domingo de Campo em Grupos — Selecione o seu Grupo:
              </h3>
            </div>

            <select
              value=${grupoAtivo?.id}
              onChange=${e => setGrupoSelecionadoId(Number(e.target.value))}
              className="border-2 border-[#1e3a5f] rounded-lg px-3 py-1.5 text-xs font-extrabold text-[#1e3a5f] bg-white"
            >
              ${grupos.map(
                g => html`
                  <option key=${g.id} value=${g.id}>
                    ${g.nome} (Mapa ${g.mapa})
                  </option>
                `
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${grupos.map(g => {
              const ativo = g.id === grupoAtivo?.id;
              return html`
                <button
                  key=${g.id}
                  type="button"
                  onClick=${() => setGrupoSelecionadoId(g.id)}
                  className=${`p-2.5 rounded-xl border text-left transition ${
                    ativo
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md"
                      : "bg-white text-slate-700 border-blue-200 hover:bg-blue-100/50"
                  }`}
                >
                  <span className="font-extrabold text-xs block truncate">${g.nome}</span>
                  <span
                    className=${`text-[10px] font-semibold block mt-0.5 ${
                      ativo ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    Mapa ${g.mapa} • ${g.anciao}
                  </span>
                </button>
              `;
            })}
          </div>

          <!-- Avisos de Domingo do Grupo Selecionado (Visita do Sup. de Grupos ou Mudança Provisória) -->
          ${grupoAtivo?.visitaSupGrupos && html`
            <div className="bg-sky-100 border-l-4 border-sky-600 p-3 rounded-r-xl text-xs text-sky-950">
              <strong>👔 Visita do Superintendente de Grupos hoje neste grupo!</strong>
              ${grupoAtivo.visitaSupGruposObs && html`
                <p className="mt-0.5 font-semibold">${grupoAtivo.visitaSupGruposObs}</p>
              `}
            </div>
          `}

          ${usandoSaidaProvisoria && html`
            <div className="bg-amber-100 border-l-4 border-amber-600 p-3 rounded-r-xl text-xs text-amber-950">
              <strong>📍 Atenção — Mudança Provisória no Local de Saída deste Grupo hoje:</strong>
              <p className="mt-0.5">
                Hoje este grupo sairá de: <strong>${grupoAtivo.saidaProvisoriaNome}</strong> (${grupoAtivo.saidaProvisoriaEndereco}).
              </p>
            </div>
          `}
        </div>
      `}

      <!-- Alerta quando o Local da Saída fica em um Mapa diferente do Território trabalhado -->
      ${!usandoSaidaProvisoria &&
        localSaidaAtual &&
        String(localSaidaAtual.mapaLocal) !== String(territorioAtual.numero) && html`
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-900">
          <strong>⚠️ Atenção: Local da Saída em Mapa Diferente!</strong> O ponto de encontro
          (<strong>${localSaidaAtual.nome}</strong>) fica na Quadra
          <strong> ${localSaidaAtual.quadraLocal}</strong> do
          <strong> Mapa ${localSaidaAtual.mapaLocal}</strong>, mas o território a ser trabalhado hoje é o
          <strong> Mapa ${territorioAtual.numero}</strong>.
        </div>
      `}

      <!-- CARD PRINCIPAL DO TERRITÓRIO DO DIA -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-4">
        <!-- Cabeçalho: Dirigente ao lado direito e Botão GPS embaixo do Local da Saída -->
        <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-3.5">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-blue-700 uppercase block">
              ${saidaAtual?.periodo} • ${saidaAtual?.hora}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1e3a5f]">
              Mapa ${territorioAtual.numero} - ${territorioAtual.nome}
            </h2>
            <p className="text-xs text-slate-600">
              <strong>Local da Saída:</strong> ${nomeSaidaExibido} — ${enderecoSaidaExibido}
              (Quadra ${quadraSaidaExibida})
            </p>
            <div className="pt-0.5">
              <a
                href=${`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  (enderecoSaidaExibido || "") + ", Mongaguá - SP"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
              >
                📍 Abrir Endereço da Saída no GPS
              </a>
            </div>
          </div>

          <div className="bg-blue-50 px-3.5 py-2 rounded-lg border border-blue-200 text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">
              Dirigente Designado
            </span>
            <span className="font-bold text-sm text-[#1e3a5f]">${saidaAtual?.dirigente}</span>
          </div>
        </div>

        <!-- 1. Situação das Quadras (Legenda + Grade Sincronizada) -->
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold uppercase text-[#1e3a5f] tracking-wide">
                SITUAÇÃO DAS QUADRAS
              </h3>
              <span className="bg-[#24558f] text-white text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Ciclo ${territorioAtual.rodada}
              </span>
            </div>

            <!-- Legenda Limpa (Sem números de quadras nos rótulos) -->
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
              <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-sm">
                <span className="w-4 h-4 rounded bg-white border-2 border-slate-400 inline-block"></span>
                Disponível
              </span>
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 shadow-sm">
                <span className="w-4 h-4 rounded bg-amber-400 border border-amber-500 inline-block"></span>
                Parcial
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-sm">
                <span className="w-4 h-4 rounded bg-emerald-600 inline-block"></span>
                Trabalhada
              </span>

              ${entradasSemMoradores.map(
                ([qNum, nomeCadastrado]) => html`
                  <span
                    key=${`leg-sm-${qNum}`}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 shadow-sm"
                  >
                    <span className="w-4 h-4 rounded bg-slate-200 border-2 border-dashed border-slate-500 inline-block"></span>
                    ${nomeCadastrado}
                  </span>
                `
              )}

              ${entradasParticulares.length > 0 && html`
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-300 shadow-sm">
                  <span className="w-4 h-4 rounded bg-purple-100 border-2 border-dashed border-purple-600 inline-block"></span>
                  Particular — Não Fazer
                </span>
              `}
            </div>
          </div>

          <!-- Aviso de Quadras Parciais -->
          ${Object.keys(territorioAtual.parciais || {}).length > 0 && html`
            <div className="mt-2.5 bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-xs text-amber-900">
              <strong>🟨 Atenção às Quadras Parciais:</strong>
              <ul className="list-disc list-inside mt-1">
                ${Object.entries(territorioAtual.parciais).map(
                  ([q, det]) => html`<li key=${q}><strong>${q}:</strong> ${det}</li>`
                )}
              </ul>
            </div>
          `}
        </div>

        <!-- 2. IMAGEM DO MAPA COM OS POLÍGONOS VETORIAIS INCORPORADOS -->
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase text-[#1e3a5f]">
              🗺️ Imagem do Mapa ${territorioAtual.numero} (${territorioAtual.nome})
              ${temPoligonosNoMapa ? " • Mapa Interativo Colorido" : ""}
            </h3>
            <span className="text-[11px] font-semibold text-blue-700">
              🔍 Toque na imagem para abrir e dar zoom
            </span>
          </div>

          <div
            className=${`grid grid-cols-1 ${
              territorioAtual.imagens.length > 1 ? "md:grid-cols-2" : ""
            } gap-3`}
          >
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
                    setZoomModalInfo({ url: thumbUrl, idx });
                  }}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm cursor-pointer hover:border-blue-400 transition flex flex-col items-center justify-center p-1 sm:p-2"
                >
                  ${territorioAtual.imagens.length > 1 && html`
                    <div className="w-full bg-slate-100 px-3 py-1.5 border-b flex justify-between items-center text-xs mb-1 rounded-t-lg">
                      <span className="font-bold text-slate-700">
                        Mapa ${territorioAtual.numero} - Parte ${idx + 1}
                      </span>
                      <span className="text-[11px] text-blue-700 font-bold">
                        🔍 Toque para ampliar
                      </span>
                    </div>
                  `}

                  <!-- Container relativo que une a imagem e a camada vetorial de polígonos -->
                  <div className="relative inline-block select-none rounded-lg overflow-hidden">
                    <img
                      src=${thumbUrl}
                      alt=${`Mapa ${territorioAtual.numero}`}
                      draggable="false"
                      className="max-h-[540px] w-auto block select-none"
                    />
                    ${renderizarCamadaVetorial(idx, false)}
                  </div>
                </div>
              `;
            })}
          </div>
        </div>

        <!-- 3. Última vez trabalhado & Observações -->
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <span className="font-bold text-slate-700 block mb-1">🕒 Última vez trabalhado:</span>
            <p>
              <strong>Data:</strong> ${territorioAtual.ultimaData} (${territorioAtual.ultimoDirigente})
            </p>
            <p className="mt-1 text-slate-600 italic">"${territorioAtual.ultimaObs}"</p>
          </div>
          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
            <span className="font-bold text-[#1e3a5f] block mb-1">
              📌 Observação do Ancião / Servo:
            </span>
            <p className="text-slate-700">${territorioAtual.obsAnciao}</p>
          </div>
        </div>

        <!-- 4. Casas Restritas -->
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs">
          <span className="font-bold text-red-800 block mb-1">
            🛑 Casas Restritas (Não Bater) - Mapa ${territorioAtual.numero}:
          </span>
          ${restricoes.filter(r => r.mapa === territorioAtual.numero).length === 0
            ? html`<p className="text-slate-600">Nenhuma casa restrita cadastrada para este mapa.</p>`
            : html`
                <ul className="space-y-1 text-red-900 font-semibold">
                  ${restricoes
                    .filter(r => r.mapa === territorioAtual.numero)
                    .map(
                      r => html`
                        <li key=${r.id}>
                          📍 ${r.rua}, Nº ${r.numero}
                          <span className="text-[10px] text-red-600 font-normal"> (${r.data})</span>
                        </li>
                      `
                    )}
                </ul>
              `}
        </div>

        <!-- 5. Botão de Preencher Território Trabalhado Hoje (Texto principal em cima, nome do grupo embaixo) -->
        <button
          onClick=${onOpenReportModal}
          className="w-full bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-3 px-4 rounded-xl shadow flex flex-col items-center justify-center gap-0.5 text-xs sm:text-sm transition text-center"
        >
          <span>✍️ Preencher Território Trabalhado Hoje</span>
          ${isDiaDeGrupos && grupoAtivo?.nome && html`
            <span className="text-[11px] text-blue-200 font-semibold">
              ${grupoAtivo.nome}
            </span>
          `}
        </button>
      </div>

      <!-- Popup / Modal de Zoom da Foto do Mapa (Com os Polígonos Vetoriais Inclusos!) -->
      ${zoomModalInfo && html`
        <div
          onClick=${() => setZoomModalInfo(null)}
          className="fixed inset-0 bg-black/85 flex items-center justify-center p-2 sm:p-4 z-50"
        >
          <div
            onClick=${e => e.stopPropagation()}
            className="max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            <div className="p-3 bg-[#1e3a5f] text-white flex flex-wrap justify-between items-center gap-2 text-xs font-bold">
              <span>
                🗺️ Mapa ${territorioAtual.numero} (${territorioAtual.nome}) — Zoom: ${Math.round(zoomScale * 100)}%
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick=${() => setZoomScale(s => Math.max(1, Number((s - 0.5).toFixed(1))))}
                  className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded"
                >
                  🔍 -
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomScale(1)}
                  className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomScale(s => Math.min(3, Number((s + 0.5).toFixed(1))))}
                  className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded"
                >
                  🔍 +
                </button>
                <button
                  type="button"
                  onClick=${() => setZoomModalInfo(null)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded ml-2"
                >
                  Fechar ✕
                </button>
              </div>
            </div>

            <div className="overflow-auto bg-slate-900 p-3 flex-1 flex items-center justify-center">
              <div
                onClick=${() => setZoomScale(s => (s >= 2.5 ? 1 : Number((s + 0.75).toFixed(2))))}
                style=${{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "top center"
                }}
                className="relative inline-block select-none transition-transform duration-150 cursor-zoom-in"
              >
                <img
                  src=${zoomModalInfo.url}
                  alt="Mapa Ampliado"
                  draggable="false"
                  className="max-h-[78vh] w-auto block select-none"
                />
                ${renderizarCamadaVetorial(zoomModalInfo.idx, true)}
              </div>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}