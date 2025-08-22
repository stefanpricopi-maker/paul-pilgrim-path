import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tile {
  id: number;
  name: string;
  type: string;
  tile_index: number;
}

const TILE_TYPES = [
  'special', 'city', 'community-chest', 'chance', 'port', 'jail', 'tax', 'tent', 'sabbath'
];

const TileEditor = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTile, setEditingTile] = useState<Tile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    tile_index: 0
  });

  const loadTiles = async () => {
    try {
      // Load template tiles (where game_id is null) first
      let { data: templateTiles, error: templateError } = await supabase
        .from('tiles')
        .select('*')
        .is('game_id', null)
        .order('tile_index');

      if (templateError && templateError.message.includes('no rows')) {
        // If no template tiles exist, load any tiles for editing
        const { data: existingTiles, error: existingError } = await supabase
          .from('tiles')
          .select('*')
          .order('tile_index')
          .limit(30);

        if (existingError) throw existingError;
        setTiles(existingTiles || []);
      } else if (templateError) {
        throw templateError;
      } else {
        setTiles(templateTiles || []);
      }
    } catch (error) {
      console.error('Error loading tiles:', error);
      toast({
        title: "Error",
        description: "Failed to load tiles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiles();
  }, []);

  const handleSave = async () => {
    try {
      if (editingTile) {
        const { error } = await supabase
          .from('tiles')
          .update({
            name: formData.name,
            type: formData.type,
            tile_index: formData.tile_index
          })
          .eq('id', editingTile.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tile updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('tiles')
          .insert({
            name: formData.name,
            type: formData.type,
            tile_index: formData.tile_index,
            game_id: null // Template tile
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Tile created successfully"
        });
      }

      setIsOpen(false);
      setEditingTile(null);
      setFormData({ name: '', type: '', tile_index: 0 });
      loadTiles();
    } catch (error) {
      console.error('Error saving tile:', error);
      toast({
        title: "Error",
        description: "Failed to save tile",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tile: Tile) => {
    setEditingTile(tile);
    setFormData({
      name: tile.name,
      type: tile.type,
      tile_index: tile.tile_index
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('tiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tile deleted successfully"
      });
      loadTiles();
    } catch (error) {
      console.error('Error deleting tile:', error);
      toast({
        title: "Error",
        description: "Failed to delete tile",
        variant: "destructive"
      });
    }
  };

  const openNew = () => {
    setEditingTile(null);
    setFormData({ name: '', type: '', tile_index: tiles.length + 1 });
    setIsOpen(true);
  };

  if (loading) return <div>Loading tiles...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Board Tiles</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTile ? 'Edit Tile' : 'Create New Tile'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tile Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter tile name"
                />
              </div>
              <div>
                <Label htmlFor="type">Tile Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tile type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TILE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="index">Tile Index (Position)</Label>
                <Input
                  id="index"
                  type="number"
                  value={formData.tile_index}
                  onChange={(e) => setFormData({...formData, tile_index: parseInt(e.target.value) || 0})}
                  placeholder="Tile position on board"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingTile ? 'Update' : 'Create'}
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
            <TableHead>Index</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiles.map((tile) => (
            <TableRow key={tile.id}>
              <TableCell>{tile.tile_index}</TableCell>
              <TableCell>{tile.name}</TableCell>
              <TableCell>{tile.type}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(tile)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tile.id)}>
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

export default TileEditor;