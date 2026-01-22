import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    const email = 'internal_test_user@example.com';
    const password = 'Password@123';

    console.log(`Creating test user: ${email}`);

    // Check if exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    const existing = users.find(u => u.email === email);
    if (existing) {
        console.log('User already exists. ID:', existing.id);

        // Update Metadata to ensure role APPLICANT
        const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
            user_metadata: { role: 'APPLICANT' }
        });

        if (updateError) console.error('Error updating role:', updateError.message);
        else console.log('User role confirmed as APPLICANT');

        return;
    }

    // Create New
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'APPLICANT' }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created successfully!');
        console.log('ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('Password:', password);
        console.log('Role:', data.user.user_metadata.role);
    }
}

createTestUser();
