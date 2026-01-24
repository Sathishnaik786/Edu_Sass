import { supabase } from '../../lib/supabase';
import { ADMISSION_STATUS, APPLICATION_TYPE, CANDIDATE_TYPE } from './admission.constants';
import { ROLES } from '../../constants/roles';
import { UserRoleSyncService } from '../../services/userRoleSync.service';

export const IntakeService = {
    getPendingExternalIntake: async () => {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('application_type', APPLICATION_TYPE.PET)
            .eq('candidate_type', CANDIDATE_TYPE.EXTERNAL)
            .eq('status', ADMISSION_STATUS.SUBMITTED)
            .is('applicant_id', null)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    },

    approveExternalIntake: async (applicationId: string) => {
        // 1. Fetch Application by ID ONLY (Fix 500 Error)
        // Need 'payload' to retrieve encrypted password and applicant details
        const { data: app, error: fetchError } = await supabase
            .from('admission_applications')
            .select('id, payload, candidate_type, applicant_id, status')
            .eq('id', applicationId)
            .single();

        if (fetchError || !app) {
            console.error("Fetch Error Details:", fetchError);
            throw new Error(`Application not found: ${fetchError?.message || 'Unknown error'}`);
        }

        // 2. Validate State Explicitly
        if (app.candidate_type !== CANDIDATE_TYPE.EXTERNAL) {
            throw new Error(`Invalid Intake: Application is not EXTERNAL (Current: ${app.candidate_type})`);
        }
        if (app.applicant_id !== null) {
            throw new Error('Application already approved (Applicant ID exists)');
        }
        // Strict Status Check is optional but good practice. Assuming SUBMITTED is the only valid state.
        if (app.status !== ADMISSION_STATUS.SUBMITTED) {
            throw new Error(`Application status '${app.status}' is not eligible for approval.`);
        }

        // 3. Extract Details from Payload (Source of Truth for External)
        const payload = app.payload || {};
        const email = payload.email;
        const fullName = payload.personal_details?.full_name || 'PhD Applicant';

        if (!email) {
            throw new Error(`External application payload invalid: missing email (applicationId=${app.id})`);
        }

        // 4. Decrypt Password or Use Default
        let finalPassword = 'ChangeMe@1234'; // Fallback

        try {
            if (payload.auth_credentials?.encrypted_data) {
                const crypto = require('crypto');
                const [ivHex, encryptedHex] = payload.auth_credentials.encrypted_data.split(':');

                if (ivHex && encryptedHex) {
                    const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_secret_key_32_bytes_length!!';
                    const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
                    const iv = Buffer.from(ivHex, 'hex');

                    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
                    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);

                    if (decrypted.length > 0) {
                        finalPassword = decrypted.toString();
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to decrypt applicant password, using fallback:", e);
        }

        // 5. Create Auth User (Admin only action)
        // We create the identity in Supabase Auth.
        // We DO NOT set metadata roles anymore.
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: finalPassword,
            email_confirm: true,
            user_metadata: {
                full_name: fullName
            }
        });

        if (authError) throw new Error(`Auth creation failed: ${authError.message}`);
        const newUserId = authData.user.id;

        // 6. Clean Payload (Remove Password Hash from DB)
        // Note: app is immutable so check payload copy
        const cleanPayload = { ...payload };
        if (cleanPayload.auth_credentials) {
            delete cleanPayload.auth_credentials;
        }

        // 7. Assign APPLICANT Role in DATABASE (Source of Truth)
        // Lookup Role ID for APPLICANT
        const { data: roleData, error: roleErr } = await supabase
            .from('iers_roles')
            .select('id')
            .eq('name', 'APPLICANT')
            .single();

        if (roleErr || !roleData) throw new Error('System Configuration Error: APPLICANT role missing');

        const { error: assignError } = await supabase
            .from('iers_user_roles')
            .insert({
                user_id: newUserId,
                role_id: roleData.id
            });

        if (assignError) throw new Error(`Role assignment failed: ${assignError.message}`);

        // 8. Convert Application to INTERNAL and Link User
        // Status remains SUBMITTED so it flows into DRC Scrutiny
        const { error: updateError } = await supabase
            .from('admission_applications')
            .update({
                applicant_id: newUserId,
                candidate_type: CANDIDATE_TYPE.INTERNAL,
                payload: cleanPayload
                // application_source: EXTERNAL (Removed as column doesn't exist)
            })
            .eq('id', applicationId);

        if (updateError) throw new Error(updateError.message);

        return { userId: newUserId };
    },

    rejectExternalIntake: async (applicationId: string) => {
        const { error } = await supabase
            .from('admission_applications')
            .update({
                status: ADMISSION_STATUS.INTAKE_REJECTED
            })
            .eq('id', applicationId);

        if (error) throw new Error(error.message);
        return true;
    }
};
