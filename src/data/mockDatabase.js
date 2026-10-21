export const INITIAL_USERS = [
  { id: 1, nome: "Administrador Master", email: "admin@arpoador.org", chave: "MASTER1", role: "Master", privilegio: "Ancião" },
  { id: 2, nome: "Emerson Gomes", email: "emersongomes1610@gmail.com", chave: "EMER16", role: "Superintendente", privilegio: "Ancião" },
  { id: 3, nome: "Gilmarcos Sampaio", email: "gilmarcossampaio@gmail.com", chave: "GILM88", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 4, nome: "Antônio Xavier", email: "antonioxavier417@gmail.com", chave: "ANTX24", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 5, nome: "Paulo Tardivo", email: "paulotardivo@email.com", chave: "PAUL05", role: "Ancião", privilegio: "Ancião" },
  { id: 6, nome: "Mario Casimiro", email: "mariocasimiro@email.com", chave: "MARI06", role: "Dirigente", privilegio: "Ancião" },
  { id: 7, nome: "Davi Sampaio", email: "davisampaio@email.com", chave: "DAVI07", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 8, nome: "Artur Santos", email: "artursantos@email.com", chave: "ARTU08", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 9, nome: "Jailson Menezes", email: "jailson@email.com", chave: "JAIL09", role: "Dirigente", privilegio: "Publicador" },
  { id: 10, nome: "Luiz Pereira", email: "luizpereira@email.com", chave: "LUIZ10", role: "Dirigente", privilegio: "Ancião" },
  { id: 11, nome: "Maycon Nonato", email: "maycon@email.com", chave: "MAYC11", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 12, nome: "Odorico do Prado", email: "odorico@email.com", chave: "ODOR12", role: "Dirigente", privilegio: "Publicador" },
  { id: 13, nome: "Isac Menezes", email: "isac@email.com", chave: "ISAC13", role: "Dirigente", privilegio: "Servo Ministerial" },
  { id: 14, nome: "Hilário Santos", email: "hilario@email.com", chave: "HILA14", role: "Dirigente", privilegio: "Pioneiro" },
  { id: 15, nome: "Felipe Sabino", email: "felipe@email.com", chave: "FELI15", role: "Dirigente", privilegio: "Publicador" },
  { id: 16, nome: "Irmão Sebastião (Particular)", email: "sebastiao@email.com", chave: "PART16", role: "Particular", privilegio: "Publicador" }
];

