# Checklist de Implantacao Producao 2.0

## 1. Pre-requisitos
- Windows com PowerShell 5+ ou Linux com Node.js LTS.
- Node.js LTS instalado e acessivel em PATH.
- npm ou pnpm instalado.
- Porta 3000 liberada na rede local.

## 2. Preparacao de ambiente
- Definir AGUIA_API_TOKEN forte (minimo 24 caracteres alfanumericos).
- Definir AGUIA_ALLOWED_ORIGINS com hosts permitidos.
- Garantir permissao de escrita na pasta server/data e logs.

## 3. Validacao antes da subida
- Executar npm install.
- Executar npm run build.
- Executar npm test.
- Confirmar que dist/index.html foi gerado.

## 4. Subida segura (Windows)
- Executar INICIAR-AGUIA-SERVIDOR-SEGURO.bat.
- Informar token quando solicitado, se variavel nao estiver definida.
- Validar logs em logs/aguia-startup-secure.log.
- Confirmar endpoint GET /api/health.

## 5. Pos-subida
- Verificar acesso da aplicacao via navegador na LAN.
- Testar fluxos principais: Pessoas, Processos, Vendas, Eventos e Relatorios.
- Executar exportacao e importacao de backup em ambiente de homologacao.

## 6. Operacao e continuidade
- Configurar rotina de backup recorrente.
- Monitorar tamanho e rotacao de logs.
- Validar periodicamente token, origins e disponibilidade da porta 3000.
- Definir procedimento de parada com PARAR-AGUIA-SERVIDOR.bat.

## 7. Rollback
- Restaurar backup valido via API de importacao.
- Reimplantar build anterior, mantendo o mesmo db.json.
- Revalidar healthcheck e fluxos criticos.
