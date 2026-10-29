export default class Produto {
  #id;
  #nome;
  #preco;
  #quantidade;

  constructor(id, nome, preco, quantidade) {
    this.#id = id ?? null;
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
  }

  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get preco() { return this.#preco; }
  get quantidade() { return this.#quantidade; }

  set nome(valor) {
    if (typeof valor !== "string" || valor.trim() === "") {
      throw new Error("O nome do produto é obrigatório.");
    }
    if (valor.trim().length > 80) {
      throw new Error("O nome deve ter no máximo 80 caracteres.");
    }
    this.#nome = valor.trim();
  }

  set preco(valor) {
    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error("O preço deve ser um número válido e não negativo.");
    }
    this.#preco = Math.round(valor * 100) / 100;
  }

  set quantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw new Error("A quantidade deve ser um número inteiro não negativo.");
    }
    this.#quantidade = valor;
  }

  estaComEstoqueBaixo() { return this.#quantidade < 5; }
  calcularValorTotal() { return this.#preco * this.#quantidade; }
}
