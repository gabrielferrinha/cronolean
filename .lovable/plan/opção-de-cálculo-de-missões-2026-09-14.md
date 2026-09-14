# Opção de cálculo de missões

## Alterações
- Manter a pergunta se haverá missões na separação.
- Ao escolher “Sim”, mostrar duas opções:
  - **Padrão:** calcular automaticamente 4 missões a cada 10 separações da demanda.
  - **Manual:** permitir que o operador informe a quantidade esperada.
- No modo padrão, arredondar para cima quando a proporção resultar em fração e mostrar a quantidade calculada antes de executar a análise.
- Continuar exibindo separadamente as pessoas necessárias para separação e para missões.
- Salvar no histórico a quantidade de missões efetivamente usada no cálculo, preservando os registros existentes.

## Detalhes técnicos
- Centralizar a proporção padrão (4/10) na lógica de cálculo.
- Derivar a quantidade padrão a partir da demanda e enviar a quantidade final ao cálculo existente.
- Validar quantidade inteira positiva somente no modo manual.
- Verificar os modos padrão, manual e sem missões na tela de análise.
