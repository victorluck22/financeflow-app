import React from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronRight, CreditCard, Tag, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const settingsLinks = [
  {
    path: "/settings/cards",
    icon: CreditCard,
    title: "Cartões",
    description: "Gerencie seus cartões de crédito.",
  },
  {
    path: "/settings/categories",
    icon: Tag,
    title: "Categorias",
    description: "Edite suas categorias de despesa.",
  },
  {
    path: "/settings/users",
    icon: Users,
    title: "Usuários",
    description: "Gerencie os usuários do sistema.",
  },
  {
    path: "/settings/exchange-rates",
    icon: DollarSign,
    title: "Taxas de Câmbio",
    description: "Gerencie as taxas de conversão de moedas.",
  },
];

const SettingsPage = () => {
  return (
    <>
      <Helmet>
        <title>Configurações - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie suas configurações no FinanceFlow."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Gerencie os cadastros e dados do seu aplicativo.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {settingsLinks.map((link, index) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link to={link.path}>
                <Card className="hover:border-primary transition-colors glass-effect">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <link.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{link.title}</CardTitle>
                        <CardDescription>{link.description}</CardDescription>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
