<!-- l10n-sync: source-file="04-design-vibes.md" -->
# Parte 4: Temas com foco no design

---

Nesta parte, você vai usar os ciclos de planejamento e implementação do Copilot para transformar o tema de forma abrangente. Este é um desenvolvimento com foco no design: comece pela visão, refine os elementos visuais e deixe o Copilot cuidar do trabalho pesado de CSS.

## Tarefa 1: Planeje o tema retrô

<!-- track:vscode:start -->
Mude para o modo **Plan** no GitHub Copilot Chat.
<!-- track:vscode:end -->

<!-- track:cli:start -->
Use `/plan` no GitHub Copilot CLI ou pressione **Shift+Tab** até ativar o modo de planejamento.
<!-- track:cli:end -->

Insira este prompt:

> Quero transformar esta página em uma experiência completa de fliperama retrô. Planeje uma reformulação visual abrangente que inclua: efeitos de linhas de varredura CRT no fundo, brilho neon no título pulsando como uma placa luminosa, selo VS animado com mudanças nas cores do gradiente, camada de brilho sobre os cartões de resultado dos usuários, animações de entrada flutuante nos campos, texto de carregamento que muda entre verde e roxo e efeitos de brilho ao passar o cursor sobre os quadrados de contribuição. Mantenha o fundo escuro (`#0a0a1a`) com detalhes em verde (`#5fed83`) e roxo (`#8a2be2`). Use um tema escuro com a fonte de jogos retrô Press Start 2P do Google Fonts.

O Copilot vai gerar um plano detalhado com todos os efeitos visuais. **Não aceite imediatamente**: revise o plano e itere:

- Sugira ajustes no tempo das animações (por exemplo, *"Deixe a pulsação neon mais lenta, com cerca de 3 segundos"*).
- Pergunte sobre efeitos específicos (por exemplo, *"Como a camada de brilho funcionará nos cartões?"*).
- Peça mudanças na abordagem se algo não parecer adequado.

## Tarefa 2: Implemente o tema

Quando estiver satisfeito com o plano, peça ao Copilot para implementá-lo.

> Implemente o plano do tema de fliperama retrô que acabamos de criar.

O Copilot vai adicionar várias animações CSS, pseudoelementos e transições à folha de estilos. Isso pode incluir:

- `@keyframes` para o efeito de linhas CRT, o pulso neon, o brilho e a animação de entrada flutuante.
- Pseudoelementos (`::before`, `::after`) para efeitos de sobreposição.
- Propriedades personalizadas de CSS para as cores do tema.
- Transições e estados `hover` para elementos interativos.

<!-- track:cli:start -->
Depois que as alterações forem aplicadas, use `/diff` para revisá-las antes de aprová-las.
<!-- track:cli:end -->

## Tarefa 3: Refine o visual

> **⚠️ Não está vendo as alterações?** Se o novo tema ou as animações não aparecerem, pare o servidor de desenvolvimento (`Ctrl+C`), reinicie com `npm run dev` e atualize o navegador sem usar o cache (`Ctrl+Shift+R`).

Mantenha a prévia no navegador aberta e itere no design. Experimente prompts como:

> O efeito de linhas de varredura está forte demais; reduza a opacidade para 0.03.

> Adicione uma cintilação elétrica sutil ao texto do título.

> O selo VS deve pulsar de forma mais intensa.

Este é um **desenvolvimento com foco no design**: você está iterando no resultado visual em tempo real. Cada prompt refina a experiência até que fique do jeito certo. Não se contente com algo "bom o suficiente" — ajuste o visual até a página parecer saída de um fliperama.

## Tarefa 4: Atualize as instruções

Suas instruções devem refletir as principais decisões de design para manter os próximos prompts alinhados.

<!-- track:vscode:start -->
Peça ao Copilot Chat:

> Adicione a copilot-instructions.md uma seção de guia de design que descreva o tema de fliperama retrô: cores, fontes e estilo das animações.
<!-- track:vscode:end -->

<!-- track:cli:start -->
Peça ao Copilot CLI:

> Atualize as instruções do repositório com um guia de design curto para o tema de fliperama retrô: cores, fontes, estilo das animações e a regra de que novas interfaces devem manter a estética neon.
<!-- track:cli:end -->

Quando a página estiver como você quer, faça commit das instruções e das alterações de design.

## ✅ Parte 4 concluída

**O que você aprendeu:**

- Usar fluxos de planejamento para definir um **sistema de design antes da implementação**.
- **Iterar no resultado visual** com prompts de acompanhamento.
- **Atualizar as instruções depois de decisões importantes** para manter a identidade visual.
