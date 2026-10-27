import {
  INITIAL_USERS,
  INITIAL_TERRITORIOS,
  INITIAL_SAIDAS,
  INITIAL_RESTRICOES,
  INITIAL_GRUPOS,
  INITIAL_LISTAS_MENSAIS,
  INITIAL_S13
} from "../data/mockDatabase.js";

const INITIAL_PARTICULARES = [
  {
    id: 501,
    usuarioNome: "Roberto Almeida",
    mapa: "11",
    quadras: [8, 9],
    endereco: "Rua Santa Eunice, 620 (Próximo à praça)",
    imagemUrl: "https://drive.google.com/uc?export=view&id=11h3dBSd1sV9hGPr-uY6-cW61L-cR9_kK",
    dataDesignacao: "01/06/2026",
    concluidas: {}
  }
];

const INITIAL_ZOOM_CONFIG = {
  linkPadrao: "https://zoom.us/j/1234567890",
  horarioPadrao: "09:30",
  dias: [
    { id: 1, dia: 1, horario: "09:30", dirigente: "Antônio Xavier", link: "https://zoom.us/j/1234567890" },
    { id: 2, dia: 8, horario: "09:30", dirigente: "Isac Menezes", link: "https://zoom.us/j/1234567890" },
    { id: 3, dia: 15, horario: "09:30", dirigente: "Antônio Xavier", link: "https://zoom.us/j/1234567890" },
    { id: 4, dia: 22, horario: "09:30", dirigente: "Isac Menezes", link: "https://zoom.us/j/1234567890" },
    { id: 5, dia: 29, horario: "09:30", dirigente: "Antônio Xavier", link: "https://zoom.us/j/1234567890" }
  ]
};

export const StorageService = {
  KEYS: {
    USERS: "arp_users_v4",
    TERRITORIOS: "arp_territorios_v4",
    SAIDAS: "arp_saidas_v4",
    RESTRICOES: "arp_restricoes_v4",
    GRUPOS: "arp_grupos_v4",
    LISTAS: "arp_listas_v4",
    S13: "arp_s13_v4",
    MES_VIGENTE: "arp_mes_vigente_v4",
    PARTICULARES: "arp_particulares_v4",
    ZOOM: "arp_zoom_v4"
  },

  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("Erro ao carregar localStorage:", e);
      return fallback;
    }
  },

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Erro ao salvar localStorage:", e);
    }
  },

  getInitialState() {
    return {
      usuarios: this.load(this.KEYS.USERS, INITIAL_USERS),
      territorios: this.load(this.KEYS.TERRITORIOS, INITIAL_TERRITORIOS),
      saidas: this.load(this.KEYS.SAIDAS, INITIAL_SAIDAS),
      restricoes: this.load(this.KEYS.RESTRICOES, INITIAL_RESTRICOES),
      grupos: this.load(this.KEYS.GRUPOS, INITIAL_GRUPOS),
      listasMensais: this.load(this.KEYS.LISTAS, INITIAL_LISTAS_MENSAIS),
      s13Data: this.load(this.KEYS.S13, INITIAL_S13),
      mesVigenteId: this.load(this.KEYS.MES_VIGENTE, "2026-06"),
      particulares: this.load(this.KEYS.PARTICULARES, INITIAL_PARTICULARES),
      zoomConfig: this.load(this.KEYS.ZOOM, INITIAL_ZOOM_CONFIG)
    };
  }
};