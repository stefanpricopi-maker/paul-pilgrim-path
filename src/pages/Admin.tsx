import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Gamepad2, 
  Trophy, 
  MapPin, 
  Users, 
  Building2, 
  CreditCard 
} from "lucide-react";

// Import admin components
import CurrentGamesOverview from "@/components/admin/CurrentGamesOverview";
import WinningConditionsEditor from "@/components/admin/WinningConditionsEditor";
import TileEditor from "@/components/admin/TileEditor";
import CharacterEditor from "@/components/admin/CharacterEditor";
import BuildingEditor from "@/components/admin/BuildingEditor";
import CardEditor from "@/components/admin/CardEditor";
import PlayerManagement from "@/components/admin/PlayerManagement";
import Analytics from "@/components/admin/Analytics";

const Admin = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage game settings, players, and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="games" className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 justify-center md:justify-start">
              <TabsTrigger
                value="games"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="text-xs">Games</span>
              </TabsTrigger>

              <TabsTrigger
                value="winning"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <Trophy className="w-5 h-5" />
                <span className="text-xs">Win</span>
              </TabsTrigger>

              <TabsTrigger
                value="tiles"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-xs">Tiles</span>
              </TabsTrigger>

              <TabsTrigger
                value="characters"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Chars</span>
              </TabsTrigger>

              <TabsTrigger
                value="buildings"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Buildings</span>
              </TabsTrigger>

              <TabsTrigger
                value="cards"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Cards</span>
              </TabsTrigger>

              <TabsTrigger
                value="players"
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Players</span>
              </TabsTrigger>
              
              <TabsTrigger 
                value="analytics" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
                >
                <Trophy className="w-5 h-5" /> 
                <span className="text-xs">Analytics</span>
              </TabsTrigger>

              <TabsTrigger 
                value="settings" 
                className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200
                         data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                         data-[state=active]:scale-105 data-[state=active]:shadow-lg
                         hover:bg-accent hover:text-accent-foreground"
                >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
              
            </TabsList>

            <TabsContent value="games">
              <CurrentGamesOverview />
            </TabsContent>

            <TabsContent value="winning">
              <WinningConditionsEditor />
            </TabsContent>

            <TabsContent value="tiles">
              <TileEditor />
            </TabsContent>

            <TabsContent value="characters">
              <CharacterEditor />
            </TabsContent>

            <TabsContent value="buildings">
              <BuildingEditor />
            </TabsContent>

            <TabsContent value="cards">
              <CardEditor />
            </TabsContent>

            <TabsContent value="players">
              <PlayerManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <Analytics />
            </TabsContent>

            <TabsContent value="settings">
                  <GameSettingsEditor />
            </TabsContent>

            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
