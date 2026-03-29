import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Landmark,
  Edit,
  Trash2,
  Calendar,
  CircleDollarSign,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const FinancingForm = ({ financing, onSubmit }) => {
  const [name, setName] = useState(financing?.name || "");
  const [totalAmount, setTotalAmount] = useState(financing?.totalAmount || "");
  const [installments, setInstallments] = useState(
    financing?.installments || "",
  );
  const [paidInstallments, setPaidInstallments] = useState(
    financing?.paidInstallments || 0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: financing?.id,
      name,
      totalAmount: parseFloat(totalAmount),
      installments: parseInt(installments, 10),
      paidInstallments: parseInt(paidInstallments, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Financiamento</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Financiamento Veículo"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalAmount">Valor Total (R$)</Label>
        <CurrencyInput
          id="totalAmount"
          value={totalAmount}
          onChange={(value) => setTotalAmount(value)}
          placeholder="50000.00"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="installments">Total de Parcelas</Label>
          <Input
            id="installments"
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="48"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
          <Input
            id="paidInstallments"
            type="number"
            value={paidInstallments}
            onChange={(e) => setPaidInstallments(e.target.value)}
            placeholder="12"
            required
          />
        </div>
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

const FinancingPage = () => {
  const { financings, addFinancing, updateFinancing, deleteFinancing } =
    useOutletContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState(null);
  const { toast } = useToast();

  const handleFormSubmit = (data) => {
    if (data.id) {
      updateFinancing(data);
      toast({ title: "Sucesso!", description: "Financiamento atualizado." });
    } else {
      addFinancing(data);
      toast({ title: "Sucesso!", description: "Financiamento adicionado." });
    }
    setIsFormOpen(false);
    setSelectedFinancing(null);
  };

  const openForm = (financing = null) => {
    setSelectedFinancing(financing);
    setIsFormOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Financiamentos - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie seus financiamentos no FinanceFlow."
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
              Financiamentos
            </h1>
            <p className="text-muted-foreground text-lg">
              Controle suas parcelas e prazos.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" /> Novo Financiamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedFinancing ? "Editar" : "Novo"} Financiamento
                </DialogTitle>
              </DialogHeader>
              <FinancingForm
                financing={selectedFinancing}
                onSubmit={handleFormSubmit}
              />
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {financings.map((f) => {
            const progress = (f.paidInstallments / f.installments) * 100;
            const remainingAmount =
              f.totalAmount * (1 - f.paidInstallments / f.installments);
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col glass-effect">
                  <CardHeader>
                    <CardTitle>{f.name}</CardTitle>
                    <CardDescription>
                      Valor Total: R$ {f.totalAmount.toFixed(2)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          Progresso
                        </span>
                        <span className="text-sm font-medium">
                          {f.paidInstallments} / {f.installments} parcelas
                        </span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-green-500" />
                        <span>Valor Pago:</span>
                      </div>
                      <span>
                        R$ {(f.totalAmount - remainingAmount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span>Saldo Devedor:</span>
                      </div>
                      <span>R$ {remainingAmount.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openForm(f)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteFinancing(f.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {financings.length === 0 && (
          <div className="text-center py-16">
            <Landmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              Nenhum financiamento adicionado
            </h3>
            <p className="text-muted-foreground">
              Adicione seus financiamentos para começar a controlá-los.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default FinancingPage;