export const INITIAL_TERRITORIOS = [
  { numero: "1", nome: "Itaóca Lado Praia I", totalQuadras: 35, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12], parciais: { "13": "Rua das Flores (feito apenas lado direito)" }, semMoradores: { "15": "Escola Municipal", "22": "Praça Pública" }, ultimaData: "01/06/2026", ultimoDirigente: "Antônio Xavier", ultimaObs: "Quadra 13 feita só metade por causa da chuva.", obsAnciao: "Atenção aos prédios de veraneio na Av. Monteiro Lobato.", rodada: 3, imagens: ["https://drive.google.com/uc?id=1yHtxTlYkZBaM47v8RO2ojt6oVM7rS23B"] },
  { numero: "2", nome: "Trevo Jussara Praia", totalQuadras: 28, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], parciais: {}, semMoradores: {}, ultimaData: "02/06/2026", ultimoDirigente: "Mario Casimiro", ultimaObs: "Bom apoio, moradores receptivos.", obsAnciao: "Iniciar sempre próximo à passarela.", rodada: 2, imagens: ["https://drive.google.com/uc?id=1LPAZ806GDBDgaSlnDpfcrHtpA3FZ3LHs"] },
  { numero: "3", nome: "Passarela UPA Praia", totalQuadras: 30, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], parciais: {}, semMoradores: { "4": "Prédio da UPA / Estacionamento" }, ultimaData: "08/06/2026", ultimoDirigente: "Paulo Tardivo", ultimaObs: "Faltam as quadras mais ao fundo.", obsAnciao: "Território comercial e residencial misto.", rodada: 4, imagens: ["https://drive.google.com/uc?id=1d0JGPUWoyVRC4xjH7GrIp-MN6DG-0aXy"] },
  { numero: "4", nome: "Balneário Itaóca Centro", totalQuadras: 40, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22], parciais: { "23": "Av. Monteiro Lobato lado par" }, semMoradores: {}, ultimaData: "10/06/2026", ultimoDirigente: "Jailson Menezes", ultimaObs: "Quadra 23 ficou pendente o lado ímpar.", obsAnciao: "Mapa dividido em 2 imagens (Parte 1 e Parte 2).", rodada: 3, imagens: ["https://drive.google.com/uc?id=1LDZTXC1DiTuTbqhSIBWt7R-KQ8hQMBpn", "https://drive.google.com/uc?id=1kgtzSiRQdcJUWkbKwnTzxvvkVS5OwdvT"] },
  { numero: "5", nome: "Vila Atlântica", totalQuadras: 25, trabalhadas: [1,2,3,4,5], parciais: {}, semMoradores: {}, ultimaData: "20/05/2026", ultimoDirigente: "Gilmarcos Sampaio", ultimaObs: "Início de nova rodada.", obsAnciao: "Verificar campainhas sem identificação.", rodada: 2, imagens: ["https://drive.google.com/uc?id=1JbWdCuGNPcp051q6edxHC8ZhMPrFavCW"] },
  { numero: "6", nome: "Monteiro Lobato Sul", totalQuadras: 32, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], parciais: {}, semMoradores: {}, ultimaData: "11/06/2026", ultimoDirigente: "Luiz Pereira", ultimaObs: "Trabalhado até a quadra 18.", obsAnciao: "Muito movimento aos domingos.", rodada: 3, imagens: ["https://drive.google.com/uc?id=11NNfNxY5TgRsNspiPhXU435xZOu4VUVg"] },
  { numero: "7", nome: "Jardim Aimorés", totalQuadras: 30, trabalhadas: [1,2,3,4,5,6,7,8,9], parciais: {}, semMoradores: {}, ultimaData: "28/05/2026", ultimoDirigente: "Antônio Xavier", ultimaObs: "Ruas tranquilas pela manhã.", obsAnciao: "Atenção à saída na quadra 27.", rodada: 2, imagens: ["https://drive.google.com/uc?id=1KQuZ6pYYUx7Ams1KBq2iNM68kwf1Y4YH"] },
  { numero: "8", nome: "Ubatuba / Olga", totalQuadras: 26, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12], parciais: {}, semMoradores: {}, ultimaData: "04/06/2026", ultimoDirigente: "Davi Sampaio", ultimaObs: "Boa receptividade no período da tarde.", obsAnciao: "Priorizar trabalho à tarde.", rodada: 3, imagens: ["https://drive.google.com/uc?id=1Lr-d4_Bpog9lgPs-1sK9IiALR6T5AjPw"] },
  { numero: "9", nome: "Arpoador Central", totalQuadras: 34, trabalhadas: [1,2,3,4,5,6,7,8,9,10], parciais: {}, semMoradores: {}, ultimaData: "25/05/2026", ultimoDirigente: "Odorico do Prado", ultimaObs: "Quadras 1 a 10 concluídas.", obsAnciao: "Saída próxima à casa do irmão Paulo Tardivo.", rodada: 2, imagens: ["https://drive.google.com/uc?id=1Hg7FjUYW2HbPxGjzo2i0vv_ZWQ2wDeI-"] },
  { numero: "10", nome: "São Jorge / Divisa", totalQuadras: 38, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14], parciais: {}, semMoradores: {}, ultimaData: "24/05/2026", ultimoDirigente: "Mario Casimiro", ultimaObs: "Ótimo campo de domingo.", obsAnciao: "Possui 2 partes de imagem.", rodada: 1, imagens: ["https://drive.google.com/uc?id=1Fptj8U21TaIv6tnUoDBJILp-3xuKHSfE", "https://drive.google.com/uc?id=15WBSRkS-p2rVybvI9LIRKI6m2y6lbHvT"] },
  { numero: "11", nome: "Santa Eunice Interior", totalQuadras: 28, trabalhadas: [1,2,3,4,5,6], parciais: { "7": "Rua Santa Eunice de esquina até o nº 500" }, semMoradores: { "12": "Escola Estadual", "19": "Supermercado / Estacionamento" }, ultimaData: "12/06/2026", ultimoDirigente: "Antônio Xavier", ultimaObs: "Continuar da quadra 7 (faltou do 502 em diante).", obsAnciao: "Ficar atento quando a saída for no Mapa 3.", rodada: 3, imagens: ["https://drive.google.com/uc?id=1aZlnS5rkBoOs6iZ1SUTaMwAjgTTYG68y"] },
  { numero: "12", nome: "Regina Maria / Santa Cecília", totalQuadras: 36, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], parciais: {}, semMoradores: {}, ultimaData: "06/06/2026", ultimoDirigente: "Antônio Xavier", ultimaObs: "Feitas quadras 10 a 16.", obsAnciao: "Mapa amplo com 2 imagens.", rodada: 2, imagens: ["https://drive.google.com/uc?id=180n6ReGbPW7hWPkHA0exylL2MdgXYRo1", "https://drive.google.com/uc?id=1sb00DL6XbuDcoTEZDgmTsmRIax6gHtc0"] },
  { numero: "13", nome: "José Bonifácio", totalQuadras: 24, trabalhadas: [1,2,3,4,5,6,7,8], parciais: {}, semMoradores: {}, ultimaData: "16/05/2026", ultimoDirigente: "Paulo Tardivo", ultimaObs: "Moradores atenciosos.", obsAnciao: "Saída habitual na Quadra 4.", rodada: 3, imagens: ["https://drive.google.com/uc?id=1eYY-gUOZs9zcaGT0ZVynlHpkIXqUDj6B"] },
  { numero: "14", nome: "Rural São Vicente / Birigui II", totalQuadras: 20, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11,12], parciais: {}, semMoradores: {}, ultimaData: "23/05/2026", ultimoDirigente: "Gilmarcos Sampaio", ultimaObs: "Estradas secas, bom acesso.", obsAnciao: "Território Rural - recomendável ir de carro.", rodada: 1, imagens: ["https://drive.google.com/uc?id=1mNBbzS7P2dU2llpw9Ysviq_O-ECfwSck"] },
  { numero: "15", nome: "Balneário Jussara Norte", totalQuadras: 30, trabalhadas: [1,2,3,4,5,6,7,8,9,10,11], parciais: {}, semMoradores: {}, ultimaData: "19/05/2026", ultimoDirigente: "Felipe Sabino", ultimaObs: "Trabalhadas quadras próximas à Av. Jussara.", obsAnciao: "Cuidado com cães soltos na quadra 15.", rodada: 2, imagens: ["https://drive.google.com/uc?id=1eQOdLggsRkFFtA5KIg8st0FYRowicOFj"] }
];

