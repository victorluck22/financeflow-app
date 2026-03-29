import React from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/providers/AuthProvider";

const DashboardPage = () => {
  const { user } = useAuth();
  const {
    transactions,
    goals,
    deleteTransaction,
    deleteGoal,
    updateGoal,
    users,
    currencies,
  } = useOutletContext();

  return (
    <>
      <Helmet>
        <title>Dashboard - FinanceFlow</title>
        <meta
          name="description"
          content="Sua visão geral financeira no FinanceFlow."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <Dashboard
          transactions={transactions}
          goals={goals}
          users={users || []}
          currencies={currencies || []}
          defaultCurrencyId={
            user?.default_dashboard_currency_id
              ? String(user.default_dashboard_currency_id)
              : ""
          }
          onDeleteTransaction={deleteTransaction}
          onDeleteGoal={deleteGoal}
          onUpdateGoal={updateGoal}
        />
      </div>
    </>
  );
};

export default DashboardPage;
