import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, CreditCard, Edit, Trash2 } from "lucide-react";
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

const CardForm = ({ card, onSubmit, isLoading, paymentMethods = [] }) => {
  const [name, setName] = useState(card?.name || "");
  const [cardholder, setCardholder] = useState(card?.cardholder || "");
  const [paymentMethodId, setPaymentMethodId] = useState(
    card?.paymentMethodId || "",
  );
  const [expiryDate, setExpiryDate] = useState(card?.expiryDate || "");
  const [limit, setLimit] = useState(card?.limit || 0);
  const [closingDay, setClosingDay] = useState(card?.closingDay || "");
  const [cardLastDigits, setCardLastDigits] = useState(
    card?.cardLastDigits || "",
  );
  const [loyaltyProgram, setLoyaltyProgram] = useState(
    card?.loyaltyProgram || "",
  );
  const [loyaltyPoints, setLoyaltyPoints] = useState(card?.loyaltyPoints || 0);

  // Atualizar estados quando o card mudar (para edição)
  useEffect(() => {
    if (card) {
      setName(card.name || "");
      setCardholder(card.cardholder || "");
      setPaymentMethodId(
        card.paymentMethodId ? String(card.paymentMethodId) : "",
      );
      setExpiryDate(card.expiryDate || "");
      setLimit(card.limit || 0);
      setClosingDay(card.closingDay || "");
      setCardLastDigits(card.cardLastDigits || "");
      setLoyaltyProgram(card.loyaltyProgram || "");
      setLoyaltyPoints(card.loyaltyPoints || 0);
    } else {
      // Resetar para criar novo cartão
      setName("");
      setCardholder("");
      setPaymentMethodId("");
      setExpiryDate("");
      setLimit(0);
      setClosingDay("");
      setCardLastDigits("");
      setLoyaltyProgram("");
      setLoyaltyPoints(0);
    }
  }, [card]);

  const cardholders = [
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

  const handleCardDigitsChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardLastDigits(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor, preencha o nome do cartão");
      return;
    }
    if (!cardholder) {
      alert("Por favor, selecione o operador do cartão");
      return;
    }
    if (!expiryDate) {
      alert("Por favor, preencha a data de validade");
      return;
    }
    onSubmit({
      id: card?.id,
      name,
      cardholder,
      paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : null,
      expiryDate,
      limit: parseFloat(limit) || 0,
      closingDay: parseInt(closingDay, 10) || 1,
      cardLastDigits,
      loyaltyProgram,
      loyaltyPoints: parseFloat(loyaltyPoints) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Nubank Platinum"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardholder">Operador do Cartão</Label>
        <select
          id="cardholder"
          value={cardholder}
          onChange={(e) => setCardholder(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          required
          disabled={isLoading}
        >
          <option value="">Selecione um operador...</option>
          {cardholders.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="paymentMethodId">Tipo de Cartão</Label>
        <select
          id="paymentMethodId"
          value={paymentMethodId}
          onChange={(e) => setPaymentMethodId(e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          <option value="">Selecione o tipo...</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.payment_method_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiryDate">Data de Validade (MM/AA)</Label>
        <Input
          id="expiryDate"
          value={expiryDate}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length >= 2) {
              value = value.slice(0, 2) + "/" + value.slice(2, 4);
            }
            setExpiryDate(value);
          }}
          placeholder="MM/AA"
          maxLength="5"
          type="text"
          inputMode="numeric"
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardLastDigits">Últimos 4 Dígitos do Cartão</Label>
        <Input
          id="cardLastDigits"
          value={cardLastDigits}
          onChange={handleCardDigitsChange}
          placeholder="0000"
          maxLength="4"
          inputMode="numeric"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="limit">Limite (R$)</Label>
          <CurrencyInput
            id="limit"
            value={limit}
            onChange={(value) => setLimit(value)}
            placeholder="0,00"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closingDay">Dia do Fechamento</Label>
          <Input
            id="closingDay"
            type="number"
            min="1"
            max="31"
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            placeholder="25"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loyaltyProgram">Programa de Fidelidade</Label>
          <Input
            id="loyaltyProgram"
            value={loyaltyProgram}
            onChange={(e) => setLoyaltyProgram(e.target.value)}
            placeholder="Ex: Livelo, Esfera"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loyaltyPoints">Pontos Acumulados</Label>
          <Input
            id="loyaltyPoints"
            type="number"
            step="0.01"
            value={loyaltyPoints}
            onChange={(e) => setLoyaltyPoints(e.target.value)}
            placeholder="0"
            disabled={isLoading}
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const CardsPage = () => {
  const {
    cards,
    addCard,
    updateCard,
    deleteCard,
    paymentMethods,
    loadPaymentMethods,
  } = useOutletContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (data.id) {
        await updateCard(data);
      } else {
        await addCard(data);
      }
      setIsFormOpen(false);
      setSelectedCard(null);
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (card = null) => {
    setSelectedCard(card);
    setIsFormOpen(true);
    // Carregar payment methods quando abrir o formulário
    if (paymentMethods.length === 0) {
      loadPaymentMethods();
    }
  };

  return (
    <>
      <Helmet>
        <title>Cartões - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie seus cartões de crédito no FinanceFlow."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Meus Cartões</h1>
            <p className="text-muted-foreground text-lg">
              Cadastre e gerencie seus cartões de crédito.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" /> Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedCard ? "Editar" : "Novo"} Cartão
                </DialogTitle>
              </DialogHeader>
              <CardForm
                card={selectedCard}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                paymentMethods={paymentMethods}
              />
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col justify-between glass-effect bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">{card.name}</CardTitle>
                    <CreditCard className="w-8 h-8 text-white/70" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-white/80 space-y-2">
                    <p>
                      Limite:{" "}
                      <span className="font-bold text-white">
                        R$ {card.limit.toFixed(2)}
                      </span>
                    </p>
                    <p>
                      Fechamento:{" "}
                      <span className="font-bold text-white">
                        Todo dia {card.closingDay}
                      </span>
                    </p>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openForm(card)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteCard(card.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Nenhum cartão adicionado</h3>
            <p className="text-muted-foreground">
              Adicione seus cartões de crédito para começar.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CardsPage;
