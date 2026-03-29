import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
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
import { forgotPasswordRequest } from "@/api/services/authService";

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPasswordRequest({ email });
      toast({
        title: "Solicitacao recebida",
        description: response.message,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel enviar a solicitacao.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar senha - FinanceFlow</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              Informe seu e-mail para receber o link de redefinicao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link"}
              </Button>
            </form>
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

export default ForgotPasswordPage;
