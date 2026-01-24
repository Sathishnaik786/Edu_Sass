DROP TABLE IF EXISTS public.admission_fee_payments CASCADE;

CREATE TABLE public.admission_fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    application_id UUID NOT NULL
        REFERENCES public.admission_applications(id)
        ON DELETE CASCADE,

    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',

    payment_status TEXT NOT NULL
        CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED')),

    transaction_reference TEXT,
    paid_at TIMESTAMPTZ,
    payment_mode TEXT,

    created_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_fee_per_application UNIQUE (application_id)
);

-- RLS Policies
ALTER TABLE public.admission_fee_payments ENABLE ROW LEVEL SECURITY;

-- Applicant can view own fee
CREATE POLICY "Applicant view own fee"
ON public.admission_fee_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admission_applications a
    WHERE a.id = admission_fee_payments.application_id
    AND a.applicant_id = auth.uid()
  )
);

-- Applicant can insert fee only for own application
CREATE POLICY "Applicant insert fee"
ON public.admission_fee_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admission_applications a
    WHERE a.id = admission_fee_payments.application_id
    AND a.applicant_id = auth.uid()
    AND a.status = 'DOCUMENTS_VERIFIED'
  )
);

-- Applicant can update their own fee (e.g. confirming it)
CREATE POLICY "Applicant update fee"
ON public.admission_fee_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admission_applications a
    WHERE a.id = admission_fee_payments.application_id
    AND a.applicant_id = auth.uid()
  )
);

-- Admin can read all
CREATE POLICY "Admin read all fees"
ON public.admission_fee_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.iers_roles r
    JOIN public.iers_user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('ADMIN','SUPER_ADMIN', 'DRC')
  )
);
