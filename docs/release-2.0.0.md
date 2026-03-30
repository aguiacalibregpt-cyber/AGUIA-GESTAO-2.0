# Release 2.0.0

Data: 2026-03-30

## Escopo
- Base funcional original preservada.
- Inclusao de Vendas, Eventos e Relatorios.
- Compatibilidade total com banco legado sem migracao obrigatoria.

## Itens de validacao obrigatoria
- Build em verde (`npm run build`).
- Suite de testes em verde (`npm test`).
- Healthcheck da API (`/api/health`) respondendo com `ok: true`.
- Fluxo de backup/export e import sem erro.

## Risco residual conhecido
- Dependencia de variaveis de ambiente em modo seguro (token e origins).
- Inicializacao segura em Windows depende de PowerShell e permissao de rede/porta.

## Comandos de release
- `npm install`
- `npm run build`
- `npm test`

## Start recomendado em Windows
- `INICIAR-AGUIA-SERVIDOR-SEGURO.bat`
