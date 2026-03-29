import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, DollarSign, Loader, Plus, CreditCard, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  createCategory,
  getAllCategories,
} from "@/api/services/categoryService";
import { createPaymentCard } from "@/api/services/paymentCardService";
import {
  createExpense,
  formatExpenseData,
  getExpenseById,
  updateExpense,
} from "@/api/services/expenseService";
import { normalizeTransactionType } from "@/lib/transactionType";
import httpClient from "@/api/httpClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const getDefaultFormData = (userId) => ({
  type: "expense",
  amount: "",
  category: "",
  paymentMethod: "",
  currencyId: "",
  paymentCardId: "",
  description: "",
  place: "",
  isInstallment: false,
  installments: 2,
  userId: userId || "",
  date: new Date().toISOString().split("T")[0],
});

const QUICK_CARD_BRANDS = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
  "Hipercard",
  "Aura",
  "Discover",
  "JCB",
  "Outro",
];

const TransactionForm = ({ onSubmit, onClose, initialTransaction = null }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  useBodyScrollLock(true);
  const isEditMode = Boolean(initialTransaction?.id);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentCards, setPaymentCards] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isHydratingTransaction, setIsHydratingTransaction] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData(user?.id));
  const [isCategoryShortcutOpen, setIsCategoryShortcutOpen] = useState(false);
  const [isCategoryShortcutLoading, setIsCategoryShortcutLoading] =
    useState(false);
  const [quickCategoryData, setQuickCategoryData] = useState({
    name: "",
    icon: "📦",
  });
  const [isCardShortcutOpen, setIsCardShortcutOpen] = useState(false);
  const [isCardShortcutLoading, setIsCardShortcutLoading] = useState(false);
  const [quickCardData, setQuickCardData] = useState({
    cardDescription: "",
    cardholderName: "",
    expiryMonth: "",
    paymentMethodId: "",
  });

  const loadCategories = async () => {
    const { categories: apiCategories } = await getAllCategories(true);
    const nextCategories = apiCategories || [];
    setCategories(nextCategories);
    return nextCategories;
  };

  const loadPaymentCards = async () => {
    const { data: cardsResponse } = await httpClient.get("/payment-cards");
    const nextCards = cardsResponse?.data || [];
    setPaymentCards(nextCards);
    return nextCards;
  };

  const resolvePaymentMethodValue = (transaction) => {
    const valueFromShow = transaction?.payment_method_id;
    const valueFromInitial = initialTransaction?.payment_method_id;
    const valueFromCamel = transaction?.paymentMethodId;
    const valueFromNested = transaction?.payment_method?.id;

    const rawValue =
      valueFromShow ??
      valueFromInitial ??
      valueFromCamel ??
      valueFromNested ??
      "";
    return rawValue ? String(rawValue) : "";
  };

  const findMatchingPaymentMethodId = (rawMethodId) => {
    if (!rawMethodId || paymentMethods.length === 0) {
      return "";
    }

    const rawAsString = String(rawMethodId);
    const rawAsNumber = Number(rawMethodId);

    const directMatch = paymentMethods.find(
      (method) => String(method.id) === rawAsString,
    );
    if (directMatch) {
      return String(directMatch.id);
    }

    if (!Number.isNaN(rawAsNumber)) {
      const numericMatch = paymentMethods.find(
        (method) => Number(method.id) === rawAsNumber,
      );
      if (numericMatch) {
        return String(numericMatch.id);
      }
    }

    return "";
  };

  const isCreditCardMethod = (methodId) => {
    if (!methodId) {
      return false;
    }

    const method = paymentMethods.find(
      (m) => String(m.id) === String(methodId),
    );
    if (!method?.payment_method_name) {
      return false;
    }

    const normalizedName = method.payment_method_name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return normalizedName.includes("credito");
  };

  const buildExpiryDateFromMonth = (monthValue) => {
    if (!monthValue || !monthValue.includes("-")) {
      return "";
    }

    const [year, month] = monthValue.split("-");
    return `${year}-${month}-01`;
  };

  const handleQuickCategoryFieldChange = (field, value) => {
    setQuickCategoryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetQuickCategoryState = () => {
    setQuickCategoryData({
      name: "",
      icon: "📦",
    });
  };

  const handleCreateCategoryShortcut = async (e) => {
    e.preventDefault();

    if (!quickCategoryData.name.trim() || !quickCategoryData.icon.trim()) {
      toast({
        title: "Validação",
        description: "Informe nome e icone da categoria.",
        variant: "destructive",
      });
      return;
    }

    setIsCategoryShortcutLoading(true);
    const previousCategoryIds = new Set(
      categories.map((item) => String(item.id)),
    );

    try {
      await createCategory({
        name: quickCategoryData.name.trim(),
        icon: quickCategoryData.icon.trim(),
      });

      const nextCategories = await loadCategories();
      const createdCategory = nextCategories.find(
        (item) => !previousCategoryIds.has(String(item.id)),
      );

      if (createdCategory?.id) {
        handleChange("category", String(createdCategory.id));
      }

      setIsCategoryShortcutOpen(false);
      resetQuickCategoryState();

      toast({
        title: "Categoria criada",
        description: "A nova categoria ja esta disponivel na transacao.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Nao foi possivel criar a categoria.";

      toast({
        title: "Erro ao criar categoria",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCategoryShortcutLoading(false);
    }
  };

  const handleQuickCardFieldChange = (field, value) => {
    setQuickCardData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetQuickCardState = () => {
    setQuickCardData({
      cardDescription: "",
      cardholderName: "",
      expiryMonth: "",
      paymentMethodId: "",
    });
  };

  const handleCreateCardShortcut = async (e) => {
    e.preventDefault();

    const expiryDate = buildExpiryDateFromMonth(quickCardData.expiryMonth);
    if (!quickCardData.cardholderName || !expiryDate) {
      toast({
        title: "Validação",
        description: "Preencha operadora e validade do cartao.",
        variant: "destructive",
      });
      return;
    }

    setIsCardShortcutLoading(true);

    try {
      const payload = {
        cardholder_name: quickCardData.cardholderName,
        expiry_date: expiryDate,
        payment_method_id: quickCardData.paymentMethodId
          ? Number(quickCardData.paymentMethodId)
          : null,
        card_description: quickCardData.cardDescription || null,
      };

      const response = await createPaymentCard(payload);
      const createdCardId = String(response?.data?.id || response?.id || "");

      await loadPaymentCards();
      if (createdCardId) {
        handleChange("paymentCardId", createdCardId);
      }

      setIsCardShortcutOpen(false);
      resetQuickCardState();

      toast({
        title: "Cartao criado",
        description: "O novo cartao ja esta selecionavel na transacao.",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Nao foi possivel criar o cartao.";

      toast({
        title: "Erro ao criar cartao",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCardShortcutLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);

        // Carregar categorias ativas
        await loadCategories();

        // Carregar usuários do grupo
        const { data: apiUsers } = await httpClient.get("/user-group/users");
        setUsers(apiUsers || [user]);

        // Carregar métodos de pagamento
        const { data: methodsResponse } =
          await httpClient.get("/payment-methods");
        setPaymentMethods(methodsResponse?.data || []);

        // Carregar cartões do usuário
        await loadPaymentCards();

        // Carregar moedas
        const { data: currenciesResponse } =
          await httpClient.get("/currencies");
        const nextCurrencies = currenciesResponse?.data || [];
        setCurrencies(nextCurrencies);

        // Aplicar moeda padrão do usuário no formulário de criação
        const defaultCurrencyId = user?.default_dashboard_currency_id;
        if (!isEditMode && defaultCurrencyId) {
          setFormData((prev) => ({
            ...prev,
            currencyId: String(defaultCurrencyId),
          }));
        } else if (!isEditMode && nextCurrencies.length > 0) {
          setFormData((prev) => ({
            ...prev,
            currencyId: prev.currencyId || String(nextCurrencies[0].id),
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Aviso",
          description: "Erro ao carregar categorias e responsáveis",
          variant: "destructive",
        });
        // Fallback para usuário atual se falhar
        setUsers([user]);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, toast, isEditMode]);

  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (!isEditMode) {
        setFormData(getDefaultFormData(user?.id));
        return;
      }

      try {
        setIsHydratingTransaction(true);
        const response = await getExpenseById(initialTransaction.id);
        const transaction = response?.data;

        if (!transaction) {
          return;
        }

        const rawPaymentMethodValue = resolvePaymentMethodValue(transaction);
        const matchedPaymentMethodValue = findMatchingPaymentMethodId(
          rawPaymentMethodValue,
        );

        setFormData({
          type: normalizeTransactionType(transaction.transaction_type),
          amount: Number(transaction.amount) || "",
          category: transaction.category_id
            ? String(transaction.category_id)
            : "",
          paymentMethod: matchedPaymentMethodValue || rawPaymentMethodValue,
          currencyId: transaction.currency_id
            ? String(transaction.currency_id)
            : "",
          paymentCardId: transaction.payment_card_id
            ? String(transaction.payment_card_id)
            : "",
          description: transaction.description || "",
          place: transaction.place || "",
          isInstallment: false,
          installments: 2,
          userId: transaction.user_id
            ? String(transaction.user_id)
            : String(user?.id || ""),
          date: transaction.date || new Date().toISOString().split("T")[0],
        });
      } catch (error) {
        console.error("Erro ao carregar transação para edição:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a transação para edição",
          variant: "destructive",
        });
      } finally {
        setIsHydratingTransaction(false);
      }
    };

    loadTransactionForEdit();
  }, [initialTransaction, isEditMode, user, toast, paymentMethods]);

  useEffect(() => {
    if (isCreditCardMethod(formData.paymentMethod)) {
      return;
    }

    if (formData.paymentCardId) {
      setFormData((prev) => ({
        ...prev,
        paymentCardId: "",
        isInstallment: false,
      }));
    }
  }, [formData.paymentMethod]);

  useEffect(() => {
    if (!isEditMode || paymentMethods.length === 0) {
      return;
    }

    const rawPaymentMethodValue =
      formData.paymentMethod ||
      resolvePaymentMethodValue(initialTransaction) ||
      "";

    if (!rawPaymentMethodValue) {
      return;
    }

    const matchedPaymentMethodValue = findMatchingPaymentMethodId(
      rawPaymentMethodValue,
    );

    if (
      matchedPaymentMethodValue &&
      matchedPaymentMethodValue !== formData.paymentMethod
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: matchedPaymentMethodValue,
      }));
    }
  }, [isEditMode, paymentMethods, formData.paymentMethod, initialTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.amount || formData.amount <= 0) {
      toast({
        title: "Validação",
        description: "Digite um valor maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === "expense" && !formData.category) {
      toast({
        title: "Validação",
        description: "Selecione uma categoria para despesa",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paymentMethod) {
      toast({
        title: "Validação",
        description: "Selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    if (!formData.currencyId) {
      toast({
        title: "Validação",
        description: "Selecione a moeda da transação",
        variant: "destructive",
      });
      return;
    }

    if (
      formData.type === "expense" &&
      isCreditCardMethod(formData.paymentMethod) &&
      (!formData.paymentCardId || formData.paymentCardId === "none")
    ) {
      toast({
        title: "Validação",
        description: "Selecione um cartao para pagamento em credito",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const expenseData = formatExpenseData(formData);
      const response = isEditMode
        ? await updateExpense(initialTransaction.id, expenseData)
        : await createExpense(expenseData);

      if (response.success) {
        toast({
          title: "Sucesso!",
          description:
            response.message ||
            (isEditMode
              ? "Transação atualizada com sucesso"
              : "Transação registrada com sucesso"),
          className: "bg-green-500 text-white",
        });

        if (onSubmit) {
          onSubmit(response.data);
        }

        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erro ao salvar transação. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto my-3 w-full max-w-md sm:my-6"
      >
        <Card className="glass-effect max-h-[calc(100dvh-5rem)] overflow-x-hidden overflow-y-auto rounded-2xl p-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-emerald-400" />
              {isEditMode ? "Editar Transação" : "Nova Transação"}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={
                  formData.type === "expense" ? "destructive" : "outline"
                }
                onClick={() => handleChange("type", "expense")}
                className="h-12"
              >
                Despesa
              </Button>
              <Button
                type="button"
                variant={formData.type === "income" ? "default" : "outline"}
                onClick={() => handleChange("type", "income")}
                className={`h-12 ${
                  formData.type === "income"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : ""
                }`}
              >
                Receita
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-muted-foreground">
                Valor
              </Label>
              <CurrencyInput
                id="amount"
                placeholder="0,00"
                value={formData.amount}
                onChange={(value) => handleChange("amount", value)}
                className="bg-background/50 h-12 text-lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.type === "expense" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-muted-foreground">Categoria</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setIsCategoryShortcutOpen(true)}
                      disabled={isCategoryShortcutLoading || isLoadingData}
                    >
                      <Tag className="mr-1.5 h-3.5 w-3.5" />
                      Criar categoria
                    </Button>
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange("category", value)}
                    disabled={isLoadingData}
                  >
                    <SelectTrigger className="bg-background/50 h-12">
                      <SelectValue
                        placeholder={
                          isLoadingData ? "Carregando..." : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          <span className="flex items-center">
                            <span className="mr-2">{c.icon}</span>
                            {c.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div
                className={`space-y-2 ${
                  formData.type === "income" ? "col-span-2" : ""
                }`}
              >
                <Label className="text-muted-foreground">Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleChange("paymentMethod", value)
                  }
                  disabled={isLoadingData}
                >
                  <SelectTrigger className="bg-background/50 h-12">
                    <SelectValue
                      placeholder={
                        isLoadingData ? "Carregando..." : "Selecione"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.payment_method_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Moeda</Label>
              <Select
                value={formData.currencyId}
                onValueChange={(value) => handleChange("currencyId", value)}
                disabled={isLoadingData}
              >
                <SelectTrigger className="bg-background/50 h-12">
                  <SelectValue
                    placeholder={isLoadingData ? "Carregando..." : "Selecione"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem
                      key={currency.id}
                      value={currency.id.toString()}
                    >
                      {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seletor de cartão se for cartão de crédito */}
            {isCreditCardMethod(formData.paymentMethod) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-muted-foreground">Cartão</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => setIsCardShortcutOpen(true)}
                    disabled={isLoadingData}
                  >
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Novo cartao
                  </Button>
                </div>
                <Select
                  value={formData.paymentCardId}
                  onValueChange={(value) =>
                    handleChange("paymentCardId", value)
                  }
                >
                  <SelectTrigger className="bg-background/50 h-12">
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {paymentCards.map((card) => (
                      <SelectItem key={card.id} value={card.id.toString()}>
                        {card.card_description ||
                          `**** ${card.card_number.slice(-4)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date" className="text-muted-foreground">
                Data
              </Label>
              <DatePicker
                id="date"
                value={formData.date}
                onChange={(dateValue) => handleChange("date", dateValue)}
                buttonClassName="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Responsável</Label>
              <Select
                value={formData.userId?.toString()}
                onValueChange={(value) => handleChange("userId", value)}
              >
                <SelectTrigger className="bg-background/50 h-12">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Adicione uma descrição (opcional)"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-background/50 resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="place" className="text-muted-foreground">
                Local/Estabelecimento
              </Label>
              <Input
                id="place"
                type="text"
                placeholder="Ex: Supermercado, Farmácia..."
                value={formData.place || ""}
                onChange={(e) => handleChange("place", e.target.value)}
                className="bg-background/50 h-12"
              />
            </div>

            {formData.type === "expense" &&
              isCreditCardMethod(formData.paymentMethod) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInstallment"
                    checked={formData.isInstallment}
                    onCheckedChange={(checked) =>
                      handleChange("isInstallment", checked)
                    }
                  />
                  <Label
                    htmlFor="isInstallment"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Compra Parcelada?
                  </Label>
                </div>
              )}

            {formData.isInstallment && (
              <div className="space-y-2">
                <Label htmlFor="installments" className="text-muted-foreground">
                  Número de Parcelas
                </Label>
                <Input
                  id="installments"
                  type="number"
                  min="2"
                  value={formData.installments}
                  onChange={(e) => handleChange("installments", e.target.value)}
                  className="bg-background/50 h-12"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold"
                disabled={isLoading || isLoadingData || isHydratingTransaction}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : isEditMode ? (
                  "Salvar"
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      <Dialog
        open={isCategoryShortcutOpen}
        onOpenChange={(nextOpen) => {
          setIsCategoryShortcutOpen(nextOpen);
          if (!nextOpen) {
            resetQuickCategoryState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Nova Categoria
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateCategoryShortcut}>
            <div className="space-y-2">
              <Label htmlFor="quick-category-name">Nome da Categoria</Label>
              <Input
                id="quick-category-name"
                value={quickCategoryData.name}
                onChange={(e) =>
                  handleQuickCategoryFieldChange("name", e.target.value)
                }
                placeholder="Ex: Lazer"
                disabled={isCategoryShortcutLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-category-icon">Icone</Label>
              <Input
                id="quick-category-icon"
                value={quickCategoryData.icon}
                onChange={(e) =>
                  handleQuickCategoryFieldChange("icon", e.target.value)
                }
                placeholder="Ex: 🍽️"
                maxLength={2}
                disabled={isCategoryShortcutLoading}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryShortcutOpen(false)}
                disabled={isCategoryShortcutLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCategoryShortcutLoading}>
                {isCategoryShortcutLoading ? "Criando..." : "Criar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCardShortcutOpen}
        onOpenChange={(nextOpen) => {
          setIsCardShortcutOpen(nextOpen);
          if (!nextOpen) {
            resetQuickCardState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Cartao
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateCardShortcut}>
            <div className="space-y-2">
              <Label htmlFor="quick-card-description">Nome do Cartao</Label>
              <Input
                id="quick-card-description"
                value={quickCardData.cardDescription}
                onChange={(e) =>
                  handleQuickCardFieldChange("cardDescription", e.target.value)
                }
                placeholder="Ex: Cartao principal"
                disabled={isCardShortcutLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-cardholder-name">Operadora</Label>
              <select
                id="quick-cardholder-name"
                value={quickCardData.cardholderName}
                onChange={(e) =>
                  handleQuickCardFieldChange("cardholderName", e.target.value)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                disabled={isCardShortcutLoading}
                required
              >
                <option value="">Selecione uma operadora...</option>
                {QUICK_CARD_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-card-expiry">Validade</Label>
              <Input
                id="quick-card-expiry"
                type="month"
                value={quickCardData.expiryMonth}
                onChange={(e) =>
                  handleQuickCardFieldChange("expiryMonth", e.target.value)
                }
                disabled={isCardShortcutLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-card-method">Tipo de Pagamento</Label>
              <select
                id="quick-card-method"
                value={quickCardData.paymentMethodId}
                onChange={(e) =>
                  handleQuickCardFieldChange("paymentMethodId", e.target.value)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                disabled={isCardShortcutLoading}
              >
                <option value="">Nao definido</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={String(method.id)}>
                    {method.payment_method_name}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCardShortcutOpen(false)}
                disabled={isCardShortcutLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCardShortcutLoading}>
                {isCardShortcutLoading ? "Criando..." : "Criar cartao"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TransactionForm;
