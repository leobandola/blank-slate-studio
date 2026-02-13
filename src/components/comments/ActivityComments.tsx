import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  activity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
  avatar_url?: string;
}

interface ActivityCommentsProps {
  activityId: string;
  onClose?: () => void;
}

export const ActivityComments = ({ activityId, onClose }: ActivityCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    loadComments();

    const channel = supabase
      .channel(`comments-${activityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activity_comments',
        filter: `activity_id=eq.${activityId}`,
      }, () => loadComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activityId]);

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('activity_comments')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    if (error) { console.error(error); return; }

    // Enrich with profile data
    const userIds = [...new Set((data || []).map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .in('id', userIds);

    const enriched = (data || []).map(c => {
      const profile = profiles?.find(p => p.id === c.user_id);
      return {
        ...c,
        user_email: profile?.email || '',
        user_name: profile?.name || profile?.email?.split('@')[0] || '',
        avatar_url: profile?.avatar_url || '',
      };
    });

    setComments(enriched);
  };

  const addComment = async () => {
    if (!newComment.trim() || !userId) return;
    setLoading(true);

    const { error } = await supabase
      .from('activity_comments')
      .insert({ activity_id: activityId, user_id: userId, content: newComment.trim() });

    if (error) {
      toast.error('Erro ao adicionar comentário');
    } else {
      setNewComment('');
      // Also log to audit
      await supabase.from('audit_log').insert({
        user_id: userId,
        action: 'comment_added',
        entity_type: 'activity',
        entity_id: activityId,
        details: { content: newComment.trim().substring(0, 100) },
      });
    }
    setLoading(false);
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from('activity_comments').delete().eq('id', commentId);
    if (error) toast.error('Erro ao remover comentário');
  };

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      <div className="flex items-center gap-2 pb-3 border-b">
        <MessageSquare className="h-4 w-4" />
        <span className="font-medium text-sm">Comentários ({comments.length})</span>
      </div>

      <ScrollArea className="flex-1 py-3">
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum comentário ainda</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2 animate-fade-in group">
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={comment.avatar_url} />
                <AvatarFallback className="text-[10px]">
                  {(comment.user_name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{comment.user_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(comment.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                  {comment.user_id === userId && (
                    <Button
                      variant="ghost" size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-foreground mt-0.5 break-words">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-3 border-t">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="min-h-[36px] h-9 text-xs resize-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(); } }}
        />
        <Button size="sm" onClick={addComment} disabled={loading || !newComment.trim()} className="h-9 px-3">
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
