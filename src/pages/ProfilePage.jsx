import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  requestEmailChangeRequest,
  updateProfileRequest,
} from "@/api/services/authService";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSendingEmailChange, setIsSendingEmailChange] = useState(false);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);

    try {
      const response = await updateProfileRequest({ name });
      if (response.success && response.data) {
        updateUser(response.data);
      }
      toast({
        title: "Perfil atualizado",
        description: response.message,
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEmailChangeRequest = async (event) => {
    event.preventDefault();
    setIsSendingEmailChange(true);

    try {
      const response = await requestEmailChangeRequest({
        new_email: newEmail,
        password: currentPassword,
      });

      toast({
        title: "Confirmacao enviada",
        description: response.message,
      });
      setCurrentPassword("");
      setNewEmail("");
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel solicitar a troca de e-mail.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmailChange(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Meu perfil - FinanceFlow</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 grid gap-6">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Dados do usuario</CardTitle>
            <CardDescription>Atualize seu nome de exibicao.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 max-w-xl" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail atual</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Salvando..." : "Salvar perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Trocar e-mail</CardTitle>
            <CardDescription>
              Um link de confirmacao sera enviado ao novo e-mail informado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4 max-w-xl"
              onSubmit={handleEmailChangeRequest}
            >
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo e-mail</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isSendingEmailChange}>
                {isSendingEmailChange
                  ? "Enviando..."
                  : "Solicitar troca de e-mail"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
