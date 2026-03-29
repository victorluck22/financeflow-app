import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { resetPasswordRequest } from "@/api/services/authService";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const hasToken = useMemo(
    () => token.length > 0 && email.length > 0,
    [token, email],
  );

  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasToken) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPasswordRequest({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast({
        title: "Senha redefinida",
        description: response.message,
        className: "bg-green-500 text-white",
      });
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel redefinir a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir senha - FinanceFlow</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>
              Defina uma nova senha para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasToken ? (
              <p className="text-sm text-red-500">
                Link invalido ou incompleto.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirmation">Confirmar senha</Label>
                  <Input
                    id="passwordConfirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(event) =>
                      setPasswordConfirmation(event.target.value)
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Redefinir"}
                </Button>
              </form>
            )}
            <p className="text-sm text-center mt-4 text-muted-foreground">
              <Link className="underline" to="/login">
                Voltar ao login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ResetPasswordPage;
