export const ROLES = {
    APPLICANT: 'APPLICANT',
    DRC: 'DRC',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    FACULTY: 'FACULTY', // For guides
} as const;

export type Role = keyof typeof ROLES;
