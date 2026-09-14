# Missões no dimensionamento

## O que será alterado
- Incluir a pergunta “Quer considerar que nessa separação vai ocorrer missões?” com opção Sim/Não.
- Quando Sim, solicitar a quantidade de missões prevista para o turno.
- Usar o tempo médio observado de aproximadamente 5min08s por missão: média do aviso à mesa somada à média da busca do pedido.
- Calcular as pessoas exclusivas para missões pela carga total das missões dividida pelo tempo efetivo de uma pessoa no turno, arredondando para cima.
- Mostrar separadamente “Pessoas para separação” e “Pessoas para missões”, sem apresentar uma soma das equipes.
- Salvar quantidade, tempo e pessoas de missões no histórico compartilhado e exibi-los nos registros anteriores.

## Detalhes técnicos
- Registros antigos continuarão válidos, assumindo zero missões.
- O cálculo principal de separação não será alterado pelas missões.
- A quantidade de missões será validada como número inteiro positivo quando a opção estiver ativa.
