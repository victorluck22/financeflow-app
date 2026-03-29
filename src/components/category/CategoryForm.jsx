import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CATEGORY_ICON_GROUPS = [
  {
    title: "Despesas Comuns",
    icons: [
      "🍽️",
      "🛒",
      "🚗",
      "⛽",
      "🏠",
      "💡",
      "📱",
      "💊",
      "🏥",
      "🎓",
      "👕",
      "🎬",
    ],
  },
  {
    title: "Receitas e Finanças",
    icons: ["💰", "💸", "📈", "🏦", "🧾", "📦"],
  },
  {
    title: "Outros",
    icons: ["✈️", "🐶", "🎁", "🧹", "🔧", "📚"],
  },
];

const ALL_CATEGORY_ICONS = CATEGORY_ICON_GROUPS.flatMap((group) => group.icons);

const CategoryForm = ({
  category,
  isSubmitting,
  onChange,
  onSubmit,
  onIconSelect,
}) => {
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
        <Label>Ícone da Categoria</Label>
        <div className="space-y-3 rounded-md border p-3">
          {CATEGORY_ICON_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {group.title}
              </p>
              <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
                {group.icons.map((iconOption) => {
                  const isSelected = category?.icon === iconOption;

                  return (
                    <button
                      key={iconOption}
                      type="button"
                      onClick={() => onIconSelect(iconOption)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                      aria-label={`Selecionar ícone ${iconOption}`}
                      title={`Selecionar ícone ${iconOption}`}
                    >
                      {iconOption}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {category?.icon && !ALL_CATEGORY_ICONS.includes(category.icon) ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Ícone atual
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary bg-primary/10 text-lg">
                {category.icon}
              </div>
            </div>
          ) : null}
        </div>
        {!category?.icon ? (
          <p className="text-xs text-destructive">
            Selecione um ícone para continuar.
          </p>
        ) : null}
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