export const INITIAL_SAIDAS = [
  { id: 1, nome: "Trevo Itaoca Lado Praia", endereco: "Avenida Tiradentes, 7431. Frente a Imobiliária Patucci", mapaLocal: "1", quadraLocal: "1" },
  { id: 2, nome: "Trevo Jussara Lado Praia", endereco: "Avenida José Jacoub Seckler, 8025. Casa de Esquina. Frente a passarela.", mapaLocal: "2", quadraLocal: "1" },
  { id: 3, nome: "Passarela Upa Lado Praia", endereco: "Avenida Tiradentes, 8797.", mapaLocal: "3", quadraLocal: "3" },
  { id: 4, nome: "Trevo Agenor Lado Praia", endereco: "Nossa Senhora de Fátima, 200. Lado Praia.", mapaLocal: "3", quadraLocal: "15" },
  { id: 5, nome: "Casa Irmão Vanderlei Barbosa", endereco: "Rua Aimorés, 801.", mapaLocal: "7", quadraLocal: "27" },
  { id: 6, nome: "Casa do Irmão Marcos Fonseca", endereco: "Rua Santa Eunice, 786.", mapaLocal: "3", quadraLocal: "8" },
  { id: 7, nome: "Casa Irmão Reinaldo Assis", endereco: "Avenida Jussara, 1193, Balneário Jussara.", mapaLocal: "15", quadraLocal: "5" },
  { id: 8, nome: "Casa Irmão Paulo Tardivo", endereco: "Avenida Arpoador, 2607.", mapaLocal: "9", quadraLocal: "10" },
  { id: 9, nome: "Território Rural São Vicente", endereco: "Rua São Lourenço, 343, Jardim Birigui II.", mapaLocal: "14", quadraLocal: "1" },
  { id: 10, nome: "Casa Irmão Marcelo Nonato", endereco: "Rua 5A, 119, Regina Maria.", mapaLocal: "12", quadraLocal: "12" },
  { id: 11, nome: "Casa Irmão Luiz Pereira", endereco: "Avenida Monteiro Lobato, 9158. (Imobiliária Amélia)", mapaLocal: "6", quadraLocal: "4" },
  { id: 12, nome: "Casa Irmã Vera Nice Rezende", endereco: "Rua José Bonifácio, 2870.", mapaLocal: "13", quadraLocal: "4" },
  { id: 13, nome: "Casa Irmã Amália Martins", endereco: "Avenida Santa Cecília, 1951.", mapaLocal: "12", quadraLocal: "6" },
  { id: 14, nome: "Casa Irmã Elza Fernandes", endereco: "Rua Santa Eunice, 2121.", mapaLocal: "12", quadraLocal: "18" },
  { id: 15, nome: "Casa Irmã Olga Gato", endereco: "R. Ubatuba, 810.", mapaLocal: "8", quadraLocal: "5" },
  { id: 16, nome: "Depósito Lucimar", endereco: "Av. Monteiro Lobato, 7944 - Balneário Itaóca.", mapaLocal: "4", quadraLocal: "2" },
  { id: 17, nome: "Casa Irmã Luiza Anjos", endereco: "R. São Jorge, 1901.", mapaLocal: "10", quadraLocal: "8" },
  { id: 18, nome: "Imobiliária Carlão", endereco: "Av. Monteiro Lobato, 8202 - Balneário Itaóca.", mapaLocal: "4", quadraLocal: "14" },
  { id: 19, nome: "Casa Irmão Jailson Menezes", endereco: "Balneário Itaóca - Próximo à Av. Monteiro Lobato", mapaLocal: "4", quadraLocal: "9" }
];

