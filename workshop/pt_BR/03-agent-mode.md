<!-- l10n-sync: source-file="03-agent-mode.md" -->
# Parte 3: Construa o jogo com fluxos de trabalho agênticos

---

Nesta parte, o Copilot passa de planejador a implementador. Em vez de escrever código linha por linha, você descreve o que quer e deixa o Copilot realizar o trabalho nos arquivos que precisar alterar.

## Tarefa 1: Conecte a batalha

<!-- track:vscode:start -->
1. Mude para o modo **Agent** no Copilot Chat.
2. Insira este prompt:
<!-- track:vscode:end -->

<!-- track:cli:start -->
1. Volte ao fluxo de programação padrão do Copilot CLI (ou continue no modo autopilot se quiser que o Copilot siga trabalhando até você pará-lo).
2. Se for útil, mencione o arquivo da página para fornecer mais contexto: `@src/pages/index.astro`.
3. Insira este prompt:
<!-- track:cli:end -->

   > Adicione JavaScript no lado do cliente à página de batalha para que:
   > 1. Ao clicar no botão Battle, obtenha os dois nomes de usuário dos campos.
   > 2. Verifique se os dois campos estão preenchidos (e mostre um erro caso contrário).
   > 3. Busque em paralelo os dados de contribuição dos dois usuários pela nossa API.
   > 4. Renderize os gráficos de contribuição como grades coloridas: cada dia será um quadrado colorido da paleta do GitHub.
   > 5. Exiba um selo VS entre os dois usuários.
   > 6. Mostre o nome de usuário, o total de contribuições e o intervalo de datas de cada usuário.
   > 7. Trate os estados de carregamento e os erros.
   > 8. A ação também deve ser iniciada ao pressionar Enter nos campos de entrada.
   > 9. Por enquanto, mantenha a interface simples que já está estruturada.
   >
   > Use interfaces do TypeScript para a estrutura de dados de contribuição.

<!-- track:vscode:start -->
3. Deixe o Agent Mode implementar as alterações em vários arquivos, incluindo `index.astro`.
4. Revise as alterações propostas na visualização de diferenças antes de aceitá-las.
<!-- track:vscode:end -->

<!-- track:cli:start -->
4. Deixe o Copilot CLI implementar as alterações em `src/pages/index.astro`.
5. Use `/diff` para revisar as alterações geradas e, em seguida, aprove-as.
<!-- track:cli:end -->

## Tarefa 2: Teste a batalha

> **⚠️ Não está vendo as alterações?** Se a página de batalha não foi atualizada, pare o servidor de desenvolvimento (`Ctrl+C`), reinicie com `npm run dev` e atualize o navegador.

1. Insira `octocat` e `torvalds` como nomes de usuário e clique em **Battle**.
2. Você deve ver os gráficos de contribuições dos dois usuários lado a lado, com grades coloridas.
3. Teste os casos de erro:
   - Deixe um ou ambos os campos vazios e clique em Battle: deve aparecer um erro de validação.
   - Insira um nome de usuário inválido: o aplicativo deve exibir um erro da API.
4. Pressione **Enter** em qualquer campo: isso deve iniciar a batalha como o clique no botão.

## Tarefa 3: Itere com o Copilot

Se algo não estiver como esperado, envie feedback diretamente ao Copilot. Por exemplo:

- *"Os quadrados de contribuição estão grandes demais; deixe-os com 12x12px."*
- *"Adicione uma dica ao passar o cursor que mostre a data e a contagem de contribuições."*
- *"O estado de carregamento precisa de uma animação pulsante."*

<!-- track:vscode:start -->
O Agent Mode lida naturalmente com alterações em vários arquivos e iterações. Cada prompt de acompanhamento aproveita a conversa anterior, permitindo refinar a implementação aos poucos sem começar do zero.
<!-- track:vscode:end -->

<!-- track:cli:start -->
As sessões do Copilot CLI mantêm o histórico, então cada prompt de acompanhamento usa o contexto dos anteriores. Use `/session` ou `/context` para inspecionar o contexto que o Copilot está mantendo e `/review` depois de uma iteração maior para buscar bugs ou oportunidades de refinamento.
<!-- track:cli:end -->

## Dicas para esta parte

- **Seja específico sobre o que você quer**: requisitos claros geram resultados melhores.
- **Divida tarefas grandes em prompts menores** se o Copilot sair do rumo.
- **Revise as alterações antes de aceitá-las**: é mais rápido inspecionar o código gerado do que reescrevê-lo depois.
- **Teste o aplicativo após cada etapa de implementação** para localizar os problemas.

## ✅ Parte 3 concluída

Você aprendeu a:

- Usar o Copilot para **implementar alterações em vários arquivos**.
- **Iterar nos resultados** com feedback específico.
- Lidar com o **ciclo completo de uma funcionalidade**: implementação, revisão, testes e refinamento.
