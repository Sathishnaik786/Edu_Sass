import { supabase } from './lib/supabase';

async function seedAdminRole() {
    console.log("🔄 Attempting to seed ADMIN role for 'admin@test.com'...");

    // 1. Get the User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error("❌ Failed to list users:", userError.message);
        return;
    }

    const adminUser = users.find(u => u.email === 'admin@test.com');

    if (!adminUser) {
        console.error("❌ User 'admin@test.com' not found in Auth. Please sign up first.");
        return;
    }

    console.log(`✅ Found User ID: ${adminUser.id}`);

    // 2. Get the Role ID
    const { data: roleData, error: roleError } = await supabase
        .from('iers_roles')
        .select('id')
        .eq('name', 'ADMIN')
        .single();

    if (roleError || !roleData) {
        console.error("❌ Failed to find 'ADMIN' role in iers_roles table.");
        console.error("   Did you run the migration '20260123_db_driven_rbac.sql'?");
        return;
    }

    console.log(`✅ Found Role ID: ${roleData.id}`);

    // 3. Assign the Role
    const { error: insertError } = await supabase
        .from('iers_user_roles')
        .insert({
            user_id: adminUser.id,
            role_id: roleData.id
        });

    if (insertError) {
        if (insertError.code === '23505') { // Unique violation
            console.log("✅ Role was already assigned.");
        } else {
            console.error("❌ Failed to assign role:", insertError.message);
        }
    } else {
        console.log("🎉 SUCCESS: Assigned ADMIN role to 'admin@test.com'");
    }
}

seedAdminRole();