export const INITIAL_RESTRICOES = [
  { id: 1, mapa: "1", rua: "Av. Tiradentes", numero: "7510", data: "12/05/2025", status: "Aniversário 1 Ano - Revisitar" },
  { id: 2, mapa: "3", rua: "Rua Santa Eunice", numero: "412", data: "10/01/2026", status: "Ativa" },
  { id: 3, mapa: "4", rua: "Av. Monteiro Lobato", numero: "8105", data: "19/04/2025", status: "Aniversário 1 Ano - Revisitar" },
  { id: 4, mapa: "11", rua: "Rua São Pedro", numero: "98", data: "14/02/2026", status: "Ativa" },
  { id: 5, mapa: "12", rua: "Av. Santa Cecília", numero: "1890", data: "03/03/2026", status: "Ativa" }
];

export const INITIAL_GRUPOS = [
  {
    id: 1,
    nome: "Grupo 1 - Itaóca",
    anciao: "Paulo Tardivo",
    ajudante: "Antônio Xavier",
    mapa: "1",
    saidaId: 1,
    horario: "09:00",
    saidaProvisoriaAtiva: true,
    saidaProvisoriaNome: "Salão do Reino (Saída Provisória)",
    saidaProvisoriaEndereco: "Av. Monteiro Lobato, 7500 - Itaóca",
    saidaProvisoriaQuadra: "3",
    visitaSupGrupos: true,
    visitaSupGruposObs: "Reunião rápida com o grupo às 08:50 antes da saída."
  },
  {
    id: 2,
    nome: "Grupo 2 - Jussara",
    anciao: "Mario Casimiro",
    ajudante: "Gilmarcos Sampaio",
    mapa: "2",
    saidaId: 2,
    horario: "09:00",
    saidaProvisoriaAtiva: false,
    saidaProvisoriaNome: "",
    saidaProvisoriaEndereco: "",
    saidaProvisoriaQuadra: "",
    visitaSupGrupos: false,
    visitaSupGruposObs: ""
  },
  {
    id: 3,
    nome: "Grupo 3 - Centro / Arpoador",
    anciao: "Luiz Pereira",
    ajudante: "Davi Sampaio",
    mapa: "6",
    saidaId: 11,
    horario: "09:00",
    saidaProvisoriaAtiva: false,
    saidaProvisoriaNome: "",
    saidaProvisoriaEndereco: "",
    saidaProvisoriaQuadra: "",
    visitaSupGrupos: false,
    visitaSupGruposObs: ""
  },
  {
    id: 4,
    nome: "Grupo 4 - Santa Cecília",
    anciao: "Emerson Gomes",
    ajudante: "Isac Menezes",
    mapa: "12",
    saidaId: 13,
    horario: "09:00",
    saidaProvisoriaAtiva: false,
    saidaProvisoriaNome: "",
    saidaProvisoriaEndereco: "",
    saidaProvisoriaQuadra: "",
    visitaSupGrupos: false,
    visitaSupGruposObs: ""
  }
];

