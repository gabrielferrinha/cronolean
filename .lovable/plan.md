# Acesso do Operador 1

## Objetivo
Adicionar uma tela de entrada simples com usuário e senha, mantendo o perfil do operador salvo e impedindo o acesso às páginas internas antes da autenticação.

## Implementação
- Criar a tela pública de login com os campos “Usuário” e “Senha”.
- Preparar a conta inicial `Operador 1`, com a senha informada, sem expor essa senha no aplicativo.
- Manter o perfil do operador no banco de dados e associá-lo à conta de acesso.
- Proteger as páginas de análise, banco de tempos, indicadores, custos e histórico.
- Mostrar o operador conectado no cabeçalho e oferecer a opção “Sair”.
- Manter a página de referências pública, conforme a decisão existente do projeto.

## Validação
- Confirmar entrada com `Operador 1` e `1234`.
- Confirmar rejeição de dados incorretos.
- Confirmar que sair encerra o acesso e que páginas internas voltam à tela de login.
- Conferir a apresentação no computador e no celular.

## Detalhes técnicos
- A autenticação e o perfil serão mantidos no Lovable Cloud.
- O nome de usuário será associado internamente a uma identidade técnica, sem solicitar e-mail ao operador.
- A senha digitada será verificada no servidor e não ficará salva no navegador nem no código visível.
