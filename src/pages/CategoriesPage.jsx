import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Tag, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CategoryDialog from "@/components/category/CategoryDialog";
import { useToast } from "@/components/ui/use-toast";
import {
  getAllCategories,
  deleteCategory,
} from "../api/services/categoryService";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { set } from "date-fns";

const CategoriesPage = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLockedCategories, setShowLockedCategories] = useState(false);

  const { toast } = useToast();
  useEffect(() => {
    //setShowLockedCategories(true);
    loadCategories();
  }, []);

  useEffect(() => {
    loadCategories();
  }, [showLockedCategories]);

  const handleSwitchToggle = (e) => {
    setShowLockedCategories(e);
    loadCategories();
  };

  const loadCategories = async () => {
    try {
      const { categories } = await getAllCategories(showLockedCategories);
      setAllCategories(categories);
    } catch (error) {
      toast({
        title: "Erro ao carregar as categorias",
        descriprion: error,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      deleteCategory(categoryId);

      setIsDialogOpen(false);
      toast({
        title: "Categoria bloqueada com sucesso!",
        className: "bg-primary text-primary-foreground toast-success",
      });
      handleSuccess();
    } catch (error) {
      toast({
        title: "Erro ao excluir a categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openForm = (category = null) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    loadCategories();
  };

  return (
    <>
      <Helmet>
        <title>Categorias - FinanceFlow</title>
        <meta
          name="description"
          content="Gerencie suas categorias no FinanceFlow."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Categorias</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas categorias de despesas.
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showLockedCategories}
                onToggle={(e) => handleSwitchToggle(e)}
                aria-label="Mostrar categorias bloqueadas"
                id="onlyActiveCategories"
              ></Switch>
              <Label htmlFor="onlyActiveCategories">Mostrar bloqueados</Label>
            </div>
          </div>
          <Button
            onClick={() => openForm()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Nova Categoria
          </Button>

          <CategoryDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            category={selectedCategory}
            onSuccess={handleSuccess}
          />
        </motion.div>

        {allCategories.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className="text-center text-muted-foreground text-lg py-10"
          >
            {allCategories.length > 1
              ? "Nenhuma categoria encontrada."
              : "Nenhuma categoria encontrada. Crie uma nova!"}
          </motion.p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="glass-effect">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {category.name}
                    </CardTitle>
                    <span className="text-2xl">{category.icon}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openForm(category)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <ConfirmDialog
                        onConfirm={() => handleDelete(category.id)}
                        title={
                          category.is_active ? (
                            <>
                              <PowerOff className="w-5 h-5" />
                              Bloquear {category.name}
                            </>
                          ) : (
                            <>
                              <Power className="w-5 h-5" /> Desbloquear{" "}
                              {category.name}
                            </>
                          )
                        }
                        message={`Deseja realmente excluir a categoria "${category.name}"?`}
                        variant={category.is_active ? "destructive" : "primary"}
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        trigger={
                          category.is_active ? (
                            <>
                              <PowerOff className="mr-2 w-4 h-4"></PowerOff>
                              {" Bloquear"}
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 w-4 h-4"></Power>{" "}
                              Desbloquear
                            </>
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesPage;