export const INITIAL_LISTAS_MENSAIS = {
  "2026-05": {
    id: "2026-05", mesNome: "Maio", ano: "2026", status: "Concluída (Histórico)",
    dias: [
      { id: 501, dia: 1, semana: "Sexta", periodo: "Manhã", saidaId: 1, mapa: "1", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 502, dia: 10, semana: "DOMINGO", periodo: "Manhã", saidaId: 0, mapa: "GRUPOS", hora: "09:00", dirigente: "GRUPOS", tipo: "Grupos", confirmacao: "Confirmado", relatado: true },
      { id: 503, dia: 13, semana: "Quarta", periodo: "Manhã", saidaId: 18, mapa: "4", hora: "09:00", dirigente: "Isac Menezes", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 504, dia: 20, semana: "Quarta", periodo: "Manhã", saidaId: 14, mapa: "5", hora: "09:00", dirigente: "Gilmarcos Sampaio", tipo: "Normal", confirmacao: "Confirmado", relatado: true }
    ]
  },
  "2026-06": {
    id: "2026-06", mesNome: "Junho", ano: "2026", status: "Vigente (Ativa na Tela Inicial)",
    dias: [
      { id: 1, dia: 1, semana: "Segunda", periodo: "Manhã", saidaId: 1, mapa: "1", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Confirmado", relatado: true, zoomDirigente: "Antônio Xavier" },
      { id: 2, dia: 2, semana: "Terça", periodo: "Manhã", saidaId: 2, mapa: "2", hora: "09:00", dirigente: "Mario Casimiro", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 3, dia: 3, semana: "Quarta", periodo: "Manhã", saidaId: 3, mapa: "3", hora: "09:00", dirigente: "Paulo Tardivo", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 4, dia: 4, semana: "Quinta", periodo: "Tarde", saidaId: 15, mapa: "8", hora: "16:00", dirigente: "Davi Sampaio", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 5, dia: 5, semana: "Sexta", periodo: "Tarde", saidaId: 14, mapa: "12", hora: "16:00", dirigente: "Gilmarcos Sampaio", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 6, dia: 6, semana: "Sábado", periodo: "Manhã", saidaId: 13, mapa: "12", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 7, dia: 7, semana: "DOMINGO", periodo: "Manhã", saidaId: 11, mapa: "6", hora: "09:00", dirigente: "Artur Santos", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 8, dia: 8, semana: "Segunda", periodo: "Manhã", saidaId: 3, mapa: "3", hora: "09:00", dirigente: "Paulo Tardivo", tipo: "Normal", confirmacao: "Confirmado", relatado: true, zoomDirigente: "Isac Menezes" },
      { id: 9, dia: 9, semana: "Terça", periodo: "Manhã", saidaId: 16, mapa: "4", hora: "09:00", dirigente: "Mario Casimiro", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 10, dia: 10, semana: "Quarta", periodo: "Manhã", saidaId: 19, mapa: "4", hora: "09:00", dirigente: "Jailson Menezes", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 11, dia: 11, semana: "Quinta", periodo: "Tarde", saidaId: 11, mapa: "6", hora: "16:00", dirigente: "Luiz Pereira", tipo: "Normal", confirmacao: "Confirmado", relatado: true },
      { id: 12, dia: 12, semana: "Sexta", periodo: "Tarde", saidaId: 6, mapa: "11", hora: "16:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 13, dia: 13, semana: "Sábado", periodo: "Manhã", saidaId: 10, mapa: "12", hora: "09:00", dirigente: "Maycon Nonato", tipo: "Normal", confirmacao: "Pendente", relatado: false },
      { id: 14, dia: 14, semana: "DOMINGO", periodo: "Manhã", saidaId: 0, mapa: "GRUPOS", hora: "09:00", dirigente: "GRUPOS", tipo: "Grupos", confirmacao: "Confirmado", relatado: false },
      { id: 15, dia: 15, semana: "Segunda", periodo: "Tarde", saidaId: 8, mapa: "9", hora: "16:00", dirigente: "Odorico do Prado", tipo: "Normal", confirmacao: "Pendente", relatado: false, zoomDirigente: "Antônio Xavier" },
      { id: 16, dia: 16, semana: "Terça", periodo: "Manhã", saidaId: 12, mapa: "13", hora: "09:00", dirigente: "Paulo Tardivo", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 17, dia: 17, semana: "Quarta", periodo: "Manhã", saidaId: 7, mapa: "15", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Pendente", relatado: false },
      { id: 18, dia: 18, semana: "Quinta", periodo: "Tarde", saidaId: 17, mapa: "11", hora: "16:00", dirigente: "Isac Menezes", tipo: "Normal", confirmacao: "Recusado", relatado: false },
      { id: 19, dia: 19, semana: "Sexta", periodo: "Tarde", saidaId: 15, mapa: "8", hora: "16:00", dirigente: "Hilário Santos", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 20, dia: 20, semana: "Sábado", periodo: "Manhã", saidaId: 12, mapa: "13", hora: "09:00", dirigente: "Gilmarcos Sampaio", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 21, dia: 21, semana: "DOMINGO", periodo: "Manhã", saidaId: 17, mapa: "10", hora: "09:00", dirigente: "Mario Casimiro", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 22, dia: 22, semana: "Segunda", periodo: "Manhã", saidaId: 7, mapa: "15", hora: "09:00", dirigente: "Felipe Sabino", tipo: "Normal", confirmacao: "Pendente", relatado: false, zoomDirigente: "Isac Menezes" },
      { id: 23, dia: 23, semana: "Terça", periodo: "Manhã", saidaId: 11, mapa: "7", hora: "09:00", dirigente: "Luiz Pereira", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 24, dia: 24, semana: "Quarta", periodo: "Manhã", saidaId: 5, mapa: "7", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 25, dia: 25, semana: "Quinta", periodo: "Tarde", saidaId: 19, mapa: "4", hora: "16:00", dirigente: "Isac Menezes", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 26, dia: 26, semana: "Sexta", periodo: "Tarde", saidaId: 18, mapa: "4", hora: "16:00", dirigente: "Hilário Santos", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 27, dia: 27, semana: "Sábado", periodo: "Manhã", saidaId: 9, mapa: "14", hora: "09:00", dirigente: "Gilmarcos Sampaio", tipo: "Normal", confirmacao: "Confirmado", relatado: false },
      { id: 28, dia: 28, semana: "DOMINGO", periodo: "Manhã", saidaId: 0, mapa: "GRUPOS", hora: "09:00", dirigente: "GRUPOS", tipo: "Grupos", confirmacao: "Confirmado", relatado: false },
      { id: 29, dia: 29, semana: "Segunda", periodo: "Manhã", saidaId: 18, mapa: "4", hora: "09:00", dirigente: "Odorico do Prado", tipo: "Normal", confirmacao: "Pendente", relatado: false, zoomDirigente: "Antônio Xavier" },
      { id: 30, dia: 30, semana: "Terça", periodo: "Manhã", saidaId: 4, mapa: "3", hora: "09:00", dirigente: "Artur Santos", tipo: "Normal", confirmacao: "Confirmado", relatado: false }
    ]
  },
  "2026-07": {
    id: "2026-07", mesNome: "Julho", ano: "2026", status: "Rascunho (Próximo Mês)",
    dias: [
      { id: 701, dia: 1, semana: "Quarta", periodo: "Manhã", saidaId: 1, mapa: "1", hora: "09:00", dirigente: "Antônio Xavier", tipo: "Normal", confirmacao: "Pendente", relatado: false },
      { id: 702, dia: 2, semana: "Quinta", periodo: "Tarde", saidaId: 2, mapa: "2", hora: "16:00", dirigente: "Mario Casimiro", tipo: "Normal", confirmacao: "Pendente", relatado: false },
      { id: 703, dia: 5, semana: "DOMINGO", periodo: "Manhã", saidaId: 0, mapa: "GRUPOS", hora: "09:00", dirigente: "GRUPOS", tipo: "Grupos", confirmacao: "Pendente", relatado: false }
    ]
  }
};

export const INITIAL_S13 = Array.from({ length: 15 }, (_, i) => {
  const num = String(i + 1);
  return {
    territorio: num,
    ultimaConclusao: "10/01/2026",
    colunas: [
      { dirigente: "Antônio Xavier", inicio: "15/02/2026", fim: "15/02/2026" },
      { dirigente: "Paulo Tardivo", inicio: "22/03/2026", fim: "22/03/2026" },
      { dirigente: "Isac Menezes", inicio: "13/05/2026", fim: "13/05/2026" },
      { dirigente: "", inicio: "", fim: "" }
    ]
  };
});

export const INITIAL_PARTICULARES = [
  {
    id: 1,
    usuarioNome: "Irmão Sebastião (Particular)",
    mapa: "11",
    quadras: [8, 9],
    endereco: "Rua Santa Eunice, próximo ao nº 620 (Quadras planas próximas à residência do irmão)",
    imagemUrl: "https://drive.google.com/uc?id=1aZlnS5rkBoOs6iZ1SUTaMwAjgTTYG68y",
    dataDesignacao: "01/06/2026",
    concluidas: {}
  }
];