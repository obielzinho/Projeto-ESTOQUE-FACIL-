import { iniciarBanco, obterBanco } from "./database";
import Produto from "../models/Produto";

export async function listarProdutos({ busca = "", filtro = "todos", ordenacao = "nome" } = {}) {
  try {
    await iniciarBanco();
    const db = obterBanco();
    let sql = "SELECT id, nome, preco, quantidade FROM produtos WHERE nome LIKE ?";
    const parametros = [`%${busca.trim()}%`];

    if (filtro === "baixo") {
      sql += " AND quantidade < ?";
      parametros.push(5);
    }

    sql += ordenacao === "quantidade"
      ? " ORDER BY quantidade ASC, nome COLLATE NOCASE ASC"
      : " ORDER BY nome COLLATE NOCASE ASC";

    const linhas = await db.getAllAsync(sql, parametros);
    return linhas.map((linha) =>
      new Produto(linha.id, linha.nome, Number(linha.preco), Number(linha.quantidade))
    );
  } catch (erro) {
    console.error("Erro ao consultar produtos:", erro);
    throw new Error("Não foi possível consultar os produtos.");
  }
}

export async function salvarProduto(produto) {
  try {
    const db = obterBanco();
    if (!(produto instanceof Produto)) throw new Error("Os dados do produto são inválidos.");

    if (produto.id !== null) {
      await db.runAsync(
        "UPDATE produtos SET nome = ?, preco = ?, quantidade = ? WHERE id = ?",
        [produto.nome, produto.preco, produto.quantidade, produto.id]
      );
    } else {
      await db.runAsync(
        "INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)",
        [produto.nome, produto.preco, produto.quantidade]
      );
    }
  } catch (erro) {
    console.error("Erro ao salvar produto:", erro);
    if (erro.message === "Os dados do produto são inválidos.") throw erro;
    throw new Error("Não foi possível salvar o produto. Confira os dados e tente novamente.");
  }
}

export async function excluirProduto(id) {
  try {
    const db = obterBanco();
    if (!Number.isInteger(id) || id <= 0) throw new Error("Identificador do produto inválido.");
    await db.runAsync("DELETE FROM produtos WHERE id = ?", [id]);
  } catch (erro) {
    console.error("Erro ao excluir produto:", erro);
    throw new Error(erro.message || "Não foi possível excluir o produto.");
  }
}
