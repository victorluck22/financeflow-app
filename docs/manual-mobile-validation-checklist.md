# Checklist de Validacao Mobile

## Objetivo

Validar comportamento mobile real em iOS e Android para header, modais e formularios, cobrindo retrato e paisagem.

## Matriz de Dispositivos

| Plataforma | Dispositivo   | Orientacao | Status | Evidencia |
| ---------- | ------------- | ---------- | ------ | --------- |
| iOS        | iPhone        | Retrato    | [ ]    |           |
| iOS        | iPhone        | Paisagem   | [ ]    |           |
| Android    | Android Phone | Retrato    | [ ]    |           |
| Android    | Android Phone | Paisagem   | [ ]    |           |

## 1. Header Mobile

- [ ] Hamburger visivel e clicavel
- [ ] Menu abre e fecha corretamente
- [ ] Itens de menu estao visiveis e clicaveis
- [ ] Menu fecha apos navegacao
- [ ] Estado autenticado mostra itens privados
- [ ] Estado nao autenticado oculta itens privados
- [ ] Botao de logout aparece apenas quando autenticado

## 2. Modais

- [ ] Modal abre sem cortar conteudo
- [ ] Sem scroll horizontal no modal
- [ ] Scroll vertical funciona em conteudo longo
- [ ] Fechar modal restaura scroll da pagina
- [ ] Nao ha travamento de layout ao fechar modal

## 3. Formularios e Inputs

- [ ] Teclado abre corretamente para campo de texto
- [ ] Teclado numerico abre para campos numericos
- [ ] Mascaras de input funcionam no mobile
- [ ] Select abre e permite selecionar opcao
- [ ] Campos continuam acessiveis com teclado aberto

## 4. Evidencias

Anexar capturas de tela para cada plataforma/orientacao validada.

- [ ] Evidencia iOS retrato anexada
- [ ] Evidencia iOS paisagem anexada
- [ ] Evidencia Android retrato anexada
- [ ] Evidencia Android paisagem anexada

## 5. Aprovacao

- Responsavel: ********\_\_\_\_********
- Data: \_**\_/\_\_**/**\_\_**
- Resultado geral: [ ] Aprovado [ ] Reprovado
- Observacoes:
