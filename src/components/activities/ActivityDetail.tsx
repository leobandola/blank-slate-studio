import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityComments } from '@/components/comments/ActivityComments';
import { ActivityAttachments } from '@/components/attachments/ActivityAttachments';
import { Activity } from '@/types/activity';
import { MessageSquare, Paperclip, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TagDisplay } from '@/components/tags/TagManager';

interface ActivityDetailProps {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}

export const ActivityDetail = ({ activity, open, onClose }: ActivityDetailProps) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (activity?.id && open) {
      loadAttachments();
      loadCommentCount();
    }
  }, [activity?.id, open]);

  const loadAttachments = async () => {
    if (!activity?.id) return;
    const { data } = await supabase
      .from('activity_attachments')
      .select('*')
      .eq('activity_id', activity.id)
      .order('created_at', { ascending: false });
    setAttachments(data || []);
  };

  const loadCommentCount = async () => {
    if (!activity?.id) return;
    const { count } = await supabase
      .from('activity_comments')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activity.id);
    setCommentCount(count || 0);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            Detalhes da Atividade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Atividade:</span>
            <span className="font-medium">{activity.atividade || '-'}</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>📅 {activity.data}</span>
            <span>🕐 {activity.hora}</span>
            {activity.obra && <span>🏗️ {activity.obra}</span>}
          </div>
          {activity.status && (
            <Badge variant="outline" className="text-xs">{activity.status}</Badge>
          )}
          {activity.tags && activity.tags.length > 0 && (
            <TagDisplay tags={activity.tags} />
          )}
        </div>

        <Tabs defaultValue="comments" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="comments" className="flex-1 gap-1">
              <MessageSquare className="h-3 w-3" />
              Comentários
              {commentCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">{commentCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex-1 gap-1">
              <Paperclip className="h-3 w-3" />
              Anexos
              {attachments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">{attachments.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="comments" className="flex-1 overflow-hidden mt-3">
            <ActivityComments activityId={activity.id!} />
          </TabsContent>
          <TabsContent value="attachments" className="mt-3">
            <ActivityAttachments
              activityId={activity.id!}
              attachments={attachments}
              onRefresh={loadAttachments}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
