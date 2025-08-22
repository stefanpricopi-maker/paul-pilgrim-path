import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Character {
  id: number;
  name: string;
  description_en: string;
  description_ro: string;
  ability_type: string;
  ability_key: string;
  icon_url: string;
}

const ABILITY_TYPES = ['passive', 'one_time', 'active'];

const CharacterEditor = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description_en: '',
    description_ro: '',
    ability_type: '',
    ability_key: '',
    icon_url: ''
  });

  const loadCharacters = async () => {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('id');

      if (error) throw error;
      setCharacters(data || []);
    } catch (error) {
      console.error('Error loading characters:', error);
      toast({
        title: "Error",
        description: "Failed to load characters",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleSave = async () => {
    try {
      if (editingCharacter) {
        const { error } = await supabase
          .from('characters')
          .update(formData)
          .eq('id', editingCharacter.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Character updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('characters')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Character created successfully"
        });
      }

      setIsOpen(false);
      setEditingCharacter(null);
      setFormData({
        name: '',
        description_en: '',
        description_ro: '',
        ability_type: '',
        ability_key: '',
        icon_url: ''
      });
      loadCharacters();
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: "Error",
        description: "Failed to save character",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description_en: character.description_en,
      description_ro: character.description_ro,
      ability_type: character.ability_type,
      ability_key: character.ability_key,
      icon_url: character.icon_url
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Character deleted successfully"
      });
      loadCharacters();
    } catch (error) {
      console.error('Error deleting character:', error);
      toast({
        title: "Error",
        description: "Failed to delete character",
        variant: "destructive"
      });
    }
  };

  const openNew = () => {
    setEditingCharacter(null);
    setFormData({
      name: '',
      description_en: '',
      description_ro: '',
      ability_type: '',
      ability_key: '',
      icon_url: ''
    });
    setIsOpen(true);
  };

  if (loading) return <div>Loading characters...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Biblical Characters</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCharacter ? 'Edit Character' : 'Create New Character'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter character name"
                />
              </div>
              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                  placeholder="Character ability description in English"
                />
              </div>
              <div>
                <Label htmlFor="description_ro">Description (Romanian)</Label>
                <Textarea
                  id="description_ro"
                  value={formData.description_ro}
                  onChange={(e) => setFormData({...formData, description_ro: e.target.value})}
                  placeholder="Character ability description in Romanian"
                />
              </div>
              <div>
                <Label htmlFor="ability_type">Ability Type</Label>
                <Select value={formData.ability_type} onValueChange={(value) => setFormData({...formData, ability_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ability type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ABILITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ability_key">Ability Key</Label>
                <Input
                  id="ability_key"
                  value={formData.ability_key}
                  onChange={(e) => setFormData({...formData, ability_key: e.target.value})}
                  placeholder="Unique key for the ability (e.g., church_income_boost)"
                />
              </div>
              <div>
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
                  placeholder="Path to character icon (e.g., /icons/paul.svg)"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingCharacter ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ability Type</TableHead>
            <TableHead>Description (EN)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.id}>
              <TableCell className="font-medium">{character.name}</TableCell>
              <TableCell>{character.ability_type}</TableCell>
              <TableCell className="max-w-xs truncate">{character.description_en}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(character)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(character.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CharacterEditor;