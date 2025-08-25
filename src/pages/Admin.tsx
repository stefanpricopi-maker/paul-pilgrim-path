import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Users, Building2, CreditCard, Settings, Trophy, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TileEditor from '@/components/admin/TileEditor';
import CharacterEditor from '@/components/admin/CharacterEditor';
import BuildingEditor from '@/components/admin/BuildingEditor';
import CardEditor from '@/components/admin/CardEditor';
import CurrentGamesOverview from '@/components/admin/CurrentGamesOverview';
import WinningConditionsEditor from '@/components/admin/WinningConditionsEditor';
import PlayerManagement from "@/components/admin/PlayerManagement";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Game</span>
            </Button>
            <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="games" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <TabsTrigger value="games" className="flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Games</span>
            </TabsTrigger>
            <TabsTrigger value="winning" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Win Conditions</span>
            </TabsTrigger>
            <TabsTrigger value="tiles" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Tiles</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Characters</span>
            </TabsTrigger>
            <TabsTrigger value="buildings" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Buildings</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Cards</span>
            </TabsTrigger>

            <TabsTrigger value="players" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Players</span>
            </TabsTrigger>
            
          </TabsList>

          <TabsContent value="games">
            <CurrentGamesOverview />
          </TabsContent>
          
          <TabsContent value="winning">
            <WinningConditionsEditor />
          </TabsContent>

          <TabsContent value="players">
            <PlayerManagement />
          </TabsContent>

          <TabsContent value="tiles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Tile Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TileEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Character Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CharacterEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buildings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Building Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BuildingEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Card Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardEditor />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;