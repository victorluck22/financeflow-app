import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LineChart, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const INVESTMENT_TYPE_OPTIONS = [
  "Renda Fixa",
  "Renda Variavel",
  "Fundo Imobiliario",
  "Criptomoeda",
  "Tesouro Direto",
  "Previdencia",
  "Outro",
];

const InvestmentForm = ({ investment, onSubmit }) => {
  const [name, setName] = useState(investment?.name || "");
  const initialType = investment?.type || "";
  const isKnownType = INVESTMENT_TYPE_OPTIONS.includes(initialType);
  const [type, setType] = useState(
    isKnownType ? initialType : initialType ? "Outro" : "",
  );
  const [customType, setCustomType] = useState(isKnownType ? "" : initialType);
  const [amount, setAmount] = useState(investment?.amount || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const normalizedType =
      type === "Outro" ? customType.trim() : (type || "").trim();

    if (!normalizedType) {
      alert("Por favor, selecione o tipo do investimento");
      return;
    }

    onSubmit({
      id: investment?.id,
      name,
      type: normalizedType,
      amount: parseFloat(amount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Investimento</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Ações da Apple"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          required
        >
          <option value="">Selecione o tipo...</option>
          {INVESTMENT_TYPE_OPTIONS.map((typeOption) => (
            <option key={typeOption} value={typeOption}>
              {typeOption}
            </option>
          ))}
        </select>
      </div>
      {type === "Outro" ? (
        <div className="space-y-2">
          <Label htmlFor="customType">Tipo personalizado</Label>
          <Input
            id="customType"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Descreva o tipo"
            required
          />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="amount">Valor Investido (R$)</Label>
        <CurrencyInput
          id="amount"
          value={amount}
          onChange={(value) => setAmount(value)}
          placeholder="1000.00"
          required
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
};

const InvestmentsPage = () => {
  const {
    investments = [],
    addInvestment = () => {},
    updateInvestment = () => {},
    deleteInvestment = () => {},
  } = useOutletContext() || {};
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const { toast } = useToast();

  const handleFormSubmit = (data) => {
    if (data.id) {
      updateInvestment(data);
      toast({ title: "Sucesso!", description: "Investimento atualizado." });
    } else {
      addInvestment(data);
      toast({ title: "Sucesso!", description: "Investimento adicionado." });
    }
    setIsFormOpen(false);
    setSelectedInvestment(null);
  };

  const openForm = (investment = null) => {
    setSelectedInvestment(investment);
    setIsFormOpen(true);
  };

  const totalInvested = investments.reduce(
    (sum, inv) => sum + (inv?.amount || 0),
    0,
  );

  return (
    <>
      <Helmet>
        <title>Investimentos - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie seus investimentos no FinanceFlow."
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
              Investimentos
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe o crescimento do seu patrimônio.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" /> Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedInvestment ? "Editar" : "Novo"} Investimento
                </DialogTitle>
              </DialogHeader>
              <InvestmentForm
                investment={selectedInvestment}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </motion.div>

        <Card className="mb-8 glass-effect">
          <CardHeader>
            <CardDescription>Total Investido</CardDescription>
            <CardTitle className="text-3xl gradient-text">
              R$ {totalInvested.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col glass-effect">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{investment.name}</span>
                    <span className="text-sm font-medium bg-primary/20 text-primary px-2 py-1 rounded-md">
                      {investment.type}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Valor: R$ {(investment.amount || 0).toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <div className="p-6 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openForm(investment)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteInvestment(investment.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {investments.length === 0 && (
          <div className="text-center py-16">
            <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              Nenhum investimento adicionado
            </h3>
            <p className="text-muted-foreground">
              Comece a adicionar seus investimentos para acompanhá-los.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default InvestmentsPage;
