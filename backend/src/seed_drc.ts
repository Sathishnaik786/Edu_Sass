import { supabase } from './lib/supabase';

async function seedDRCRole() {
    console.log("🔄 Attempting to seed DRC role for 'drc@test.com'...");

    // 1. Get the User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error("❌ Failed to list users:", userError.message);
        return;
    }

    const drcUser = users.find(u => u.email === 'drc@test.com');

    if (!drcUser) {
        console.error("❌ User 'drc@test.com' not found in Auth. Please sign up first.");
        return;
    }

    console.log(`✅ Found User ID: ${drcUser.id}`);

    // 2. Get the Role ID
    const { data: roleData, error: roleError } = await supabase
        .from('iers_roles')
        .select('id')
        .eq('name', 'DRC')
        .single();

    if (roleError || !roleData) {
        console.error("❌ Failed to find 'DRC' role in iers_roles table.");
        return;
    }

    console.log(`✅ Found Role ID: ${roleData.id}`);

    // 3. Assign the Role
    const { error: insertError } = await supabase
        .from('iers_user_roles')
        .insert({
            user_id: drcUser.id,
            role_id: roleData.id
        });

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            console.log("✅ Role was already assigned.");
        } else {
            console.error("❌ Failed to assign role:", insertError.message);
        }
    } else {
        console.log("🎉 SUCCESS: Assigned DRC role to 'drc@test.com'");
    }
}

seedDRCRole();
