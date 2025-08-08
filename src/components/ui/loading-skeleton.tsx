import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Skeleton */}
        <Card className="p-6 card-ancient">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <Skeleton className="h-8 w-96 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board Skeleton */}
          <div className="lg:col-span-3">
            <Card className="p-6 card-elevated">
              <Skeleton className="w-full h-[600px] rounded-lg" />
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            
            {/* Dice Skeleton */}
            <Card className="p-6 card-ancient">
              <div className="text-center space-y-4">
                <Skeleton className="h-6 w-16 mx-auto" />
                <Skeleton className="h-20 w-20 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-8 mx-auto" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>

            {/* Location Info Skeleton */}
            <Card className="p-4 card-ancient">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </Card>

            {/* Game Log Skeleton */}
            <Card className="p-4 card-ancient">
              <Skeleton className="h-6 w-24 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-full" />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Players Panel Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 card-ancient">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;