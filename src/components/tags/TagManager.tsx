import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tag, Plus, X } from 'lucide-react';

const TAG_COLORS = [
  'hsl(220, 70%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(45, 93%, 47%)',
  'hsl(0, 84%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(24, 95%, 53%)',
  'hsl(188, 78%, 41%)',
  'hsl(330, 70%, 50%)',
];

export interface ActivityTag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  compact?: boolean;
}

const getStoredTags = (): ActivityTag[] => {
  try {
    return JSON.parse(localStorage.getItem('activityTags') || '[]');
  } catch { return []; }
};

const saveStoredTags = (tags: ActivityTag[]) => {
  localStorage.setItem('activityTags', JSON.stringify(tags));
};

export const TagManager = ({ selectedTags, onTagsChange, compact = false }: TagManagerProps) => {
  const [allTags, setAllTags] = useState<ActivityTag[]>(getStoredTags);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [open, setOpen] = useState(false);

  const addNewTag = () => {
    if (!newTagName.trim()) return;
    const tag: ActivityTag = {
      id: crypto.randomUUID(),
      name: newTagName.trim().toUpperCase(),
      color: selectedColor,
    };
    const updated = [...allTags, tag];
    setAllTags(updated);
    saveStoredTags(updated);
    onTagsChange([...selectedTags, tag.name]);
    setNewTagName('');
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagId: string) => {
    const tag = allTags.find(t => t.id === tagId);
    const updated = allTags.filter(t => t.id !== tagId);
    setAllTags(updated);
    saveStoredTags(updated);
    if (tag) onTagsChange(selectedTags.filter(t => t !== tag.name));
  };

  const getTagColor = (tagName: string) => {
    return allTags.find(t => t.name === tagName)?.color || TAG_COLORS[0];
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {selectedTags.map(tag => (
          <Badge
            key={tag}
            variant="outline"
            className="text-[10px] px-1.5 py-0 animate-scale-in"
            style={{ borderColor: getTagColor(tag), color: getTagColor(tag) }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Tag className="h-3 w-3" />
          Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <p className="text-sm font-medium">Etiquetas</p>

          {/* Existing tags */}
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {allTags.map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                className="cursor-pointer text-xs gap-1 animate-scale-in transition-all"
                style={selectedTags.includes(tag.name) 
                  ? { backgroundColor: tag.color, color: '#fff' }
                  : { borderColor: tag.color, color: tag.color }
                }
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
                <X
                  className="h-3 w-3 hover:scale-125 transition-transform"
                  onClick={(e) => { e.stopPropagation(); removeTag(tag.id); }}
                />
              </Badge>
            ))}
            {allTags.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma tag criada</p>
            )}
          </div>

          {/* Create new tag */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex gap-1.5">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nova tag..."
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && addNewTag()}
              />
              <Button size="sm" className="h-8 px-2" onClick={addNewTag}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-1.5">
              {TAG_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-5 h-5 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-foreground/30' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const TagDisplay = ({ tags }: { tags: string[] }) => {
  const allTags: ActivityTag[] = (() => {
    try { return JSON.parse(localStorage.getItem('activityTags') || '[]'); }
    catch { return []; }
  })();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => {
        const tagData = allTags.find(t => t.name === tag);
        return (
          <Badge
            key={tag}
            variant="outline"
            className="text-[10px] px-1.5 py-0"
            style={{ 
              borderColor: tagData?.color || 'hsl(220, 70%, 50%)', 
              color: tagData?.color || 'hsl(220, 70%, 50%)' 
            }}
          >
            {tag}
          </Badge>
        );
      })}
    </div>
  );
};
