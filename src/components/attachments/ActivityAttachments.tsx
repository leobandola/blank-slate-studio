import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Upload, Trash2, FileText, Image, File } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Attachment {
  id: string;
  activity_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

interface ActivityAttachmentsProps {
  activityId: string;
  attachments: Attachment[];
  onRefresh: () => void;
}

const getFileIcon = (type: string | null) => {
  if (!type) return File;
  if (type.startsWith('image/')) return Image;
  return FileText;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const ActivityAttachments = ({ activityId, attachments, onRefresh }: ActivityAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: globalThis.File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    setUploading(true);
    const userId = session.user.id;
    const filePath = `${userId}/${activityId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Erro ao fazer upload do arquivo');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    const { error } = await supabase.from('activity_attachments').insert({
      activity_id: activityId,
      user_id: userId,
      file_name: file.name,
      file_url: filePath,
      file_type: file.type,
      file_size: file.size,
    });

    if (error) {
      toast.error('Erro ao registrar anexo');
    } else {
      toast.success('Arquivo anexado!');
      // Audit log
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'attachment_added',
        entity_type: 'activity',
        entity_id: activityId,
        details: { file_name: file.name },
      });
      onRefresh();
    }
    setUploading(false);
  };

  const deleteAttachment = async (attachment: Attachment) => {
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_url]);

    const { error } = await supabase
      .from('activity_attachments')
      .delete()
      .eq('id', attachment.id);

    if (error) {
      toast.error('Erro ao remover anexo');
    } else {
      toast.success('Anexo removido');
      onRefresh();
    }
  };

  const downloadAttachment = async (attachment: Attachment) => {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(attachment.file_url);

    if (error || !data) {
      toast.error('Erro ao baixar arquivo');
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.file_name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          <span className="font-medium text-sm">Anexos ({attachments.length})</span>
        </div>
        <Button
          size="sm" variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-7 text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          {uploading ? 'Enviando...' : 'Anexar'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 10 * 1024 * 1024) {
                toast.error('Arquivo muito grande (máx 10MB)');
                return;
              }
              uploadFile(file);
            }
          }}
        />
      </div>

      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum anexo</p>
      ) : (
        <ScrollArea className="max-h-[200px]">
          <div className="space-y-1.5">
            {attachments.map(att => {
              const Icon = getFileIcon(att.file_type);
              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in group"
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate cursor-pointer hover:underline"
                      onClick={() => downloadAttachment(att)}
                    >
                      {att.file_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(att.file_size)} • {format(new Date(att.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteAttachment(att)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
