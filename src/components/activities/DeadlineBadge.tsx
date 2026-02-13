import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle2, Timer } from 'lucide-react';
import { isBefore, isToday, startOfDay, differenceInDays } from 'date-fns';

interface DeadlineBadgeProps {
  prazo: string | null | undefined;
  status: string;
}

export const DeadlineBadge = ({ prazo, status }: DeadlineBadgeProps) => {
  if (!prazo || status === 'CONCLUÍDO' || status === 'CANCELADO') return null;

  const now = startOfDay(new Date());
  const prazoDate = new Date(prazo);
  const daysLeft = differenceInDays(prazoDate, now);

  if (isBefore(prazoDate, now)) {
    return (
      <Badge variant="destructive" className="gap-1 text-[10px] animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        Atrasado {Math.abs(daysLeft)}d
      </Badge>
    );
  }

  if (isToday(prazoDate)) {
    return (
      <Badge className="gap-1 text-[10px] bg-status-pendente text-white">
        <Timer className="h-3 w-3" />
        Vence Hoje
      </Badge>
    );
  }

  if (daysLeft <= 3) {
    return (
      <Badge variant="outline" className="gap-1 text-[10px] border-status-pendente text-status-pendente">
        <Clock className="h-3 w-3" />
        {daysLeft}d restantes
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-[10px] border-status-ativo text-status-ativo">
      <CheckCircle2 className="h-3 w-3" />
      No prazo
    </Badge>
  );
};
