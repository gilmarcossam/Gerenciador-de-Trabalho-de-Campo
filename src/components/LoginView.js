import React from "https://esm.sh/react@18.2.0";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

export function LoginView({
  chaveInput,
  setChaveInput,
  loginError,
  onLogin,
  onVisitorAccess,
  onQuickUser
}) {
  return html`
    <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h1 className="text-xl font-bold text-[#1e3a5f] text-center">CONGREGAÇÃO ARPOADOR</h1>
        <p className="text-xs text-slate-500 text-center mb-5">
          Sistema de Gestão de Territórios de Pregação
        </p>

        <form onSubmit=${onLogin} className="space-y-3">
          <input
            type="text"
            value=${chaveInput}
            onChange=${e => setChaveInput(e.target.value)}
            placeholder="Chave de Acesso (Ex: MASTER1, ANTX24)"
            className="w-full px-3 py-2.5 border rounded-lg font-mono uppercase text-sm"
          />
          ${loginError && html`<p className="text-xs text-red-600 font-bold">${loginError}</p>`}
          <button
            type="submit"
            className="w-full bg-[#24558f] hover:bg-[#1e3a5f] text-white font-bold py-2.5 rounded-lg text-sm"
          >
            Entrar com Chave
          </button>
        </form>

        <button
          onClick=${onVisitorAccess}
          className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg text-sm border"
        >
          Acessar Tela Inicial (Modo Visitante)
        </button>

        <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
          <button
            onClick=${() => onQuickUser(0)}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded font-bold"
          >
            Atalho: Master
          </button>
          <button
            onClick=${() => onQuickUser(3)}
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded font-bold"
          >
            Atalho: Dirigente (Antônio)
          </button>
        </div>
      </div>
    </div>
  `;
}