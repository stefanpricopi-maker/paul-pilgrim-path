import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Card {
  id: number;
  text_en: string;
  text_ro: string;
  action_type: string;
  action_value: string;
  category: string;
}

const ACTION_TYPES = [
  'add_money', 'lose_money', 'go_to_tile', 'go_to_tile_and_pass_bonus', 
  'go_to_nearest_port', 'go_to_jail', 'get_out_of_jail_card', 'pay_per_building'
];

const CATEGORIES = ['movement', 'money', 'jail', 'building', 'special'];

const CardEditor = () => {
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [chanceCards, setChanceCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardType, setCardType] = useState<'community' | 'chance'>('community');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    text_en: '',
    text_ro: '',
    action_type: '',
    action_value: '',
    category: ''
  });

  const loadCards = async () => {
    try {
      const [communityResult, chanceResult] = await Promise.all([
        supabase.from('cards_community').select('*').order('id'),
        supabase.from('cards_chance').select('*').order('id')
      ]);

      if (communityResult.error) throw communityResult.error;
      if (chanceResult.error) throw chanceResult.error;

      setCommunityCards(communityResult.data || []);
      setChanceCards(chanceResult.data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast({
        title: "Error",
        description: "Failed to load cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleSave = async () => {
    try {
      const table = cardType === 'community' ? 'cards_community' : 'cards_chance';
      
      if (editingCard) {
        const { error } = await supabase
          .from(table)
          .update(formData)
          .eq('id', editingCard.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Card updated successfully"
        });
      } else {
        const { error } = await supabase
          .from(table)
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Card created successfully"
        });
      }

      setIsOpen(false);
      setEditingCard(null);
      setFormData({
        text_en: '',
        text_ro: '',
        action_type: '',
        action_value: '',
        category: ''
      });
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: "Error",
        description: "Failed to save card",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (card: Card, type: 'community' | 'chance') => {
    setEditingCard(card);
    setCardType(type);
    setFormData({
      text_en: card.text_en,
      text_ro: card.text_ro,
      action_type: card.action_type,
      action_value: card.action_value || '',
      category: card.category
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number, type: 'community' | 'chance') => {
    try {
      const table = type === 'community' ? 'cards_community' : 'cards_chance';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Card deleted successfully"
      });
      loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Error",
        description: "Failed to delete card",
        variant: "destructive"
      });
    }
  };

  const openNew = (type: 'community' | 'chance') => {
    setEditingCard(null);
    setCardType(type);
    setFormData({
      text_en: '',
      text_ro: '',
      action_type: '',
      action_value: '',
      category: ''
    });
    setIsOpen(true);
  };

  const renderCardTable = (cards: Card[], type: 'community' | 'chance') => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {type === 'community' ? 'Community Cards' : 'Chance Cards'}
        </h3>
        <Button onClick={() => openNew(type)}>
          <Plus className="w-4 h-4 mr-2" />
          Add {type === 'community' ? 'Community' : 'Chance'} Card
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Text (EN)</TableHead>
            <TableHead>Action Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card.id}>
              <TableCell className="max-w-xs truncate">{card.text_en}</TableCell>
              <TableCell>{card.action_type}</TableCell>
              <TableCell>{card.category}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(card, type)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id, type)}>
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

  if (loading) return <div>Loading cards...</div>;

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit' : 'Create New'} {cardType === 'community' ? 'Community' : 'Chance'} Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="text_en">Text (English)</Label>
              <Textarea
                id="text_en"
                value={formData.text_en}
                onChange={(e) => setFormData({...formData, text_en: e.target.value})}
                placeholder="Card text in English"
              />
            </div>
            <div>
              <Label htmlFor="text_ro">Text (Romanian)</Label>
              <Textarea
                id="text_ro"
                value={formData.text_ro}
                onChange={(e) => setFormData({...formData, text_ro: e.target.value})}
                placeholder="Card text in Romanian"
              />
            </div>
            <div>
              <Label htmlFor="action_type">Action Type</Label>
              <Select value={formData.action_type} onValueChange={(value) => setFormData({...formData, action_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="action_value">Action Value</Label>
              <Input
                id="action_value"
                value={formData.action_value}
                onChange={(e) => setFormData({...formData, action_value: e.target.value})}
                placeholder="Value for the action (amount, tile name, etc.)"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSave} className="flex-1">
                {editingCard ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="community" className="space-y-4">
        <TabsList>
          <TabsTrigger value="community">Community Cards</TabsTrigger>
          <TabsTrigger value="chance">Chance Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="community">
          {renderCardTable(communityCards, 'community')}
        </TabsContent>
        
        <TabsContent value="chance">
          {renderCardTable(chanceCards, 'chance')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardEditor;