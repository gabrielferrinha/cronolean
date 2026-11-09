# CronoLean

Crie um aplicativo simples de Cronoanálise e Dimensionamento de Mão de Obra para Separação de Pedidos.

1. CONTEXTO DO PROCESSO

O sistema será utilizado em uma indústria alimentícia, em uma operação de separação de pedidos.

A linha analisada trabalha exclusivamente com miudezas secas.

O objetivo da operação é separar os produtos conforme os pedidos/demanda e preparar os itens para a sequência do processo logístico.

O sistema deve ser desenvolvido pensando em uma operação industrial real, na qual a quantidade de pedidos/demanda e a quantidade de pessoas disponíveis podem variar diariamente.

2. OBJETIVO DO SISTEMA

O principal objetivo é determinar:

Qual é o número mínimo de pessoas necessárias para realizar a separação da demanda do dia dentro do tempo disponível?

O sistema deve utilizar os tempos médios obtidos através da cronoanálise como base para realizar esse cálculo.

A lógica deve ser:

Banco de tempos → Dados do dia → Cálculo → Número mínimo de pessoas

3. PRINCÍPIO FUNDAMENTAL DA INTERFACE

A interface deve ser extremamente simples.

O usuário não deve precisar preencher formulários extensos ou informações técnicas.

O sistema deve buscar automaticamente no banco de dados tudo aquilo que já foi previamente cadastrado.

O usuário deve informar somente os dados primordiais para realizar o cálculo do dia.

Na prática, a tela principal deve funcionar como uma calculadora de dimensionamento de operadores.

4. O QUE VEM DO BANCO DE DADOS

A planilha Excel fornecida será utilizada como banco de dados dos tempos da operação.

Ela contém as atividades da separação e suas medições de ciclo.

Estrutura:

Nº da atividade

Atividade

Ciclo 1

Ciclo 2

Ciclo 3

...

Ciclo 10

Média

Os ciclos medidos serão utilizados para calcular o tempo médio de cada atividade.

O sistema deve armazenar esses tempos médios e utilizá-los automaticamente nos cálculos.

O usuário NÃO deverá precisar digitar os tempos durante a análise diária.

5. DADOS QUE O USUÁRIO DEVE INFORMAR

Na tela NOVA ANÁLISE, solicitar somente:

Demanda

Quantidade que precisa ser separada no período.

Exemplo:

Demanda: 1.200 pedidos

ou, conforme a unidade utilizada no banco de dados:

Demanda: 1.200 unidades

Pessoas disponíveis

Quantidade de pessoas que efetivamente estão disponíveis para realizar a separação.

Exemplo:

Pessoas disponíveis: 6

Tempo disponível

Tempo disponível para realizar a operação.

Exemplo:

Tempo disponível: 8 horas

Linha

Selecionar a linha de separação que será analisada, caso exista mais de uma.

6. NÃO SOLICITAR DADOS DESNECESSÁRIOS

Não criar campos obrigatórios para informações que não sejam necessárias para o cálculo.

Não solicitar ao usuário:

Tempo de ciclo

Média dos ciclos

Quantidade de atividades

Takt Time

Tempo total das atividades

Operadores teóricos

Operadores necessários

Esses valores devem ser calculados automaticamente.

Também não utilizar automaticamente dados históricos da planilha como demanda ou quantidade de pessoas presentes.

7. CÁLCULO

O sistema deve utilizar os tempos médios das atividades cadastradas no banco.

Tempo disponível

Converter o tempo informado pelo usuário para minutos.

Exemplo:

8 horas = 480 minutos.

Takt Time

Calcular:

Takt Time = Tempo disponível / Demanda

Tempo total das atividades

Somar os tempos médios das atividades necessárias para realizar a separação.

Operadores teóricos

Calcular:

Operadores teóricos = Tempo total das atividades / Takt Time

Operadores necessários

Arredondar sempre para cima.

Exemplo:

2,3 → 3 pessoas

4,1 → 5 pessoas

5,0 → 5 pessoas

8. RESULTADO PRINCIPAL

O resultado mais importante deve aparecer em destaque.

Exemplo:

RESULTADO

Demanda: 1.200

Pessoas disponíveis: 6

Pessoas necessárias: 7

⚠️ FALTAM 1 PESSOA

O usuário deve conseguir entender o resultado imediatamente, sem precisar interpretar tabelas ou fórmulas.

9. INFORMAÇÕES COMPLEMENTARES

Abaixo do resultado principal, mostrar de maneira secundária:

Takt Time

Tempo total das atividades

Operadores teóricos

Pessoas disponíveis

Diferença entre pessoas disponíveis e necessárias

Essas informações devem existir para permitir uma análise mais detalhada, mas não devem deixar a tela principal poluída.

10. BANCO DE TEMPOS

Criar uma área separada chamada:

BANCO DE TEMPOS

Essa área será utilizada para administrar os dados da cronoanálise.

Permitir:

Importar a planilha Excel

Visualizar as atividades

Visualizar os ciclos

Visualizar a média

Atualizar os ciclos

Adicionar uma nova atividade

Alterar uma atividade

Quando novos ciclos forem cadastrados, recalcular automaticamente a média.

Ciclos vazios não devem ser considerados no cálculo.

11. SEPARAÇÃO ENTRE BANCO E ANÁLISE DIÁRIA

O sistema deve separar claramente:

BANCO DE TEMPOS

Informações permanentes da operação:

Atividades

Ciclos

Tempos médios

ANÁLISE DO DIA

Informações variáveis:

Demanda

Pessoas disponíveis

Tempo disponível

Linha

A análise realizada em um determinado dia não deve alterar os tempos médios do banco.

12. HISTÓRICO

Criar uma tela separada chamada:

HISTÓRICO

Salvar automaticamente cada análise realizada.

Registrar:

Data

Linha

Demanda

Pessoas disponíveis

Tempo disponível

Takt Time

Tempo total das atividades

Operadores teóricos

Operadores necessários

Diferença

Resultado

O histórico deve servir para acompanhar a evolução do dimensionamento da mão de obra.

13. EXPERIÊNCIA DO USUÁRIO

A tela principal deve ser construída pensando no seguinte fluxo:

PASSO 1

Selecionar a linha.

PASSO 2

Informar a demanda.

PASSO 3

Informar quantas pessoas estão disponíveis.

PASSO 4

Informar o tempo disponível.

PASSO 5

Clicar em:

CALCULAR

PASSO 6

O sistema apresenta:

PESSOAS NECESSÁRIAS

Não exigir nenhuma outra informação para realizar o cálculo básico.

14. CONCEITO DO APLICATIVO

O aplicativo não deve ser desenvolvido como um sistema complexo de gestão de armazém ou logística.

Ele deve ser uma ferramenta simples de cronoanálise e dimensionamento de mão de obra, específica para a operação de separação de pedidos de miudezas secas.

A prioridade é:

SIMPLICIDADE → VELOCIDADE → CONFIABILIDADE DO CÁLCULO

O usuário deve conseguir realizar uma análise em poucos segundos.

Regra principal:

O Excel fornece os tempos médios.

O usuário fornece os dados essenciais do dia.

O sistema realiza todos os cálculos.

O sistema informa quantas pessoas são necessárias.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cronolean.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d6bbb459-ffcc-4445-8535-c58ecb378015).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
