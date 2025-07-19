
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESET-PASSWORD] ${step}${detailsStr}`);
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

    // Verify the request is from an authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user has admin privileges in any school
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('school_users')
      .select('role, school_id')
      .eq('user_id', user.id)
      .in('role', ['super_admin', 'admin'])
      .eq('is_active', true)
      .single();

    if (roleError || !userRole) {
      throw new Error("Access denied: Admin privileges required");
    }

    logStep("Admin verified", { adminId: user.id, role: userRole.role });

    const { userId, email, newPassword } = await req.json();

    if (!userId || !email || !newPassword) {
      throw new Error("Missing required fields: userId, email, newPassword");
    }

    logStep("Resetting password for user", { userId, email });

    // Reset the user's password using admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      logStep("Error resetting password", { error });
      throw error;
    }

    logStep("Password reset successful", { userId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset successfully",
        user: { id: data.user.id, email: data.user.email }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in reset-user-password", { message: errorMessage });
    
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
