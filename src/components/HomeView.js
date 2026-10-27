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
  onOpenReportModal
}) {
  const [zoomImgUrl, setZoomImgUrl] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);

  const entradasSemMoradores = Object.entries(territorioAtual.semMoradores || {});
  const grupoAtivo = grupos.find(g => g.id === Number(grupoSelecionadoId)) || grupos[0];

  // Mapeia as quadras deste território que estão reservadas como Território Particular (ainda não concluídas)
  const quadrasParticularesAtivas = {};
  (particulares || [])
    .filter(p => p.mapa === territorioAtual.numero)
    .forEach(p => {
      p.quadras.forEach(q => {
        if (!p.concluidas?.[q]) {
          quadrasParticularesAtivas[q] = p.usuarioNome;
        }
      });
    });

  const entradasParticulares = Object.entries(quadrasParticularesAtivas);

  const temSaidaProvisoria = isDiaDeGrupos && grupoAtivo?.saidaProvisoriaAtiva;
  const nomeSaidaExibido = temSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaNome || "Local Provisório"
    : localSaidaAtual?.nome;
  const enderecoSaidaExibido = temSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaEndereco
    : localSaidaAtual?.endereco;
  const quadraSaidaExibida = temSaidaProvisoria
    ? grupoAtivo.saidaProvisoriaQuadra || "-"
    : localSaidaAtual?.quadraLocal;

  return html`
    <div className="space-y-4">
      ${campanha.ativa && html`
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

      <!-- Seletor de Dia -->
      <div className="bg-white p-3 rounded-xl shadow-sm border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            Dia de ${mesVigenteInfo?.mesNome}:
          </span>
          <select
            value=${diaSelecionado}
            onChange=${e => setDiaSelecionado(Number(e.target.value))}
            className="border rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#1e3a5f] bg-slate-50"
          >
            ${Array.from(new Set(programacaoVigente.map(p => p.dia))).map(d => {
              const info = programacaoVigente.find(p => p.dia === d);
              return html`
                <option key=${d} value=${d}>
                  Dia ${String(d).padStart(2, "0")} (${info.semana}) -${
                    info.tipo === "Grupos" ? "GRUPOS" : `Mapa ${info.mapa}`
                  }
                </option>
              `;
            })}
          </select>
        </div>
        <div className="flex gap-1.5 text-xs">
          <button
            onClick=${() => setDiaSelecionado(12)}
            className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold"
          >
            Dia 12 (Com Particular/Escola)
          </button>
          <button
            onClick=${() => setDiaSelecionado(2)}
            className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-bold"
          >
            Dia 02 (Mapa Limpo)
          </button>
          <button
            onClick=${() => setDiaSelecionado(14)}
            className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-bold"
          >
            Dia 14 (Domingo de Grupos)
          </button>
        </div>
      </div>

      <!-- SELETOR DE GRUPO (Domingos de Campo em Grupos) -->
      ${isDiaDeGrupos && html`
        <div className="space-y-3">
          <div className="bg-[#1e3a5f] text-white p-4 rounded-xl shadow-md space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase bg-blue-800 px-2 py-0.5 rounded font-bold">
                  Saída de Domingo em Grupos
                </span>
                <h3 className="font-bold text-sm sm:text-base mt-1">
                  👥 Selecione o seu Grupo de Campo para ver o Mapa e Relatar:
                </h3>
              </div>

              <select
                value=${grupoSelecionadoId}
                onChange=${e => setGrupoSelecionadoId(Number(e.target.value))}
                className="bg-white text-[#1e3a5f] font-bold text-xs px-3 py-2 rounded-lg shadow-sm"
              >
                ${grupos.map(
                  g => html`
                    <option key=${g.id} value=${g.id}>
                      ${g.nome} — Mapa ${g.mapa} (${g.anciao} / ${g.ajudante})
                    </option>
                  `
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              ${grupos.map(g => {
                const ativo = Number(grupoSelecionadoId) === g.id;
                return html`
                  <button
                    key=${g.id}
                    onClick=${() => setGrupoSelecionadoId(g.id)}
                    className=${`text-left p-2.5 rounded-lg border transition relative ${
                      ativo
                        ? "bg-white text-[#1e3a5f] border-white shadow-md font-extrabold"
                        : "bg-[#24558f] text-blue-100 border-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span>${g.nome}</span>
                      <span
                        className=${`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ativo ? "bg-[#1e3a5f] text-white" : "bg-blue-900 text-blue-200"
                        }`}
                      >
                        Mapa ${g.mapa}
                      </span>
                    </div>
                    <p
                      className=${`text-[11px] mt-1 truncate ${
                        ativo ? "text-slate-600 font-semibold" : "text-blue-200"
                      }`}
                    >
                      ${g.anciao} • ${g.ajudante}
                    </p>
                  </button>
                `;
              })}
            </div>
          </div>

          ${grupoAtivo?.visitaSupGrupos && html`
            <div className="bg-sky-50 border-l-4 border-sky-600 p-3.5 rounded-r-xl shadow-sm flex items-start gap-3">
              <span className="text-xl">👔</span>
              <div className="text-xs text-sky-950 space-y-0.5">
                <span className="text-[10px] uppercase font-extrabold bg-sky-200 text-sky-900 px-2 py-0.5 rounded">
                  Aviso Especial — ${grupoAtivo.nome}
                </span>
                <h4 className="font-extrabold text-sm text-[#1e3a5f] pt-0.5">
                  Visita do Superintendente de Grupos Hoje!
                </h4>
                <p className="text-slate-700 font-medium">
                  Hoje o <strong>${grupoAtivo.nome}</strong> receberá a visita do Superintendente de Grupos.
                  ${grupoAtivo.visitaSupGruposObs ? ` — ${grupoAtivo.visitaSupGruposObs}` : ""}
                </p>
              </div>
            </div>
          `}

          ${grupoAtivo?.saidaProvisoriaAtiva && html`
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl shadow-sm flex items-start gap-3">
              <span className="text-xl">📍</span>
              <div className="text-xs text-amber-950 space-y-1 flex-1">
                <span className="text-[10px] uppercase font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Mudança de Endereço no Dia — ${grupoAtivo.nome}
                </span>
                <h4 className="font-extrabold text-sm text-amber-900 pt-0.5">
                  Atenção: O local da saída deste grupo mudou excepcionalmente hoje!
                </h4>
                <p className="text-slate-800">
                  <strong>Novo Local Provisório:</strong> ${grupoAtivo.saidaProvisoriaNome} —{" "}
                  <strong>${grupoAtivo.saidaProvisoriaEndereco}</strong>
                </p>
              </div>
            </div>
          `}
        </div>
      `}

      <!-- Alerta quando o Local da Saída fica em um Mapa diferente do Território trabalhado -->
      ${!temSaidaProvisoria &&
        localSaidaAtual &&
        localSaidaAtual.mapaLocal !== territorioAtual.numero && html`
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl text-xs text-amber-900">
          <strong>⚠️ Atenção: Local da Saída em Mapa Diferente!</strong> O ponto de encontro
          (<strong>${localSaidaAtual.nome}</strong>) fica na Quadra
          <strong> ${localSaidaAtual.quadraLocal}</strong> do
          <strong> Mapa ${localSaidaAtual.mapaLocal}</strong>, mas o território a ser trabalhado hoje é o
          <strong> Mapa ${territorioAtual.numero}</strong>.
        </div>
      `}

      <!-- CARTÃO UNIFICADO DO TERRITÓRIO -->
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-3.5">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-blue-700 uppercase block">
              ${saidaAtual?.periodo} • ${saidaAtual?.hora}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1e3a5f]">
              Mapa ${territorioAtual.numero} - ${territorioAtual.nome}
            </h2>
            <p className="text-xs text-slate-600">
              <strong>Local da Saída ${temSaidaProvisoria ? "(Provisório Hoje)" : ""}:</strong>{" "}
              ${nomeSaidaExibido} — ${enderecoSaidaExibido} (Quadra ${quadraSaidaExibida})
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
              ${isDiaDeGrupos ? "Dirigentes do Grupo (Ancião / Ajudante)" : "Dirigente Designado"}
            </span>
            <span className="font-bold text-sm text-[#1e3a5f]">${saidaAtual?.dirigente}</span>
          </div>
        </div>

        <!-- 1. Grade de Números de Quadras -->
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

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-800">
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

              <!-- Legenda de Quadras Sem Moradores (Só aparece se houver no mapa) -->
              ${entradasSemMoradores.map(
                ([qNum, nomeCadastrado]) => html`
                  <span
                    key=${qNum}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 shadow-sm"
                  >
                    <span className="w-4 h-4 rounded bg-slate-200 border-2 border-dashed border-slate-500 inline-block"></span>
                    ${nomeCadastrado}
                  </span>
                `
              )}

              <!-- Legenda de Território Particular (Só aparece se houver quadra particular em andamento neste mapa) -->
              ${entradasParticulares.length > 0 && html`
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-300 shadow-sm">
                  <span className="w-4 h-4 rounded bg-purple-100 border-2 border-dashed border-purple-600 inline-block"></span>
                  Particular — Não Fazer
                </span>
              `}
            </div>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 bg-slate-50 p-3 rounded-xl border">
            ${Array.from({ length: territorioAtual.totalQuadras }, (_, i) => i + 1).map(num => {
              const nomeLocalSemMorador =
                territorioAtual.semMoradores?.[num] ||
                territorioAtual.semMoradores?.[String(num)];
              const isSemMorador = Boolean(nomeLocalSemMorador);

              const donoParticular =
                quadrasParticularesAtivas[num] || quadrasParticularesAtivas[String(num)];
              const isParticularAtivo = !isSemMorador && Boolean(donoParticular);

              const isParcial =
                !isSemMorador &&
                !isParticularAtivo &&
                Boolean(
                  territorioAtual.parciais?.[num] ||
                    territorioAtual.parciais?.[String(num)]
                );
              const isFeita =
                !isSemMorador &&
                !isParticularAtivo &&
                !isParcial &&
                territorioAtual.trabalhadas.includes(num);

              return html`
                <div
                  key=${num}
                  title=${
                    isSemMorador
                      ? `${nomeLocalSemMorador}`
                      : isParticularAtivo
                      ? `Território Particular (${donoParticular})`
                      : ""
                  }
                  className=${`py-1.5 px-1 rounded-lg font-bold text-xs text-center border flex flex-col items-center justify-center ${
                    isSemMorador
                      ? "bg-slate-200 text-slate-600 border-2 border-dashed border-slate-400"
                      : isParticularAtivo
                      ? "bg-purple-100 text-purple-900 border-2 border-dashed border-purple-500"
                      : isParcial
                      ? "bg-amber-400 text-amber-950 border-amber-500 shadow-sm"
                      : isFeita
                      ? "bg-emerald-600 text-white border-emerald-700"
                      : "bg-white text-slate-800 border-slate-300"
                  }`}
                >
                  <span>${num}</span>${isSemMorador && html`
                    <span className="text-[9px] font-semibold text-slate-600 leading-tight truncate max-w-full">
                      ${nomeLocalSemMorador}
                    </span>
                  `}
                  ${isParticularAtivo && html`
                    <span className="text-[9px] font-bold text-purple-800 leading-tight truncate max-w-full">
                      Particular
                    </span>
                  `}
                </div>
              `;
            })}
          </div>

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
                        Mapa ${territorioAtual.numero} - Parte${idx + 1}
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
                          📍 ${r.rua}, Nº ${r.numero}{" "}
                          <span className="text-[10px] text-red-600 font-normal">(${r.data})</span>
                        </li>
                      `
                    )}
                </ul>
              `}
        </div>

        <!-- 5. Botão de Preencher Território -->
        <button
          onClick=${onOpenReportModal}
          className="w-full bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl text-sm shadow transition"
        >
          ✍️ Preencher Território Trabalhado Hoje ${isDiaDeGrupos ? `(${saidaAtual.periodo})` : ""}
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
