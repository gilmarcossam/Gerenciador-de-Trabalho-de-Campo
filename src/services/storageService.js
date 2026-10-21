import {
  INITIAL_USERS,
  INITIAL_TERRITORIOS,
  INITIAL_SAIDAS,
  INITIAL_RESTRICOES,
  INITIAL_GRUPOS,
  INITIAL_LISTAS_MENSAIS,
  INITIAL_S13,
  INITIAL_PARTICULARES
} from "../data/mockDatabase.js";

const STORAGE_KEYS = {
  USERS: "arpoador_users_v3",
  TERRITORIOS: "arpoador_territorios_v4",
  SAIDAS: "arpoador_saidas_v2",
  RESTRICOES: "arpoador_restricoes_v2",
  GRUPOS: "arpoador_grupos_v3",
  LISTAS: "arpoador_listas_v2",
  S13: "arpoador_s13_v2",
  MES_VIGENTE: "arpoador_mes_vigente_v2",
  PARTICULARES: "arpoador_particulares_v1"
};

export const StorageService = {
  load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error("Erro ao salvar estado local:", err);
    }
  },
  getInitialState() {
    return {
      usuarios: this.load(STORAGE_KEYS.USERS, INITIAL_USERS),
      territorios: this.load(STORAGE_KEYS.TERRITORIOS, INITIAL_TERRITORIOS),
      saidas: this.load(STORAGE_KEYS.SAIDAS, INITIAL_SAIDAS),
      restricoes: this.load(STORAGE_KEYS.RESTRICOES, INITIAL_RESTRICOES),
      grupos: this.load(STORAGE_KEYS.GRUPOS, INITIAL_GRUPOS),
      listasMensais: this.load(STORAGE_KEYS.LISTAS, INITIAL_LISTAS_MENSAIS),
      s13Data: this.load(STORAGE_KEYS.S13, INITIAL_S13),
      mesVigenteId: this.load(STORAGE_KEYS.MES_VIGENTE, "2026-06"),
      particulares: this.load(STORAGE_KEYS.PARTICULARES, INITIAL_PARTICULARES)
    };
  },
  KEYS: STORAGE_KEYS
};