import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false
    }
  }
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to verify admin role
async function verifyAdmin(authHeader: string) {
  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: user, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return { valid: false, error: 'Unauthorized' };
    }

    // Check if user has admin role in any school
    const { data: schoolUsers, error: roleError } = await supabaseAdmin
      .from('school_users')
      .select('role')
      .eq('user_id', user.user.id)
      .eq('is_active', true)
      .in('role', ['admin', 'super_admin']);

    if (roleError || !schoolUsers || schoolUsers.length === 0) {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Authentication failed' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[CREATE-SCHOOL-USER] Function started');
    
    // Get the request body
    const body = await req.json();
    console.log('[CREATE-SCHOOL-USER] Request body received -', JSON.stringify({ userData: body.userData || body }));
    
    // Handle both old and new request formats
    const userData = body.userData || body;
    const { email, password, firstName, lastName, role, schoolId, studentId, teacherId } = userData;

    // Verify that the user is an admin
    const adminCheck = await verifyAdmin(req.headers.get('authorization') ?? '');
    if (!adminCheck.valid) {
        return new Response(
            JSON.stringify({ error: adminCheck.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('[CREATE-SCHOOL-USER] Creating user -', { email, firstName, lastName, role, schoolId });

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role,
        school_id: schoolId
      },
      email_confirm: true
    });

    if (authError) {
      console.error('[CREATE-SCHOOL-USER] Auth error -', authError);
      
      if (authError.message?.includes('email_address_not_authorized')) {
        return new Response(
          JSON.stringify({ 
            error: 'email_not_authorized',
            message: 'Cette adresse email n\'est pas autorisée.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (authError.message?.includes('User already registered')) {
        return new Response(
          JSON.stringify({ 
            error: 'email_exists',
            message: 'Un compte avec cette adresse email existe déjà.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw authError;
    }

    console.log('[CREATE-SCHOOL-USER] Auth user created -', { userId: authData.user?.id });

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user!.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
      });

    if (profileError) {
      console.log('[CREATE-SCHOOL-USER] Error creating profile -', JSON.stringify({ error: profileError }));
    }

    // Create school user relationship
    const { error: schoolUserError } = await supabaseAdmin
      .from('school_users')
      .insert({
        user_id: authData.user!.id,
        school_id: schoolId,
        role: role,
        joined_at: new Date().toISOString()
      });

    if (schoolUserError) {
      console.error('[CREATE-SCHOOL-USER] School user error -', schoolUserError);
      throw schoolUserError;
    }

    // Update student or teacher record with user_id
    if (role === 'student' && studentId) {
      const { error: studentUpdateError } = await supabaseAdmin
        .from('students')
        .update({ user_id: authData.user!.id })
        .eq('id', studentId);

      if (studentUpdateError) {
        console.error('[CREATE-SCHOOL-USER] Student update error -', studentUpdateError);
        throw studentUpdateError;
      }
      console.log('[CREATE-SCHOOL-USER] Student record updated with user_id');
    }

    if (role === 'teacher' && teacherId) {
      const { error: teacherUpdateError } = await supabaseAdmin
        .from('teachers')
        .update({ user_id: authData.user!.id })
        .eq('id', teacherId);

      if (teacherUpdateError) {
        console.error('[CREATE-SCHOOL-USER] Teacher update error -', teacherUpdateError);
        throw teacherUpdateError;
      }
      console.log('[CREATE-SCHOOL-USER] Teacher record updated with user_id');
    }

    console.log('[CREATE-SCHOOL-USER] User creation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user!.id,
        message: 'Utilisateur créé avec succès' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[CREATE-SCHOOL-USER] Unexpected error -', error);
    return new Response(
      JSON.stringify({ 
        error: 'server_error',
        message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
