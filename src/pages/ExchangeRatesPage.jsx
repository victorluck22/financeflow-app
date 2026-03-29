import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Plus, RefreshCw, DollarSign } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import httpClient from "@/api/httpClient";
import { exchangeRateService } from "@/api/services/exchangeRateService";

const ExchangeRatesPage = () => {
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lastRefreshResult, setLastRefreshResult] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    from_currency_id: "",
    to_currency_id: "",
    rate: "",
    source: "manual",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ratesRes, currenciesRes] = await Promise.all([
        exchangeRateService.getAllRates(),
        httpClient.get("/currencies"),
      ]);

      if (ratesRes.success) {
        setRates(ratesRes.data);
      }

      if (currenciesRes.data.success) {
        setCurrencies(currenciesRes.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar taxas de câmbio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await exchangeRateService.createRate(formData);

      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Taxa de câmbio atualizada com sucesso",
          className: "bg-green-500 text-white",
        });

        loadData();
        setIsFormOpen(false);
        setFormData({
          from_currency_id: "",
          to_currency_id: "",
          rate: "",
          source: "manual",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar taxa:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.message || "Erro ao salvar taxa de câmbio",
        variant: "destructive",
      });
    }
  };

  const handleRefreshRates = async () => {
    try {
      setIsRefreshingRates(true);
      const response = await exchangeRateService.refreshRates();

      if (response.success) {
        const refreshData = response.data;
        setLastRefreshResult(refreshData);
        await loadData();

        toast({
          title: "Atualização concluída",
          description: `${refreshData.summary.updated} atualizada(s), ${refreshData.summary.unchanged} sem mudança, ${refreshData.summary.failed} falha(s).`,
          className:
            refreshData.summary.failed > 0
              ? "bg-amber-500 text-white"
              : "bg-green-500 text-white",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar cotações:", error);
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Erro ao atualizar taxas de câmbio automaticamente",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingRates(false);
    }
  };

  const getCurrencyName = (id) => {
    const currency = currencies.find((c) => c.id === id);
    return currency ? `${currency.name} (${currency.code})` : "N/A";
  };

  return (
    <>
      <Helmet>
        <title>Taxas de Câmbio - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie as taxas de conversão de moedas"
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
              Taxas de Câmbio
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie as taxas de conversão entre moedas
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>

            <Button
              onClick={handleRefreshRates}
              variant="secondary"
              disabled={isRefreshingRates}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshingRates ? "animate-spin" : ""}`}
              />
              {isRefreshingRates
                ? "Atualizando cotações..."
                : "Atualizar Cotações"}
            </Button>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Taxa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar Taxa de Câmbio</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_currency">De (Moeda)</Label>
                    <Select
                      value={formData.from_currency_id.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          from_currency_id: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda de origem" />
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

                  <div className="space-y-2">
                    <Label htmlFor="to_currency">Para (Moeda)</Label>
                    <Select
                      value={formData.to_currency_id.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          to_currency_id: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda de destino" />
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

                  <div className="space-y-2">
                    <Label htmlFor="rate">Taxa de Conversão</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.000001"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rate: e.target.value,
                        }))
                      }
                      placeholder="Ex: 5.00"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      1 unidade da moeda de origem = X unidades da moeda de
                      destino
                    </p>
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
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma taxa de câmbio cadastrada
            </p>
          </div>
        ) : (
          <>
            {lastRefreshResult && (
              <Card className="mb-6 border-primary/30">
                <CardHeader>
                  <CardTitle>Resultado da Atualização Automática</CardTitle>
                  <CardDescription>
                    Base {lastRefreshResult.baseCurrency} - Atualizadas:{" "}
                    {lastRefreshResult.summary.updated}, sem mudança:{" "}
                    {lastRefreshResult.summary.unchanged}, falhas:{" "}
                    {lastRefreshResult.summary.failed}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {lastRefreshResult.results.map((item) => (
                      <div
                        key={`${item.currencyCode}-${item.status}-${item.checkedAt}`}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <span className="font-medium">
                          {lastRefreshResult.baseCurrency} → {item.currencyCode}
                        </span>
                        <span className="text-muted-foreground">
                          {item.status === "updated" && "Atualizada"}
                          {item.status === "unchanged" && "Sem alteração"}
                          {item.status === "failed" && "Falhou"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rates.map((rate, index) => (
                <motion.div
                  key={rate.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="glass-effect hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          {rate.from_currency?.code} → {rate.to_currency?.code}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {parseFloat(rate.rate).toFixed(4)}
                        </span>
                      </CardTitle>
                      <CardDescription>
                        1 {rate.from_currency?.code} ={" "}
                        {parseFloat(rate.rate).toFixed(4)}{" "}
                        {rate.to_currency?.code}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Origem:</span>
                          <span className="font-medium">
                            {rate.from_currency?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destino:</span>
                          <span className="font-medium">
                            {rate.to_currency?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fonte:</span>
                          <span className="font-medium capitalize">
                            {rate.source || "Manual"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Válido desde:</span>
                          <span className="font-medium">
                            {new Date(rate.valid_from).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExchangeRatesPage;
