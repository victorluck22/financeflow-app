# Debito Tecnico de Testes

Este documento registra pendencias tecnicas identificadas durante a change de mobile modals, header mobile e atalhos de transacao.

## 1. Warnings de mock de Select em testes

- Contexto: em testes de TransactionForm, o mock simplificado de Select renderiza option com filhos complexos (span), gerando warning de DOM nesting.
- Impacto: ruido de log e risco de esconder warnings reais.
- Acao sugerida:
  - Ajustar mock para normalizar children em texto simples dentro de option.
  - Criar utilitario compartilhado para mocks de Select em vez de repetir implementacoes locais.

## 2. Ruido de console.error em cenarios de erro esperados

- Contexto: testes que cobrem falhas de API exercitam branches com console.error intencional.
- Impacto: saida de teste poluida e mais dificil de identificar erros nao esperados.
- Acao sugerida:
  - Usar spy em console.error por teste e restaurar no teardown.
  - Falhar teste quando ocorrer console.error nao previsto.

## 3. Cobertura ainda baixa em areas criticas de UI

- Contexto: apos melhorias, cobertura global subiu, mas algumas areas seguem abaixo do ideal.
- Impacto: maior risco de regressao em comportamento mobile e refresh de dados.
- Acao sugerida:
  - Priorizar novos testes para Header mobile (menu hamburguer, fechamento por navegacao, estados de autenticacao).
  - Priorizar novos testes para ExchangeRatesPage (estados de erro, vazio, retries e filtros).

## 4. Dependencia alta de mocks de implementacao

- Contexto: varios testes usam mocks profundos de componentes UI (Dialog/Select/Checkbox), distantes do comportamento real do Radix.
- Impacto: falso positivo de teste e menor confianca para bugs de interacao real.
- Acao sugerida:
  - Introduzir camada de helpers de render com mocks mais fieis.
  - Complementar com testes de integracao em nivel de pagina para fluxos criticos.

## 5. Gap de validacao mobile real

- Contexto: tarefas manuais de verificacao mobile ficaram em aberto no fechamento da change.
- Impacto: comportamentos dependentes de viewport dinamica podem divergir entre navegadores/dispositivos.
- Acao sugerida:
  - Executar checklist manual em iOS/Android (retrato/paisagem) e anexar evidencias.
  - Planejar smoke E2E mobile para scroll lock e alcance de acoes da modal.
