import React from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function Header({
  currentUser,
  mesVigenteInfo,
  activeTab,
  setActiveTab,
  percentualGeral,
  isAdminOrSup,
  temParticular,
  onLogout
}) {
  const isParticularOnly = currentUser?.role === "Particular";

  return html`
    <header className="bg-[#1e3a5f] text-white shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between gap-2">
        <div>
          <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide">
            CONGREGAÇÃO ARPOADOR
          </h1>
          <p className="text-[11px] text-blue-200">
            Mês Vigente: ${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs bg-[#2c5282] px-2.5 py-1 rounded font-semibold truncate max-w-[150px] sm:max-w-none">
            ${currentUser ? `${currentUser.nome} (${currentUser.role})` : "Visitante"}
          </span>
          <button
            onClick=${onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition shrink-0"
          >
            Sair
          </button>
        </div>
      </div>

      <!-- Barra de Abas Responsiva: No celular quebra em 2 linhas organizadas para nenhuma aba sumir! -->
      <div className="bg-[#24558f] border-t border-blue-800">
        <div className="max-w-6xl mx-auto px-2 py-1 flex flex-wrap items-center gap-1 text-xs font-semibold">
          <button
            onClick=${() => setActiveTab("home")}
            className=${`px-2.5 py-2 rounded-lg transition ${
              activeTab === "home"
                ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                : "text-blue-100 hover:bg-white/10"
            }`}
          >
            🗺️ Território do Dia
          </button>

          <button
            onClick=${() => setActiveTab("calendario")}
            className=${`px-2.5 py-2 rounded-lg transition ${
              activeTab === "calendario"
                ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                : "text-blue-100 hover:bg-white/10"
            }`}
          >
            📅 Lista do Mês
          </button>

          ${currentUser && (isParticularOnly || temParticular || currentUser.role === "Master") && html`
            <button
              onClick=${() => setActiveTab("particular")}
              className=${`px-2.5 py-2 rounded-lg transition ${
                activeTab === "particular"
                  ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              🏠 Território Particular
            </button>
          `}

          ${currentUser && !isParticularOnly && html`
            <button
              onClick=${() => setActiveTab("dirigente")}
              className=${`px-2.5 py-2 rounded-lg transition ${
                activeTab === "dirigente"
                  ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              👤 Área do Dirigente
            </button>
            <button
              onClick=${() => setActiveTab("dashboard")}
              className=${`px-2.5 py-2 rounded-lg transition ${
                activeTab === "dashboard"
                  ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              📊 Dashboard (${percentualGeral}%)
            </button>
          `}

          ${isAdminOrSup && !isParticularOnly && html`
            <button
              onClick=${() => setActiveTab("admin")}
              className=${`px-2.5 py-2 rounded-lg transition ${
                activeTab === "admin"
                  ? "bg-white text-[#1e3a5f] font-extrabold shadow-sm"
                  : "text-blue-100 hover:bg-white/10"
              }`}
            >
              ⚙️ Admin & S-13
            </button>
          `}
        </div>
      </div>
    </header>
  `;
}