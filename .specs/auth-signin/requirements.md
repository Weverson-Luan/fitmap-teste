# Requirements — auth-signin

## Contexto

Alunos e personal trainers precisam entrar no FitMap com uma conta já existente para acessar sua área (aluno ou personal). Esta é a porta de entrada do app — sem ela, nenhuma outra feature é alcançável.

## User stories

- Como **aluno**, eu quero entrar com e-mail e senha, para acessar minha área e encontrar/acompanhar meu personal.
- Como **personal trainer**, eu quero entrar com e-mail e senha, para acessar minha área e gerenciar meus alunos.

## Requisitos funcionais

1. O sistema DEVE permitir login com e-mail e senha.
2. O sistema DEVE validar o formato do e-mail no cliente antes de enviar a requisição.
3. O sistema DEVE exibir uma mensagem de erro genérica quando as credenciais forem inválidas (sem revelar se o e-mail existe ou não na base).
4. O sistema DEVE redirecionar o usuário, após login bem-sucedido, para a área correspondente ao seu perfil (`student` ou `personal`), conforme retornado pela API — a escolha de perfil não é feita na tela de login.
5. O sistema DEVE oferecer um link "Esqueci minha senha" que leva ao fluxo de `recover-password`.
6. O sistema DEVE exibir estado de carregamento enquanto a autenticação está em andamento, e desabilitar o botão de entrar nesse período.
7. O sistema DEVE persistir a sessão (token) localmente, para não exigir login a cada abertura do app.

## Requisitos não-funcionais

- Segurança: a senha nunca é logada (console, crash reporter, analytics) em texto plano; o token de sessão é armazenado em storage seguro (Keychain/Keystore), não em `AsyncStorage` puro.
- Privacidade: mensagens de erro não podem revelar se um e-mail está cadastrado (evitar enumeração de usuários).
- Acessibilidade: campos de e-mail/senha com `accessibilityLabel`; botão de entrar comunica estado desabilitado via `accessibilityState`.
- Performance percebida: o spinner de loading aparece imediatamente ao toque em "Entrar" (sem esperar a resposta de rede para dar feedback visual).

## Critérios de aceite

### Cenário: login bem-sucedido como aluno

- **Dado** um usuário cadastrado com perfil `student`
- **Quando** ele informa e-mail e senha corretos e toca em "Entrar"
- **Então** o sistema autentica, salva a sessão e navega para a área do aluno

### Cenário: login bem-sucedido como personal

- **Dado** um usuário cadastrado com perfil `personal`
- **Quando** ele informa e-mail e senha corretos e toca em "Entrar"
- **Então** o sistema autentica, salva a sessão e navega para a área do personal

### Cenário: credenciais inválidas

- **Dado** um e-mail e/ou senha incorretos
- **Quando** o usuário toca em "Entrar"
- **Então** o sistema exibe uma mensagem de erro genérica ("E-mail ou senha inválidos") e permanece na tela de login

### Cenário: e-mail mal formatado

- **Dado** um e-mail sem `@` ou domínio válido
- **Quando** o usuário toca em "Entrar"
- **Então** o sistema exibe erro de validação no campo, sem chamar a API

### Cenário: sem conexão de rede

- **Dado** o dispositivo sem conectividade
- **Quando** o usuário toca em "Entrar"
- **Então** o sistema exibe uma mensagem de erro de conexão (distinta da de credenciais inválidas) e permite tentar novamente

### Cenário: navegação para recuperação de senha

- **Dado** a tela de login
- **Quando** o usuário toca em "Esqueci minha senha"
- **Então** o sistema navega para o fluxo `recover-password`

## Fora de escopo

- Criação de conta (signup) — spec separada.
- Login social (Google/Apple).
- Biometria (Face ID / Touch ID) para reautenticação.
- Escolha manual de perfil (aluno/personal) na tela de login — o perfil vem da API.
