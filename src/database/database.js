import * as SQLite from "expo-sqlite";

let db;

export async function iniciarBanco() {
  try {
    if (!db) db = await SQLite.openDatabaseAsync("estoque-facil.db");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL CHECK (preco >= 0),
        quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
        criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    return db;
  } catch (erro) {
    console.error("Erro ao iniciar SQLite:", erro);
    throw new Error("Não foi possível iniciar o banco de dados local.");
  }
}

export function obterBanco() {
  if (!db) throw new Error("O banco de dados ainda não foi iniciado.");
  return db;
}
