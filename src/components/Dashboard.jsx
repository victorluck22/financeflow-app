import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MonthlyFlowChart from "@/components/MonthlyFlowChart";
import CategoryChart from "@/components/CategoryChart";
import RecentTransactions from "@/components/RecentTransactions";
import {
  filterTransactionsByCurrency,
  formatDashboardAmount,
  getDashboardCurrencySymbol,
  resolveInitialCurrencyFilter,
} from "@/lib/dashboardCurrency";

const Dashboard = ({
  transactions,
  goals,
  users = [],
  currencies = [],
  defaultCurrencyId = "",
  onDeleteTransaction,
  onDeleteGoal,
  onUpdateGoal,
}) => {
  const [currencyFilter, setCurrencyFilter] = useState("all");

  useEffect(() => {
    setCurrencyFilter(resolveInitialCurrencyFilter(defaultCurrencyId));
  }, [defaultCurrencyId]);

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByCurrency(transactions, currencyFilter);
  }, [transactions, currencyFilter]);

  const selectedCurrencySymbol = useMemo(() => {
    return getDashboardCurrencySymbol(currencies, currencyFilter);
  }, [currencies, currencyFilter]);

  const formatAmount = (amount) =>
    formatDashboardAmount(amount, currencies, currencyFilter);

  const financialData = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const categoryExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return {
      income,
      expenses,
      balance,
      categoryExpenses,
      totalGoals: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      achievedGoals: goals.reduce((sum, g) => sum + g.currentAmount, 0),
    };
  }, [filteredTransactions, goals]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <Card className="glass-effect p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Moeda do dashboard
          </span>
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-[280px] bg-background/50">
              <SelectValue placeholder="Selecione a moeda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as moedas</SelectItem>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id.toString()}>
                  {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="income-card p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 dark:text-emerald-300 text-sm font-medium mb-1">
                  Receitas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(financialData.income)}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="expense-card p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-500 dark:text-red-400 text-sm font-medium mb-1">
                  Despesas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatAmount(financialData.expenses)}
                </p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card
            className={`p-6 rounded-2xl glass-effect ${financialData.balance >= 0 ? "income-card" : "expense-card"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">
                  Saldo
                </p>
                <p
                  className={`text-2xl font-bold ${financialData.balance >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                >
                  {formatAmount(financialData.balance)}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${financialData.balance >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}
              >
                <DollarSign
                  className={`w-6 h-6 ${financialData.balance >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="savings-card p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-500 dark:text-blue-400 text-sm font-medium mb-1">
                  Metas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {goals.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatAmount(financialData.achievedGoals)} /{" "}
                  {formatAmount(financialData.totalGoals)}
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted rounded-xl p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <Target className="w-4 h-4 mr-2" />
            Metas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Fluxo Financeiro Mensal
                </h3>
                <MonthlyFlowChart
                  transactions={filteredTransactions}
                  currencySymbol={selectedCurrencySymbol}
                />
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Transações Recentes
                </h3>
                <RecentTransactions
                  transactions={filteredTransactions.slice(0, 5)}
                  onDelete={onDeleteTransaction}
                  users={users}
                />
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-effect p-6 rounded-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-primary" />
                Gastos por Categoria
              </h3>
              <CategoryChart
                categoryExpenses={financialData.categoryExpenses}
                currencySymbol={selectedCurrencySymbol}
              />
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className="col-span-full text-center py-12"
              >
                <Target className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  Nenhuma meta criada
                </h3>
                <p className="text-muted-foreground/80">
                  Crie sua primeira meta de economia para começar!
                </p>
              </motion.div>
            ) : (
              goals.map((goal) => (
                <motion.div key={goal.id} variants={itemVariants}>
                  <Card className="glass-effect p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">
                          {goal.name}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {goal.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="text-foreground font-medium">
                          {formatAmount(goal.currentAmount)} /{" "}
                          {formatAmount(goal.targetAmount)}
                        </span>
                      </div>

                      <Progress
                        value={(goal.currentAmount / goal.targetAmount) * 100}
                        className="h-3 bg-secondary"
                      />

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {(
                            (goal.currentAmount / goal.targetAmount) *
                            100
                          ).toFixed(1)}
                          % concluído
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const amount = prompt(
                              "Quanto deseja adicionar à meta?",
                            );
                            if (amount && !isNaN(amount)) {
                              onUpdateGoal(goal.id, parseFloat(amount));
                            }
                          }}
                          className="bg-primary/20 text-primary hover:bg-primary/30 text-xs px-3 py-1"
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Dashboard;
