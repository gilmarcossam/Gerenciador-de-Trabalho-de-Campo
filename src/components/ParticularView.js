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
            Quadras reservadas para o seu trabalho pessoal. Ao concluir uma quadra, informe a data de término abaixo.
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
            const idMatch = imgUrl?.match(/id=([^&]+)/);
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

                <!-- Lista de Quadras Designadas -->
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

                <!-- Imagem do Mapa (Sem link externo, abre direto no Popup de Zoom) -->
                <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1e3a5f] uppercase">
                      🗺️ Imagem do Mapa ${item.mapa}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700">
                      🔍 Toque na imagem para ampliar
                    </span>
                  </div>
                  <img
                    src=${thumbUrl}
                    alt=${`Mapa ${item.mapa}`}
                    onClick=${() => setZoomImgUrl(thumbUrl)}
                    className="w-full max-h-96 object-contain bg-white rounded border cursor-pointer hover:border-blue-400 transition"
                  />
                </div>

                <!-- Casas Restritas do Mapa + Campo para Adicionar Nova Restrição -->
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs space-y-3">
                  <div>
                    <span className="font-bold text-red-800 block mb-1">
                      🛑 Casas Restritas (Não Bater) - Mapa ${item.mapa}:
                    </span>
                    ${restMapa.length === 0
                      ? html`<p className="text-slate-600">Nenhuma casa restrita cadastrada para este mapa.</p>`
                      : html`
                          <ul className="space-y-1 text-red-900 font-semibold">
                            ${restMapa.map(
                              r => html`
                                <li key=${r.id}>
                                  📍 ${r.rua}, Nº ${r.numero} <span className="text-[10px]">(${r.data})</span>
                                </li>
                              `
                            )}
                          </ul>
                        `}
                  </div>

                  <!-- Formulário para o irmão cadastrar uma nova restrição (Ficará salva para os Dirigentes!) -->
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
                      + Informar nova Casa Restrita encontrada nas suas quadras:
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
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg"
                      >
                        + Registrar Restrição
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            `;
          })}

      ${zoomImgUrl && html`
        <div
          onClick=${() => setZoomImgUrl(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-3 z-50"
        >
          <div className="max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-[#1e3a5f] text-white flex justify-between items-center text-xs font-bold">
              <span>Mapa Ampliado</span>
              <button onClick=${() => setZoomImgUrl(null)} className="bg-red-600 px-2.5 py-1 rounded">
                Fechar ✕
              </button>
            </div>
            <img src=${zoomImgUrl} alt="Mapa Ampliado" className="w-full max-h-[82vh] object-contain" />
          </div>
        </div>
      `}
    </div>
  `;
}