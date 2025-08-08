import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameLocation, Player } from '@/types/game';
import ConfirmationModal from './ConfirmationModal';
import { ShoppingCart, Church, Building2, Coins, Home } from 'lucide-react';

interface PropertyActionsProps {
  location: GameLocation;
  currentPlayer: Player;
  onBuyLand: (locationId: string) => void;
  onBuildChurch: (locationId: string) => void;
  onBuildSynagogue: (locationId: string) => void;
  onPayRent: (locationId: string) => void;
  isCurrentPlayerLocation: boolean;
  allPlayers: Player[];
}

const PropertyActions = ({
  location,
  currentPlayer,
  onBuyLand,
  onBuildChurch,
  onBuildSynagogue,
  onPayRent,
  isCurrentPlayerLocation,
  allPlayers
}: PropertyActionsProps) => {
  const [pendingAction, setPendingAction] = useState<{
    type: 'buy' | 'church' | 'synagogue' | 'pay';
    location: GameLocation;
  } | null>(null);

  const isOwned = !!location.owner;
  const isOwnedByCurrentPlayer = location.owner === currentPlayer.id;
  const canBuy = !isOwned && location.type === 'city' && isCurrentPlayerLocation;
  const canBuild = isOwnedByCurrentPlayer && location.type === 'city' && isCurrentPlayerLocation;
  const needsToPayRent = isOwned && !isOwnedByCurrentPlayer && isCurrentPlayerLocation && location.rent > 0;

  // Visit tracking for building restrictions
  const visitCount = currentPlayer.propertyVisits[location.id] || 0;
  const canBuildSynagogue = canBuild && visitCount >= 1;
  const canBuildChurch = canBuild && visitCount >= 3;

  const ownerPlayer = allPlayers.find(p => p.id === location.owner);

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.type) {
      case 'buy':
        onBuyLand(location.id);
        break;
      case 'church':
        onBuildChurch(location.id);
        break;
      case 'synagogue':
        onBuildSynagogue(location.id);
        break;
      case 'pay':
        onPayRent(location.id);
        break;
    }
    setPendingAction(null);
  };

  if (!isCurrentPlayerLocation || location.type !== 'city') {
    return null;
  }

  return (
    <>
      <Card className="p-4 card-ancient border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-primary ancient-title">{location.name}</h3>
          </div>

          {/* Property Status */}
          <div className="text-sm space-y-1">
            {isOwned ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: ownerPlayer?.color || '#666' }}
                  />
                  <span className="text-muted-foreground">
                    Owned by {ownerPlayer?.name || 'Unknown'}
                  </span>
                </div>
                {isOwnedByCurrentPlayer && (
                  <p className="text-xs text-accent">
                    Visits: {visitCount} 
                    {visitCount < 1 && " (Need 1+ for synagogue)"}
                    {visitCount >= 1 && visitCount < 3 && " (Need 3+ for church)"}
                    {visitCount >= 3 && " (Can build both)"}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Land available for purchase</p>
            )}
            
            <p className="text-xs">Price: {location.price} denarii</p>
            {location.rent > 0 && <p className="text-xs">Rent: {location.rent} denarii</p>}
          </div>

          {/* Buildings Info */}
          {(location.buildings.churches > 0 || location.buildings.synagogues > 0) && (
            <div className="flex items-center gap-3 text-xs">
              {location.buildings.churches > 0 && (
                <div className="flex items-center gap-1">
                  <Church className="w-3 h-3 text-game-church" />
                  <span>{location.buildings.churches}</span>
                </div>
              )}
              {location.buildings.synagogues > 0 && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-game-synagogue" />
                  <span>{location.buildings.synagogues}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {needsToPayRent && (
              <Button
                onClick={() => setPendingAction({ type: 'pay', location })}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Coins className="w-4 h-4 mr-2" />
                Pay Rent ({location.rent} denarii)
              </Button>
            )}

            {canBuy && (
              <Button
                onClick={() => setPendingAction({ type: 'buy', location })}
                variant="default"
                size="sm"
                className="w-full"
                disabled={currentPlayer.money < location.price}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Land ({location.price} denarii)
              </Button>
            )}

            {canBuild && (
              <>
                <Button
                  onClick={() => setPendingAction({ type: 'church', location })}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-game-church/20"
                  disabled={currentPlayer.money < location.churchCost || !canBuildChurch}
                  title={!canBuildChurch ? "Need 3+ visits to build church" : ""}
                >
                  <Church className="w-4 h-4 mr-2" />
                  Build Church ({location.churchCost} denarii)
                  {!canBuildChurch && " - Need more visits"}
                </Button>
                <Button
                  onClick={() => setPendingAction({ type: 'synagogue', location })}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-game-synagogue/20"
                  disabled={currentPlayer.money < location.synagogueCost || !canBuildSynagogue}
                  title={!canBuildSynagogue ? "Need 1+ visits to build synagogue" : ""}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Build Synagogue ({location.synagogueCost} denarii)
                  {!canBuildSynagogue && " - Need more visits"}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {pendingAction && (
        <ConfirmationModal
          isOpen={true}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
          action={pendingAction.type}
          location={pendingAction.location}
          playerMoney={currentPlayer.money}
        />
      )}
    </>
  );
};

export default PropertyActions;