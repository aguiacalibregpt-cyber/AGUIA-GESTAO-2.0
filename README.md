# AGUIA GESTAO 2.0

Versao robusta e modernizada do sistema original, preservando a base funcional e mantendo compatibilidade com o banco existente.

## Objetivos atendidos

- Reproducao das funcionalidades da base original (cadastros, processos, backup, seguranca, relatorios).
- Compatibilidade total com banco atual (`server/data/db.json`), sem migracao obrigatoria.
- Evolucao da persistencia com validacao, escrita atomica e integridade de backup.
- Modernizacao das interfaces com novos modulos e navegacao ampliada.
- Preservacao integral das rotas e recursos existentes.

## Modulos

- Dashboard
- Pessoas
- Processos
- Vendas (novo)
- Eventos (novo)
- Relatorios (novo)
- Configuracoes e Backup

## Persistencia e compatibilidade

O backend continua aceitando o formato legado e agora suporta chaves adicionais sem quebrar bancos antigos.

Estrutura base (`db.json`):

```json
{
	"pessoas": [],
	"processos": [],
	"documentosProcesso": [],
	"configuracoes": [],
	"vendas": [],
	"eventos": []
}
```

Se `vendas` e `eventos` nao existirem no banco atual, o sistema inicializa essas colecoes em memoria com fallback seguro.

## Seguranca e integridade

- Escrita atomica em disco para evitar corrupcao (`.tmp` + rename).
- Validacao de payload com `zod` em todas as rotas principais.
- Integridade de backup com checksum SHA-256.
- Verificacao de vinculos relacionais em backup e API (pessoa/processo/documento/venda/evento).
- Protecao por token de API, CORS controlado e rate limit.

## Execucao

```bash
npm install
npm run dev
```

Build de producao:

```bash
npm run build
```

Testes:

```bash
npm test
```

Servidor local (API + arquivos build):

```bash
npm run server
```