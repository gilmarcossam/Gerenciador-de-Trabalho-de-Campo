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
      <div className="max-w-6xl mx-auto px-3 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-sm sm:text-base leading-tight tracking-wide">
            CONGREGAÇÃO ARPOADOR
          </h1>
          <p className="text-[11px] text-blue-200">
            Mês Vigente: ${mesVigenteInfo?.mesNome}/${mesVigenteInfo?.ano}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#2c5282] px-2.5 py-1 rounded font-semibold">
            ${currentUser ? `${currentUser.nome} (${currentUser.role})` : "Visitante"}
          </span>
          <button
            onClick=${onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="bg-[#24558f] border-t border-blue-800">
        <div className="max-w-6xl mx-auto px-2 flex overflow-x-auto text-xs font-semibold">
          <button
            onClick=${() => setActiveTab("home")}
            className=${`px-3 py-2.5 whitespace-nowrap border-b-2 ${
              activeTab === "home"
                ? "border-white text-white bg-white/10"
                : "border-transparent text-blue-100"
            }`}
          >
            🗺️ Território do Dia
          </button>

          ${currentUser && (isParticularOnly || temParticular || currentUser.role === "Master") && html`
            <button
              onClick=${() => setActiveTab("particular")}
              className=${`px-3 py-2.5 whitespace-nowrap border-b-2 ${
                activeTab === "particular"
                  ? "border-white text-white bg-white/10"
                  : "border-transparent text-blue-100"
              }`}
            >
              🏠 Meu Território Particular
            </button>
          `}

          ${currentUser && !isParticularOnly && html`
            <button
              onClick=${() => setActiveTab("dirigente")}
              className=${`px-3 py-2.5 whitespace-nowrap border-b-2 ${
                activeTab === "dirigente"
                  ? "border-white text-white bg-white/10"
                  : "border-transparent text-blue-100"
              }`}
            >
              👤 Área do Dirigente
            </button>
            <button
              onClick=${() => setActiveTab("dashboard")}
              className=${`px-3 py-2.5 whitespace-nowrap border-b-2 ${
                activeTab === "dashboard"
                  ? "border-white text-white bg-white/10"
                  : "border-transparent text-blue-100"
              }`}
            >
              📊 Dashboard (${percentualGeral}%)
            </button>
          `}

          ${isAdminOrSup && !isParticularOnly && html`
            <button
              onClick=${() => setActiveTab("admin")}
              className=${`px-3 py-2.5 whitespace-nowrap border-b-2 ${
                activeTab === "admin"
                  ? "border-white text-white bg-white/10"
                  : "border-transparent text-blue-100"
              }`}
            >
              ⚙️ Administração & S-13
            </button>
          `}
        </div>
      </div>
    </header>
  `;
}