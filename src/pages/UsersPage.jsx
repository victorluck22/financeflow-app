import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { User, Mail, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { useOutletContext } from "react-router-dom";
import {
  acceptUserShareRequest,
  createUserShareRequest,
  listUserSharesRequest,
  revokeUserShareRequest,
  searchShareUserByEmailRequest,
} from "@/api/services/authService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserPreferences } from "@/api/services/userPreferenceService";

const UsersPage = () => {
  const { user: currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const { users = [], currencies = [] } = useOutletContext();
  const [isSaving, setIsSaving] = useState(false);
  const [shareSearchEmail, setShareSearchEmail] = useState("");
  const [shareCandidate, setShareCandidate] = useState(null);
  const [shareSearchLoading, setShareSearchLoading] = useState(false);
  const [shares, setShares] = useState({ requested: [], received: [] });
  const [shareActionLoading, setShareActionLoading] = useState(false);
  const [defaultDashboardCurrencyId, setDefaultDashboardCurrencyId] = useState(
    currentUser?.default_dashboard_currency_id
      ? String(currentUser.default_dashboard_currency_id)
      : "none",
  );

  const currentCurrencyLabel = useMemo(() => {
    if (!currentUser?.default_dashboard_currency_id) {
      return "Nao definida";
    }

    const currency = currencies.find(
      (item) =>
        String(item.id) === String(currentUser.default_dashboard_currency_id),
    );

    if (!currency) {
      return "Nao definida";
    }

    return `${currency.name} (${currency.code})`;
  }, [currencies, currentUser?.default_dashboard_currency_id]);

  const loadShares = async () => {
    try {
      const response = await listUserSharesRequest();
      if (response.success && response.data) {
        setShares(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar compartilhamentos:", error);
    }
  };

  useEffect(() => {
    loadShares();
  }, []);

  const handleSearchShareCandidate = async (event) => {
    event.preventDefault();
    if (!shareSearchEmail) {
      return;
    }

    setShareSearchLoading(true);
    try {
      const response = await searchShareUserByEmailRequest(shareSearchEmail);
      setShareCandidate(response.data);
      if (!response.data) {
        toast({
          title: "Nenhum resultado",
          description: "Nao encontramos usuario elegivel com este e-mail.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na busca",
        description:
          error.response?.data?.message || "Nao foi possivel buscar usuario.",
        variant: "destructive",
      });
    } finally {
      setShareSearchLoading(false);
    }
  };

  const handleCreateShare = async () => {
    if (!shareCandidate?.email) {
      return;
    }

    setShareActionLoading(true);
    try {
      const response = await createUserShareRequest({
        email: shareCandidate.email,
      });
      toast({
        title: "Solicitacao criada",
        description: response.message,
      });
      await loadShares();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel criar solicitacao.",
        variant: "destructive",
      });
    } finally {
      setShareActionLoading(false);
    }
  };

  const handleAcceptShare = async (id) => {
    setShareActionLoading(true);
    try {
      const response = await acceptUserShareRequest(id);
      toast({
        title: "Compartilhamento aceito",
        description: response.message,
      });
      await loadShares();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel aceitar compartilhamento.",
        variant: "destructive",
      });
    } finally {
      setShareActionLoading(false);
    }
  };

  const handleRevokeShare = async (id) => {
    setShareActionLoading(true);
    try {
      const response = await revokeUserShareRequest(id);
      toast({
        title: "Compartilhamento revogado",
        description: response.message,
      });
      await loadShares();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel revogar compartilhamento.",
        variant: "destructive",
      });
    } finally {
      setShareActionLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true);

      const payload = {
        default_dashboard_currency_id:
          defaultDashboardCurrencyId === "none"
            ? null
            : parseInt(defaultDashboardCurrencyId),
      };

      const response = await updateUserPreferences(payload);

      if (response.success && response.data) {
        updateUser(response.data);
        toast({
          title: "Sucesso",
          description: "Moeda padrao do dashboard atualizada.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar preferencias do usuario:", error);
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar a moeda padrao.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Usuários - FinanceFlow</title>
        <meta name="description" content="Gerencie os usuários do sistema." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Usuários</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie os usuários com acesso ao sistema.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Gerencie perfil e compartilhamentos
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle>Preferencias do dashboard</CardTitle>
                <CardDescription>
                  Defina a moeda padrao usada ao abrir os dashboards.
                </CardDescription>
              </div>

              <div className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                  Moeda atual:{" "}
                  <span className="font-medium">{currentCurrencyLabel}</span>
                </p>
                <Select
                  value={defaultDashboardCurrencyId}
                  onValueChange={setDefaultDashboardCurrencyId}
                >
                  <SelectTrigger className="max-w-md bg-background/50">
                    <SelectValue placeholder="Selecione uma moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem padrao (todas)</SelectItem>
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

                <div>
                  <Button onClick={handleSavePreferences} disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar preferencias"}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="glass-effect">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle>Compartilhar dados por e-mail</CardTitle>
                <CardDescription>
                  Pesquise um usuario e solicite acesso aos dados dele.
                </CardDescription>
              </div>

              <form
                className="grid gap-3 md:grid-cols-[1fr_auto]"
                onSubmit={handleSearchShareCandidate}
              >
                <input
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  type="email"
                  value={shareSearchEmail}
                  onChange={(event) => setShareSearchEmail(event.target.value)}
                  placeholder="email@dominio.com"
                  required
                />
                <Button type="submit" disabled={shareSearchLoading}>
                  {shareSearchLoading ? "Buscando..." : "Buscar"}
                </Button>
              </form>

              {shareCandidate && (
                <div className="rounded-md border border-border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{shareCandidate.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {shareCandidate.email}
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateShare}
                    disabled={shareActionLoading}
                  >
                    Solicitar compartilhamento
                  </Button>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border p-3 space-y-2">
                  <p className="font-medium">Solicitacoes enviadas</p>
                  {shares.requested?.length ? (
                    shares.requested.map((share) => (
                      <div
                        key={share.id}
                        className="text-sm flex items-center justify-between gap-2"
                      >
                        <span>
                          {share.data_owner?.email} ({share.status})
                        </span>
                        {share.status !== "revoked" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeShare(share.id)}
                            disabled={shareActionLoading}
                          >
                            Revogar
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma solicitacao enviada.
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-border p-3 space-y-2">
                  <p className="font-medium">Solicitacoes recebidas</p>
                  {shares.received?.length ? (
                    shares.received.map((share) => (
                      <div key={share.id} className="text-sm space-y-1">
                        <div>
                          {share.requester?.email} ({share.status})
                        </div>
                        <div className="flex gap-2">
                          {share.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleAcceptShare(share.id)}
                              disabled={shareActionLoading}
                            >
                              Aceitar
                            </Button>
                          )}
                          {share.status !== "revoked" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeShare(share.id)}
                              disabled={shareActionLoading}
                            >
                              Revogar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma solicitacao recebida.
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`glass-effect ${currentUser?.id === user.id ? "border-primary" : ""}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <User /> {user.name}
                    </CardTitle>
                    {currentUser?.id === user.id && (
                      <Shield className="text-primary" />
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 pt-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UsersPage;
