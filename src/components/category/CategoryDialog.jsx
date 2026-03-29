import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import CategoryForm from "./CategoryForm";
import { createCategory, updateCategory } from "@/api/services/CategoryService";

const CategoryDialog = ({ open, onOpenChange, category = null, onSuccess }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", icon: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name, icon: category.icon });
    } else {
      setFormData({ name: "", icon: "" });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name) {
        toast({
          title: "Erro de cadastro",
          variant: "destructive",
          description: "O campo categoria é obrigatório!",
        });
        setIsSubmitting(false);
        return;
      }

      if (category) {
        //console.log(category, formData);
        await updateCategory(category.id, formData);
        toast({
          title: "Categoria atualizada com sucesso!",
          className: "bg-primary text-primary-foreground toast-success",
        });
      } else {
        await createCategory(formData);
        toast({
          title: "Categoria cadastrada com sucesso!",
          className: "bg-primary text-primary-foreground toast-success",
        });
      }

      onSuccess?.(); // recarrega lista na tela principal
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          category={formData}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
