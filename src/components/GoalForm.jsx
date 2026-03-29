import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Target, DollarSign, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/providers/AuthProvider";

const GoalForm = ({ onSubmit, onClose }) => {
  const { user, users } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    userId: user.id,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="glass-effect p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary" />
              Nova Meta
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">
                Nome da Meta
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Viagem para Europa"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-background/50 h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount" className="text-muted-foreground">
                Valor Alvo
              </Label>
              <CurrencyInput
                id="targetAmount"
                placeholder="0,00"
                value={formData.targetAmount}
                onChange={(value) => handleChange("targetAmount", value)}
                className="bg-background/50 h-12 text-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Responsável</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => handleChange("userId", value)}
              >
                <SelectTrigger className="bg-background/50 h-12">
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva sua meta (opcional)"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="bg-background/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-blue-400 text-white font-semibold"
              >
                Criar Meta
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default GoalForm;
