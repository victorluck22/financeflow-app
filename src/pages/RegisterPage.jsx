import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
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
import { preRegisterRequest } from "@/api/services/authService";

const RegisterPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await preRegisterRequest({ name, email });
      toast({
        title: "Pre-cadastro realizado",
        description: response.message,
        className: "bg-green-500 text-white",
      });
      setName("");
      setEmail("");
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel concluir o pre-cadastro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro - FinanceFlow</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Informe seus dados e receba por e-mail o link para definir sua
              senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {isLoading ? "Enviando..." : "Finalizar pre-cadastro"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Ja possui conta?{" "}
                <Link className="underline" to="/login">
                  Entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;
