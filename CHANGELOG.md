# Changelog

## 2.0.0 - 2026-03-30

### Added
- Modulos de Vendas, Eventos e Relatorios consolidados no frontend.
- Novas stores Zustand para vendas e eventos.
- Novas rotas de API: CRUD de vendas e eventos.
- Cobertura de testes para stores de vendas/eventos e pagina de relatorios.

### Changed
- Navegacao principal ampliada com novos modulos, mantendo os modulos originais.
- Persistencia e backup expandidos para suportar vendas/eventos com compatibilidade retroativa.
- Validacoes de integridade aprimoradas para relacionamentos de vendas e eventos.

### Compatibility
- Banco legado continua suportado sem migracao obrigatoria.
- Payloads de backup antigos permanecem validos.
