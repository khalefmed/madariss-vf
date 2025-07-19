
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, teacherId, schoolId, firstName, lastName } = await req.json()

    console.log('Creating teacher user:', { email, teacherId, schoolId, firstName, lastName })

    // Create the user account
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        teacher_id: teacherId
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw authError
    }

    console.log('Auth user created:', authUser.user.id)

    // Add user to school with teacher role
    const { error: schoolUserError } = await supabaseAdmin
      .from('school_users')
      .insert([{
        school_id: schoolId,
        user_id: authUser.user.id,
        role: 'teacher',
        is_active: true,
        joined_at: new Date().toISOString()
      }])

    if (schoolUserError) {
      console.error('Error creating school user:', schoolUserError)
      throw schoolUserError
    }

    // Update teacher record with user_id (if teachers table has user_id column)
    // This is optional and depends on your schema
    try {
      await supabaseAdmin
        .from('teachers')
        .update({ user_id: authUser.user.id })
        .eq('id', teacherId)
    } catch (error) {
      console.log('Note: Could not link teacher to user (user_id column may not exist):', error)
    }

    console.log('Teacher user setup completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: authUser.user,
        message: 'Teacher user account created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-teacher-user function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create teacher user account'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
