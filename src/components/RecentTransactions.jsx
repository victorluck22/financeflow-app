import React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const categoryIcons = {
  food: "🍽️",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  health: "🏥",
  education: "📚",
  bills: "📄",
  other: "📦",
};
const categoryLabels = {
  food: "Alimentação",
  transport: "Transporte",
  entertainment: "Entretenimento",
  shopping: "Compras",
  health: "Saúde",
  education: "Educação",
  bills: "Contas",
  other: "Outros",
};

const RecentTransactions = ({ transactions, onDelete, onEdit, users = [] }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma transação encontrada</p>
      </div>
    );
  }

  const getUserName = (userId) => {
    if (!users || !Array.isArray(users)) return "N/A";
    return users.find((u) => u.id === userId)?.name || "N/A";
  };

  const formatAmount = (transaction) => {
    const symbol = transaction.currencySymbol || "R$";
    const code = transaction.currencyCode || "BRL";
    return `${symbol} ${transaction.amount.toFixed(2)} (${code})`;
  };

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
      {transactions.map((t, index) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${t.type === "income" ? "bg-emerald-500/20" : "bg-primary/10"}`}
            >
              {t.type === "income" ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-lg">
                  {t.categoryIcon || categoryIcons[t.category] || "📦"}
                </span>
              )}
            </div>

            <div>
              <p className="text-foreground font-medium text-sm">
                {t.description || categoryLabels[t.category] || "Transação"}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date(t.date).toLocaleDateString("pt-BR")} por{" "}
                {getUserName(t.userId)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-semibold text-sm ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}
            >
              {t.type === "income" ? "+" : "-"}
              {formatAmount(t)}
            </span>

            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(t)}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(t.id)}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecentTransactions;
