import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { iniciarBanco } from "./src/database/database";
import { listarProdutos, salvarProduto, excluirProduto } from "./src/database/produtosRepository";
import Produto from "./src/models/Produto";

const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function App() {
  const [bancoPronto, setBancoPronto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [ordenacao, setOrdenacao] = useState("nome");
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await iniciarBanco();
        setBancoPronto(true);
      } catch (erro) {
        Alert.alert("Erro no banco de dados", erro.message || "Não foi possível iniciar o banco.");
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (bancoPronto) atualizarProdutos();
  }, [bancoPronto, busca, filtro, ordenacao]);

  async function atualizarProdutos() {
    try {
      setProdutos(await listarProdutos({ busca, filtro, ordenacao }));
    } catch (erro) {
      Alert.alert("Erro", erro.message || "Não foi possível consultar os produtos.");
    }
  }

  const resumo = useMemo(() => ({
    unidades: produtos.reduce((soma, item) => soma + item.quantidade, 0),
    valor: produtos.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
    baixo: produtos.filter((item) => item.estaComEstoqueBaixo()).length
  }), [produtos]);

  function limparFormulario() {
    setNome(""); setPreco(""); setQuantidade(""); setEditandoId(null);
  }

  async function lidarComSalvar() {
    try {
      if (preco.trim() === "" || quantidade.trim() === "") {
        throw new Error("Preencha o preço e a quantidade.");
      }
      const produto = new Produto(
        editandoId, nome.trim(), Number(preco.trim().replace(",", ".")), Number(quantidade.trim())
      );
      await salvarProduto(produto);
      limparFormulario();
      await atualizarProdutos();
      Alert.alert("Sucesso", editandoId ? "Produto atualizado!" : "Produto cadastrado!");
    } catch (erro) {
      Alert.alert("Confira os dados", erro.message || "Não foi possível salvar o produto.");
    }
  }

  function editar(produto) {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setPreco(String(produto.preco).replace(".", ","));
    setQuantidade(String(produto.quantidade));
  }

  function confirmarExclusao(produto) {
    Alert.alert("Excluir produto", `Deseja excluir "${produto.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          await excluirProduto(produto.id);
          await atualizarProdutos();
          if (editandoId === produto.id) limparFormulario();
        } catch (erro) {
          Alert.alert("Erro", erro.message || "Não foi possível excluir o produto.");
        }
      }}
    ]);
  }

  if (carregando) return (
    <SafeAreaView style={styles.loading}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Preparando seu estoque...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>GESTÃO SIMPLES</Text>
              <Text style={styles.title}>Estoque Fácil</Text>
              <Text style={styles.subtitle}>Seus produtos em um só lugar.</Text>
            </View>
            <View style={styles.logo}><Text style={styles.logoText}>EF</Text></View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.blueCard]}>
              <Text style={styles.summaryLabel}>Produtos</Text>
              <Text style={styles.summaryValue}>{produtos.length}</Text>
              <Text style={styles.summaryHint}>encontrados</Text>
            </View>
            <View style={[styles.summaryCard, styles.greenCard]}>
              <Text style={styles.summaryLabel}>Unidades</Text>
              <Text style={styles.summaryValue}>{resumo.unidades}</Text>
              <Text style={styles.summaryHint}>em estoque</Text>
            </View>
          </View>

          <View style={styles.valueCard}>
            <View>
              <Text style={styles.valueLabel}>Valor estimado do estoque</Text>
              <Text style={styles.valueAmount}>{moeda(resumo.valor)}</Text>
            </View>
            <View style={styles.lowBadge}>
              <Text style={styles.lowNumber}>{resumo.baixo}</Text>
              <Text style={styles.lowText}>estoque baixo</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{editandoId ? "Editar produto" : "Cadastrar produto"}</Text>
            {editandoId ? <TouchableOpacity onPress={limparFormulario}><Text style={styles.cancel}>Cancelar</Text></TouchableOpacity> : null}
          </View>
          <View style={styles.formCard}>
            <Text style={styles.label}>Nome do produto</Text>
            <TextInput value={nome} onChangeText={setNome} placeholder="Ex.: Teclado sem fio" placeholderTextColor="#9CA3AF" style={styles.input} maxLength={80} />
            <View style={styles.inputRow}>
              <View style={styles.half}>
                <Text style={styles.label}>Preço (R$)</Text>
                <TextInput value={preco} onChangeText={setPreco} placeholder="0,00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Quantidade</Text>
                <TextInput value={quantidade} onChangeText={setQuantidade} placeholder="0" placeholderTextColor="#9CA3AF" keyboardType="number-pad" style={styles.input} />
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={lidarComSalvar} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>{editandoId ? "Salvar alterações" : "+ Cadastrar produto"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos cadastrados</Text>
            <Text style={styles.count}>{produtos.length} item(ns)</Text>
          </View>
          <TextInput value={busca} onChangeText={setBusca} placeholder="🔎  Pesquisar por nome..." placeholderTextColor="#9CA3AF" style={styles.searchInput} />
          <View style={styles.chipRow}>
            {[{ key: "todos", label: "Todos" }, { key: "baixo", label: "Estoque baixo" }].map((item) => (
              <TouchableOpacity key={item.key} onPress={() => setFiltro(item.key)} style={[styles.chip, filtro === item.key && styles.chipActive]}>
                <Text style={[styles.chipText, filtro === item.key && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setOrdenacao((atual) => atual === "nome" ? "quantidade" : "nome")} style={styles.sortButton}>
              <Text style={styles.sortText}>{ordenacao === "nome" ? "Ordenar: A–Z" : "Ordenar: quantidade"}</Text>
            </TouchableOpacity>
          </View>

          {produtos.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
              <Text style={styles.emptyText}>Cadastre um produto acima ou altere sua pesquisa.</Text>
            </View>
          ) : produtos.map((produto) => (
            <View key={produto.id} style={styles.productCard}>
              <View style={styles.productIcon}><Text style={styles.productEmoji}>📦</Text></View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{produto.nome}</Text>
                <Text style={styles.productMeta}>{moeda(produto.preco)} por unidade</Text>
                <Text style={styles.productTotal}>Total: {moeda(produto.calcularValorTotal())}</Text>
                <View style={[styles.stockPill, produto.estaComEstoqueBaixo() ? styles.stockLow : styles.stockOk]}>
                  <Text style={[styles.stockText, produto.estaComEstoqueBaixo() ? styles.stockLowText : styles.stockOkText]}>
                    {produto.quantidade} unidade(s){produto.estaComEstoqueBaixo() ? " • Estoque baixo" : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => editar(produto)} style={styles.editButton}><Text style={styles.editText}>Editar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => confirmarExclusao(produto)} style={styles.deleteButton}><Text style={styles.deleteText}>Excluir</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          <Text style={styles.footer}>Estoque Fácil • Dados locais em SQLite</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: "#F4F7FB" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FB" },
  loadingText: { marginTop: 12, color: "#64748B", fontSize: 15 },
  container: { padding: 20, paddingTop: Platform.OS === "android" ? 24 : 12, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  eyebrow: { color: "#2563EB", fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 5 },
  title: { color: "#172033", fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { color: "#64748B", fontSize: 14, marginTop: 5 },
  logo: { width: 54, height: 54, borderRadius: 17, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  logoText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 18, padding: 16 }, blueCard: { backgroundColor: "#E7EEFF" }, greenCard: { backgroundColor: "#DFF7EB" },
  summaryLabel: { color: "#52627A", fontSize: 13, fontWeight: "600" }, summaryValue: { color: "#172033", fontSize: 28, fontWeight: "800", marginTop: 8 },
  summaryHint: { color: "#64748B", fontSize: 12, marginTop: 1 },
  valueCard: { backgroundColor: "#172033", borderRadius: 18, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  valueLabel: { color: "#C7D2E3", fontSize: 12, marginBottom: 7 }, valueAmount: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  lowBadge: { backgroundColor: "#354258", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
  lowNumber: { color: "#FBBF24", fontSize: 18, fontWeight: "800" }, lowText: { color: "#E2E8F0", fontSize: 10, marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 2 },
  sectionTitle: { color: "#172033", fontSize: 18, fontWeight: "800" }, cancel: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  count: { color: "#64748B", fontSize: 12 }, formCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 18, marginBottom: 26, borderWidth: 1, borderColor: "#E8EDF5" },
  label: { color: "#344256", fontSize: 12, fontWeight: "700", marginBottom: 7, marginTop: 2 },
  input: { borderWidth: 1, borderColor: "#E1E7F0", backgroundColor: "#FBFCFE", borderRadius: 11, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: "#172033", marginBottom: 14 },
  inputRow: { flexDirection: "row", gap: 12 }, half: { flex: 1 },
  primaryButton: { backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 1 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  searchInput: { borderWidth: 1, borderColor: "#E1E7F0", backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: "#172033", fontSize: 14, marginBottom: 11 },
  chipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  chip: { borderRadius: 20, backgroundColor: "#E9EEF6", paddingVertical: 8, paddingHorizontal: 12 }, chipActive: { backgroundColor: "#2563EB" },
  chipText: { color: "#52627A", fontSize: 12, fontWeight: "700" }, chipTextActive: { color: "#FFFFFF" },
  sortButton: { marginLeft: "auto", paddingVertical: 8, paddingHorizontal: 11, borderRadius: 20, borderWidth: 1, borderColor: "#D7DFEA" },
  sortText: { color: "#344256", fontSize: 11, fontWeight: "700" },
  emptyCard: { alignItems: "center", padding: 28, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#E8EDF5" },
  emptyEmoji: { fontSize: 32, marginBottom: 10 }, emptyTitle: { color: "#172033", fontSize: 15, fontWeight: "800" },
  emptyText: { color: "#64748B", fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18 },
  productCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFFFFF", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E8EDF5", gap: 10 },
  productIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F0F5FF", alignItems: "center", justifyContent: "center" },
  productEmoji: { fontSize: 19 }, productInfo: { flex: 1 }, productName: { color: "#172033", fontSize: 15, fontWeight: "800", marginBottom: 4 },
  productMeta: { color: "#64748B", fontSize: 12 }, productTotal: { color: "#344256", fontSize: 12, fontWeight: "700", marginTop: 5 },
  stockPill: { alignSelf: "flex-start", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, marginTop: 8 },
  stockLow: { backgroundColor: "#FFF0D9" }, stockOk: { backgroundColor: "#DFF7EB" }, stockText: { fontSize: 10, fontWeight: "800" },
  stockLowText: { color: "#9A5B00" }, stockOkText: { color: "#087443" }, actions: { gap: 7, alignItems: "stretch" },
  editButton: { borderWidth: 1, borderColor: "#C9D8FF", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, alignItems: "center" },
  editText: { color: "#2563EB", fontSize: 11, fontWeight: "800" },
  deleteButton: { borderWidth: 1, borderColor: "#F5CACA", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7, alignItems: "center" },
  deleteText: { color: "#C03939", fontSize: 11, fontWeight: "800" },
  footer: { textAlign: "center", color: "#94A3B8", fontSize: 11, marginTop: 18 }
});
