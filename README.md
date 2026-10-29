# Estoque Fácil

Aplicativo de controle de estoque com React Native, Expo, JavaScript, SQLite e POO.

## Recursos
- Cadastro, consulta, edição e exclusão de produtos (CRUD).
- SQLite local para manter os dados após fechar/reabrir o app.
- Validação de nome, preço e quantidade na classe Produto.
- Pesquisa por nome, filtro de estoque baixo (menos de 5 unidades) e ordenação SQL.
- Resumo de quantidade total, valor estimado do estoque e produtos com estoque baixo.
- Tratamento de erros com try/catch.

## Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta `EstoqueFacil` no VS Code.
3. Abra o terminal dentro da pasta e execute `npm install`.
4. Execute `npx expo start`.
5. Leia o QR Code com o Expo Go compatível com o SDK ou rode em um emulador Android.

Se o Expo informar incompatibilidade de versões, execute `npx expo install --fix` e siga as instruções exibidas.

## Arquivos principais
- `App.js`: interface e ações do usuário.
- `src/models/Produto.js`: classe, encapsulamento e validações.
- `src/database/database.js`: inicialização SQLite e tabela.
- `src/database/produtosRepository.js`: operações CRUD e consultas SQL.

## Observação
Este projeto utiliza banco local SQLite e não possui sincronização com serviços em nuvem.