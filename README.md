# 🗺️ Sistema de Gestão de Territórios — Congregação Arpoador

Plataforma web responsiva para gerenciamento de territórios de pregação, programação mensal de saídas de campo, controle de casas restritas (com alerta de aniversário de 1 ano — KM 6/94), dashboard estatístico e geração automatizada do formulário **S-13**.

## 🏗️ Arquitetura do Projeto

- **`/src/data`**: Dados sementes e mapeamento oficial dos 15 territórios e saídas.
- **`/src/services`**: Camada de abstração de banco de dados (`LocalStorage` ativo + suporte preparado para `Supabase`).
- **`/src/components`**: Módulos visuais independentes divididos por responsabilidade de negócio.
- **`/src/styles`**: Estilização auxiliar e regras `@media print` para exportação de PDFs.