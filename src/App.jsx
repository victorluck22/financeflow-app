import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { getAllExpenses, deleteExpense } from "@/api/services/expenseService";
import { normalizeTransactionType } from "@/lib/transactionType";
import {
  getAllPaymentCards,
  createPaymentCard,
  updatePaymentCard,
  deletePaymentCard,
} from "@/api/services/paymentCardService";
import { paymentMethodService } from "@/api/services/paymentMethodService";
import httpClient from "@/api/httpClient";

import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import InvestmentsPage from "@/pages/InvestmentsPage";
import FinancingPage from "@/pages/FinancingPage";
import CardsPage from "@/pages/CardsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SetupPasswordPage from "@/pages/SetupPasswordPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ConfirmEmailChangePage from "@/pages/ConfirmEmailChangePage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import UsersPage from "@/pages/UsersPage";
import ExchangeRatesPage from "@/pages/ExchangeRatesPage";
import TransactionForm from "@/components/TransactionForm";
import GoalForm from "@/components/GoalForm";

const useAppLogic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const dataLoadedRef = useRef(false);

  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [financings, setFinancings] = useState([]);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const mapTransactionFromApi = (transaction) => ({
    id: transaction.id || `${Date.now()}`,
    type: normalizeTransactionType(
      transaction.transaction_type || transaction.type,
    ),
    amount: parseFloat(transaction.amount),
    category_id: transaction.category_id,
    category: transaction.category?.name || transaction.category || "Outros",
    categoryIcon: transaction.category?.icon || "📦",
    description: transaction.description,
    place: transaction.place,
    date: transaction.date,
    userId: transaction.user_id,
    payment_method_id:
      transaction.payment_method_id || transaction.paymentMethodId || null,
    payment_card_id:
      transaction.payment_card_id || transaction.paymentCardId || null,
    currency_id: transaction.currency_id || transaction.currencyId || null,
    currency: transaction.currency || null,
    currencyCode:
      transaction.currency?.code || transaction.currencyCode || "BRL",
    currencySymbol:
      transaction.currency?.symbol || transaction.currencySymbol || "R$",
    is_recurring: transaction.is_recurring || false,
  });

  const defaultCategories = [
    { id: "cat1", value: "food", name: "Alimentação", icon: "🍽️" },
    { id: "cat2", value: "transport", name: "Transporte", icon: "🚗" },
    { id: "cat3", value: "entertainment", name: "Entretenimento", icon: "🎬" },
    { id: "cat4", value: "shopping", name: "Compras", icon: "🛍️" },
    { id: "cat5", value: "health", name: "Saúde", icon: "🏥" },
    { id: "cat6", value: "education", name: "Educação", icon: "📚" },
    { id: "cat7", value: "bills", name: "Contas", icon: "📄" },
    { id: "cat8", value: "other", name: "Outros", icon: "📦" },
  ];

  const loadData = (key, setter, defaultValue = []) => {
    if (!user) return;
    const savedData = localStorage.getItem(`${key}-${user.id}`);
    if (savedData) {
      try {
        setter(JSON.parse(savedData));
      } catch (error) {
        console.warn(`Erro ao fazer parse de ${key}:`, error);
        setter(defaultValue);
      }
    } else {
      setter(defaultValue);
    }
  };

  const saveData = (key, data) => {
    if (user) localStorage.setItem(`${key}-${user.id}`, JSON.stringify(data));
  };

  useEffect(() => {
    if (user && !dataLoadedRef.current) {
      dataLoadedRef.current = true;

      // Carregar dados locais (não críticos)
      loadData("budget-goals", setGoals);
      loadData("budget-investments", setInvestments);
      loadData("budget-financings", setFinancings);
      loadData("budget-categories", setCategories, defaultCategories);

      // Carregar cartões da API
      getAllPaymentCards()
        .then((response) => {
          if (response.success && response.data) {
            const mappedCards = response.data.map((card) => {
              // Converter data de YYYY-MM-DD para MM/AA
              let formattedDate = "";
              if (card.expiry_date) {
                const [year, month] = card.expiry_date.split("-");
                const shortYear = year.substring(2); // Pega os últimos 2 dígitos
                formattedDate = `${month}/${shortYear}`;
              }

              return {
                id: card.id,
                name: card.card_description || "Cartão sem nome",
                cardholder: card.cardholder_name || "",
                paymentMethodId: card.payment_method_id || null,
                expiryDate: formattedDate,
                limit: parseFloat(card.credit_limit) || 0,
                closingDay: card.closing_day || 1,
                cardLastDigits: card.card_number || "",
                loyaltyProgram: card.loyalty_program || "",
                loyaltyPoints: parseFloat(card.loyalty_points) || 0,
              };
            });
            setCards(mappedCards);
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar cartões:", error);
          loadData("budget-cards", setCards);
        });

      // Carregar transações da API
      getAllExpenses()
        .then((response) => {
          if (response.success && response.data) {
            const mappedTransactions = response.data.map(mapTransactionFromApi);
            setTransactions(mappedTransactions);
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar despesas:", error);
          toast({
            title: "Aviso",
            description: "Erro ao carregar transações",
            variant: "destructive",
          });
        });

      // Carregar usuários da API
      Promise.all([
        httpClient.get("/user-group/users"),
        httpClient.get("/user-shares"),
      ])
        .then(([groupResponse, sharesResponse]) => {
          const groupUsers = groupResponse.data || [user];
          const sharedOwners = (sharesResponse.data?.data?.requested || [])
            .filter((share) => share.status === "accepted")
            .map((share) => share.data_owner)
            .filter(Boolean);

          const combinedUsers = [...groupUsers, ...sharedOwners].reduce(
            (acc, nextUser) => {
              if (
                !acc.some((item) => String(item.id) === String(nextUser.id))
              ) {
                acc.push(nextUser);
              }
              return acc;
            },
            [],
          );

          setUsers(combinedUsers.length ? combinedUsers : [user]);
        })
        .catch((error) => {
          console.error("Erro ao carregar usuários:", error);
          setUsers([user]);
        });

      httpClient
        .get("/currencies")
        .then((response) => {
          if (response.data?.success && response.data?.data) {
            setCurrencies(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Erro ao carregar moedas:", error);
        });
    }
  }, [user]);

  useEffect(() => saveData("budget-goals", goals), [goals, user]);
  useEffect(
    () => saveData("budget-investments", investments),
    [investments, user],
  );
  useEffect(
    () => saveData("budget-financings", financings),
    [financings, user],
  );
  useEffect(() => saveData("budget-cards", cards), [cards, user]);
  useEffect(
    () => saveData("budget-categories", categories),
    [categories, user],
  );

  const addTransaction = (transaction) => {
    const newTransaction = mapTransactionFromApi(transaction);
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransactionInState = (transaction) => {
    const updated = mapTransactionFromApi(transaction);
    setTransactions((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteExpense(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive",
      });
    }
  };

  const updateGoal = (goalId, amount) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentAmount: Math.min(
                goal.currentAmount + parseFloat(amount),
                goal.targetAmount,
              ),
            }
          : goal,
      ),
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const createCrud = (setter) => ({
    add: (item) =>
      setter((prev) => [{ ...item, id: Date.now().toString() }, ...prev]),
    update: (item) =>
      setter((prev) => prev.map((i) => (i.id === item.id ? item : i))),
    delete: (id) => setter((prev) => prev.filter((i) => i.id !== id)),
  });

  const {
    add: addInvestment,
    update: updateInvestment,
    delete: deleteInvestment,
  } = createCrud(setInvestments);
  const {
    add: addFinancing,
    update: updateFinancing,
    delete: deleteFinancing,
  } = createCrud(setFinancings);

  const addCard = async (data) => {
    try {
      // Converter MM/YY para YYYY-MM-DD
      const [month, year] = data.expiryDate.split("/");
      const fullYear = `20${year}`;
      const expiryDateFormatted = `${fullYear}-${month}-01`;

      const cardData = {
        card_number: data.cardLastDigits || null,
        cardholder_name: data.cardholder,
        expiry_date: expiryDateFormatted,
        payment_method_id: data.paymentMethodId || null,
        card_description: data.name,
        credit_limit: data.limit,
        closing_day: data.closingDay,
        loyalty_program: data.loyaltyProgram,
        loyalty_points: data.loyaltyPoints,
      };
      const response = await createPaymentCard(cardData);
      if (response.success && response.data) {
        // Converter data de YYYY-MM-DD para MM/AA
        let formattedDate = "";
        if (response.data.expiry_date) {
          const [year, month] = response.data.expiry_date.split("-");
          const shortYear = year.substring(2);
          formattedDate = `${month}/${shortYear}`;
        }

        const newCard = {
          id: response.data.id,
          name: response.data.card_description || "Cartão sem nome",
          cardholder: response.data.cardholder_name || "",
          paymentMethodId: response.data.payment_method_id || null,
          expiryDate: formattedDate,
          limit: parseFloat(response.data.credit_limit) || 0,
          closingDay: response.data.closing_day || 1,
          cardLastDigits: response.data.card_number || "",
          loyaltyProgram: response.data.loyalty_program || "",
          loyaltyPoints: parseFloat(response.data.loyalty_points) || 0,
        };
        setCards((prev) => [newCard, ...prev]);
        toast({
          title: "Sucesso!",
          description: "Cartão criado com sucesso",
          className: "bg-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar cartão",
        variant: "destructive",
      });
    }
  };

  const updateCard = async (data) => {
    try {
      // Converter MM/YY para YYYY-MM-DD
      const [month, year] = data.expiryDate.split("/");
      const fullYear = `20${year}`;
      const expiryDateFormatted = `${fullYear}-${month}-01`;

      const cardData = {
        card_number: data.cardLastDigits || null,
        cardholder_name: data.cardholder,
        expiry_date: expiryDateFormatted,
        payment_method_id: data.paymentMethodId || null,
        card_description: data.name,
        credit_limit: data.limit,
        closing_day: data.closingDay,
        loyalty_program: data.loyaltyProgram,
        loyalty_points: data.loyaltyPoints,
      };
      const response = await updatePaymentCard(data.id, cardData);
      if (response.success && response.data) {
        // Converter data de YYYY-MM-DD para MM/AA
        let formattedDate = "";
        if (response.data.expiry_date) {
          const [year, month] = response.data.expiry_date.split("-");
          const shortYear = year.substring(2);
          formattedDate = `${month}/${shortYear}`;
        }

        const updatedCard = {
          id: response.data.id,
          name: response.data.card_description || "Cartão sem nome",
          cardholder: response.data.cardholder_name || "",
          paymentMethodId: response.data.payment_method_id || null,
          expiryDate: formattedDate,
          limit: parseFloat(response.data.credit_limit) || 0,
          closingDay: response.data.closing_day || 1,
          cardLastDigits: response.data.card_number || "",
          loyaltyProgram: response.data.loyalty_program || "",
          loyaltyPoints: parseFloat(response.data.loyalty_points) || 0,
        };
        setCards((prev) =>
          prev.map((c) => (c.id === data.id ? updatedCard : c)),
        );
        toast({
          title: "Sucesso!",
          description: "Cartão atualizado com sucesso",
          className: "bg-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cartão",
        variant: "destructive",
      });
    }
  };

  const deleteCard = async (id) => {
    try {
      const response = await deletePaymentCard(id);
      if (response.success) {
        setCards((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Sucesso!",
          description: "Cartão deletado com sucesso",
          className: "bg-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar cartão:", error);
      toast({
        title: "Erro",
        description: "Erro ao deletar cartão",
        variant: "destructive",
      });
    }
  };

  const {
    add: addCategory,
    update: updateCategory,
    delete: deleteCategory,
  } = createCrud(setCategories);

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentMethodService.getAllPaymentMethods();
      if (response.success && response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar métodos de pagamento:", error);
    }
  };

  return {
    transactions,
    goals,
    investments,
    financings,
    cards,
    categories,
    users,
    currencies,
    paymentMethods,
    addTransaction,
    addGoal,
    addInvestment,
    addFinancing,
    addCard,
    addCategory,
    updateGoal,
    updateInvestment,
    updateFinancing,
    updateCard,
    updateCategory,
    deleteTransaction,
    updateTransactionInState,
    deleteGoal,
    deleteInvestment,
    deleteFinancing,
    deleteCard,
    deleteCategory,
    loadPaymentMethods,
  };
};

const MainLayout = () => {
  const logic = useAppLogic();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const handleCreateTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleTransactionSubmit = (transaction) => {
    if (editingTransaction?.id) {
      logic.updateTransactionInState(transaction);
    } else {
      logic.addTransaction(transaction);
    }

    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleCloseTransactionForm = () => {
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleAddGoal = (goal) => {
    logic.addGoal(goal);
    setShowGoalForm(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        onNewTransaction={handleCreateTransaction}
        onNewGoal={() => setShowGoalForm(true)}
      />
      <main>
        <Outlet
          context={{
            ...logic,
            onEditTransaction: handleEditTransaction,
          }}
        />
      </main>

      <AnimatePresence>
        {showTransactionForm && (
          <TransactionForm
            onSubmit={handleTransactionSubmit}
            onClose={handleCloseTransactionForm}
            initialTransaction={editingTransaction}
          />
        )}

        {showGoalForm && (
          <GoalForm
            onSubmit={handleAddGoal}
            onClose={() => setShowGoalForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup-password" element={<SetupPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/confirm-email-change"
          element={<ConfirmEmailChangePage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="investments" element={<InvestmentsPage />} />
          <Route path="financing" element={<FinancingPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/profile" element={<ProfilePage />} />
          <Route path="settings/cards" element={<CardsPage />} />
          <Route path="settings/categories" element={<CategoriesPage />} />
          <Route path="settings/users" element={<UsersPage />} />
          <Route
            path="settings/exchange-rates"
            element={<ExchangeRatesPage />}
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
