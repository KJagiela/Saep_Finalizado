# ANEXO 1

**Estudante:**

**Data:**

**Número da prova:**

---

## ENTREGA 01: Documentação de software

### 1.1 Preencha a tabela dos requisitos funcionais do sistema

**Requisitos Funcionais do Sistema**

| ID | Requisito | Descrição |
|---|---|---|
| RF-07 | Sessão com expiração | O sistema mantém a sessão do usuário logado, protege todas as rotas com verificação de sessão e a encerra automaticamente após 15 minutos. |
| RF-15 | Cadastrar tutor | O sistema cadastra um tutor com nome, CPF e telefone. O CPF é salvo criptografado, por ser dado sensível (LGPD). |
| RF-18 | Cadastrar pet | O sistema cadastra um pet (nome e espécie) sempre vinculado a um tutor existente. |
| RF-19 | Listar agendamentos | O sistema lista os agendamentos ordenados por data, com os dados do pet e do tutor (JOIN entre agendamentos, pets e tutores). |


### 1.2 Preencha os requisitos de infraestrutura

SGBD Utilizado: PostgreSQL
Versão: 10.2.3 (npm psql --version)
Linguagem de Programação:JavaScript (Node.js com Express no back-end)
Versão: 10.2.3 (npm node -v)