# Tasks — `nome-da-feature`

> Checklist de implementação. Cada tarefa referencia o requisito (`R#`) que ela resolve, para rastreabilidade com `requirements.md`.

## Implementação

- [ ] `data/infra/repositories`: ... (R#)
- [ ] `presentation/view-model`: ... (R#)
- [ ] `presentation/views`: ... (R#)
- [ ] `store`: ... (se aplicável) (R#)

## Testes

- [ ] Teste de `view-model` cobrindo os critérios de aceite do `requirements.md`
- [ ] Teste de `infra/repositories` (mock de `http`)

## Qualidade

- [ ] `npm run lint` sem erros
- [ ] `npm test` sem erros
- [ ] Estados de UI do `design.md` (loading/erro/vazio/sucesso) implementados
- [ ] Acessibilidade básica (labels/roles) nos elementos interativos novos

## Revisão

- [ ] Implementação confere com `requirements.md` e `design.md`
- [ ] Nenhuma regra de `specs/constitution.md` violada sem justificativa registrada em `design.md`
