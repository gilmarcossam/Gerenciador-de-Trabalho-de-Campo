import React, { useState, useMemo, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import htm from "https://esm.sh/htm@3.1.1";

import { StorageService } from "./services/storageService.js";
import { Header } from "./components/Header.js";
import { LoginView } from "./components/LoginView.js";
import { HomeView } from "./components/HomeView.js";
import { CalendarioView } from "./components/CalendarioView.js";
import { ParticularView } from "./components/ParticularView.js";
import { DirigenteView } from "./components/DirigenteView.js";
import { DashboardView } from "./components/DashboardView.js";
import { AdminView } from "./components/AdminView.js";

const html = htm.bind(React.createElement);

function App() {
  const initialState = useMemo(() => StorageService.getInitialState(), []);

  const [usuarios, setUsuarios] = useState(initialState.usuarios);
  const [territorios, setTerritorios] = useState(initialState.territorios);
  const [saidas, setSaidas] = useState(initialState.saidas);
  const [restricoes, setRestricoes] = useState(initialState.restricoes);
  const [grupos, setGrupos] = useState(initialState.grupos);
  const [listasMensais, setListasMensais] = useState(initialState.listasMensais);
  const [mesVigenteId, setMesVigenteId] = useState(initialState.mesVigenteId);
  const [mesSelecionadoAdmin, setMesSelecionadoAdmin] = useState(initialState.mesVigenteId);
  const [s13Data, setS13Data] = useState(initialState.s13Data);
  const [particulares, setParticulares] = useState(initialState.particulares || []);
  const [zoomConfig, setZoomConfig] = useState(
    initialState.zoomConfig || {
      linkPadrao: "https://zoom.us/j/1234567890",
      horarioPadrao: "09:30",
      dias: []
    }
  );

  const [currentUser, setCurrentUser] = useState(usuarios[0]);
  const [isVisitor, setIsVisitor] = useState(false);
  const [chaveInput, setChaveInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  const [campanha, setCampanha] = useState({
    ativa: false,
    nome: "Campanha Especial da Celebração",
    dataInicio: "01/03/2026",
    dataFim: "31/03/2026",
    observacao: "Priorizar entrega de convites em todas as residências."
  });

  const [diaSelecionado, setDiaSelecionado] = useState(12);
  const [grupoSelecionadoId, setGrupoSelecionadoId] = useState(initialState.grupos[0]?.id || 1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNovoMesModal, setShowNovoMesModal] = useState(false);
  const [novoMesForm, setNovoMesForm] = useState({ mes: "08", ano: "2026" });

  // Estados do Modal de Relatório ("Preencher Território Trabalhado Hoje")
  const [chaveRelatorioInput, setChaveRelatorioInput] = useState("");
  const [erroChaveRelatorio, setErroChaveRelatorio] = useState("");
  const [houveCampo, setHouveCampo] = useState("Sim");
  const [motivoNaoHouve, setMotivoNaoHouve] = useState("");
  const [quadrasMarcadas, setQuadrasMarcadas] = useState({});
  const [obsRelatorio, setObsRelatorio] = useState("");
  const [novasRestricoes, setNovasRestricoes] = useState([]);

  // Persistência completa no LocalStorage (incluindo Restrições e Zoom!)
  useEffect(() => {
    StorageService.save(StorageService.KEYS.USERS, usuarios);
    StorageService.save(StorageService.KEYS.TERRITORIOS, territorios);
    StorageService.save(StorageService.KEYS.SAIDAS, saidas);
    StorageService.save(StorageService.KEYS.RESTRICOES, restricoes);
    StorageService.save(StorageService.KEYS.GRUPOS, grupos);
    StorageService.save(StorageService.KEYS.LISTAS, listasMensais);
    StorageService.save(StorageService.KEYS.S13, s13Data);
    StorageService.save(StorageService.KEYS.MES_VIGENTE, mesVigenteId);
    StorageService.save(StorageService.KEYS.PARTICULARES, particulares);
    StorageService.save(StorageService.KEYS.ZOOM, zoomConfig);
  }, [
    usuarios,
    territorios,
    saidas,
    restricoes,
    grupos,
    listasMensais,
    s13Data,
    mesVigenteId,
    particulares,
    zoomConfig
  ]);

  const programacaoVigente = listasMensais[mesVigenteId]?.dias || [];
  const saidasDoDia = programacaoVigente.filter(p => p.dia === diaSelecionado);
  const saidaBase = saidasDoDia[0] || programacaoVigente[0];

  const isDiaDeGrupos = saidaBase?.tipo === "Grupos";
  const grupoAtivo = grupos.find(g => g.id === Number(grupoSelecionadoId)) || grupos[0] || {
    id: 1,
    nome: "Grupo 1",
    anciao: "",
    ajudante: "",
    mapa: "1",
    saidaId: 1,
    horario: "09:00"
  };

  const saidaAtual = isDiaDeGrupos
    ? {
        ...saidaBase,
        periodo: `DOMINGO DE GRUPOS (${grupoAtivo.nome})`,
        hora: grupoAtivo.horario || saidaBase.hora,
        mapa: grupoAtivo.mapa,
        saidaId: grupoAtivo.saidaId,
        dirigente: `${grupoAtivo.anciao} / ${grupoAtivo.ajudante}`
      }
    : saidaBase;

  const territorioAtual = territorios.find(t => t.numero === saidaAtual?.mapa) || territorios[0];
  const localSaidaAtual = saidas.find(s => s.id === Number(saidaAtual?.saidaId));

  const isMaster = currentUser?.role === "Master";
  const isAdminOrSup =
    currentUser && ["Master", "Superintendente", "Ancião"].includes(currentUser.role);
  const temParticular = particulares.some(p => p.usuarioNome === currentUser?.nome);

  // Quadras em Território Particular ativas no mapa atual (para bloquear no formulário do dirigente)
  const quadrasParticularesNoMapaAtual = {};
  particulares
    .filter(p => p.mapa === territorioAtual.numero)
    .forEach(p => {
      p.quadras.forEach(q => {
        if (!p.concluidas?.[q]) {
          quadrasParticularesNoMapaAtual[q] = p.usuarioNome;
        }
      });
    });

  const percentualGeral = useMemo(() => {
    const totalTrabalhaveis = territorios.reduce((acc, t) => {
      const qtdSemMoradores = Object.keys(t.semMoradores || {}).length;
      return acc + Math.max(1, t.totalQuadras - qtdSemMoradores);
    }, 0);
    const feitas = territorios.reduce((acc, t) => acc + t.trabalhadas.length, 0);
    return Math.round((feitas / totalTrabalhaveis) * 100);
  }, [territorios]);

  // Adicionar nova Casa Restrita (usado tanto no Relatório Diário quanto no Território Particular)
  const adicionarCasaRestrita = (mapaNum, rua, numero, dataOpcional) => {
    if (!rua || !rua.trim() || !numero || !numero.trim()) return;
    const dataStr = dataOpcional || new Date().toLocaleDateString("pt-BR");
    setRestricoes(prev => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        mapa: String(mapaNum),
        rua: rua.trim(),
        numero: numero.trim(),
        data: dataStr,
        status: "Ativa"
      }
    ]);
  };

  // Concluir quadra de Território Particular (acionada pelo irmão ou pelo Admin Master)
  const concluirQuadraParticular = (particularId, quadraNum, dataTermino, observacao) => {
    const regAlvo = particulares.find(p => p.id === particularId);
    if (!regAlvo) return;

    setParticulares(prev =>
      prev.map(p => {
        if (p.id !== particularId) return p;
        return {
          ...p,
          concluidas: {
            ...(p.concluidas || {}),
            [quadraNum]: { data: dataTermino, obs: observacao }
          }
        };
      })
    );

    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== regAlvo.mapa) return t;
        const novasParciais = { ...(t.parciais || {}) };
        delete novasParciais[quadraNum];

        const uniaoTrabalhadas = Array.from(
          new Set([...t.trabalhadas, Number(quadraNum)])
        ).sort((a, b) => a - b);

        const totalTrabalhaveisMapa =
          t.totalQuadras - Object.keys(t.semMoradores || {}).length;
        const concluiuTudo =
          uniaoTrabalhadas.length >= totalTrabalhaveisMapa &&
          Object.keys(novasParciais).length === 0;

        return {
          ...t,
          trabalhadas: concluiuTudo ? [] : uniaoTrabalhadas,
          parciais: concluiuTudo ? {} : novasParciais,
          rodada: concluiuTudo ? t.rodada + 1 : t.rodada,
          ultimaData: dataTermino,
          ultimoDirigente: `${regAlvo.usuarioNome}`,
          ultimaObs: `Quadra ${quadraNum} concluída (${observacao})`
        };
      })
    );
  };

  const handleLogin = e => {
    e.preventDefault();
    const found = usuarios.find(
      u => u.chave.toUpperCase() === chaveInput.trim().toUpperCase()
    );
    if (found) {
      setCurrentUser(found);
      setIsVisitor(false);
      setLoginError("");
      setActiveTab(found.role === "Particular" ? "particular" : "home");
    } else {
      setLoginError("Chave inválida. Tente MASTER1, ANTX24 ou PART16.");
    }
  };

  const toggleQuadraForm = q => {
    setQuadrasMarcadas(prev => {
      const st = prev[q]?.status;
      if (!st) return { ...prev, [q]: { status: "concluida", detalhe: "" } };
      if (st === "concluida")
        return {
          ...prev,
          [q]: {
            status: "parcial",
            detalhe: prev[q]?.detalhe || territorioAtual.parciais?.[q] || ""
          }
        };
      const copy = { ...prev };
      delete copy[q];
      return copy;
    });
  };

  const salvarRelatorio = e => {
    e.preventDefault();

    // Validação de chave caso esteja preenchendo a partir do Modo Visitante
    let usuarioQuePreencheu = currentUser;
    if (!usuarioQuePreencheu) {
      const encontrado = usuarios.find(
        u => u.chave.toUpperCase() === chaveRelatorioInput.trim().toUpperCase()
      );
      if (!encontrado) {
        setErroChaveRelatorio("Informe uma Chave de Acesso válida para enviar o relatório.");
        return;
      }
      usuarioQuePreencheu = encontrado;
      setErroChaveRelatorio("");
    }

    const dataHojeRelatorio = `${String(diaSelecionado).padStart(2, "0")}/06/2026`;

    if (houveCampo === "Sim") {
      const concluidasHoje = Object.keys(quadrasMarcadas)
        .filter(q => quadrasMarcadas[q].status === "concluida")
        .map(Number);

      const parciaisHoje = Object.keys(quadrasMarcadas).filter(
        q => quadrasMarcadas[q].status === "parcial"
      );

      // 1. Salva no Banco de Dados qualquer nova Casa Restrita adicionada neste formulário!
      if (novasRestricoes.length > 0) {
        novasRestricoes.forEach(nr => {
          if (nr.rua.trim() && nr.numero.trim()) {
            adicionarCasaRestrita(territorioAtual.numero, nr.rua, nr.numero, dataHojeRelatorio);
          }
        });
      }

      // 2. Atualiza as quadras feitas e parciais do território
      setTerritorios(prev =>
        prev.map(t => {
          if (t.numero !== territorioAtual.numero) return t;

          const novasParciais = { ...(t.parciais || {}) };
          concluidasHoje.forEach(q => {
            delete novasParciais[q];
          });
          parciaisHoje.forEach(q => {
            novasParciais[q] =
              quadrasMarcadas[q].detalhe?.trim() ||
              obsRelatorio.trim() ||
              "Trabalhada parcialmente";
          });

          const uniaoTrabalhadas = Array.from(
            new Set([...t.trabalhadas, ...concluidasHoje])
          )
            .filter(q => !novasParciais[q] && !(t.semMoradores && t.semMoradores[q]))
            .sort((a, b) => a - b);

          const totalTrabalhaveisMapa =
            t.totalQuadras - Object.keys(t.semMoradores || {}).length;

          const concluiuTudo =
            uniaoTrabalhadas.length >= totalTrabalhaveisMapa &&
            Object.keys(novasParciais).length === 0;

          return {
            ...t,
            trabalhadas: concluiuTudo ? [] : uniaoTrabalhadas,
            parciais: concluiuTudo ? {} : novasParciais,
            rodada: concluiuTudo ? t.rodada + 1 : t.rodada,
            ultimaData: dataHojeRelatorio,
            ultimoDirigente: usuarioQuePreencheu?.nome || saidaAtual.dirigente,
            ultimaObs: obsRelatorio || t.ultimaObs
          };
        })
      );
    }

    setShowReportModal(false);
    setQuadrasMarcadas({});
    setObsRelatorio("");
    setNovasRestricoes([]);
    setChaveRelatorioInput("");
    setErroChaveRelatorio("");
  };

  const handleCriarListaMes = e => {
    e.preventDefault();
    const chave = `${novoMesForm.ano}-${novoMesForm.mes}`;
    const nomes = {
      "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
      "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
      "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
    };
    const diasSemana = ["DOMINGO", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const totalDias = new Date(Number(novoMesForm.ano), Number(novoMesForm.mes), 0).getDate();
    const novosDias = [];
    for (let d = 1; d <= totalDias; d++) {
      const dt = new Date(Number(novoMesForm.ano), Number(novoMesForm.mes) - 1, d);
      const sem = diasSemana[dt.getDay()];
      const isGrupo = sem === "DOMINGO" && (d === 14 || d === 28);
      novosDias.push({
        id: Date.now() + d,
        dia: d,
        semana: sem,
        periodo: "Manhã",
        saidaId: isGrupo ? 0 : 1,
        mapa: isGrupo ? "GRUPOS" : "1",
        hora: "09:00",
        dirigente: isGrupo ? "GRUPOS" : "Antônio Xavier",
        tipo: isGrupo ? "Grupos" : "Normal",
        confirmacao: "Pendente",
        relatado: false
      });
    }
    setListasMensais(prev => ({
      ...prev,
      [chave]: {
        id: chave,
        mesNome: nomes[novoMesForm.mes],
        ano: novoMesForm.ano,
        status: "Rascunho (Próximo Mês)",
        dias: novosDias
      }
    }));
    setMesSelecionadoAdmin(chave);
    setShowNovoMesModal(false);
  };

  // Quadras marcadas como parciais no modal para pedir detalhe específico
  const quadrasParciaisMarcadasNoModal = Object.keys(quadrasMarcadas).filter(
    q => quadrasMarcadas[q]?.status === "parcial"
  );

  if (!currentUser && !isVisitor) {
    return html`
      <${LoginView}
        chaveInput=${chaveInput}
        setChaveInput=${setChaveInput}
        loginError=${loginError}
        onLogin=${handleLogin}
        onVisitorAccess=${() => setIsVisitor(true)}
        onQuickUser=${idx => setCurrentUser(usuarios[idx])}
      />
    `;
  }

  return html`
    <div className="min-h-screen flex flex-col">
      <${Header}
        currentUser=${currentUser}
        mesVigenteInfo=${listasMensais[mesVigenteId]}
        activeTab=${activeTab}
        setActiveTab=${setActiveTab}
        percentualGeral=${percentualGeral}
        isAdminOrSup=${isAdminOrSup}
        temParticular=${temParticular}
        onLogout=${() => {
          setCurrentUser(null);
          setIsVisitor(false);
        }}
      />

      <main className="max-w-6xl w-full mx-auto p-3 sm:p-5 flex-1 space-y-4">
        ${activeTab === "home" && html`
          <${HomeView}
            campanha=${campanha}
            mesVigenteInfo=${listasMensais[mesVigenteId]}
            programacaoVigente=${programacaoVigente}
            diaSelecionado=${diaSelecionado}
            setDiaSelecionado=${setDiaSelecionado}
            isDiaDeGrupos=${isDiaDeGrupos}
            grupoSelecionadoId=${grupoSelecionadoId}
            setGrupoSelecionadoId=${setGrupoSelecionadoId}
            saidaAtual=${saidaAtual}
            territorioAtual=${territorioAtual}
            localSaidaAtual=${localSaidaAtual}
            grupos=${grupos}
            particulares=${particulares}
            restricoes=${restricoes}
            zoomConfig=${zoomConfig}
            onOpenReportModal=${() => setShowReportModal(true)}
          />
        `}

        ${activeTab === "calendario" && html`
          <${CalendarioView}
            mesVigenteInfo=${listasMensais[mesVigenteId]}
            programacaoVigente=${programacaoVigente}
            saidas=${saidas}
            territorios=${territorios}
            grupos=${grupos}
            diaSelecionado=${diaSelecionado}
            setDiaSelecionado=${setDiaSelecionado}
            zoomConfig=${zoomConfig}
            onIrParaTerritorioDoDia=${() => setActiveTab("home")}
          />
        `}

        ${activeTab === "particular" && html`
          <${ParticularView}
            currentUser=${currentUser}
            isMaster=${isMaster}
            particulares=${particulares}
            territorios=${territorios}
            restricoes=${restricoes}
            onConcluirQuadraParticular=${concluirQuadraParticular}
            onAdicionarCasaRestrita=${adicionarCasaRestrita}
          />
        `}

        ${activeTab === "dirigente" && html`
          <${DirigenteView}
            currentUser=${currentUser}
            isMaster=${isMaster}
            mesVigenteInfo=${listasMensais[mesVigenteId]}
            programacaoVigente=${programacaoVigente}
            saidas=${saidas}
            onChangeConfirmacao=${(id, status) => {
              const novos = programacaoVigente.map(d =>
                d.id === id ? { ...d, confirmacao: status } : d
              );
              setListasMensais(prev => ({
                ...prev,
                [mesVigenteId]: { ...prev[mesVigenteId], dias: novos }
              }));
            }}
          />
        `}

        ${activeTab === "dashboard" && html`
          <${DashboardView}
            territorios=${territorios}
            percentualGeral=${percentualGeral}
            restricoes=${restricoes}
          />
        `}

        ${activeTab === "admin" && isAdminOrSup && html`
          <${AdminView}
            isMaster=${isMaster}
            listasMensais=${listasMensais}
            setListasMensais=${setListasMensais}
            mesVigenteId=${mesVigenteId}
            setMesVigenteId=${setMesVigenteId}
            mesSelecionadoAdmin=${mesSelecionadoAdmin}
            setMesSelecionadoAdmin=${setMesSelecionadoAdmin}
            saidas=${saidas}
            setSaidas=${setSaidas}
            grupos=${grupos}
            setGrupos=${setGrupos}
            territorios=${territorios}
            setTerritorios=${setTerritorios}
            particulares=${particulares}
            setParticulares=${setParticulares}
            onConcluirQuadraParticular=${concluirQuadraParticular}
            restricoes=${restricoes}
            setRestricoes=${setRestricoes}
            onAdicionarCasaRestrita=${adicionarCasaRestrita}
            usuarios=${usuarios}
            setUsuarios=${setUsuarios}
            s13Data=${s13Data}
            setS13Data=${setS13Data}
            campanha=${campanha}
            setCampanha=${setCampanha}
            zoomConfig=${zoomConfig}
            setZoomConfig=${setZoomConfig}
            onOpenNovoMesModal=${() => setShowNovoMesModal(true)}
          />
        `}
      </main>

      <!-- MODAL COMPLETO: PREENCHER TERRITÓRIO TRABALHADO HOJE -->
      ${showReportModal && html`
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-5 space-y-4 my-8 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2.5">
              <div>
                <h3 className="font-extrabold text-base text-[#1e3a5f]">
                  ✍️ Preencher Território Trabalhado Hoje — Mapa ${territorioAtual.numero} (${territorioAtual.nome})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  ${isDiaDeGrupos
                    ? `👥 ${grupoAtivo.nome} • Dirigentes: ${grupoAtivo.anciao} / ${grupoAtivo.ajudante}`
                    : `Dirigente Designado: ${saidaAtual?.dirigente} • Saída: ${localSaidaAtual?.nome}`}
                </p>
              </div>
              <button
                onClick=${() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit=${salvarRelatorio} className="space-y-4 text-xs">
              <!-- Se estiver no Modo Visitante, exige a Chave de Acesso para validar quem está preenchendo -->
              ${!currentUser && html`
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-1.5">
                  <label className="font-bold text-[#1e3a5f] block">
                    🔑 Confirme sua Chave de Acesso Pessoal para enviar o relatório:
                  </label>
                  <input
                    type="text"
                    placeholder="Digite sua chave (Ex: ANTX24 ou MASTER1)"
                    value=${chaveRelatorioInput}
                    onChange=${e => setChaveRelatorioInput(e.target.value)}
                    className="w-full border border-blue-300 rounded-lg px-3 py-2 font-mono uppercase bg-white"
                    required
                  />
                  ${erroChaveRelatorio && html`
                    <p className="text-red-600 font-bold">${erroChaveRelatorio}</p>
                  `}
                </div>
              `}

              <!-- 1. Pergunta: Houve campo hoje? -->
              <div className="bg-slate-50 p-3 rounded-xl border">
                <label className="font-bold text-slate-800 block mb-1.5">Houve campo hoje?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      checked=${houveCampo === "Sim"}
                      onChange=${() => setHouveCampo("Sim")}
                    />
                    ✅ Sim, houve campo
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-amber-900">
                    <input
                      type="radio"
                      checked=${houveCampo === "Não"}
                      onChange=${() => setHouveCampo("Não")}
                    />
                    🌧️ Não houve (Chuva / Imprevisto)
                  </label>
                </div>
              </div>

              ${houveCampo === "Não"
                ? html`
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Informe o motivo de não ter havido campo hoje:
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Chuva forte no horário da saída / Falta de apoio"
                        value=${motivoNaoHouve}
                        onChange=${e => setMotivoNaoHouve(e.target.value)}
                        className="w-full border rounded-lg p-2.5"
                        required
                      />
                    </div>
                  `
                : html`
                    <!-- 2. Foto do Mapa visível dentro do Modal para lembrar onde foi feito -->
                    <div className="bg-slate-50 border rounded-xl p-2.5 space-y-2">
                      <span className="font-bold text-[#1e3a5f] block">
                        🗺️ Imagem do Mapa ${territorioAtual.numero} (Para lembrar onde foi feito):
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        ${territorioAtual.imagens.map((url, i) => {
                          const isDataUrl = url.startsWith("data:image");
                          const idMatch = !isDataUrl && url.match(/id=([^&]+)/);
                          const thumbUrl = idMatch
                            ? `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`
                            : url;
                          return html`
                            <img
                              key=${i}
                              src=${thumbUrl}
                              alt="Mapa referência"
                              className="w-full max-h-60 object-contain bg-white rounded border"
                            />
                          `;
                        })}
                      </div>
                    </div>

                    <!-- 3. Grade Interativa de Quadras -->
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-800 block">
                        Toque nas quadras trabalhadas hoje:
                        <span className="block font-normal text-slate-600 mt-0.5">
                          • <strong>1 toque</strong> = <span className="text-emerald-700 font-bold">Concluída (Verde)</span> |
                          • <strong>2 toques</strong> = <span className="text-amber-700 font-bold">Parcial (Amarela)</span> |
                          • Quadras com <strong>✓ Feita</strong> podem ser selecionadas novamente se foram retrabalhadas hoje.
                        </span>
                      </label>

                      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 bg-slate-50 p-2.5 rounded-xl border">
                        ${Array.from({ length: territorioAtual.totalQuadras }, (_, i) => i + 1).map(
                          q => {
                            const motivoSemMorador =
                              territorioAtual.semMoradores?.[q] ||
                              territorioAtual.semMoradores?.[String(q)];
                            const isSemMorador = Boolean(motivoSemMorador);
                            const donoParticular = quadrasParticularesNoMapaAtual[q];
                            const isParticularAtivo = !isSemMorador && Boolean(donoParticular);

                            const jaFeita = territorioAtual.trabalhadas.includes(q);
                            const eraParcial = Boolean(
                              territorioAtual.parciais?.[q] ||
                                territorioAtual.parciais?.[String(q)]
                            );
                            const st = quadrasMarcadas[q]?.status;

                            return html`
                              <button
                                type="button"
                                key=${q}
                                disabled=${isSemMorador || isParticularAtivo}
                                title=${
                                  isSemMorador
                                    ? `${motivoSemMorador}`
                                    : isParticularAtivo
                                    ? `Reservada: ${donoParticular}`
                                    : ""
                                }
                                onClick=${() => toggleQuadraForm(q)}
                                className=${`py-1.5 px-1 rounded-lg font-bold border relative transition ${
                                  isSemMorador
                                    ? "bg-slate-200 text-slate-400 border-dashed border-slate-300 cursor-not-allowed"
                                    : isParticularAtivo
                                    ? "bg-purple-100 text-purple-800 border-dashed border-purple-400 cursor-not-allowed"
                                    : st === "concluida"
                                    ? "bg-emerald-600 text-white border-emerald-800 ring-2 ring-emerald-400 shadow"
                                    : st === "parcial"
                                    ? "bg-amber-400 text-amber-950 border-amber-600 ring-2 ring-amber-300 shadow"
                                    : eraParcial
                                    ? "bg-amber-100 text-amber-900 border-amber-400"
                                    : jaFeita
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-white text-slate-800 border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                ${q}
                                ${isSemMorador && html`
                                  <span className="block text-[8px] text-slate-500 leading-none truncate px-0.5">
                                    ${motivoSemMorador}
                                  </span>
                                `}
                                ${isParticularAtivo && html`
                                  <span className="block text-[8px] text-purple-700 leading-none truncate px-0.5">
                                    Particular
                                  </span>
                                `}
                                ${!isSemMorador && !isParticularAtivo && jaFeita && !st && html`
                                  <span className="block text-[9px] text-emerald-700 leading-none">
                                    ✓ Feita
                                  </span>
                                `}
                              </button>
                            `;
                          }
                        )}
                      </div>
                    </div>

                    <!-- Se marcou alguma quadra como Parcial (Amarela), abre o detalhe específico de cada uma -->
                    ${quadrasParciaisMarcadasNoModal.length > 0 && html`
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl space-y-2">
                        <span className="font-bold text-amber-950 block">
                          🟨 Detalhe das Quadras Parciais (Informe qual rua ou lado foi feito):
                        </span>
                        ${quadrasParciaisMarcadasNoModal.map(
                          qNum => html`
                            <div key=${qNum} className="flex items-center gap-2">
                              <span className="font-extrabold text-amber-900 w-20">
                                Quadra ${qNum}:
                              </span>
                              <input
                                type="text"
                                placeholder="Ex: Rua das Flores lado direito (até o nº 400)"
                                value=${quadrasMarcadas[qNum]?.detalhe || ""}
                                onChange=${e => {
                                  const val = e.target.value;
                                  setQuadrasMarcadas(prev => ({
                                    ...prev,
                                    [qNum]: { ...prev[qNum], detalhe: val }
                                  }));
                                }}
                                className="flex-1 border border-amber-400 rounded-lg px-2.5 py-1.5 bg-white"
                                required
                              />
                            </div>
                          `
                        )}
                      </div>
                    `}

                    <!-- 4. Observações do Dirigente -->
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Observações gerais do trabalho de hoje:
                      </label>
                      <textarea
                        placeholder="Registre algum detalhe importante para o próximo dirigente que trabalhar neste mapa..."
                        value=${obsRelatorio}
                        onChange=${e => setObsRelatorio(e.target.value)}
                        className="w-full border rounded-lg p-2.5"
                        rows="2"
                      ></textarea>
                    </div>

                    <!-- 5. CADASTRO DE CASAS RESTRITAS DENTRO DO PREENCHIMENTO DO DIA -->
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-2.5">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <span className="font-bold text-red-900 block">
                            🛑 Pedido de Restrição de Visita (Casas Restritas / Não Bater)
                          </span>
                          <span className="text-[11px] text-red-700">
                            Algum morador pediu hoje para não bater mais na residência?
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick=${() =>
                            setNovasRestricoes([...novasRestricoes, { rua: "", numero: "" }])}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm"
                        >
                          + Adicionar Casa Restrita
                        </button>
                      </div>

                      ${novasRestricoes.length > 0 && html`
                        <div className="space-y-2 pt-1">
                          ${novasRestricoes.map(
                            (nr, i) => html`
                              <div key=${i} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  maxLength="50"
                                  placeholder="Nome da Rua (Ex: Rua das Flores)"
                                  value=${nr.rua}
                                  onChange=${e => {
                                    const c = [...novasRestricoes];
                                    c[i].rua = e.target.value;
                                    setNovasRestricoes(c);
                                  }}
                                  className="border border-red-300 rounded-lg px-2.5 py-1.5 flex-1 bg-white"
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="Nº (Ex: 120)"
                                  value=${nr.numero}
                                  onChange=${e => {
                                    const c = [...novasRestricoes];
                                    c[i].numero = e.target.value.replace(/\D/g, "");
                                    setNovasRestricoes(c);
                                  }}
                                  className="border border-red-300 rounded-lg px-2.5 py-1.5 w-28 bg-white font-bold"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick=${() =>
                                    setNovasRestricoes(
                                      novasRestricoes.filter((_, idx) => idx !== i)
                                    )}
                                  className="text-red-600 hover:text-red-800 font-bold px-2 py-1"
                                >
                                  ✕
                                </button>
                              </div>
                            `
                          )}
                        </div>
                      `}
                    </div>
                  `}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick=${() => setShowReportModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#24558f] hover:bg-[#1e3a5f] text-white rounded-lg font-bold shadow"
                >
                  Salvar Relatório de Hoje
                </button>
              </div>
            </form>
          </div>
        </div>
      `}

      <!-- MODAL: CRIAR LISTA DO PRÓXIMO MÊS -->
      ${showNovoMesModal && html`
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3">
            <h3 className="font-bold text-base text-[#1e3a5f]">
              Criar Lista de Campo do Próximo Mês
            </h3>
            <form onSubmit=${handleCriarListaMes} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Mês:</label>
                  <select
                    value=${novoMesForm.mes}
                    onChange=${e => setNovoMesForm({ ...novoMesForm, mes: e.target.value })}
                    className="w-full border rounded p-2 font-bold"
                  >
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Ano:</label>
                  <input
                    type="text"
                    value=${novoMesForm.ano}
                    onChange=${e => setNovoMesForm({ ...novoMesForm, ano: e.target.value })}
                    className="w-full border rounded p-2 font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick=${() => setShowNovoMesModal(false)}
                  className="px-3 py-2 border rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold"
                >
                  Gerar Mês
                </button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
}

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(App));