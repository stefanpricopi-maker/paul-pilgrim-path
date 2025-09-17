import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, User, Loader2 } from 'lucide-react';
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
  face_image_url?: string;
  full_image_url?: string;
}

const ABILITY_TYPES = ['passive', 'one_time', 'active'];

const CharacterEditor = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
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

  // Reload characters when component mounts or becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCharacters();
      }
    };

    const handleFocus = () => {
      loadCharacters();
    };

    // Reload on tab/window focus and visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Reload characters whenever the component mounts (for tab switching)
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

  const handleImageUpload = async (
    characterId: number, 
    file: File, 
    imageType: 'face' | 'full'
  ) => {
    const uploadKey = `${characterId}-${imageType}`;
    setUploading(prev => ({ ...prev, [uploadKey]: true }));

    try {
      // Debug log to track which image type is being uploaded
      console.log(`Uploading ${imageType} image for character ${characterId}`);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `character-${characterId}-${imageType}.${fileExt}`;
      const bucket = imageType === 'face' ? 'character-faces' : 'character-full';
      
      console.log(`Using bucket: ${bucket}, filename: ${fileName}`);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      // Update character record
      const updateField = imageType === 'face' ? 'face_image_url' : 'full_image_url';
      console.log(`Updating field: ${updateField} with URL: ${imageUrl}`);
      
      const { error: updateError } = await supabase
        .from('characters')
        .update({ [updateField]: imageUrl })
        .eq('id', characterId);

      if (updateError) throw updateError;

      // Update local state
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, [updateField]: imageUrl }
            : char
        )
      );

      toast({
        title: "Success",
        description: `${imageType === 'face' ? 'Face' : 'Full body'} image updated successfully`
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleRemoveImage = async (characterId: number, imageType: 'face' | 'full') => {
    const uploadKey = `${characterId}-${imageType}`;
    setUploading(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const updateField = imageType === 'face' ? 'face_image_url' : 'full_image_url';
      
      // Update character record to remove image URL
      const { error } = await supabase
        .from('characters')
        .update({ [updateField]: null })
        .eq('id', characterId);

      if (error) throw error;

      // Update local state
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, [updateField]: null }
            : char
        )
      );

      toast({
        title: "Success",
        description: `${imageType === 'face' ? 'Face' : 'Full body'} image removed successfully`
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const createImageUploadSection = (character: Character, imageType: 'face' | 'full') => {
    const uploadKey = `${character.id}-${imageType}`;
    const isUploading = uploading[uploadKey];
    const currentImageUrl = imageType === 'face' ? character.face_image_url : character.full_image_url;
    const title = imageType === 'face' ? 'Face Image' : 'Full Body Image';

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {imageType === 'face' ? <User className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          {title}
        </Label>
        
        {currentImageUrl && (
          <div className="relative inline-block">
            <img 
              src={currentImageUrl} 
              alt={`${character.name} ${imageType}`}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              onClick={() => handleRemoveImage(character.id, imageType)}
              disabled={isUploading}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(character.id, file, imageType);
              }
            }}
            disabled={isUploading}
            className="flex-1"
          />
          {isUploading && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </div>
      </div>
    );
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
    <div className="space-y-6">
      {/* Character Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Character Management</CardTitle>
              <CardDescription>
                Manage biblical characters with their abilities and images
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Character Images */}
      <Card>
        <CardHeader>
          <CardTitle>Character Images</CardTitle>
          <CardDescription>
            Upload face and full body images for each character. Images should be high quality and properly cropped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {characters.map((character) => (
              <Card key={character.id} className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{character.name}</h3>
                    <p className="text-sm text-muted-foreground">Upload character images</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="order-1">
                    {createImageUploadSection(character, 'face')}
                  </div>
                  <div className="order-2">
                    {createImageUploadSection(character, 'full')}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {characters.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No characters found. Create characters first to upload images.
              </p>
            </div>
          )}

          {characters.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Images are automatically saved when uploaded
              </div>
              <Button 
                onClick={() => {
                  toast({
                    title: "All Changes Saved",
                    description: "Character images are automatically saved when uploaded",
                  });
                }}
                className="bg-primary hover:bg-primary/90"
              >
                All Changes Saved ✓
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterEditor;