import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Target,
  Settings,
  LayoutDashboard,
  List,
  LogOut,
  User,
  CreditCard,
  Landmark,
  LineChart,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/providers/AuthProvider";
import { logoutRequest } from "../../api/services/authService";

const Header = ({ onNewTransaction, onNewGoal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, users, logout, switchUser } = useAuth();

  //console.log(user);
  const mainNavItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transações", icon: List },
  ];

  const secondaryNavItems = [
    { path: "/investments", label: "Investimentos", icon: LineChart },
    { path: "/financing", label: "Financiamentos", icon: Landmark },
  ];

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Erro ao fazer logout na API:", error);
    } finally {
      // Sempre fazer logout local, independente da API
      logout();
      navigate("/login");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold gradient-text">FinanceFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  <MoreHorizontal className="h-4 w-4" /> Mais
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {secondaryNavItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" /> {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onNewTransaction}
            className="hidden sm:inline-flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Transação
          </Button>

          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                title={user?.name}
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "Usuário"}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
