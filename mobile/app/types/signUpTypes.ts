// =====================
// Types
// =====================
export interface AccountFormData {
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface PersonalFormData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
  
  export interface ProfessionalFormData {
    specialty: string;
    yearsExperience: string;
    preferredShiftTypes: string[];
    preferredDistance: string;
    minHourlyRate: string;
    maxHourlyRate: string;
  }
  
  export interface LicenseFormData {
    licenseType: string;
    licenseNumber: string;
    state: string;
    expiryDate: Date;
    licenseImage: string | null;
  }
  
  export interface CertificationFormData {
    certName: string;
    issuingBody: string;
    expiryDate: Date;
    certImage: string | null;
  }
  
  // =====================
  // Constants
  // =====================
  export const SHIFT_TYPES = ['Day', 'Night', 'Evening', 'Weekend', 'On-Call'];
  
  export const SPECIALTIES = [
    'Registered Nurse (RN)',
    'Licensed Practical Nurse (LPN)',
    'Certified Nursing Assistant (CNA)',
    'Emergency Department',
    'Intensive Care Unit (ICU)',
    'Pediatric',
    'Operating Room',
    'Maternity',
    'Geriatric',
    'Psychiatric',
    'Other'
  ];
  
  export const STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  
  export const LICENSE_TYPES = [
    'Registered Nurse (RN)',
    'Licensed Practical Nurse (LPN)',
    'Advanced Practice Registered Nurse (APRN)',
    'Certified Nursing Assistant (CNA)',
    'Nurse Practitioner (NP)',
    'Clinical Nurse Specialist (CNS)',
    'Other'
  ];
  
  export const CERTIFICATION_TYPES = [
    'Basic Life Support (BLS)',
    'Advanced Cardiac Life Support (ACLS)',
    'Pediatric Advanced Life Support (PALS)',
    'Neonatal Resuscitation Program (NRP)',
    'Trauma Nursing Core Course (TNCC)',
    'Critical Care Registered Nurse (CCRN)',
    'Medical-Surgical Nursing Certification (MEDSURG-BC)',
    'Other'
  ];
  
  export const ISSUING_BODIES = [
    'American Heart Association (AHA)',
    'American Nurses Credentialing Center (ANCC)',
    'American Association of Critical-Care Nurses (AACN)',
    'National Council of State Boards of Nursing (NCSBN)',
    'Emergency Nurses Association (ENA)',
    'American Red Cross',
    'Other'
  ];
  