import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Building {
  id: number;
  type: string;
  cost: number;
  income: number;
  icon_url: string;
}

const BuildingEditor = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: '',
    cost: 0,
    income: 0,
    icon_url: ''
  });

  const loadBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('id');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error loading buildings:', error);
      toast({
        title: "Error",
        description: "Failed to load buildings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleSave = async () => {
    try {
      if (editingBuilding) {
        const { error } = await supabase
          .from('buildings')
          .update(formData)
          .eq('id', editingBuilding.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Building updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('buildings')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Building created successfully"
        });
      }

      setIsOpen(false);
      setEditingBuilding(null);
      setFormData({ type: '', cost: 0, income: 0, icon_url: '' });
      loadBuildings();
    } catch (error) {
      console.error('Error saving building:', error);
      toast({
        title: "Error",
        description: "Failed to save building",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      type: building.type,
      cost: building.cost,
      income: building.income,
      icon_url: building.icon_url || ''
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Building deleted successfully"
      });
      loadBuildings();
    } catch (error) {
      console.error('Error deleting building:', error);
      toast({
        title: "Error",
        description: "Failed to delete building",
        variant: "destructive"
      });
    }
  };

  const openNew = () => {
    setEditingBuilding(null);
    setFormData({ type: '', cost: 0, income: 0, icon_url: '' });
    setIsOpen(true);
  };

  if (loading) return <div>Loading buildings...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Building Types</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Building
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBuilding ? 'Edit Building' : 'Create New Building'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Building Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="Enter building type (e.g., church, synagogue)"
                />
              </div>
              <div>
                <Label htmlFor="cost">Building Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value) || 0})}
                  placeholder="Cost to build"
                />
              </div>
              <div>
                <Label htmlFor="income">Income per Turn</Label>
                <Input
                  id="income"
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({...formData, income: parseInt(e.target.value) || 0})}
                  placeholder="Income generated per turn"
                />
              </div>
              <div>
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({...formData, icon_url: e.target.value})}
                  placeholder="Path to building icon (e.g., /icons/church.svg)"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingBuilding ? 'Update' : 'Create'}
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
            <TableHead>Type</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Income</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buildings.map((building) => (
            <TableRow key={building.id}>
              <TableCell className="font-medium">{building.type}</TableCell>
              <TableCell>{building.cost} TEC$</TableCell>
              <TableCell>{building.income} TEC$</TableCell>
              <TableCell>{building.icon_url}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(building)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(building.id)}>
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

export default BuildingEditor;