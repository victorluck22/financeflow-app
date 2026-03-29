import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { confirmEmailChangeRequest } from "@/api/services/authService";
import { useAuth } from "@/providers/AuthProvider";

const ConfirmEmailChangePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const hasParams = useMemo(
    () => token.length > 0 && email.length > 0,
    [token, email],
  );

  const { toast } = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    if (!hasParams) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await confirmEmailChangeRequest({ token, email });
      logout();
      toast({
        title: "E-mail confirmado",
        description: response.message,
        className: "bg-green-500 text-white",
      });
      setDone(true);
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error.response?.data?.message ||
          "Nao foi possivel confirmar a troca de e-mail.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasParams) {
      handleConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Confirmar e-mail - FinanceFlow</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-effect">
          <CardHeader>
            <CardTitle>Confirmacao de e-mail</CardTitle>
            <CardDescription>
              {hasParams
                ? "Estamos validando sua solicitacao..."
                : "Link invalido para confirmacao de e-mail."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasParams && (
              <Button onClick={() => navigate("/login")} className="w-full">
                Ir para login
              </Button>
            )}
            {hasParams && (isSubmitting || done) && (
              <p className="text-sm text-muted-foreground text-center">
                Aguarde, voce sera redirecionado para o login.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ConfirmEmailChangePage;
