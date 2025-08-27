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
</TabsList>
