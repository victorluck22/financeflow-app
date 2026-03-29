import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfirmDeleteDialog = ({
  trigger,
  title = "Confirmar exclusão",
  message = "Tem certeza que deseja excluir este item?",
  onConfirm,
  loading = false,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-1">
            <Trash2 className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-muted-foreground">{message}</div>
        <DialogFooter className="mt-4">
          <DialogClose>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
