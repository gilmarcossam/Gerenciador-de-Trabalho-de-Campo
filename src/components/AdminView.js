import React, { useState } from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function AdminView({
  isMaster,
  listasMensais,
  setListasMensais,
  mesVigenteId,
  setMesVigenteId,
  mesSelecionadoAdmin,
  setMesSelecionadoAdmin,
  saidas,
  setSaidas,
  grupos,
  setGrupos,
  territorios,
  setTerritorios,
  particulares,
  setParticulares,
  onConcluirQuadraParticular,
  restricoes,
  setRestricoes,
  onAdicionarCasaRestrita,
  usuarios,
  setUsuarios,
  s13Data,
  setS13Data,
  campanha,
  setCampanha,
  zoomConfig,
  setZoomConfig,
  onOpenNovoMesModal
}) {
  const [adminSection, setAdminSection] = useState("programacao");
  const [mapaEditSelecionado, setMapaEditSelecionado] = useState("11");
  const [quadraSemMoradorNum, setQuadraSemMoradorNum] = useState("1");
  const [quadraSemMoradorMotivo, setQuadraSemMoradorMotivo] = useState("UPA");
  const [diaCortePendencia, setDiaCortePendencia] = useState(12);
  const [filtroDirigentePendencia, setFiltroDirigentePendencia] = useState("TODOS");
  const [msgCopiadaId, setMsgCopiadaId] = useState(null);
// ESTADOS DO LABORATÓRIO DE POLÍGONOS COM VÉRTICES LIVRES E ARRASTE TOTAL
  const [modoLabMapa, setModoLabMapa] = useState("mapear"); // "mapear" ou "simular"
  const [quadraAtivaLab, setQuadraAtivaLab] = useState(1);
  const [imagemLabIdx, setImagemLabIdx] = useState(0);
  const [desenhandoCaixa, setDesenhandoCaixa] = useState(null); // { startX, startY, curX, curY }
  const [arrastandoVertice, setArrastandoVertice] = useState(null); // { qNum, idx }
  const [arrastandoPoligono, setArrastandoPoligono] = useState(null); // { qNum, startX, startY, initialPts }

  const calcularPorcentagemMouse = (e, container) => {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  };

  // Garante compatibilidade com formatos anteriores
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

  // 1. Inicia o desenho de uma nova caixa ao clicar e arrastar em área livre do mapa
  const handleMouseDownMapaLab = e => {
    if (modoLabMapa !== "mapear" || arrastandoVertice || arrastandoPoligono) return;
    e.preventDefault();
    const pos = calcularPorcentagemMouse(e, e.currentTarget);
    setDesenhandoCaixa({
      startX: pos.x,
      startY: pos.y,
      curX: pos.x,
      curY: pos.y
    });
  };

  // Inicia o movimento da quadra inteira (ponteiro de 4 setas)
  const handleIniciarArrastePoligono = (e, qNum, pts) => {
    e.stopPropagation();
    if (modoLabMapa !== "mapear") {
      handleToquePinoSimulacao(e, qNum);
      return;
    }
    e.preventDefault();
    setQuadraAtivaLab(Number(qNum));
    const container = e.currentTarget.closest("[data-map-container='true']");
    if (!container) return;
    const pos = calcularPorcentagemMouse(e, container);
    setArrastandoPoligono({
      qNum: Number(qNum),
      startX: pos.x,
      startY: pos.y,
      initialPts: pts.map(p => ({ ...p }))
    });
  };

  // 2. Move 1 vértice individual, OU move a quadra inteira, OU expande a caixa nova
  const handleMouseMoveMapaLab = e => {
    if (modoLabMapa !== "mapear") return;

    // A) Movendo 1 vértice (ponteiro normal)
    if (arrastandoVertice) {
      const pos = calcularPorcentagemMouse(e, e.currentTarget);
      const { qNum, idx } = arrastandoVertice;
      setTerritorios(prev =>
        prev.map(t => {
          if (t.numero !== territorioEmEdicao.numero) return t;
          const coordsAtuais = { ...(t.coordenadasQuadras || {}) };
          const itemAtual = coordsAtuais[qNum];
          const ptsAtuais = obterVerticesQuadra(itemAtual);
          if (!ptsAtuais) return t;
          const novosPts = ptsAtuais.map((pt, i) => (i === idx ? pos : pt));
          coordsAtuais[qNum] = {
            ...itemAtual,
            pts: novosPts,
            imgIdx: itemAtual?.imgIdx || 0
          };
          return { ...t, coordenadasQuadras: coordsAtuais };
        })
      );
      return;
    }

    // B) Movendo a quadra inteira de uma vez (ponteiro de 4 setas)
    if (arrastandoPoligono) {
      const pos = calcularPorcentagemMouse(e, e.currentTarget);
      const dx = pos.x - arrastandoPoligono.startX;
      const dy = pos.y - arrastandoPoligono.startY;
      const { qNum, initialPts } = arrastandoPoligono;

      setTerritorios(prev =>
        prev.map(t => {
          if (t.numero !== territorioEmEdicao.numero) return t;
          const coordsAtuais = { ...(t.coordenadasQuadras || {}) };
          const itemAtual = coordsAtuais[qNum];
          const novosPts = initialPts.map(pt => ({
            x: Number(Math.max(0, Math.min(100, pt.x + dx)).toFixed(1)),
            y: Number(Math.max(0, Math.min(100, pt.y + dy)).toFixed(1))
          }));
          coordsAtuais[qNum] = {
            ...itemAtual,
            pts: novosPts,
            imgIdx: itemAtual?.imgIdx || 0
          };
          return { ...t, coordenadasQuadras: coordsAtuais };
        })
      );
      return;
    }

    // C) Puxando caixa nova
    if (desenhandoCaixa) {
      const pos = calcularPorcentagemMouse(e, e.currentTarget);
      setDesenhandoCaixa(prev => (prev ? { ...prev, curX: pos.x, curY: pos.y } : null));
    }
  };

  // 3. Solta o mouse: finaliza arraste de vértice, arraste da quadra toda ou criação da caixa
  const handleMouseUpMapaLab = () => {
    if (arrastandoVertice) {
      setArrastandoVertice(null);
      return;
    }
    if (arrastandoPoligono) {
      setArrastandoPoligono(null);
      return;
    }

    if (!desenhandoCaixa || modoLabMapa !== "mapear") return;

    const left = Math.min(desenhandoCaixa.startX, desenhandoCaixa.curX);
    const top = Math.min(desenhandoCaixa.startY, desenhandoCaixa.curY);
    const width = Math.abs(desenhandoCaixa.curX - desenhandoCaixa.startX);
    const height = Math.abs(desenhandoCaixa.curY - desenhandoCaixa.startY);

    if (width < 1.2 && height < 1.2) {
      setDesenhandoCaixa(null);
      return;
    }

    const x1 = Number(left.toFixed(1));
    const y1 = Number(top.toFixed(1));
    const x2 = Number((left + width).toFixed(1));
    const y2 = Number((top + height).toFixed(1));

    const qAtual = Number(quadraAtivaLab);

    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const coordsAtuais = { ...(t.coordenadasQuadras || {}) };
        coordsAtuais[qAtual] = {
          pts: [
            { x: x1, y: y1 },
            { x: x2, y: y1 },
            { x: x2, y: y2 },
            { x: x1, y: y2 }
          ],
          imgIdx: imagemLabIdx
        };
        return { ...t, coordenadasQuadras: coordsAtuais };
      })
    );

    setDesenhandoCaixa(null);
  };

  // Insere um novo vértice exatamente no meio de uma aresta específica (ou no final)
  const handleInserirVerticeNaAresta = (qNum, arestaIdx = null) => {
    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const coords = { ...(t.coordenadasQuadras || {}) };
        const pts = obterVerticesQuadra(coords[qNum]);
        if (!pts || pts.length === 0) return t;

        const idxA = arestaIdx !== null ? arestaIdx : pts.length - 1;
        const idxB = (idxA + 1) % pts.length;
        const pA = pts[idxA];
        const pB = pts[idxB];
        const novoPonto = {
          x: Number(((pA.x + pB.x) / 2).toFixed(1)),
          y: Number(((pA.y + pB.y) / 2).toFixed(1))
        };

        const novosPts = [...pts];
        novosPts.splice(idxA + 1, 0, novoPonto);
        coords[qNum] = { ...coords[qNum], pts: novosPts };
        return { ...t, coordenadasQuadras: coords };
      })
    );
  };

  // Remove um vértice específico (no duplo clique) ou o último vértice (mínimo 3 lados)
  const handleRemoverVerticeQuadra = (qNum, idxRemover = null) => {
    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const coords = { ...(t.coordenadasQuadras || {}) };
        const pts = obterVerticesQuadra(coords[qNum]);
        if (!pts || pts.length <= 3) return t;
        const novosPts =
          idxRemover !== null
            ? pts.filter((_, i) => i !== idxRemover)
            : pts.slice(0, -1);
        coords[qNum] = { ...coords[qNum], pts: novosPts };
        return { ...t, coordenadasQuadras: coords };
      })
    );
  };

  // No modo "Simular Dirigente", tocar na quadra alterna a cor de status
  const handleToquePinoSimulacao = (e, qNum) => {
    e.stopPropagation();
    if (modoLabMapa === "mapear") {
      setQuadraAtivaLab(Number(qNum));
      return;
    }

    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const isSemMorador = Boolean(t.semMoradores?.[qNum]);
        if (isSemMorador) return t;

        const jaVerde = t.trabalhadas.includes(Number(qNum));
        const jaAmarela = Boolean(t.parciais?.[qNum]);

        let novasTrabalhadas = [...t.trabalhadas];
        const novasParciais = { ...(t.parciais || {}) };

        if (!jaVerde && !jaAmarela) {
          novasTrabalhadas.push(Number(qNum));
        } else if (jaVerde) {
          novasTrabalhadas = novasTrabalhadas.filter(x => x !== Number(qNum));
          novasParciais[qNum] = "Simulação de quadra parcial";
        } else {
          delete novasParciais[qNum];
        }

        return {
          ...t,
          trabalhadas: novasTrabalhadas.sort((a, b) => a - b),
          parciais: novasParciais
        };
      })
    );
  };

  // Estado para criar um Novo Mapa do zero
  const [novoMapaForm, setNovoMapaForm] = useState({
    numero: "",
    nome: "",
    totalQuadras: 30,
    obsAnciao: "",
    imagemUrl: ""
  });

  const [novaSaida, setNovaSaida] = useState({
    nome: "",
    endereco: "",
    mapaLocal: "1",
    quadraLocal: "1"
  });

  // Estado para criar um novo Grupo de Campo (Domingos)
  const [modoSaidaGrupo, setModoSaidaGrupo] = useState("existente");
  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    mapa: "1",
    anciao: usuarios[0]?.nome || "",
    ajudante: usuarios[1]?.nome || "",
    horario: "09:00",
    saidaId: saidas[0]?.id || 1,
    novaSaidaNome: "",
    novaSaidaEndereco: "",
    novaSaidaQuadra: "1"
  });

  // Estado para configurar um novo Território Particular
  const [novoParticular, setNovoParticular] = useState({
    usuarioNome:
      usuarios.find(u => u.role === "Particular")?.nome || usuarios[0]?.nome || "",
    mapa: "11",
    quadrasTexto: "",
    endereco: "",
    imagemUrl: ""
  });

  // Estado para adicionar casa restrita dentro da aba de Territórios Particulares / Mapas
  const [novaRestricaoMapa, setNovaRestricaoMapa] = useState({
    mapa: "11",
    rua: "",
    numero: ""
  });

  // Estado para cadastrar novo Usuário
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    chave: "",
    role: "Particular",
    privilegio: "Publicador"
  });

  // Estado para adicionar um novo dia de Campo no Zoom
  const [novoDiaZoom, setNovoDiaZoom] = useState({
    dia: "1",
    horario: zoomConfig?.horarioPadrao || "09:30",
    dirigente: usuarios[0]?.nome || "Antônio Xavier",
    link: zoomConfig?.linkPadrao || "https://zoom.us/j/1234567890"
  });

  const programacaoAdmin = listasMensais[mesSelecionadoAdmin]?.dias || [];
  const territorioEmEdicao =
    territorios.find(t => t.numero === mapaEditSelecionado) || territorios[0];

  const hojeFormatado = new Date().toLocaleDateString("pt-BR");

  const adicionarTurnoNoDia = diaAlvo => {
    const novosDias = [...programacaoAdmin];
    const idx = novosDias.findIndex(d => d.id === diaAlvo.id);
    novosDias.splice(idx + 1, 0, {
      ...diaAlvo,
      id: Date.now(),
      periodo: diaAlvo.periodo === "Manhã" ? "Tarde" : "Noite",
      hora: diaAlvo.periodo === "Manhã" ? "16:00" : "19:00",
      relatado: false
    });
    setListasMensais(prev => ({
      ...prev,
      [mesSelecionadoAdmin]: { ...prev[mesSelecionadoAdmin], dias: novosDias }
    }));
  };

  const handleAdicionarQuadraSemMorador = e => {
    e.preventDefault();
    if (!quadraSemMoradorNum || !quadraSemMoradorMotivo.trim()) return;
    const qNum = Number(quadraSemMoradorNum);

    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const novasSemMoradores = {
          ...(t.semMoradores || {}),
          [qNum]: quadraSemMoradorMotivo.trim()
        };
        const novasParciais = { ...(t.parciais || {}) };
        delete novasParciais[qNum];
        return {
          ...t,
          semMoradores: novasSemMoradores,
          parciais: novasParciais,
          trabalhadas: t.trabalhadas.filter(x => x !== qNum)
        };
      })
    );
  };

  const handleRemoverQuadraSemMorador = qNum => {
    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const copy = { ...(t.semMoradores || {}) };
        delete copy[qNum];
        return { ...t, semMoradores: copy };
      })
    );
  };

  const handleCriarNovoMapa = e => {
    e.preventDefault();
    if (!novoMapaForm.numero.trim() || !novoMapaForm.nome.trim()) return;
    const novoTerr = {
      numero: novoMapaForm.numero.trim(),
      nome: novoMapaForm.nome.trim(),
      totalQuadras: Number(novoMapaForm.totalQuadras) || 25,
      trabalhadas: [],
      parciais: {},
      semMoradores: {},
      ultimaData: "Nunca trabalhado",
      ultimoDirigente: "-",
      ultimaObs: "Início do ciclo.",
      obsAnciao: novoMapaForm.obsAnciao.trim() || "Sem observações.",
      rodada: 1,
      imagens: novoMapaForm.imagemUrl.trim() ? [novoMapaForm.imagemUrl.trim()] : []
    };
    setTerritorios(prev => [...prev, novoTerr]);
    setMapaEditSelecionado(novoTerr.numero);
    setNovoMapaForm({ numero: "", nome: "", totalQuadras: 30, obsAnciao: "", imagemUrl: "" });
  };

  const lerEComprimirImagem = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1400;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadImagensMapa = async (e, indiceSubstituir = null) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const novasImagensBase64 = [];
    for (const file of files) {
      try {
        const dataUrl = await lerEComprimirImagem(file);
        novasImagensBase64.push(dataUrl);
      } catch (err) {
        console.error("Erro ao processar imagem:", err);
      }
    }

    if (novasImagensBase64.length === 0) return;

    setTerritorios(prev =>
      prev.map(t => {
        if (t.numero !== territorioEmEdicao.numero) return t;
        const atuais = [...(t.imagens || [])];
        if (indiceSubstituir !== null && atuais[indiceSubstituir] !== undefined) {
          atuais[indiceSubstituir] = novasImagensBase64[0];
          return { ...t, imagens: atuais };
        }
        return { ...t, imagens: [...atuais, ...novasImagensBase64] };
      })
    );

    e.target.value = "";
  };

  const handleUploadImagemNovoMapa = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await lerEComprimirImagem(file);
      setNovoMapaForm(prev => ({
        ...prev,
        imagemUrl: dataUrl,
        nomeArquivoUpload: file.name
      }));
    } catch (err) {
      console.error("Erro ao carregar imagem do novo mapa:", err);
    }
    e.target.value = "";
  };

  const handleSalvarNovoGrupo = e => {
    e.preventDefault();
    if (!novoGrupo.nome.trim()) return;

    let idSaidaFinal = Number(novoGrupo.saidaId);

    if (modoSaidaGrupo === "nova" && novoGrupo.novaSaidaNome.trim()) {
      const novaSaidaCriada = {
        id: Date.now() + 99,
        nome: novoGrupo.novaSaidaNome.trim(),
        endereco: novoGrupo.novaSaidaEndereco.trim() || "Endereço não informado",
        mapaLocal: novoGrupo.mapa,
        quadraLocal: novoGrupo.novaSaidaQuadra || "1"
      };
      setSaidas(prev => [...prev, novaSaidaCriada]);
      idSaidaFinal = novaSaidaCriada.id;
    }

    const grupoCriado = {
      id: Date.now(),
      nome: novoGrupo.nome.trim(),
      anciao: novoGrupo.anciao,
      ajudante: novoGrupo.ajudante,
      mapa: novoGrupo.mapa,
      saidaId: idSaidaFinal,
      horario: novoGrupo.horario || "09:00",
      saidaProvisoriaAtiva: false,
      saidaProvisoriaNome: "",
      saidaProvisoriaEndereco: "",
      saidaProvisoriaQuadra: "",
      visitaSupGrupos: false,
      visitaSupGruposObs: ""
    };

    setGrupos(prev => [...prev, grupoCriado]);
    setNovoGrupo({
      ...novoGrupo,
      nome: "",
      novaSaidaNome: "",
      novaSaidaEndereco: ""
    });
  };

  const handleSalvarNovoParticular = e => {
    e.preventDefault();
    const listaQuadras = novoParticular.quadrasTexto
      .split(/[,;\s]+/)
      .map(x => parseInt(x.trim(), 10))
      .filter(x => !isNaN(x) && x > 0);

    if (listaQuadras.length === 0) return;

    const mapaAlvo = territorios.find(t => t.numero === novoParticular.mapa);
    const imgPadrao =
      novoParticular.imagemUrl.trim() || mapaAlvo?.imagens?.[0] || "";

    const novoReg = {
      id: Date.now(),
      usuarioNome: novoParticular.usuarioNome,
      mapa: novoParticular.mapa,
      quadras: Array.from(new Set(listaQuadras)).sort((a, b) => a - b),
      endereco:
        novoParticular.endereco.trim() || `Quadras do Mapa ${novoParticular.mapa}`,
      imagemUrl: imgPadrao,
      dataDesignacao: hojeFormatado,
      concluidas: {}
    };

    setParticulares(prev => [...prev, novoReg]);
    setNovoParticular({
      ...novoParticular,
      quadrasTexto: "",
      endereco: "",
      imagemUrl: ""
    });
  };

  const handleCadastrarUsuario = e => {
    e.preventDefault();
    if (!novoUsuario.nome.trim() || !novoUsuario.chave.trim()) return;
    setUsuarios(prev => [
      ...prev,
      {
        id: Date.now(),
        nome: novoUsuario.nome.trim(),
        email: novoUsuario.email.trim(),
        chave: novoUsuario.chave.trim().toUpperCase(),
        role: novoUsuario.role,
        privilegio: novoUsuario.privilegio
      }
    ]);
    setNovoUsuario({
      nome: "",
      email: "",
      chave: "",
      role: "Particular",
      privilegio: "Publicador"
    });
  };

  return html`
    <div className="space-y-4">
      <!-- Menu de Seções Administrativas -->
      <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-xl shadow-sm border text-xs font-bold">
        <button
          onClick=${() => setAdminSection("programacao")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "programacao"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          1. Lista de Campo do Mês
        </button>
        <button
          onClick=${() => setAdminSection("territorios")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "territorios"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          2. Edição de Territórios & Quadras
        </button>
        <button
          onClick=${() => setAdminSection("saidas")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "saidas"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          3. Cadastro de Saídas
        </button>
        <button
          onClick=${() => setAdminSection("grupos")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "grupos"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          4. Configuração de Grupos (Domingos)
        </button>
        <button
          onClick=${() => setAdminSection("particulares")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "particulares"
              ? "bg-purple-800 text-white"
              : "text-purple-900 bg-purple-50 hover:bg-purple-100"
          }`}
        >
          5. Territórios Particulares
        </button>
        <button
          onClick=${() => setAdminSection("s13")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "s13"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          6. Formulário S-13
        </button>
        <button
          onClick=${() => setAdminSection("campanha")}
          className=${`px-3 py-2 rounded-lg ${
            adminSection === "campanha"
              ? "bg-[#1e3a5f] text-white"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          7. Campanhas & Usuários
        </button>
        <button
          onClick=${() => setAdminSection("pendencias")}
          className=${`px-3 py-2 rounded-lg transition ${
            adminSection === "pendencias"
              ? "bg-[#1e3a5f] text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          ⚠️ 8. Pendências de Dirigentes
        </button>
      </div>

      <!-- SEÇÃO 1: GERENCIADOR MULTI-MENSAL -->
      ${adminSection === "programacao" && html`
        <div className="space-y-4">
          <div className="bg-[#1e3a5f] text-white p-4 rounded-xl shadow space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase bg-blue-800 px-2 py-0.5 rounded font-bold">
                  Planejamento Antecipado (3 dias antes) & Histórico
                </span>
                <h3 className="font-bold text-base mt-1">Gerenciador de Listas de Campo Mensais</h3>
              </div>
              <button
                onClick=${onOpenNovoMesModal}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-lg text-xs shadow"
              >
                + Criar Lista do Próximo Mês
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-800 text-xs">
              <span className="font-semibold">Mês Selecionado:</span>
              <select
                value=${mesSelecionadoAdmin}
                onChange=${e => setMesSelecionadoAdmin(e.target.value)}
                className="bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg"
              >
                ${Object.values(listasMensais).map(
                  m => html`
                    <option key=${m.id} value=${m.id}>
                      ${m.mesNome}/${m.ano} — ${
                        m.id === mesVigenteId ? "VIGENTE NA TELA INICIAL" : m.status
                      }
                    </option>
                  `
                )}
              </select>

              ${mesSelecionadoAdmin !== mesVigenteId && html`
                <button
                  onClick=${() => setMesVigenteId(mesSelecionadoAdmin)}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-3 py-1.5 rounded-lg"
                >
                  ⭐ Tornar Este Mês Vigente na Tela Inicial
                </button>
              `}

              <button
                onClick=${() => window.print()}
                className="ml-auto bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg font-bold"
              >
                🖨️ Imprimir / Salvar PDF
              </button>
            </div>

            <!-- Campo para o Admin Master configurar o Texto Bíblico do Mês -->
            <div className="pt-2 border-t border-blue-800 text-xs space-y-1">
              <label className="font-bold text-blue-200 block">
                📖 Texto Bíblico da Lista de Campo deste Mês (Exibido no cabeçalho da Lista do Mês):
              </label>
              <input
                type="text"
                placeholder="Ex: “O homem não deve viver somente de pão, mas de toda palavra que vem da boca de Jeová.” — Mateus 4:4"
                value=${
                  listasMensais[mesSelecionadoAdmin]?.textoBiblico !== undefined
                    ? listasMensais[mesSelecionadoAdmin].textoBiblico
                    : "“O homem não deve viver somente de pão, mas de toda palavra que vem da boca de Jeová.” — Mateus 4:4"
                }
                onChange=${e => {
                  const novoTexto = e.target.value;
                  setListasMensais(prev => ({
                    ...prev,
                    [mesSelecionadoAdmin]: {
                      ...prev[mesSelecionadoAdmin],
                      textoBiblico: novoTexto
                    }
                  }));
                }}
                className="w-full bg-white text-slate-900 font-medium px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2.5">Dia</th>
                  <th className="p-2.5">Hora</th>
                  <th className="p-2.5">Local da Saída</th>
                  <th className="p-2.5">Mapa</th>
                  <th className="p-2.5">Dirigente</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">+Saída</th>
                </tr>
              </thead>
              <tbody>
                ${programacaoAdmin.map(
                  item => html`
                    <tr
                      key=${item.id}
                      className=${`border-b hover:bg-slate-50 ${
                        item.confirmacao === "Recusado" ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-2 font-bold text-[#1e3a5f] whitespace-nowrap">
                        ${String(item.dia).padStart(2, "0")} - ${item.semana}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <input
                          type="text"
                          value=${item.hora}
                          onChange=${e => {
                            const novos = programacaoAdmin.map(d =>
                              d.id === item.id ? { ...d, hora: e.target.value } : d
                            );
                            setListasMensais(prev => ({
                              ...prev,
                              [mesSelecionadoAdmin]: { ...prev[mesSelecionadoAdmin], dias: novos }
                            }));
                          }}
                          className="border rounded px-1.5 py-1 w-16 font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        ${item.tipo === "Grupos"
                          ? html`<span className="font-bold text-blue-800">SAÍDA EM GRUPOS</span>`
                          : html`
                              <select
                                value=${item.saidaId}
                                onChange=${e => {
                                  const novos = programacaoAdmin.map(d =>
                                    d.id === item.id ? { ...d, saidaId: Number(e.target.value) } : d
                                  );
                                  setListasMensais(prev => ({
                                    ...prev,
                                    [mesSelecionadoAdmin]: {
                                      ...prev[mesSelecionadoAdmin],
                                      dias: novos
                                    }
                                  }));
                                }}
                                className="border rounded px-2 py-1 w-full max-w-xs"
                              >
                                ${saidas.map(
                                  s => html`<option key=${s.id} value=${s.id}>${s.nome}</option>`
                                )}
                              </select>
                            `}
                      </td>
                      <td className="p-2">
                        <select
                          value=${item.mapa}
                          onChange=${e => {
                            const val = e.target.value;
                            const novos = programacaoAdmin.map(d =>
                              d.id === item.id
                                ? { ...d, mapa: val, tipo: val === "GRUPOS" ? "Grupos" : "Normal" }
                                : d
                            );
                            setListasMensais(prev => ({
                              ...prev,
                              [mesSelecionadoAdmin]: { ...prev[mesSelecionadoAdmin], dias: novos }
                            }));
                          }}
                          className="border rounded px-2 py-1 font-bold text-[#1e3a5f]"
                        >
                          <option value="GRUPOS">GRUPOS</option>
                          ${territorios.map(
                            t => html`<option key=${t.numero} value=${t.numero}>Mapa ${t.numero}</option>`
                          )}
                        </select>
                      </td>
                      <td className="p-2">
                        ${item.tipo === "Grupos"
                          ? html`<span className="font-bold text-slate-500">Dirigentes de Grupo</span>`
                          : html`
                              <select
                                value=${item.dirigente}
                                onChange=${e => {
                                  const novos = programacaoAdmin.map(d =>
                                    d.id === item.id
                                      ? { ...d, dirigente: e.target.value, confirmacao: "Confirmado" }
                                      : d
                                  );
                                  setListasMensais(prev => ({
                                    ...prev,
                                    [mesSelecionadoAdmin]: {
                                      ...prev[mesSelecionadoAdmin],
                                      dias: novos
                                    }
                                  }));
                                }}
                                className="border rounded px-2 py-1"
                              >
                                ${usuarios
                                  .filter(u => u.role !== "Particular")
                                  .map(
                                    u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`
                                  )}
                              </select>
                            `}
                      </td>
                      <td className="p-2">
                        <span
                          className=${`px-2 py-0.5 rounded font-bold ${
                            item.confirmacao === "Recusado"
                              ? "bg-red-200 text-red-900"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          ${item.confirmacao === "Recusado"
                            ? "⚠️ Recusou (Substituir)"
                            : item.confirmacao}
                        </span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick=${() => adicionarTurnoNoDia(item)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold"
                        >
                          +Turno
                        </button>
                      </td>
                    </tr>
                  `
                )}
              </tbody>
            </table>
          </div>
        </div>
      `}

      <!-- SEÇÃO 2: EDIÇÃO DE TERRITÓRIOS, UPLOAD DE MAPAS (PNG/JPEG) & QUADRAS SEM MORADORES -->
      ${adminSection === "territorios" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1e3a5f]">
                🗺️ Edição de Territórios, Upload de Mapas (PNG/JPEG) e Quadras
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie os dados do território, faça upload das imagens do mapa em PNG ou JPEG e configure quadras sem moradores.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Selecionar Território:</span>
              <select
                value=${mapaEditSelecionado}
                onChange=${e => {
                  setMapaEditSelecionado(e.target.value);
                  setQuadraSemMoradorNum("1");
                }}
                className="border-2 border-[#1e3a5f] rounded-lg px-3 py-1.5 font-bold text-[#1e3a5f] bg-blue-50/40"
              >
                ${territorios.map(
                  t => html`
                    <option key=${t.numero} value=${t.numero}>
                      Mapa ${t.numero} - ${t.nome}
                    </option>
                  `
                )}
              </select>

              ${isMaster && territorios.length > 1 && html`
                <button
                  type="button"
                  onClick=${() => {
                    if (
                      window.confirm(
                        `Tem certeza que deseja excluir o Mapa ${territorioEmEdicao.numero} (${territorioEmEdicao.nome})?`
                      )
                    ) {
                      const restantes = territorios.filter(
                        t => t.numero !== territorioEmEdicao.numero
                      );
                      setTerritorios(restantes);
                      setMapaEditSelecionado(restantes[0]?.numero || "1");
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg font-bold"
                >
                  🗑️ Excluir Mapa
                </button>
              `}
            </div>
          </div>

          <!-- 1. Dados Gerais do Mapa -->
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome / Bairro do Mapa:</label>
              <input
                type="text"
                value=${territorioEmEdicao.nome}
                onChange=${e => {
                  const val = e.target.value;
                  setTerritorios(prev =>
                    prev.map(t => (t.numero === territorioEmEdicao.numero ? { ...t, nome: val } : t))
                  );
                }}
                className="w-full border rounded-lg px-2.5 py-2 font-semibold bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantidade Total de Quadras:</label>
              <input
                type="number"
                min="1"
                max="150"
                value=${territorioEmEdicao.totalQuadras}
                onChange=${e => {
                  const val = Number(e.target.value) || 1;
                  setTerritorios(prev =>
                    prev.map(t =>
                      t.numero === territorioEmEdicao.numero ? { ...t, totalQuadras: val } : t
                    )
                  );
                }}
                className="w-full border rounded-lg px-2.5 py-2 font-semibold bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Observação Fixa do Ancião / Servo:
              </label>
              <input
                type="text"
                value=${territorioEmEdicao.obsAnciao}
                onChange=${e => {
                  const val = e.target.value;
                  setTerritorios(prev =>
                    prev.map(t =>
                      t.numero === territorioEmEdicao.numero ? { ...t, obsAnciao: val } : t
                    )
                  );
                }}
                className="w-full border rounded-lg px-2.5 py-2 bg-white"
              />
            </div>
          </div>

          <!-- 2. GERENCIADOR E UPLOAD DE IMAGENS DO MAPA (PNG / JPEG) -->
          <div className="border-t pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-[#1e3a5f]">
                  🖼️ Imagens do Mapa ${territorioEmEdicao.numero} (PNG ou JPEG)
                </h4>
                <p className="text-xs text-slate-600">
                  Envie o arquivo de imagem (PNG ou JPEG) direto do seu computador ou celular. Se o mapa for dividido em 2 partes, você pode enviar mais de uma imagem.
                </p>
              </div>

              <!-- Botão de Upload Direto de PNG / JPEG -->
              <label className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs shadow-sm transition">
                <span>📤 Enviar Imagem PNG / JPEG para o Mapa ${territorioEmEdicao.numero}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  onChange=${e => handleUploadImagensMapa(e, null)}
                  className="hidden"
                />
              </label>
            </div>

            <!-- Lista de Imagens Atuais do Mapa Selecionado -->
            ${(territorioEmEdicao.imagens || []).length === 0
              ? html`
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center text-xs text-amber-900">
                    ⚠️ Nenhuma imagem cadastrada para o <strong>Mapa ${territorioEmEdicao.numero}</strong>. Clique no botão verde acima para fazer o upload do arquivo PNG ou JPEG.
                  </div>
                `
              : html`
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${territorioEmEdicao.imagens.map((imgUrl, idx) => {
                      const isDataUrl = imgUrl.startsWith("data:image");
                      const idMatch = !isDataUrl && imgUrl.match(/id=([^&]+)/);
                      const previewSrc = idMatch
                        ? `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`
                        : imgUrl;

                      return html`
                        <div
                          key=${idx}
                          className="border rounded-xl overflow-hidden bg-slate-50 shadow-sm flex flex-col justify-between"
                        >
                          <div className="bg-slate-200/80 px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#1e3a5f]">
                                Imagem ${idx + 1} ${
                                  territorioEmEdicao.imagens.length > 1
                                    ? `(Parte ${idx + 1})`
                                    : ""
                                }
                              </span>
                              <span
                                className=${`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isDataUrl
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                ${isDataUrl ? "📁 Arquivo Enviado (Local)" : "☁️ Link Externo"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <!-- Botão para Substituir esta imagem específica por outro PNG/JPEG -->
                              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-bold text-[11px]">
                                🔄 Substituir PNG/JPEG
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg, image/webp"
                                  onChange=${e => handleUploadImagensMapa(e, idx)}
                                  className="hidden"
                                />
                              </label>

                              <!-- Botão para Excluir esta imagem -->
                              <button
                                type="button"
                                onClick=${() => {
                                  setTerritorios(prev =>
                                    prev.map(t =>
                                      t.numero === territorioEmEdicao.numero
                                        ? {
                                            ...t,
                                            imagens: t.imagens.filter((_, i) => i !== idx)
                                          }
                                        : t
                                    )
                                  );
                                }}
                                className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1 rounded font-bold text-[11px]"
                              >
                                🗑️ Remover
                              </button>
                            </div>
                          </div>

                          <div className="p-2 bg-white flex items-center justify-center">
                            <img
                              src=${previewSrc}
                              alt=${`Mapa ${territorioEmEdicao.numero} - Parte ${idx + 1}`}
                              className="w-full max-h-64 object-contain rounded border"
                            />
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                `}
          </div>

<!-- 🧪 LABORATÓRIO ISOLADO: POLÍGONOS COM EDIÇÃO LIVRE DE VÉRTICES E ARRASTE TOTAL -->
          <div className="border-t pt-5 space-y-4">
            <div className="bg-indigo-950 text-white p-4 rounded-xl shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                    Editor Vetorial de Territórios
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base mt-1">
                    📐 Demarcar Quadras com Vértices Livres e Arraste Total (Mapa ${territorioEmEdicao.numero})
                  </h4>
                  <p className="text-xs text-indigo-200">
                    Linhas finas tracejadas e fundo transparente na edição para total visibilidade do mapa embaixo.
                  </p>
                </div>

                <!-- Chave Alternadora: Modo Editar Vértices vs Modo Simular Visão do Usuário -->
                <div className="flex bg-indigo-900 p-1 rounded-xl border border-indigo-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick=${() => setModoLabMapa("mapear")}
                    className=${`px-3 py-1.5 rounded-lg transition ${
                      modoLabMapa === "mapear"
                        ? "bg-amber-400 text-amber-950 shadow"
                        : "text-indigo-200 hover:text-white"
                    }`}
                  >
                    📐 1. Modo Edição do Mapa (Limpo)
                  </button>
                  <button
                    type="button"
                    onClick=${() => setModoLabMapa("simular")}
                    className=${`px-3 py-1.5 rounded-lg transition ${
                      modoLabMapa === "simular"
                        ? "bg-emerald-500 text-white shadow"
                        : "text-indigo-200 hover:text-white"
                    }`}
                  >
                    👆 2. Ver Cores / Simular Usuário
                  </button>
                </div>
              </div>

              ${modoLabMapa === "mapear"
                ? html`
                    <div className="bg-indigo-900/90 border border-indigo-700 rounded-lg p-3 space-y-2.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-amber-300">
                            Editando Quadra:
                          </span>
                          <button
                            type="button"
                            onClick=${() =>
                              setQuadraAtivaLab(q => Math.max(1, Number(q) - 1))}
                            className="bg-indigo-800 hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg font-extrabold"
                          >
                            ◀
                          </button>
                          <select
                            value=${quadraAtivaLab}
                            onChange=${e => setQuadraAtivaLab(Number(e.target.value))}
                            className="bg-white text-slate-900 font-extrabold px-3 py-1.5 rounded-lg"
                          >
                            ${Array.from(
                              { length: territorioEmEdicao.totalQuadras },
                              (_, i) => i + 1
                            ).map(
                              n => html`
                                <option key=${n} value=${n}>
                                  Quadra ${n} ${
                                    territorioEmEdicao.coordenadasQuadras?.[n]
                                      ? `✅ (${obterVerticesQuadra(territorioEmEdicao.coordenadasQuadras[n])?.length || 4} vértices)`
                                      : "⏳"
                                  }
                                </option>
                              `
                            )}
                          </select>
                          <button
                            type="button"
                            onClick=${() =>
                              setQuadraAtivaLab(q =>
                                Math.min(territorioEmEdicao.totalQuadras, Number(q) + 1)
                              )}
                            className="bg-amber-400 hover:bg-amber-500 text-amber-950 px-3 py-1.5 rounded-lg font-extrabold shadow-sm"
                          >
                            Próxima Quadra ▶
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          ${territorioEmEdicao.coordenadasQuadras?.[quadraAtivaLab] && html`
                            <button
                              type="button"
                              onClick=${() => handleInserirVerticeNaAresta(quadraAtivaLab, null)}
                              className="bg-sky-500/30 hover:bg-sky-500/50 text-sky-100 border border-sky-400/50 px-2.5 py-1 rounded font-bold"
                            >
                              + Ponto de Vértice
                            </button>
                            <button
                              type="button"
                              onClick=${() => handleRemoverVerticeQuadra(quadraAtivaLab, null)}
                              className="bg-indigo-800 hover:bg-indigo-700 text-indigo-100 border border-indigo-500 px-2.5 py-1 rounded font-bold"
                            >
                              - Remover Último Vértice
                            </button>
                            <button
                              type="button"
                              onClick=${() => {
                                setTerritorios(prev =>
                                  prev.map(t => {
                                    if (t.numero !== territorioEmEdicao.numero) return t;
                                    const copy = { ...(t.coordenadasQuadras || {}) };
                                    delete copy[quadraAtivaLab];
                                    return { ...t, coordenadasQuadras: copy };
                                  })
                                );
                              }}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-400/40 px-2.5 py-1 rounded font-bold"
                            >
                              Apagar Qd ${quadraAtivaLab}
                            </button>
                          `}
                          <button
                            type="button"
                            onClick=${() => {
                              if (
                                window.confirm(
                                  `Apagar todas as marcações desenhadas no Mapa ${territorioEmEdicao.numero}?`
                                )
                              ) {
                                setTerritorios(prev =>
                                  prev.map(t =>
                                    t.numero === territorioEmEdicao.numero
                                      ? { ...t, coordenadasQuadras: {} }
                                      : t
                                  )
                                );
                                setQuadraAtivaLab(1);
                              }
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded font-bold"
                          >
                            🧹 Limpar Todas
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-indigo-200 grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-indigo-800">
                        <div>
                          ✥ <strong>Mover quadra inteira:</strong> Arraste pelo <strong>interior da caixa</strong> ou pelo número (cursor de 4 setas).
                        </div>
                        <div>
                          👆 <strong>Ajustar cantos:</strong> Arraste as <strong>bolinhas amarelas</strong> com o ponteiro normal (duplo clique remove o ponto).
                        </div>
                        <div>
                          ➕ <strong>Mais vértices:</strong> Clique e puxe qualquer <strong>bolinha azul</strong> no meio da linha tracejada para criar um novo canto!
                        </div>
                      </div>
                    </div>
                  `
                : html`
                    <div className="bg-emerald-950/90 border border-emerald-700 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span>
                        ✨ <strong>Visualização do Usuário Ativa:</strong> Aqui aparecem as cores reais de status (<strong>Branca = Disponível, Verde = Concluída, Amarela = Parcial</strong>). Toque nas quadras para testar!
                      </span>
                      <span className="bg-emerald-800 px-2.5 py-1 rounded font-bold">
                        Demarcadas: ${Object.keys(territorioEmEdicao.coordenadasQuadras || {}).length} de ${territorioEmEdicao.totalQuadras}
                      </span>
                    </div>
                  `}
            </div>

            ${(territorioEmEdicao.imagens || []).length > 1 && html`
              <div className="flex gap-2 text-xs font-bold">
                ${territorioEmEdicao.imagens.map(
                  (_, i) => html`
                    <button
                      key=${i}
                      type="button"
                      onClick=${() => setImagemLabIdx(i)}
                      className=${`px-3 py-1.5 rounded-lg border ${
                        imagemLabIdx === i
                          ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      Imagem Parte ${i + 1}
                    </button>
                  `
                )}
              </div>
            `}

            <!-- Área do Mapa com Camada SVG Vetorial -->
            ${(() => {
              const imgRaw =
                territorioEmEdicao.imagens?.[imagemLabIdx] ||
                territorioEmEdicao.imagens?.[0] ||
                "";
              if (!imgRaw) {
                return html`
                  <div className="p-6 text-center bg-slate-100 rounded-xl border text-xs text-slate-600">
                    Envie uma imagem PNG/JPEG acima para testar o mapeamento interativo.
                  </div>
                `;
              }
              const isDataUrl = imgRaw.startsWith("data:image");
              const idMatch = !isDataUrl && imgRaw.match(/id=([^&]+)/);
              const imgSrc = idMatch
                ? `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`
                : imgRaw;

              const coordsMapa = territorioEmEdicao.coordenadasQuadras || {};

              return html`
                <div className="bg-slate-900 rounded-xl p-2 sm:p-4 flex justify-center overflow-x-auto">
                  <div
                    data-map-container="true"
                    onMouseDown=${handleMouseDownMapaLab}
                    onMouseMove=${handleMouseMoveMapaLab}
                    onMouseUp=${handleMouseUpMapaLab}
                    onMouseLeave=${handleMouseUpMapaLab}
                    className=${`relative inline-block select-none rounded-lg overflow-hidden shadow-2xl border-2 ${
                      modoLabMapa === "mapear"
                        ? "cursor-crosshair border-amber-400"
                        : "cursor-pointer border-emerald-500"
                    }`}
                  >
                    <img
                      src=${imgSrc}
                      alt="Mapa Interativo"
                      draggable="false"
                      className="max-h-[660px] w-auto block select-none pointer-events-none"
                    />

                    <!-- Camada SVG Vetorial -->
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      ${Object.entries(coordsMapa)
                        .filter(([, pos]) => (pos.imgIdx || 0) === imagemLabIdx)
                        .map(([qNumStr, pos]) => {
                          const qNum = Number(qNumStr);
                          const pts = obterVerticesQuadra(pos);
                          if (!pts) return null;

                          const pointsStr = pts.map(p => `${p.x},${p.y}`).join(" ");
                          const isSelecionada =
                            modoLabMapa === "mapear" && Number(quadraAtivaLab) === qNum;

                          // NO MODO EDIÇÃO ("mapear"): Ignora status (concluída/parcial) e usa linha tracejada fina e fundo quase transparente!
                          if (modoLabMapa === "mapear") {
                            return html`
                              <polygon
                                key=${`poly-edit-${qNum}`}
                                points=${pointsStr}
                                fill=${isSelecionada ? "rgba(251, 191, 36, 0.08)" : "rgba(30, 58, 95, 0.05)"}
                                stroke=${isSelecionada ? "#f59e0b" : "#1e3a5f"}
                                strokeWidth=${isSelecionada ? "0.22" : "0.16"}
                                strokeDasharray=${isSelecionada ? "0.7, 0.5" : "0.5, 0.5"}
                                onMouseDown=${e => handleIniciarArrastePoligono(e, qNum, pts)}
                                className="pointer-events-auto cursor-move transition"
                              />
                            `;
                          }

                          // NO MODO SIMULAR USUÁRIO ("simular"): Mostra as cores de status reais!
                          const isSemMorador = Boolean(territorioEmEdicao.semMoradores?.[qNum]);
                          const isParcial =
                            !isSemMorador && Boolean(territorioEmEdicao.parciais?.[qNum]);
                          const isFeita =
                            !isSemMorador &&
                            !isParcial &&
                            territorioEmEdicao.trabalhadas.includes(qNum);

                          const fillColor = isSemMorador
                            ? "rgba(100, 116, 139, 0.48)"
                            : isParcial
                            ? "rgba(251, 191, 36, 0.52)"
                            : isFeita
                            ? "rgba(16, 185, 129, 0.52)"
                            : "rgba(255, 255, 255, 0.35)";

                          const strokeColor = isSemMorador
                            ? "#cbd5e1"
                            : isParcial
                            ? "#d97706"
                            : isFeita
                            ? "#059669"
                            : "#1e3a5f";

                          return html`
                            <polygon
                              key=${`poly-sim-${qNum}`}
                              points=${pointsStr}
                              fill=${fillColor}
                              stroke="none"
                              strokeWidth="0"
                              strokeDasharray=${isSemMorador ? "0.8, 0.6" : "none"}
                              onMouseDown=${e => e.stopPropagation()}
                              onClick=${e => handleToquePinoSimulacao(e, qNum)}
                              className="pointer-events-auto cursor-pointer transition hover:opacity-90"
                            />
                          `;
                        })}
                    </svg>

                    <!-- Caixa Temporária enquanto está puxando uma quadra nova (bem fina e tracejada) -->
                    ${desenhandoCaixa && html`
                      <div
                        style=${{
                          left: `${Math.min(desenhandoCaixa.startX, desenhandoCaixa.curX)}%`,
                          top: `${Math.min(desenhandoCaixa.startY, desenhandoCaixa.curY)}%`,
                          width: `${Math.abs(desenhandoCaixa.curX - desenhandoCaixa.startX)}%`,
                          height: `${Math.abs(desenhandoCaixa.curY - desenhandoCaixa.startY)}%`
                        }}
                        className="absolute border border-dashed border-amber-400 bg-amber-400/10 pointer-events-none flex items-center justify-center font-extrabold text-[11px] text-amber-950 rounded"
                      >
                        ${quadraAtivaLab}
                      </div>
                    `}

                    <!-- Rótulo Central + Vértices (Ponteiro) + Pontos Médios nas Arestas -->
                    ${Object.entries(coordsMapa)
                      .filter(([, pos]) => (pos.imgIdx || 0) === imagemLabIdx)
                      .map(([qNumStr, pos]) => {
                        const qNum = Number(qNumStr);
                        const pts = obterVerticesQuadra(pos);
                        if (!pts) return null;

                        const centerX = pts.reduce((acc, p) => acc + p.x, 0) / pts.length;
                        const centerY = pts.reduce((acc, p) => acc + p.y, 0) / pts.length;
                        const isSelecionada =
                          modoLabMapa === "mapear" && Number(quadraAtivaLab) === qNum;

                        return html`
                          <${React.Fragment} key=${`ctrl-${qNum}`}>
                           <!-- Número Central Puro (Sem quadradinho em volta e com fonte maior) -->
                            <button
                              type="button"
                              onMouseDown=${e => handleIniciarArrastePoligono(e, qNum, pts)}
                              style=${{
                                left: `${centerX}%`,
                                top: `${centerY}%`,
                                transform: "translate(-50%, -50%)",
                                textShadow: "0 0 4px #ffffff, 0 0 4px #ffffff, 0 1px 2px rgba(0,0,0,0.4)"
                              }}
                              title=${
                                modoLabMapa === "mapear"
                                  ? `Quadra ${qNum} — Segure e arraste para mover a quadra inteira`
                                  : `Quadra ${qNum}`
                              }
                              className=${`absolute bg-transparent border-none p-0 text-base sm:text-lg font-black leading-none select-none transition-transform ${
                                modoLabMapa === "mapear" ? "cursor-move" : "cursor-pointer hover:scale-125"
                              } ${
                                isSelecionada
                                  ? "text-amber-600 scale-125 z-20"
                                  : "text-slate-950 z-10"
                              }`}
                            >
                              ${qNum}
                            </button>

                            <!-- Vértices da Quadra Selecionada (Cursor Ponteiro normal e bolinha discreta) -->
                            ${isSelecionada &&
                            pts.map(
                              (pt, idx) => html`
                                <div
                                  key=${`vert-${qNum}-${idx}`}
                                  onMouseDown=${e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setArrastandoVertice({ qNum, idx });
                                  }}
                                  onDoubleClick=${e => {
                                    e.stopPropagation();
                                    handleRemoverVerticeQuadra(qNum, idx);
                                  }}
                                  style=${{
                                    left: `${pt.x}%`,
                                    top: `${pt.y}%`,
                                    transform: "translate(-50%, -50%)"
                                  }}
                                  title=${`Vértice ${idx + 1} (Arraste com o ponteiro para ajustar | Duplo clique para remover)`}
                                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-sm cursor-pointer z-30 hover:scale-125 hover:bg-amber-300 transition-transform"
                                />
                              `
                            )}

                            <!-- Micro-pontos Azuis no meio de cada aresta: clique e puxe para criar mais vértices onde quiser! -->
                            ${isSelecionada &&
                            pts.map((pt, idx) => {
                              const nextPt = pts[(idx + 1) % pts.length];
                              const midX = Number(((pt.x + nextPt.x) / 2).toFixed(1));
                              const midY = Number(((pt.y + nextPt.y) / 2).toFixed(1));

                              return html`
                                <div
                                  key=${`mid-${qNum}-${idx}`}
                                  onMouseDown=${e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleInserirVerticeNaAresta(qNum, idx);
                                    setArrastandoVertice({ qNum, idx: idx + 1 });
                                  }}
                                  style=${{
                                    left: `${midX}%`,
                                    top: `${midY}%`,
                                    transform: "translate(-50%, -50%)"
                                  }}
                                  title="Clique e arraste para criar um novo vértice neste lado da quadra"
                                  className="absolute w-2 h-2 rounded-full bg-sky-400/90 border border-white shadow-sm cursor-pointer z-20 hover:scale-150 hover:bg-sky-300 transition-transform"
                                />
                              `;
                            })}
                          </${React.Fragment}>
                        `;
                      })}
                  </div>
                </div>
              `;
            })()}
          </div>

          <!-- 3. Quadras Sem Moradores (Ex: [ ] UPA) -->
          <div className="border-t pt-4 space-y-4">
            <div>
              <h4 className="font-extrabold text-sm text-[#1e3a5f]">
                🏢 Quadras Sem Moradores no Mapa ${territorioEmEdicao.numero}
              </h4>
              <p className="text-xs text-slate-600">
                O nome que você cadastrar abaixo (ex: <strong>UPA</strong>, <strong>Escola</strong>) aparecerá diretamente na legenda da Tela Inicial para este mapa. Se não houver nenhuma, nada será exibido na legenda.
              </p>
            </div>

            <form
              onSubmit=${handleAdicionarQuadraSemMorador}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border text-xs items-end"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Número da Quadra:</label>
                <select
                  value=${quadraSemMoradorNum}
                  onChange=${e => setQuadraSemMoradorNum(e.target.value)}
                  className="w-full border rounded-lg px-2.5 py-2 font-bold bg-white"
                >
                  ${Array.from({ length: territorioEmEdicao.totalQuadras }, (_, i) => i + 1).map(
                    num => html`<option key=${num} value=${num}>Quadra ${num}</option>`
                  )}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Nome do Local (Ex: UPA, Escola, Mercado, Praça):
                </label>
                <input
                  type="text"
                  placeholder="Ex: UPA"
                  value=${quadraSemMoradorMotivo}
                  onChange=${e => setQuadraSemMoradorMotivo(e.target.value)}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-2 px-3 rounded-lg shadow-sm"
              >
                + Cadastrar na Legenda
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 font-semibold">Sugestões rápidas:</span>
              ${["UPA", "Escola", "Hospital", "Mercado", "Praça"].map(
                sug => html`
                  <button
                    type="button"
                    key=${sug}
                    onClick=${() => setQuadraSemMoradorMotivo(sug)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border font-semibold"
                  >
                    ${sug}
                  </button>
                `
              )}
            </div>

            <div className="space-y-2 text-xs">
              ${Object.keys(territorioEmEdicao.semMoradores || {}).length > 0 && html`
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  ${Object.entries(territorioEmEdicao.semMoradores).map(
                    ([qNum, motivo]) => html`
                      <div
                        key=${qNum}
                        className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-lg px-3 py-2"
                      >
                        <div>
                          <span className="font-extrabold text-[#1e3a5f]">Quadra ${qNum}:</span>
                          <span className="text-slate-700 font-bold">${motivo}</span>
                        </div>
                        <button
                          type="button"
                          onClick=${() => handleRemoverQuadraSemMorador(qNum)}
                          className="text-red-600 hover:text-red-800 font-bold text-xs ml-2"
                        >
                          Remover ✕
                        </button>
                      </div>
                    `
                  )}
                </div>
              `}
            </div>
          </div>

          <!-- 4. Adicionar Novo Território do Zero (Já com Upload de PNG/JPEG) -->
          <div className="border-t pt-4">
            <h4 className="font-extrabold text-sm text-[#1e3a5f] mb-2">
              + Cadastrar Novo Território / Mapa (Com Upload de PNG ou JPEG)
            </h4>
            <form
              onSubmit=${handleCriarNovoMapa}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3.5 rounded-xl border text-xs items-end"
            >
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Nº do Mapa:</label>
                <input
                  type="text"
                  placeholder="Ex: 16"
                  value=${novoMapaForm.numero}
                  onChange=${e => setNovoMapaForm({ ...novoMapaForm, numero: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Nome / Bairro:</label>
                <input
                  type="text"
                  placeholder="Nome do Mapa"
                  value=${novoMapaForm.nome}
                  onChange=${e => setNovoMapaForm({ ...novoMapaForm, nome: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Total Quadras:</label>
                <input
                  type="number"
                  placeholder="30"
                  value=${novoMapaForm.totalQuadras}
                  onChange=${e =>
                    setNovoMapaForm({ ...novoMapaForm, totalQuadras: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">
                  Arquivo do Mapa (PNG / JPEG):
                </label>
                <label className="cursor-pointer w-full flex items-center justify-center gap-1.5 border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-100/60 text-[#1e3a5f] font-bold rounded-lg px-2.5 py-2 truncate">
                  <span>
                    ${novoMapaForm.nomeArquivoUpload
                      ? `✅ ${novoMapaForm.nomeArquivoUpload}`
                      : "📤 Escolher PNG / JPEG"}
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange=${handleUploadImagemNovoMapa}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-3 py-2 shadow-sm"
                >
                  + Criar Mapa
                </button>
              </div>
            </form>
          </div>
        </div>
      `}

      <!-- SEÇÃO 3: CADASTRO DE SAÍDAS (COM CONFIGURAÇÃO E EDIÇÃO DE MAPA E QUADRA DA SAÍDA) -->
      ${adminSection === "saidas" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-5">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-[#1e3a5f]">
              📍 Cadastro e Configuração de Locais de Saída
            </h3>
            <p className="text-xs text-slate-500">
              Defina o nome da saída, o endereço para o GPS e <strong>em qual Mapa e Quadra esse endereço fica fisicamente</strong>. Quando uma saída for escalada para trabalhar outro mapa diferente, o sistema avisará os irmãos automaticamente na Tela Inicial!
            </p>
          </div>

          <!-- Formulário para Cadastrar Nova Saída com Rótulos Claros -->
          <form
            onSubmit=${e => {
              e.preventDefault();
              if (!novaSaida.nome.trim()) return;
              setSaidas(prev => [
                ...prev,
                {
                  id: Date.now(),
                  nome: novaSaida.nome.trim(),
                  endereco: novaSaida.endereco.trim(),
                  mapaLocal: String(novaSaida.mapaLocal),
                  quadraLocal: String(novaSaida.quadraLocal)
                }
              ]);
              setNovaSaida({ nome: "", endereco: "", mapaLocal: "1", quadraLocal: "1" });
            }}
            className="bg-slate-50 p-4 rounded-xl border space-y-3 text-xs"
          >
            <h4 className="font-extrabold text-sm text-[#1e3a5f]">
              + Cadastrar Novo Local de Saída
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">
                  Nome do Local da Saída:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Casa Irmão Marcos Fonseca"
                  value=${novaSaida.nome}
                  onChange=${e => setNovaSaida({ ...novaSaida, nome: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-bold text-slate-700 block mb-1">
                  Endereço Completo (Para o GPS):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua Santa Eunice, 786"
                  value=${novaSaida.endereco}
                  onChange=${e => setNovaSaida({ ...novaSaida, endereco: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-blue-900 block mb-1">
                  Fica em qual Mapa?
                </label>
                <select
                  value=${novaSaida.mapaLocal}
                  onChange=${e =>
                    setNovaSaida({ ...novaSaida, mapaLocal: e.target.value, quadraLocal: "1" })}
                  className="w-full border-2 border-blue-200 rounded-lg px-2 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${territorios.map(
                    t => html`
                      <option key=${t.numero} value=${t.numero}>
                        Mapa ${t.numero} (${t.nome})
                      </option>
                    `
                  )}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="font-bold text-blue-900 block mb-1">
                  Nº Quadra:
                </label>
                <select
                  value=${novaSaida.quadraLocal}
                  onChange=${e => setNovaSaida({ ...novaSaida, quadraLocal: e.target.value })}
                  className="w-full border-2 border-blue-200 rounded-lg px-2 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${Array.from(
                    {
                      length:
                        territorios.find(t => t.numero === String(novaSaida.mapaLocal))
                          ?.totalQuadras || 40
                    },
                    (_, i) => i + 1
                  ).map(q => html`<option key=${q} value=${String(q)}>${q}</option>`)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg shadow-sm"
                >
                  + Salvar Saída
                </button>
              </div>
            </div>
          </form>

          <!-- Tabela Editável de Todas as Saídas Cadastradas -->
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-[#1e3a5f]">
              Locais de Saída Cadastrados (${saidas.length}) — Edite o Mapa ou a Quadra diretamente abaixo:
            </h4>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="p-2.5">Nome da Saída</th>
                    <th className="p-2.5">Endereço Completo (GPS)</th>
                    <th className="p-2.5">Mapa Onde Fica a Saída</th>
                    <th className="p-2.5">Quadra Onde Fica a Saída</th>
                    <th className="p-2.5">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${saidas.map(s => {
                    const mapaDaSaida = territorios.find(
                      t => t.numero === String(s.mapaLocal)
                    );
                    const maxQuadras = mapaDaSaida?.totalQuadras || 45;

                    return html`
                      <tr key=${s.id} className="border-b hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            value=${s.nome}
                            onChange=${e => {
                              const val = e.target.value;
                              setSaidas(prev =>
                                prev.map(item => (item.id === s.id ? { ...item, nome: val } : item))
                              );
                            }}
                            className="border rounded px-2 py-1.5 font-bold text-[#1e3a5f] w-full min-w-[180px]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value=${s.endereco}
                            onChange=${e => {
                              const val = e.target.value;
                              setSaidas(prev =>
                                prev.map(item =>
                                  item.id === s.id ? { ...item, endereco: val } : item
                                )
                              );
                            }}
                            className="border rounded px-2 py-1.5 w-full min-w-[240px]"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value=${String(s.mapaLocal)}
                            onChange=${e => {
                              const val = e.target.value;
                              setSaidas(prev =>
                                prev.map(item =>
                                  item.id === s.id ? { ...item, mapaLocal: val } : item
                                )
                              );
                            }}
                            className="border border-blue-300 bg-blue-50/50 rounded px-2 py-1.5 font-bold text-[#1e3a5f]"
                          >
                            ${territorios.map(
                              t => html`
                                <option key=${t.numero} value=${t.numero}>
                                  Mapa ${t.numero} - ${t.nome}
                                </option>
                              `
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value=${String(s.quadraLocal)}
                            onChange=${e => {
                              const val = e.target.value;
                              setSaidas(prev =>
                                prev.map(item =>
                                  item.id === s.id ? { ...item, quadraLocal: val } : item
                                )
                              );
                            }}
                            className="border border-blue-300 bg-blue-50/50 rounded px-2 py-1.5 font-bold text-blue-900"
                          >
                            ${Array.from({ length: maxQuadras }, (_, i) => i + 1).map(
                              q => html`
                                <option key=${q} value=${String(q)}>
                                  Quadra ${q}
                                </option>
                              `
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          ${isMaster && html`
                            <button
                              type="button"
                              onClick=${() =>
                                setSaidas(prev => prev.filter(x => x.id !== s.id))}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >
                              Excluir
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
      `}

      <!-- SEÇÃO 4: CONFIGURAÇÃO DE GRUPOS DE CAMPO -->
      ${adminSection === "grupos" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-[#1e3a5f]">
              👥 Configuração dos Grupos de Campo (Domingos)
            </h3>
            <p className="text-xs text-slate-500">
              Cadastre os grupos de domingo, configure mudanças provisórias no local de saída e ative o aviso de visita do Superintendente de Grupos.
            </p>
          </div>

          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-extrabold bg-[#1e3a5f] text-white px-2 py-0.5 rounded">
                Avisos na Tela Inicial (Abaixo do Seletor de Grupos)
              </span>
              <h4 className="font-extrabold text-sm text-[#1e3a5f] mt-1">
                🔔 Avisos do Domingo: Mudança Provisória de Saída & Visita do Superintendente de Grupos
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${grupos.map(g => {
                const saidaCostumeira = saidas.find(s => s.id === Number(g.saidaId));
                return html`
                  <div
                    key=${g.id}
                    className="bg-white border rounded-xl p-3.5 shadow-sm space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-extrabold text-sm text-[#1e3a5f]">
                        ${g.nome} (Mapa ${g.mapa})
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ${g.anciao} / ${g.ajudante}
                      </span>
                    </div>

                    <div className="bg-sky-50/80 border border-sky-200 rounded-lg p-2.5 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-sky-950 cursor-pointer">
                        <input
                          type="checkbox"
                          checked=${Boolean(g.visitaSupGrupos)}
                          onChange=${e => {
                            const checked = e.target.checked;
                            setGrupos(prev =>
                              prev.map(item =>
                                item.id === g.id ? { ...item, visitaSupGrupos: checked } : item
                              )
                            );
                          }}
                        />
                        👔 Avisar que o Superintendente de Grupos visitará este grupo
                      </label>

                      ${g.visitaSupGrupos && html`
                        <input
                          type="text"
                          placeholder="Observação opcional da visita (ex: Reunião às 08:50)"
                          value=${g.visitaSupGruposObs || ""}
                          onChange=${e => {
                            const val = e.target.value;
                            setGrupos(prev =>
                              prev.map(item =>
                                item.id === g.id ? { ...item, visitaSupGruposObs: val } : item
                              )
                            );
                          }}
                          className="w-full border border-sky-300 rounded px-2 py-1.5 bg-white text-xs"
                        />
                      `}
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2.5 space-y-2">
                      <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                        <input
                          type="checkbox"
                          checked=${Boolean(g.saidaProvisoriaAtiva)}
                          onChange=${e => {
                            const checked = e.target.checked;
                            setGrupos(prev =>
                              prev.map(item =>
                                item.id === g.id ? { ...item, saidaProvisoriaAtiva: checked } : item
                              )
                            );
                          }}
                        />
                        📍 Mudar provisoriamente o local da saída deste grupo hoje
                      </label>

                      <p className="text-[11px] text-slate-500">
                        Saída costumeira: <strong>${saidaCostumeira?.nome}</strong> (${saidaCostumeira?.endereco})
                      </p>

                      ${g.saidaProvisoriaAtiva && html`
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Nome do Local Provisório (Ex: Casa Irmão Carlos)"
                            value=${g.saidaProvisoriaNome || ""}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item =>
                                  item.id === g.id ? { ...item, saidaProvisoriaNome: val } : item
                                )
                              );
                            }}
                            className="w-full border border-amber-300 rounded px-2 py-1.5 bg-white font-semibold"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Endereço Provisório do Dia"
                              value=${g.saidaProvisoriaEndereco || ""}
                              onChange=${e => {
                                const val = e.target.value;
                                setGrupos(prev =>
                                  prev.map(item =>
                                    item.id === g.id
                                      ? { ...item, saidaProvisoriaEndereco: val }
                                      : item
                                  )
                                );
                              }}
                              className="flex-1 border border-amber-300 rounded px-2 py-1.5 bg-white"
                            />
                            <input
                              type="text"
                              placeholder="Qd"
                              value=${g.saidaProvisoriaQuadra || ""}
                              onChange=${e => {
                                const val = e.target.value;
                                setGrupos(prev =>
                                  prev.map(item =>
                                    item.id === g.id
                                      ? { ...item, saidaProvisoriaQuadra: val }
                                      : item
                                  )
                                );
                              }}
                              className="w-16 border border-amber-300 rounded px-2 py-1.5 bg-white"
                            />
                          </div>
                        </div>
                      `}
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-[#1e3a5f]">
              Configuração Padrão (Costumeira) dos Grupos (${grupos.length})
            </h4>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="p-2.5">Nome do Grupo</th>
                    <th className="p-2.5">Território (Mapa)</th>
                    <th className="p-2.5">Dirigente 1 (Ancião)</th>
                    <th className="p-2.5">Dirigente 2 (Ajudante)</th>
                    <th className="p-2.5">Saída Costumeira & Endereço</th>
                    <th className="p-2.5">Hora</th>
                    <th className="p-2.5">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${grupos.map(g => {
                    const saidaVinculada = saidas.find(s => s.id === Number(g.saidaId));
                    return html`
                      <tr key=${g.id} className="border-b hover:bg-slate-50">
                        <td className="p-2">
                          <input
                            type="text"
                            value=${g.nome}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item => (item.id === g.id ? { ...item, nome: val } : item))
                              );
                            }}
                            className="border rounded px-2 py-1 font-bold text-[#1e3a5f] w-40"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value=${g.mapa}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item => (item.id === g.id ? { ...item, mapa: val } : item))
                              );
                            }}
                            className="border rounded px-2 py-1 font-bold text-blue-900"
                          >
                            ${territorios.map(
                              t => html`<option key=${t.numero} value=${t.numero}>Mapa ${t.numero}</option>`
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value=${g.anciao}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item => (item.id === g.id ? { ...item, anciao: val } : item))
                              );
                            }}
                            className="border rounded px-2 py-1"
                          >
                            ${usuarios.map(
                              u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value=${g.ajudante}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item =>
                                  item.id === g.id ? { ...item, ajudante: val } : item
                                )
                              );
                            }}
                            className="border rounded px-2 py-1"
                          >
                            ${usuarios.map(
                              u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`
                            )}
                          </select>
                        </td>
                        <td className="p-2">
                          <select
                            value=${g.saidaId}
                            onChange=${e => {
                              const val = Number(e.target.value);
                              setGrupos(prev =>
                                prev.map(item =>
                                  item.id === g.id ? { ...item, saidaId: val } : item
                                )
                              );
                            }}
                            className="border rounded px-2 py-1 w-full max-w-xs font-semibold"
                          >
                            ${saidas.map(
                              s => html`<option key=${s.id} value=${s.id}>${s.nome}</option>`
                            )}
                          </select>
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            📍 ${saidaVinculada?.endereco || "Sem endereço"}
                          </span>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value=${g.horario}
                            onChange=${e => {
                              const val = e.target.value;
                              setGrupos(prev =>
                                prev.map(item =>
                                  item.id === g.id ? { ...item, horario: val } : item
                                )
                              );
                            }}
                            className="border rounded px-1.5 py-1 w-16 font-semibold"
                          />
                        </td>
                        <td className="p-2">
                          ${isMaster && html`
                            <button
                              onClick=${() =>
                                setGrupos(prev => prev.filter(item => item.id !== g.id))}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >
                              Excluir
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

          <form
            onSubmit=${handleSalvarNovoGrupo}
            className="bg-slate-50 p-4 rounded-xl border space-y-3 text-xs"
          >
            <h4 className="font-extrabold text-sm text-[#1e3a5f]">+ Cadastrar Novo Grupo</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nome / Identificação do Grupo:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grupo 5 - Vila Atlântica"
                  value=${novoGrupo.nome}
                  onChange=${e => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Território (Mapa) do Grupo:
                </label>
                <select
                  value=${novoGrupo.mapa}
                  onChange=${e => setNovoGrupo({ ...novoGrupo, mapa: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${territorios.map(
                    t => html`
                      <option key=${t.numero} value=${t.numero}>
                        Mapa ${t.numero} - ${t.nome}
                      </option>
                    `
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Horário da Saída:</label>
                <input
                  type="text"
                  placeholder="09:00"
                  value=${novoGrupo.horario}
                  onChange=${e => setNovoGrupo({ ...novoGrupo, horario: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Dirigente 1 (Ancião Responsável):
                </label>
                <select
                  value=${novoGrupo.anciao}
                  onChange=${e => setNovoGrupo({ ...novoGrupo, anciao: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                >
                  ${usuarios.map(
                    u => html`<option key=${u.id} value=${u.nome}>${u.nome} (${u.privilegio})</option>`
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Dirigente 2 (Ajudante):
                </label>
                <select
                  value=${novoGrupo.ajudante}
                  onChange=${e => setNovoGrupo({ ...novoGrupo, ajudante: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                >
                  ${usuarios.map(
                    u => html`<option key=${u.id} value=${u.nome}>${u.nome} (${u.privilegio})</option>`
                  )}
                </select>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2.5">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-slate-700">Local Costumeiro da Saída do Grupo:</span>
                <label className="flex items-center gap-1 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    checked=${modoSaidaGrupo === "existente"}
                    onChange=${() => setModoSaidaGrupo("existente")}
                  />
                  Escolher saída já cadastrada
                </label>
                <label className="flex items-center gap-1 font-semibold cursor-pointer text-blue-800">
                  <input
                    type="radio"
                    checked=${modoSaidaGrupo === "nova"}
                    onChange=${() => setModoSaidaGrupo("nova")}
                  />
                  + Digitar novo Nome da Saída e Endereço
                </label>
              </div>

              ${modoSaidaGrupo === "existente"
                ? html`
                    <div>
                      <select
                        value=${novoGrupo.saidaId}
                        onChange=${e =>
                          setNovoGrupo({ ...novoGrupo, saidaId: Number(e.target.value) })}
                        className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                      >
                        ${saidas.map(
                          s => html`
                            <option key=${s.id} value=${s.id}>
                              ${s.nome} — ${s.endereco} (Quadra ${s.quadraLocal} / Mapa ${s.mapaLocal})
                            </option>
                          `
                        )}
                      </select>
                    </div>
                  `
                : html`
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      <input
                        type="text"
                        placeholder="Nome da Saída (Ex: Casa Irmão João)"
                        value=${novoGrupo.novaSaidaNome}
                        onChange=${e =>
                          setNovoGrupo({ ...novoGrupo, novaSaidaNome: e.target.value })}
                        className="border rounded-lg px-2.5 py-2 bg-white sm:col-span-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Endereço Completo da Saída"
                        value=${novoGrupo.novaSaidaEndereco}
                        onChange=${e =>
                          setNovoGrupo({ ...novoGrupo, novaSaidaEndereco: e.target.value })}
                        className="border rounded-lg px-2.5 py-2 bg-white sm:col-span-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nº Quadra"
                        value=${novoGrupo.novaSaidaQuadra}
                        onChange=${e =>
                          setNovoGrupo({ ...novoGrupo, novaSaidaQuadra: e.target.value })}
                        className="border rounded-lg px-2.5 py-2 bg-white"
                      />
                    </div>
                  `}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
              >
                + Salvar Grupo de Campo
              </button>
            </div>
          </form>
        </div>
      `}

      <!-- SEÇÃO 5: TERRITÓRIOS PARTICULARES -->
      ${adminSection === "particulares" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-6">
          <div className="border-b pb-3">
            <span className="text-[10px] uppercase font-extrabold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded">
              Cuidado Especial / Mobilidade Reduzida
            </span>
            <h3 className="font-bold text-base text-[#1e3a5f] mt-1">
              🏠 Gestão de Territórios Particulares
            </h3>
            <p className="text-xs text-slate-500">
              Designe quadras específicas de um mapa para um irmão fazer particularmente, dê baixa manual quando ele avisar verbalmente e registre casas restritas do mapa.
            </p>
          </div>

          <form
            onSubmit=${handleSalvarNovoParticular}
            className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl space-y-3 text-xs"
          >
            <h4 className="font-extrabold text-sm text-purple-950">
              + Designar Quadras de Território Particular para um Usuário
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Irmão (Usuário Designado):
                </label>
                <select
                  value=${novoParticular.usuarioNome}
                  onChange=${e =>
                    setNovoParticular({ ...novoParticular, usuarioNome: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${usuarios.map(
                    u => html`
                      <option key=${u.id} value=${u.nome}>
                        ${u.nome} (${u.role})
                      </option>
                    `
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Selecionar Mapa:
                </label>
                <select
                  value=${novoParticular.mapa}
                  onChange=${e =>
                    setNovoParticular({ ...novoParticular, mapa: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${territorios.map(
                    t => html`
                      <option key=${t.numero} value=${t.numero}>
                        Mapa ${t.numero} - ${t.nome} (1 a ${t.totalQuadras})
                      </option>
                    `
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Quadras Designadas (separe por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="Ex: 8, 9"
                  value=${novoParticular.quadrasTexto}
                  onChange=${e =>
                    setNovoParticular({ ...novoParticular, quadrasTexto: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Endereço / Referência das Quadras (Para o GPS):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rua Santa Eunice, 620"
                  value=${novoParticular.endereco}
                  onChange=${e =>
                    setNovoParticular({ ...novoParticular, endereco: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Link da Imagem do Mapa (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Deixe vazio para usar o mapa oficial"
                  value=${novoParticular.imagemUrl}
                  onChange=${e =>
                    setNovoParticular({ ...novoParticular, imagemUrl: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg shadow-sm"
              >
                + Salvar Território Particular
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#1e3a5f]">
              Territórios Particulares Designados (${particulares.length})
            </h4>

            ${particulares.map(item => {
              const tMapa = territorios.find(t => t.numero === item.mapa);
              return html`
                <div
                  key=${item.id}
                  className="border rounded-xl p-4 bg-slate-50 space-y-3 text-xs"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-2.5">
                    <div>
                      <span className="font-extrabold text-sm text-[#1e3a5f]">
                        👤 ${item.usuarioNome} — Mapa ${item.mapa} (${tMapa?.nome})
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        <strong>📍 Endereço:</strong> ${item.endereco} • 
                        <strong>Designado em:</strong> ${item.dataDesignacao}
                      </p>
                    </div>
                    <button
                      onClick=${() =>
                        setParticulares(prev => prev.filter(p => p.id !== item.id))}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      Remover Designação ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block">
                      Controle de Conclusão das Quadras (Você pode dar baixa caso o irmão avise verbalmente):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      ${item.quadras.map(qNum => {
                        const infoConcluida = item.concluidas?.[qNum];
                        const jaFeita = Boolean(infoConcluida);
                        return html`
                          <div
                            key=${qNum}
                            className=${`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                              jaFeita
                                ? "bg-emerald-50 border-emerald-300"
                                : "bg-white border-purple-300"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-sm text-[#1e3a5f]">
                                Quadra ${qNum}
                              </span>
                              <span
                                className=${`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  jaFeita
                                    ? "bg-emerald-600 text-white"
                                    : "bg-purple-100 text-purple-900"
                                }`}
                              >
                                ${jaFeita
                                  ? `Concluída (${infoConcluida.data})`
                                  : "Reservada / Pendente"}
                              </span>
                            </div>

                            ${!jaFeita && html`
                              <button
                                type="button"
                                onClick=${() =>
                                  onConcluirQuadraParticular(
                                    item.id,
                                    qNum,
                                    hojeFormatado,
                                    "Baixa manual pelo Admin Master (aviso verbal)"
                                  )}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-xs shadow-sm"
                              >
                                ✅ Marcar Concluída (Admin)
                              </button>
                            `}
                          </div>
                        `;
                      })}
                    </div>
                  </div>
                </div>
              `;
            })}
          </div>

          <div className="border-t pt-4 space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-red-900">
              🛑 Registrar Casa Restrita (Não Bater) em Qualquer Mapa
            </h4>
            <p className="text-slate-600">
              Se o irmão do território particular avisar sobre uma nova casa restrita (ou se o território voltar para o campo normal), registre abaixo para os dirigentes ficarem cientes:
            </p>
            <form
              onSubmit=${e => {
                e.preventDefault();
                onAdicionarCasaRestrita(
                  novaRestricaoMapa.mapa,
                  novaRestricaoMapa.rua,
                  novaRestricaoMapa.numero
                );
                setNovaRestricaoMapa({ ...novaRestricaoMapa, rua: "", numero: "" });
              }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-red-50 p-3 rounded-xl border border-red-200"
            >
              <select
                value=${novaRestricaoMapa.mapa}
                onChange=${e =>
                  setNovaRestricaoMapa({ ...novaRestricaoMapa, mapa: e.target.value })}
                className="border rounded-lg px-2.5 py-2 bg-white font-bold text-[#1e3a5f]"
              >
                ${territorios.map(
                  t => html`<option key=${t.numero} value=${t.numero}>Mapa ${t.numero} - ${t.nome}</option>`
                )}
              </select>
              <input
                type="text"
                placeholder="Nome da Rua (Ex: Rua São Pedro)"
                value=${novaRestricaoMapa.rua}
                onChange=${e =>
                  setNovaRestricaoMapa({ ...novaRestricaoMapa, rua: e.target.value })}
                className="border rounded-lg px-2.5 py-2 bg-white sm:col-span-2"
                required
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nº"
                  value=${novaRestricaoMapa.numero}
                  onChange=${e =>
                    setNovaRestricaoMapa({
                      ...novaRestricaoMapa,
                      numero: e.target.value.replace(/\D/g, "")
                    })}
                  className="border rounded-lg px-2.5 py-2 bg-white w-20 font-bold"
                  required
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 rounded-lg flex-1"
                >
                  + Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      `}

      <!-- SEÇÃO 6: FORMULÁRIO S-13 -->
      ${adminSection === "s13" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-[#1e3a5f]">
                REGISTRO DE DESIGNAÇÃO DE TERRITÓRIO (S-13)
              </h3>
              <p className="text-xs text-slate-500">
                Ao informar a data de início, a data de término recebe automaticamente o mesmo dia.
              </p>
            </div>
            <button
              onClick=${() => window.print()}
              className="bg-[#24558f] text-white px-3 py-2 rounded-lg text-xs font-bold"
            >
              📄 Baixar / Imprimir S-13 em PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-1.5">Terr. n.º</th>
                  <th className="border p-1.5">Última data concluída*</th>
                  <th className="border p-1.5">1. Designado / Início = Fim</th>
                  <th className="border p-1.5">2. Designado / Início = Fim</th>
                  <th className="border p-1.5">3. Designado / Início = Fim</th>
                  <th className="border p-1.5">4. Designado / Início = Fim</th>
                </tr>
              </thead>
              <tbody>
                ${s13Data.map(
                  (row, rIdx) => html`
                    <tr key=${row.territorio}>
                      <td className="border p-1.5 font-bold text-center">${row.territorio}</td>
                      <td className="border p-1.5 text-center">${row.ultimaConclusao}</td>
                      ${row.colunas.map(
                        (col, cIdx) => html`
                          <td key=${cIdx} className="border p-1.5 space-y-1">
                            <input
                              type="text"
                              placeholder="Dirigente"
                              value=${col.dirigente}
                              onChange=${e => {
                                const copy = [...s13Data];
                                copy[rIdx].colunas[cIdx].dirigente = e.target.value;
                                setS13Data(copy);
                              }}
                              className="border rounded px-1 py-0.5 w-full font-semibold"
                            />
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="DD/MM/AAAA"
                                value=${col.inicio}
                                onChange=${e => {
                                  const val = e.target.value;
                                  const copy = [...s13Data];
                                  copy[rIdx].colunas[cIdx].inicio = val;
                                  copy[rIdx].colunas[cIdx].fim = val;
                                  setS13Data(copy);
                                }}
                                className="border rounded px-1 py-0.5 w-1/2"
                              />
                              <input
                                type="text"
                                placeholder="Conclusão"
                                value=${col.fim}
                                onChange=${e => {
                                  const copy = [...s13Data];
                                  copy[rIdx].colunas[cIdx].fim = e.target.value;
                                  setS13Data(copy);
                                }}
                                className="border rounded px-1 py-0.5 w-1/2 bg-slate-50"
                              />
                            </div>
                          </td>
                        `
                      )}
                    </tr>
                  `
                )}
              </tbody>
            </table>
          </div>
        </div>
      `}

      <!-- SEÇÃO 7: CAMPANHAS, CAMPO NO ZOOM E USUÁRIOS -->
      ${adminSection === "campanha" && html`
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-4 text-xs">
            <div className="border-b pb-3 flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] uppercase font-extrabold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded">
                  Arranjo de Cartas / Campo Online
                </span>
                <h3 className="font-bold text-base text-[#1e3a5f] mt-1">
                  💻 Configurar Dias de Campo no Zoom (Tela Inicial & Calendário)
                </h3>
                <p className="text-slate-500">
                  Configure o link da sala, o horário e quais dias do mês terão saída pelo Zoom. Nos dias cadastrados abaixo, o card do Zoom aparecerá automaticamente na Tela Inicial!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-xl items-end">
              <div className="sm:col-span-2">
                <label className="font-bold text-indigo-950 block mb-1">
                  🔗 Link Padrão da Sala do Zoom:
                </label>
                <input
                  type="text"
                  placeholder="Ex: https://zoom.us/j/1234567890"
                  value=${zoomConfig?.linkPadrao || ""}
                  onChange=${e => {
                    const novoLink = e.target.value;
                    setZoomConfig(prev => ({
                      ...prev,
                      linkPadrao: novoLink,
                      dias: (prev?.dias || []).map(d => ({ ...d, link: novoLink }))
                    }));
                  }}
                  className="w-full border border-indigo-300 rounded-lg px-2.5 py-2 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-indigo-950 block mb-1">
                  🕒 Horário Padrão do Zoom:
                </label>
                <input
                  type="text"
                  placeholder="Ex: 09:30"
                  value=${zoomConfig?.horarioPadrao || ""}
                  onChange=${e => {
                    const novoHorario = e.target.value;
                    setZoomConfig(prev => ({
                      ...prev,
                      horarioPadrao: novoHorario
                    }));
                  }}
                  className="w-full border border-indigo-300 rounded-lg px-2.5 py-2 bg-white font-bold"
                />
              </div>
            </div>

            <form
              onSubmit=${e => {
                e.preventDefault();
                const novoItem = {
                  id: Date.now(),
                  dia: Number(novoDiaZoom.dia),
                  horario: novoDiaZoom.horario.trim() || zoomConfig?.horarioPadrao || "09:30",
                  dirigente: novoDiaZoom.dirigente,
                  link: novoDiaZoom.link.trim() || zoomConfig?.linkPadrao || ""
                };
                setZoomConfig(prev => ({
                  ...prev,
                  dias: [...(prev?.dias || []), novoItem].sort((a, b) => a.dia - b.dia)
                }));
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-50 p-3.5 rounded-xl border items-end"
            >
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Dia do Mês:</label>
                <select
                  value=${novoDiaZoom.dia}
                  onChange=${e => setNovoDiaZoom({ ...novoDiaZoom, dia: e.target.value })}
                  className="w-full border rounded-lg px-2 py-2 bg-white font-bold text-[#1e3a5f]"
                >
                  ${Array.from({ length: 31 }, (_, i) => i + 1).map(
                    d => html`
                      <option key=${d} value=${d}>
                        Dia ${String(d).padStart(2, "0")}
                      </option>
                    `
                  )}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Horário:</label>
                <input
                  type="text"
                  placeholder="09:30"
                  value=${novoDiaZoom.horario}
                  onChange=${e => setNovoDiaZoom({ ...novoDiaZoom, horario: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Dirigente do Zoom:</label>
                <select
                  value=${novoDiaZoom.dirigente}
                  onChange=${e => setNovoDiaZoom({ ...novoDiaZoom, dirigente: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white font-semibold"
                >
                  ${usuarios
                    .filter(u => u.role !== "Particular")
                    .map(u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`)}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="font-bold text-slate-700 block mb-1">Link da Sala:</label>
                <input
                  type="text"
                  placeholder="https://zoom.us/j/..."
                  value=${novoDiaZoom.link}
                  onChange=${e => setNovoDiaZoom({ ...novoDiaZoom, link: e.target.value })}
                  className="w-full border rounded-lg px-2.5 py-2 bg-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg shadow-sm"
                >
                  + Adicionar Dia
                </button>
              </div>
            </form>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b">
                    <th className="p-2.5">Dia</th>
                    <th className="p-2.5">Horário</th>
                    <th className="p-2.5">Dirigente Designado</th>
                    <th className="p-2.5">Link da Sala do Zoom</th>
                    <th className="p-2.5">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  ${(zoomConfig?.dias || []).map(item => html`
                    <tr key=${item.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-extrabold text-indigo-900">
                        Dia ${String(item.dia).padStart(2, "0")}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value=${item.horario}
                          onChange=${e => {
                            const val = e.target.value;
                            setZoomConfig(prev => ({
                              ...prev,
                              dias: prev.dias.map(d =>
                                d.id === item.id ? { ...d, horario: val } : d
                              )
                            }));
                          }}
                          className="border rounded px-2 py-1 w-20 font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value=${item.dirigente}
                          onChange=${e => {
                            const val = e.target.value;
                            setZoomConfig(prev => ({
                              ...prev,
                              dias: prev.dias.map(d =>
                                d.id === item.id ? { ...d, dirigente: val } : d
                              )
                            }));
                          }}
                          className="border rounded px-2 py-1 font-semibold text-[#1e3a5f]"
                        >
                          ${usuarios
                            .filter(u => u.role !== "Particular")
                            .map(u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`)}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value=${item.link}
                          onChange=${e => {
                            const val = e.target.value;
                            setZoomConfig(prev => ({
                              ...prev,
                              dias: prev.dias.map(d =>
                                d.id === item.id ? { ...d, link: val } : d
                              )
                            }));
                          }}
                          className="border rounded px-2 py-1 w-full min-w-[200px]"
                        />
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick=${() =>
                            setZoomConfig(prev => ({
                              ...prev,
                              dias: prev.dias.filter(d => d.id !== item.id)
                            }))}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Remover ✕
                        </button>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#1e3a5f]">Gerenciar Campanha Especial</h3>
              <label className="flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked=${campanha.ativa}
                  onChange=${e => setCampanha({ ...campanha, ativa: e.target.checked })}
                />
                Exibir Aviso de Campanha na Tela Inicial e Dashboard
              </label>
              <input
                type="text"
                value=${campanha.nome}
                onChange=${e => setCampanha({ ...campanha, nome: e.target.value })}
                className="w-full border rounded p-2"
                placeholder="Nome da Campanha"
              />
              <textarea
                value=${campanha.observacao}
                onChange=${e => setCampanha({ ...campanha, observacao: e.target.value })}
                className="w-full border rounded p-2"
                rows="2"
              ></textarea>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#1e3a5f]">
                Cadastrar Usuário (Master, Dirigente ou Território Particular)
              </h3>
              <form onSubmit=${handleCadastrarUsuario} className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do Irmão"
                  value=${novoUsuario.nome}
                  onChange=${e => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  className="border rounded p-2 col-span-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Chave (Ex: PART20)"
                  value=${novoUsuario.chave}
                  onChange=${e => setNovoUsuario({ ...novoUsuario, chave: e.target.value })}
                  className="border rounded p-2 font-mono uppercase"
                  required
                />
                <select
                  value=${novoUsuario.role}
                  onChange=${e => setNovoUsuario({ ...novoUsuario, role: e.target.value })}
                  className="border rounded p-2 font-bold"
                >
                  <option value="Particular">Particular (Só Tela Inicial + Particular)</option>
                  <option value="Dirigente">Dirigente</option>
                  <option value="Ancião">Ancião</option>
                  <option value="Superintendente">Superintendente</option>
                  <option value="Master">Master</option>
                </select>
                <button
                  type="submit"
                  className="col-span-2 bg-emerald-600 text-white font-bold py-2 rounded"
                >
                  + Cadastrar Usuário
                </button>
              </form>

              <div className="max-h-48 overflow-y-auto space-y-1 pt-2 border-t">
                ${usuarios.map(
                  u => html`
                    <div key=${u.id} className="border rounded p-2 flex justify-between items-center">
                      <span>
                        <strong>${u.nome}</strong> (${u.role})
                      </span>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-blue-900">
                        ${u.chave}
                      </span>
                    </div>
                  `
                )}
              </div>
            </div>
          </div>
        </div>
      `}

      <!-- SEÇÃO 8: CONTROLE DE PENDÊNCIAS DE PREENCHIMENTO DOS DIRIGENTES -->
      ${adminSection === "pendencias" && html`
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-5 space-y-4 text-xs">
          <div className="flex flex-wrap justify-between items-start gap-3 border-b pb-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                Auditoria & Cobrança de Relatórios
              </span>
              <h3 className="font-extrabold text-base text-[#1e3a5f] mt-1">
                ⚠️ Dias Pendentes de Preenchimento de Quadras (${listasMensais[mesSelecionadoAdmin]?.mesNome}/${listasMensais[mesSelecionadoAdmin]?.ano})
              </h3>
              <p className="text-slate-500">
                Verifique quais dirigentes ainda não informaram as quadras trabalhadas em seus dias de saída e copie um lembrete pronto para enviar no WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border items-end">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Verificar pendências até o dia:
              </label>
              <select
                value=${diaCortePendencia}
                onChange=${e => setDiaCortePendencia(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 bg-white font-bold text-[#1e3a5f]"
              >
                ${Array.from({ length: 31 }, (_, i) => i + 1).map(
                  d => html`
                    <option key=${d} value=${d}>
                      Até o Dia ${String(d).padStart(2, "0")} de ${listasMensais[mesSelecionadoAdmin]?.mesNome}
                    </option>
                  `
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Filtrar por Dirigente:
              </label>
              <select
                value=${filtroDirigentePendencia}
                onChange=${e => setFiltroDirigentePendencia(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-white font-bold text-[#1e3a5f]"
              >
                <option value="TODOS">Todos os Dirigentes</option>
                ${usuarios
                  .filter(u => u.role !== "Particular")
                  .map(u => html`<option key=${u.id} value=${u.nome}>${u.nome}</option>`)}
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-950 font-semibold">
              💡 Quando o dirigente preenche o relatório na Tela Inicial ou na Área do Dirigente, o dia sai automaticamente desta lista de pendências!
            </div>
          </div>

          ${(() => {
            const pendenciasMes = [];
            const mesNomeAtual = listasMensais[mesSelecionadoAdmin]?.mesNome || "";

            programacaoAdmin.forEach(item => {
              if (item.dia > diaCortePendencia) return;

              if (item.tipo === "Grupos") {
                grupos.forEach(g => {
                  const infoGrupo = item.gruposRelatados?.[g.id];
                  if (!infoGrupo?.relatado) {
                    const resp = `${g.anciao} / ${g.ajudante}`;
                    if (
                      filtroDirigentePendencia === "TODOS" ||
                      resp.includes(filtroDirigentePendencia)
                    ) {
                      pendenciasMes.push({
                        chave: `dom-${item.dia}-grp-${g.id}`,
                        idDia: item.id,
                        dia: item.dia,
                        semana: item.semana,
                        hora: g.horario || item.hora,
                        tipoLabel: g.nome,
                        mapa: g.mapa,
                        saidaId: g.saidaId,
                        dirigente: resp,
                        isGrupo: true,
                        grupoId: g.id
                      });
                    }
                  }
                });
              } else if (!item.relatado) {
                if (
                  filtroDirigentePendencia === "TODOS" ||
                  item.dirigente === filtroDirigentePendencia
                ) {
                  pendenciasMes.push({
                    chave: `normal-${item.id}`,
                    idDia: item.id,
                    dia: item.dia,
                    semana: item.semana,
                    hora: item.hora,
                    tipoLabel: item.periodo || "Manhã",
                    mapa: item.mapa,
                    saidaId: item.saidaId,
                    dirigente: item.dirigente,
                    isGrupo: false,
                    grupoId: null
                  });
                }
              }
            });

            if (pendenciasMes.length === 0) {
              return html`
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-emerald-900 font-bold text-sm">
                  🎉 Nenhuma pendência encontrada até o dia ${String(diaCortePendencia).padStart(2, "0")}! Todos os relatórios foram preenchidos.
                </div>
              `;
            }

            return html`
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-red-700 text-sm">
                    🚨 Total de saídas sem preenchimento até o dia ${String(diaCortePendencia).padStart(2, "0")}: ${pendenciasMes.length}
                  </span>
                </div>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b">
                        <th className="p-2.5">Dia</th>
                        <th className="p-2.5">Horário / Grupo</th>
                        <th className="p-2.5">Local da Saída</th>
                        <th className="p-2.5">Mapa</th>
                        <th className="p-2.5">Dirigente Responsável</th>
                        <th className="p-2.5">Ações do Admin Master</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pendenciasMes.map(p => {
                        const localObj = saidas.find(s => s.id === Number(p.saidaId));
                        const textoCobranca = `Olá irmão ${p.dirigente}! Tudo bem? Notamos no sistema de territórios que o relatório de quadras trabalhadas do *Dia ${String(
                          p.dia
                        ).padStart(2, "0")}/${mesNomeAtual}* (${
                          p.semana
                        } às ${p.hora} - *Mapa ${p.mapa}*) ainda está pendente. Quando puder, poderia preencher lá no sistema ou me informar quais quadras foram feitas? Muito obrigado!`;

                        return html`
                          <tr key=${p.chave} className="border-b hover:bg-amber-50/40">
                            <td className="p-2.5 font-extrabold text-[#1e3a5f]">
                              Dia ${String(p.dia).padStart(2, "0")} (${p.semana})
                            </td>
                            <td className="p-2.5 font-semibold">
                              ${p.hora} • ${p.tipoLabel}
                            </td>
                            <td className="p-2.5">${localObj?.nome || "-"}</td>
                            <td className="p-2.5">
                              <span className="bg-[#1e3a5f] text-white font-bold px-2 py-0.5 rounded text-[11px]">
                                Mapa ${p.mapa}
                              </span>
                            </td>
                            <td className="p-2.5 font-extrabold text-red-800">
                              👤 ${p.dirigente}
                            </td>
                            <td className="p-2.5 flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick=${() => {
                                  navigator.clipboard?.writeText(textoCobranca);
                                  setMsgCopiadaId(p.chave);
                                  setTimeout(() => setMsgCopiadaId(null), 2500);
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-sm"
                              >
                                ${msgCopiadaId === p.chave
                                  ? "✅ Mensagem Copiada!"
                                  : "📲 Copiar Cobrança"}
                              </button>

                              <button
                                type="button"
                                onClick=${() => {
                                  const novosDias = programacaoAdmin.map(item => {
                                    if (item.id !== p.idDia) return item;
                                    if (p.isGrupo) {
                                      const gruposRelatados = {
                                        ...(item.gruposRelatados || {}),
                                        [p.grupoId]: {
                                          relatado: true,
                                          por: "Baixa pelo Admin",
                                          data: new Date().toLocaleDateString("pt-BR"),
                                          resumo: "Baixa manual pelo Admin Master"
                                        }
                                      };
                                      const todosFeitos = grupos.every(
                                        g => gruposRelatados[g.id]?.relatado
                                      );
                                      return { ...item, gruposRelatados, relatado: todosFeitos };
                                    }
                                    return {
                                      ...item,
                                      relatado: true,
                                      resumoRelatorio: "Baixa manual pelo Admin Master"
                                    };
                                  });

                                  setListasMensais(prev => ({
                                    ...prev,
                                    [mesSelecionadoAdmin]: {
                                      ...prev[mesSelecionadoAdmin],
                                      dias: novosDias
                                    }
                                  }));
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-sm"
                              >
                                ✓ Dar Baixa Manual
                              </button>
                            </td>
                          </tr>
                        `;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          })()}
        </div>
      `}
    </div>
  `;
}