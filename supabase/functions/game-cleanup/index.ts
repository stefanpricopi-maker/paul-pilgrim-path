import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  games_deleted: number;
  tiles_deleted: number;
  players_deleted: number;
  members_deleted: number;
  logs_deleted: number;
}

interface CleanupStats {
  old_waiting_games: number;
  old_finished_games: number;
  total_games: number;
  total_tiles: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'stats';

    console.log(`Game cleanup function called with action: ${action}`);

    if (action === 'cleanup') {
      // Run manual cleanup
      console.log('Running manual cleanup...');
      
      const { data: cleanupResult, error: cleanupError } = await supabaseClient
        .rpc('cleanup_old_games');

      if (cleanupError) {
        console.error('Cleanup error:', cleanupError);
        throw new Error(`Cleanup failed: ${cleanupError.message}`);
      }

      // Log the manual cleanup
      const { error: logError } = await supabaseClient
        .from('cleanup_log')
        .insert({
          cleanup_type: 'manual',
          games_deleted: cleanupResult[0]?.games_deleted || 0,
          related_records_deleted: 
            (cleanupResult[0]?.tiles_deleted || 0) +
            (cleanupResult[0]?.players_deleted || 0) +
            (cleanupResult[0]?.members_deleted || 0) +
            (cleanupResult[0]?.logs_deleted || 0),
          cleanup_completed_at: new Date().toISOString(),
          success: true
        });

      if (logError) {
        console.error('Failed to log cleanup:', logError);
      }

      console.log('Manual cleanup completed:', cleanupResult[0]);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'cleanup',
          result: cleanupResult[0] || { games_deleted: 0, tiles_deleted: 0, players_deleted: 0, members_deleted: 0, logs_deleted: 0 }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (action === 'stats') {
      // Get cleanup statistics
      console.log('Getting cleanup statistics...');

      const { data: configData, error: configError } = await supabaseClient
        .from('cleanup_config')
        .select('setting_name, setting_value')
        .in('setting_name', ['cleanup_waiting_games_hours', 'cleanup_finished_games_hours']);

      if (configError) {
        console.error('Config error:', configError);
        throw new Error(`Failed to get config: ${configError.message}`);
      }

      const waitingHours = configData.find(c => c.setting_name === 'cleanup_waiting_games_hours')?.setting_value || '24';
      const finishedHours = configData.find(c => c.setting_name === 'cleanup_finished_games_hours')?.setting_value || '168';

      // Count old games that would be cleaned up
      const { count: oldWaitingCount, error: waitingError } = await supabaseClient
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting')
        .lt('created_at', new Date(Date.now() - parseInt(waitingHours) * 60 * 60 * 1000).toISOString());

      const { count: oldFinishedCount, error: finishedError } = await supabaseClient
        .from('games')
        .select('*', { count: 'exact', head: true })
        .in('status', ['finished', 'cancelled'])
        .lt('created_at', new Date(Date.now() - parseInt(finishedHours) * 60 * 60 * 1000).toISOString());

      // Get total counts
      const { count: totalGames, error: totalGamesError } = await supabaseClient
        .from('games')
        .select('*', { count: 'exact', head: true });

      const { count: totalTiles, error: totalTilesError } = await supabaseClient
        .from('tiles')
        .select('*', { count: 'exact', head: true })
        .not('game_id', 'is', null);

      // Get recent cleanup logs
      const { data: recentLogs, error: logsError } = await supabaseClient
        .from('cleanup_log')
        .select('*')
        .order('cleanup_started_at', { ascending: false })
        .limit(10);

      if (waitingError || finishedError || totalGamesError || totalTilesError) {
        console.error('Stats query errors:', { waitingError, finishedError, totalGamesError, totalTilesError });
        throw new Error('Failed to get statistics');
      }

      const stats: CleanupStats = {
        old_waiting_games: oldWaitingCount || 0,
        old_finished_games: oldFinishedCount || 0,
        total_games: totalGames || 0,
        total_tiles: totalTiles || 0
      };

      console.log('Cleanup statistics:', stats);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'stats',
          stats,
          config: {
            waiting_hours: parseInt(waitingHours),
            finished_hours: parseInt(finishedHours)
          },
          recent_logs: recentLogs || []
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    if (action === 'config') {
      // Get or update cleanup configuration
      if (req.method === 'GET') {
        const { data: config, error } = await supabaseClient
          .from('cleanup_config')
          .select('*')
          .order('setting_name');

        if (error) {
          throw new Error(`Failed to get config: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, config }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const { setting_name, setting_value } = body;

        if (!setting_name || setting_value === undefined) {
          return new Response(
            JSON.stringify({ error: 'setting_name and setting_value are required' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('cleanup_config')
          .update({ 
            setting_value: setting_value.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('setting_name', setting_name)
          .select();

        if (error) {
          throw new Error(`Failed to update config: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, updated: data }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: stats, cleanup, or config' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );

  } catch (error) {
    console.error('Game cleanup function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});