
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-USER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    if (!supabaseServiceRoleKey || !supabaseUrl) {
      throw new Error("Missing Supabase configuration");
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });

    // Verify the request is from an authenticated super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is super admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('school_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .eq('is_active', true)
      .single();

    if (roleError || !userRole) {
      throw new Error("Access denied: Super admin privileges required");
    }

    logStep("Super admin verified", { adminId: user.id });

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("Missing required field: userId");
    }

    logStep("Deleting user", { userId });

    // Delete the user using admin API
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      logStep("Error deleting user", { error });
      throw error;
    }

    logStep("User deleted successfully", { userId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User deleted successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-user", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
