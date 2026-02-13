import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Activity } from '@/types/activity';
import { OsiActivity } from '@/types/osiActivity';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfExportProps {
  activities?: Activity[];
  osiActivities?: OsiActivity[];
  title?: string;
  variant?: 'default' | 'outline';
}

export const PdfExport = ({ activities, osiActivities, title = 'Relatório', variant = 'outline' }: PdfExportProps) => {

  const exportActivitiesToPdf = () => {
    if (!activities || activities.length === 0) {
      toast.error('Nenhuma atividade para exportar');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });

    // Header
    doc.setFontSize(16);
    doc.setTextColor(41, 98, 255);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
    doc.text(`Total: ${activities.length} atividades`, 14, 27);

    // Table
    autoTable(doc, {
      startY: 32,
      head: [['Data', 'Hora', 'Obra', 'Site', 'OTS/OSI', 'Designação', 'Eq. Config.', 'Cidade', 'Empresa', 'Equipe', 'Atividade', 'Status']],
      body: activities.map(a => [
        a.data,
        a.hora,
        a.obra,
        a.site,
        a.otsOsi,
        a.designacao,
        a.equipeConfiguracao,
        a.cidade,
        a.empresa,
        a.equipe,
        a.atividade,
        a.status,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 32 },
    });

    // Summary page
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(41, 98, 255);
    doc.text('Resumo', 14, 15);

    // Status summary
    const statusCounts: Record<string, number> = {};
    activities.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    autoTable(doc, {
      startY: 22,
      head: [['Status', 'Quantidade', '% do Total']],
      body: Object.entries(statusCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([status, count]) => [
          status,
          count.toString(),
          `${Math.round((count / activities.length) * 100)}%`,
        ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 98, 255] },
    });

    // Team summary
    const teamCounts: Record<string, number> = {};
    activities.forEach(a => {
      teamCounts[a.equipe || 'N/A'] = (teamCounts[a.equipe || 'N/A'] || 0) + 1;
    });

    const lastY = (doc as any).lastAutoTable?.finalY || 60;
    autoTable(doc, {
      startY: lastY + 10,
      head: [['Equipe', 'Quantidade', '% do Total']],
      body: Object.entries(teamCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([team, count]) => [
          team,
          count.toString(),
          `${Math.round((count / activities.length) * 100)}%`,
        ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 116, 139] },
    });

    doc.save(`${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exportado com sucesso!');
  };

  const exportOsiToPdf = () => {
    if (!osiActivities || osiActivities.length === 0) {
      toast.error('Nenhuma atividade OSI para exportar');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.setTextColor(41, 98, 255);
    doc.text('Relatório OSI', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);
    doc.text(`Total: ${osiActivities.length} atividades`, 14, 27);

    autoTable(doc, {
      startY: 32,
      head: [['Data', 'OSI', 'Obra', 'Atividade', 'Ativação', 'Eq. Config.', 'Eq. Campo', 'Status', 'Obs']],
      body: osiActivities.map(a => [
        a.data,
        a.osi,
        a.obra,
        a.atividade,
        a.ativacao,
        a.equipe_configuracao,
        a.equipe_campo,
        a.status,
        a.obs || '',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    doc.save(`Relatorio_OSI_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF OSI exportado com sucesso!');
  };

  return (
    <div className="flex gap-2">
      {activities && (
        <Button variant={variant} size="sm" onClick={exportActivitiesToPdf} className="gap-2">
          <FileText className="h-4 w-4" />
          Exportar PDF
        </Button>
      )}
      {osiActivities && (
        <Button variant={variant} size="sm" onClick={exportOsiToPdf} className="gap-2">
          <FileText className="h-4 w-4" />
          PDF OSI
        </Button>
      )}
    </div>
  );
};
