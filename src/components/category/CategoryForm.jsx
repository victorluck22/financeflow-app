import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  DialogFooter,
  DialogClose,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { createCategory } from "../../api/services/CategoryService";

const CategoryForm = ({ category, isSubmitting, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input
          id="name"
          name="name"
          value={category?.name}
          onChange={onChange}
          placeholder="Ex: Lazer"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Ícone (Emoji)</Label>
        <Input
          id="icon"
          name="icon"
          value={category?.icon}
          onChange={onChange}
          placeholder="🎉"
          required
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {" "}
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
              />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;
