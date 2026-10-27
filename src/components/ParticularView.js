import React, { useState } from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function ParticularView({
  currentUser,
  isMaster,
  particulares,
  territorios,
  restricoes,
  onConcluirQuadraParticular,
  onAdicionarCasaRestrita
}) {
  const [zoomImgUrl, setZoomImgUrl] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [datasTermino, setDatasTermino] = useState({});
  const [obsTermino, setObsTermino] = useState({});
  const [novaRestricaoForm, setNovaRestricaoForm] = useState({});

  const meusParticulares = particulares.filter(
    p => p.usuarioNome === currentUser?.nome || isMaster
  );

  const hojeFormatado = new Date().toLocaleDateString("pt-BR");

  return html`
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-[10px] uppercase font-extrabold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded">
            Designação Especial
          </span>
          <h2 className="font-extrabold text-base sm:text-lg text-[#1e3a5f] mt-1">
            🏠 Meu Território Particular
          </h2>
          <p className="text-xs text-slate-600">
            Confira primeiro as casas restritas abaixo antes de trabalhar nas suas quadras reservadas.
          </p>
        </div>
      </div>

      ${meusParticulares.length === 0
        ? html`
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center text-sm text-slate-500">
              Nenhum território particular designado para o seu perfil no momento.
            </div>
          `
        : meusParticulares.map(item => {
            const tMapa = territorios.find(t => t.numero === item.mapa) || territorios[0];
            const imgUrl = item.imagemUrl || tMapa.imagens[0];
            const isDataUrl = imgUrl?.startsWith("data:image");
            const idMatch = !isDataUrl && imgUrl?.match(/id=([^&]+)/);
            const thumbUrl = idMatch
              ? `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`
              : imgUrl;
            const restMapa = restricoes.filter(r => r.mapa === item.mapa);
            const formRest = novaRestricaoForm[item.id] || { rua: "", numero: "" };

            return html`
              <div
                key=${item.id}
                className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-4"
              >
                <!-- 1. Cabeçalho do Território Particular e Botão GPS -->
                <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-3.5">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-purple-700 uppercase block">
                      Território Particular • Designado em ${item.dataDesignacao}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#1e3a5f]">
                      Mapa ${item.mapa} - ${tMapa.nome}
                    </h3>
                    <p className="text-xs text-slate-700">
                      <strong>Local / Endereço das Quadras:</strong> ${item.endereco}
                    </p>
                    <div className="pt-0.5">
                      <a
                        href=${`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          item.endereco + ", Mongaguá - SP"
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                      >
                        📍 Abrir Endereço no GPS
                      </a>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-lg text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-purple-800 block">
                      Irmão Designado
                    </span>
                    <span className="font-bold text-sm text-[#1e3a5f]">${item.usuarioNome}</span>
                  </div>
                </div>

                <!-- 2. CASAS RESTRITAS LOGO NO INÍCIO (Antes de informar as quadras feitas!) -->
                <div className="bg-red-50 border-2 border-red-200 p-3.5 rounded-xl text-xs space-y-3 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-extrabold text-sm text-red-900 block">
                        🛑 Atenção — Casas Restritas (Não Bater) no Mapa ${item.mapa}:
                      </span>
                      <span className="bg-red-200 text-red-900 font-extrabold px-2 py-0.5 rounded text-[10px] uppercase">
                        Verifique antes de iniciar
                      </span>
                    </div>
                    ${restMapa.length === 0
                      ? html`
                          <p className="text-slate-600 font-medium">
                            ✅ Nenhuma casa restrita cadastrada para este mapa até o momento.
                          </p>
                        `
                      : html`
                          <ul className="space-y-1 text-red-900 font-bold pt-1">
                            ${restMapa.map(
                              r => html`
                                <li key=${r.id} className="bg-white/80 border border-red-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                                  <span>📍 ${r.rua}, Nº ${r.numero}</span>
                                  <span className="text-[10px] text-red-700 font-semibold">
                                    Registrada em ${r.data}
                                  </span>
                                </li>
                              `
                            )}
                          </ul>
                        `}
                  </div>

                  <!-- Formulário para o irmão cadastrar uma nova restrição -->
                  <form
                    onSubmit=${e => {
                      e.preventDefault();
                      if (!formRest.rua || !formRest.numero) return;
                      onAdicionarCasaRestrita(item.mapa, formRest.rua, formRest.numero);
                      setNovaRestricaoForm({
                        ...novaRestricaoForm,
                        [item.id]: { rua: "", numero: "" }
                      });
                    }}
                    className="border-t border-red-200 pt-2.5 space-y-2"
                  >
                    <span className="font-bold text-red-900 block">
                      + Algum morador pediu para não bater? Registre abaixo:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        placeholder="Nome da Rua e Quadra (Ex: Rua São Pedro - Qd 8)"
                        value=${formRest.rua}
                        onChange=${e =>
                          setNovaRestricaoForm({
                            ...novaRestricaoForm,
                            [item.id]: { ...formRest, rua: e.target.value }
                          })}
                        className="border border-red-300 rounded-lg px-2.5 py-1.5 flex-1 bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nº da Casa"
                        value=${formRest.numero}
                        onChange=${e =>
                          setNovaRestricaoForm({
                            ...novaRestricaoForm,
                            [item.id]: {
                              ...formRest,
                              numero: e.target.value.replace(/\D/g, "")
                            }
                          })}
                        className="border border-red-300 rounded-lg px-2.5 py-1.5 w-28 bg-white font-bold"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        + Registrar Restrição
                      </button>
                    </div>
                  </form>
                </div>

                <!-- 3. Lista de Quadras Designadas (Para informar término) -->
                <div className="space-y-2.5">
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase text-[#1e3a5f]">
                    📋 Minhas Quadras Designadas (${item.quadras.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${item.quadras.map(qNum => {
                      const concluidaInfo = item.concluidas?.[qNum];
                      const jaConcluida = Boolean(concluidaInfo);
                      const chaveInputData = `${item.id}_${qNum}`;

                      return html`
                        <div
                          key=${qNum}
                          className=${`rounded-xl border p-3.5 space-y-2.5 ${
                            jaConcluida
                              ? "bg-emerald-50 border-emerald-300"
                              : "bg-purple-50/50 border-purple-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-sm text-[#1e3a5f]">
                              Quadra ${qNum}
                            </span>
                            <span
                              className=${`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                jaConcluida
                                  ? "bg-emerald-600 text-white"
                                  : "bg-purple-200 text-purple-900"
                              }`}
                            >
                              ${jaConcluida
                                ? `✅ Concluída em ${concluidaInfo.data}`
                                : "⏳ Em Andamento (Reservada)"}
                            </span>
                          </div>

                          ${jaConcluida
                            ? html`
                                <p className="text-xs text-emerald-900">
                                  Quadra finalizada e contabilizada no Dashboard!
                                  ${concluidaInfo.obs ? ` Obs: "${concluidaInfo.obs}"` : ""}
                                </p>
                              `
                            : html`
                                <div className="space-y-2 pt-1 border-t border-purple-200 text-xs">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="font-bold text-slate-700 block mb-0.5">
                                        Data do Término:
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="DD/MM/AAAA"
                                        value=${datasTermino[chaveInputData] ?? hojeFormatado}
                                        onChange=${e =>
                                          setDatasTermino({
                                            ...datasTermino,
                                            [chaveInputData]: e.target.value
                                          })}
                                        className="w-full border rounded-lg px-2.5 py-1.5 bg-white font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <label className="font-bold text-slate-700 block mb-0.5">
                                        Observação (Opcional):
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Ex: Tudo concluído"
                                        value=${obsTermino[chaveInputData] || ""}
                                        onChange=${e =>
                                          setObsTermino({
                                            ...obsTermino,
                                            [chaveInputData]: e.target.value
                                          })}
                                        className="w-full border rounded-lg px-2.5 py-1.5 bg-white"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick=${() =>
                                      onConcluirQuadraParticular(
                                        item.id,
                                        qNum,
                                        datasTermino[chaveInputData] || hojeFormatado,
                                        obsTermino[chaveInputData] || "Concluído em território particular"
                                      )}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg shadow-sm transition"
                                  >
                                    ✅ Informar Término da Quadra ${qNum}
                                  </button>
                                </div>
                              `}
                        </div>
                      `;
                    })}
                  </div>
                </div>

                <!-- 4. Imagem do Mapa (Abre no Popup de Zoom) -->
                <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1e3a5f] uppercase">
                      🗺️ Imagem do Mapa ${item.mapa}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700">
                      🔍 Toque na imagem para abrir e dar zoom
                    </span>
                  </div>
                  <img
                    src=${thumbUrl}
                    alt=${`Mapa ${item.mapa}`}
                    onClick=${() => {
                      setZoomScale(1);
                      setZoomImgUrl(thumbUrl);
                    }}
                    className="w-full max-h-96 object-contain bg-white rounded border cursor-pointer hover:border-blue-400 transition"
                  />
                </div>
              </div>
            `;
          })}

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
              <span>🗺️ Visualização do Mapa</span>

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