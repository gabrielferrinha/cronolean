<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Decisões do projeto

- A memória de cálculo fica na rota pública `/referencias`, separando regras operacionais internas de fontes conceituais externas para garantir rastreabilidade.
- Os agregados da planilha de devoluções ficam em um módulo de dados separado da tela de custos, para manter a origem estática rastreável e evitar tratá-los como economia calculada pelo app.
