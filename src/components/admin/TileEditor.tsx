import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, MapPin, RefreshCw, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tile {
  id: number;
  name: string;
  type: string;
  tile_index: number;
}

const TILE_TYPES = [
  'special', 'city', 'community-chest', 'chance', 'port', 'prison', 'sacrifice', 'go-to-prison'
];

const getTileTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'special': 'bg-yellow-100 text-yellow-800',
    'city': 'bg-blue-100 text-blue-800',
    'community-chest': 'bg-green-100 text-green-800',
    'chance': 'bg-orange-100 text-orange-800',
    'port': 'bg-purple-100 text-purple-800',
    'prison': 'bg-red-100 text-red-800',
    'sacrifice': 'bg-red-200 text-red-900',
    'go-to-prison': 'bg-red-300 text-red-900'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

const getPositionInfo = (index: number) => {
  if (index === 0) return { section: 'Start', description: 'ANTIOCHIA - Starting position' };
  if (index >= 1 && index <= 9) return { section: 'Bottom', description: 'First journey cities' };
  if (index === 10) return { section: 'Corner', description: 'PRISON - Just visiting or imprisoned' };
  if (index >= 11 && index <= 19) return { section: 'Left', description: 'Journey continues' };
  if (index === 20) return { section: 'Corner', description: 'SABAT - Skip next turn' };
  if (index >= 21 && index <= 29) return { section: 'Top', description: 'Advanced journey cities' };
  if (index === 30) return { section: 'Corner', description: 'GO TO PRISON' };
  if (index >= 31 && index <= 39) return { section: 'Right', description: 'Final journey to Rome' };
  return { section: 'Unknown', description: 'Unknown position' };
};

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
      // Load template tiles (where game_id is null) - these are the master board tiles
      const { data: templateTiles, error } = await supabase
        .from('tiles')
        .select('*')
        .is('game_id', null)
        .order('tile_index');

      if (error) throw error;
      
      setTiles(templateTiles || []);
    } catch (error) {
      console.error('Error loading tiles:', error);
      toast({
        title: "Error",
        description: "Failed to load tiles from database",
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
    setFormData({ name: '', type: '', tile_index: tiles.length });
    setIsOpen(true);
  };

  if (loading) return <div>Loading tiles...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Game Board Tiles
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Master template tiles used for all new games. These represent Paul's missionary journeys.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTiles} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
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
                    placeholder="Enter tile name (e.g., ROMA, EFES)"
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
                  <Label htmlFor="index">Board Position (0-39)</Label>
                  <Input
                    id="index"
                    type="number"
                    min="0"
                    max="39"
                    value={formData.tile_index}
                    onChange={(e) => setFormData({...formData, tile_index: parseInt(e.target.value) || 0})}
                    placeholder="Position on the board (0-39)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0=Start, 10=Prison, 20=Sabbath, 30=Go to Prison
                  </p>
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
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Currently showing {tiles.length} template tiles from the database. These tiles are automatically copied to each new game.
          The board represents Paul's missionary journeys through the biblical world.
        </AlertDescription>
      </Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Pos</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiles.map((tile) => {
            const positionInfo = getPositionInfo(tile.tile_index);
            return (
              <TableRow key={tile.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {tile.tile_index}
                </TableCell>
                <TableCell className="font-medium">{tile.name}</TableCell>
                <TableCell>
                  <Badge className={getTileTypeColor(tile.type)}>
                    {tile.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{positionInfo.section}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs">
                  {positionInfo.description}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(tile)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tile.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TileEditor;