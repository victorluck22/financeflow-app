import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Target, Mail, Key } from "lucide-react";
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
import { loginRequest } from "../api/services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginRequest({ email, password });

      // Verifica se o login foi bem sucedido
      if (!response.success) {
        toast({
          title: "Atenção",
          description: response.message || "E-mail não verificado",
          variant: "default",
          className: "bg-yellow-500 text-white",
        });
        return;
      }

      const { access_token, user } = response;
      login(access_token, user);
      toast({
        title: "Login bem sucedido",
        description: "Redirecionando para o painel",
        variant: "default",
        className: "bg-green-500 text-white",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "Erro ao realizar login";
      toast({
        title: "Erro de login",
        description: errorMessage,
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - FinanceFlow</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-sm mx-auto glass-effect">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-3xl font-bold gradient-text">
                FinanceFlow
              </CardTitle>
              <CardDescription>
                Bem-vindo de volta! Faça login para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Entrar
                </Button>
                <div className="text-sm text-center space-y-1 text-muted-foreground">
                  <p>
                    <Link className="underline" to="/forgot-password">
                      Esqueci minha senha
                    </Link>
                  </p>
                  <p>
                    Ainda nao possui conta?{" "}
                    <Link className="underline" to="/register">
                      Fazer cadastro
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
