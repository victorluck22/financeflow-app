import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { ListFilter, Search, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import RecentTransactions from "@/components/RecentTransactions";
import {
  parseCanonicalDateFlexible,
  toRangeComparisonBounds,
} from "@/lib/datePicker";

const TransactionsPage = () => {
  const {
    transactions,
    deleteTransaction,
    onEditTransaction,
    users = [],
  } = useOutletContext();

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    user: "all",
    date: { startDate: "", endDate: "" },
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredTransactions = useMemo(() => {
    const { startDate, endDate } = toRangeComparisonBounds(filters.date);

    return transactions.filter((t) => {
      const matchesType = filters.type === "all" || t.type === filters.type;
      const matchesUser =
        filters.user === "all" || String(t.userId) === String(filters.user);
      const matchesSearch =
        filters.search === "" ||
        t.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.amount.toString().includes(filters.search);

      const transactionDate =
        parseCanonicalDateFlexible(t.date) || new Date(t.date);
      const matchesDate =
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate);

      return matchesType && matchesUser && matchesSearch && matchesDate;
    });
  }, [transactions, filters]);

  return (
    <>
      <Helmet>
        <title>Transações - FinanceFlow</title>
        <meta
          name="description"
          content="Consulte e gerencie suas receitas e despesas no FinanceFlow."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Minhas Transações
            </h1>
            <p className="text-muted-foreground text-lg">
              Consulte e gerencie suas receitas e despesas.
            </p>
          </div>
        </motion.div>

        <Card className="p-4 mb-6 glass-effect">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por descrição, categoria..."
                className="pl-10 bg-background/50"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(v) => handleFilterChange("type", v)}
            >
              <SelectTrigger className="bg-background/50">
                <ListFilter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.user}
              onValueChange={(v) => handleFilterChange("user", v)}
            >
              <SelectTrigger className="bg-background/50">
                <User className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DatePicker
              id="date"
              mode="range"
              value={filters.date}
              onChange={(nextRange) => handleFilterChange("date", nextRange)}
              placeholder="Selecione um período"
              className="w-full"
            />
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <RecentTransactions
            transactions={filteredTransactions}
            onDelete={deleteTransaction}
            onEdit={onEditTransaction}
            users={users}
          />
        </motion.div>
      </div>
    </>
  );
};

export default TransactionsPage;
