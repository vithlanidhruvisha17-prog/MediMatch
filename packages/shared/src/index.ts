export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  city: string;
  email: string;
  role?: string;
  passwordHash?: string;
  budgetCap: number;
  createdAt: string;
}

export interface Assessment {
  id: string;
  patientId: string;
  patient?: Patient;
  illnessText: string;
  conditionKey?: string | null;
  conditionDetail?: string | null;
  durationBucket: string;
  severity: number;
  symptoms: string[];
  preExisting: string[];
  medicalHistoryText?: string | null;
  aiPredictedSurgery?: string | null;
  aiPriority?: string | null;
  aiSummary?: string | null;
  status: string;
  createdAt: string;
}

export interface CostBreakdown {
  surgeonFee: number;
  otCharges: number;
  roomRate: number;
  medicines: number;
  totalPackagePrice: number;
  budgetSavings: number;
  stayDurationDays: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  accreditation: string;
  address: string;
  beds: number;
  icuBeds: number;
  imageUrl?: string | null;
  contactEmail?: string | null;
  costBreakdown?: CostBreakdown;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  yearsExp: number;
  fee: number;
  photoUrl?: string | null;
  contactEmail?: string | null;
}

export interface Inquiry {
  id: string;
  patientId: string;
  patient?: Patient;
  hospitalId?: string | null;
  hospitalName?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  procedure: string;
  status: 'New' | 'Contacted' | 'Closed' | string;
  notes?: string | null;
  notifyVia?: string[];
  createdAt: string;
}

export interface AIProviderConfig {
  id: string;
  provider: 'gemini' | 'openai' | 'custom' | string;
  apiKeyEnc: string;
  maskedApiKey?: string;
  modelName: string;
  systemPrompt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface CreateAssessmentPayload {
  // Patient Profile
  fullName: string;
  phone: string;
  age: number;
  gender: string;
  city: string;
  email?: string;
  budgetCap: number;

  // Illness Details
  illnessText: string;
  conditionKey?: string;
  conditionDetail?: string;
  durationBucket: '< 1 week' | '1-4 weeks' | '1-6 months' | '6+ months' | string;
  severity: number; // 1-10
  symptoms: string[];
  preExisting: string[];
  medicalHistoryText?: string;
}

export interface AssessmentResponse {
  patient: Patient;
  assessment: Assessment;
  aiPrediction: {
    predictedSurgery: string;
    priority: string;
    summary: string;
    specialty: string;
  };
  matchingHospitals: Hospital[];
  recommendedDoctors: Doctor[];
}

export interface ConditionCategory {
  category: string;
  conditions: string[];
}

export const CONDITION_CATEGORIES: ConditionCategory[] = [
  {
    category: 'Cancer & Tumors (Oncology)',
    conditions: [
      'Lung Cancer / Solitary Nodule',
      'Breast Tumor / Carcinoma',
      'Colorectal Cancer',
      'Prostate Enlargement / Carcinoma',
      'Brain Tumor / Intracranial Mass',
      'Oral / Tongue Lesion'
    ]
  },
  {
    category: 'Heart & Circulation (Cardiovascular)',
    conditions: [
      'Coronary Artery Disease (Severe Blockage)',
      'Aortic / Mitral Valve Disease',
      'Cardiac Arrhythmia / Conduction Defect',
      'Aortic Aneurysm',
      'Peripheral Artery Occlusive Disease'
    ]
  },
  {
    category: 'Bones, Joints & Spine (Orthopedics & Neuro)',
    conditions: [
      'Severe Osteoarthritis Knee (End-stage)',
      'Severe Osteoarthritis Hip (Avascular Necrosis)',
      'Lumbar Disc Herniation / Sciatica',
      'Cervical Spondylotic Myelopathy',
      'ACL / Meniscus Ligament Tear',
      'Spinal Deformity / Scoliosis'
    ]
  },
  {
    category: 'Digestive & Abdominal (Gastrointestinal & HPB)',
    conditions: [
      'Gallbladder Stones / Acute Cholecystitis',
      'Inguinal / Umbilical Hernia',
      'Acute / Recurrent Appendicitis',
      'Complex Anal Fistula / Hemorrhoids',
      'Chronic Liver / Biliary Obstruction',
      'Morbid Obesity / Metabolic Surgery'
    ]
  },
  {
    category: 'Kidney & Urinary (Urology)',
    conditions: [
      'Obstructive Renal / Ureteric Calculus (Kidney Stones)',
      'Benign Prostatic Hyperplasia (BPH)',
      'Bladder Mass / Hematuria',
      'Pelvic Ureteric Junction Obstruction'
    ]
  },
  {
    category: 'Women\'s Health (Gynecology)',
    conditions: [
      'Large Symptomatic Uterine Fibroids',
      'Complex Ovarian Cyst / Endometrioma',
      'Pelvic Organ Prolapse / Uterine Descent',
      'Abnormal Uterine Bleeding (AUB)'
    ]
  },
  {
    category: 'Head, Neck & Endocrine (ENT / Endocrine)',
    conditions: [
      'Symptomatic Multinodular Goiter / Thyroid Nodule',
      'Deviated Nasal Septum / Chronic Sinusitis',
      'Enlarged Tonsils & Sleep Apnea',
      'Parotid Salivary Gland Tumor'
    ]
  }
];

export const SYMPTOM_LIST: string[] = [
  // Pain & Physical Sensation
  'Sharp Abdominal Pain',
  'Dull Radiating Back Pain',
  'Severe Joint Pain & Morning Stiffness',
  'Chest Tightness or Heaviness',
  'Radiating Sciatica Leg Pain',
  'Throbbing Headache',
  'Neck & Arm Radicular Pain',
  'Chronic Pelvic Pain',
  'Pain on Swallowing (Dysphagia)',
  'Painful Urination (Dysuria)',

  // Mobility & Functional
  'Difficulty Walking or Weight Bearing',
  'Joint Locking or Giving Way',
  'Loss of Limb Sensation / Numbness',
  'Muscle Weakness in Extremities',
  'Shortness of Breath on Exertion',
  'Inability to Lie Flat at Night',
  'Impaired Balance or Dizziness',

  // Gastrointestinal & Abdominal
  'Nausea & Persistent Vomiting',
  'Post-Meal Upper Abdominal Bloating',
  'Blood in Stool or Dark Stools',
  'Jaundice (Yellowish Eyes or Skin)',
  'Sudden Changes in Bowel Habits',
  'Severe Acid Reflux / Heartburn',

  // Urinary & Pelvic
  'Visible Blood in Urine (Hematuria)',
  'Urinary Hesitancy or Weak Stream',
  'Frequent Nocturnal Urination',
  'Feeling of Incomplete Bladder Emptying',
  'Heavy or Irregular Menstrual Bleeding',

  // Systemic & Oncological Warning Signs
  'Unintentional Rapid Weight Loss',
  'Persistent Low-grade or High Fever',
  'Drenching Night Sweats',
  'Extreme Fatigue & Weakness',
  'Palpable Lump in Breast or Neck',
  'Swollen Lymph Nodes in Groin/Armpit',
  'Chronic Non-healing Ulcer or Sore',
  'Persistent Cough or Blood in Phlegm',
  'Voice Hoarseness lasting > 3 weeks'
];

export const PRE_EXISTING_CONDITIONS: string[] = [
  'Type 2 Diabetes',
  'Hypertension (High BP)',
  'Asthma / COPD',
  'Coronary Stent / Prior Heart Surgery',
  'Chronic Kidney Disease (CKD)',
  'Hypo / Hyperthyroidism',
  'Blood Thinner Medication (Aspirin/Warfarin)',
  'Prior Major Abdominal Surgery',
  'Liver Cirrhosis / Fatty Liver',
  'No Known Pre-existing Conditions'
];

export const DURATION_OPTIONS = [
  '< 1 week',
  '1-4 weeks',
  '1-6 months',
  '6+ months'
] as const;

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad'
] as const;

export const ACCREDITATION_OPTIONS = [
  'All Accreditations',
  'NABH Accredited',
  'JCI Accredited',
  'NABH & JCI'
] as const;

export const DEFAULT_AI_SYSTEM_PROMPT = `You are MediMatch's Board-Certified Medical AI & Surgical Financial Counselor.
Your job is to analyze patient symptom profiles, condition severity, reported history, and target budget to:
1. Identify the most likely surgical or interventional procedure indication.
2. Determine surgical urgency/priority (e.g., "Urgent Priority / Schedule Immediate Evaluation", "Moderate Priority / Schedule Within 1-2 Weeks", or "Elective Priority / Planned Consultation Within 1 Month").
3. Provide a clear, empathetic 2-3 sentence clinical summary explaining the surgical rationale and what the patient should expect.
4. Specify the exact surgical subspecialty (e.g., "Cardiothoracic Surgery", "Orthopedics & Joint Reconstruction", "Surgical Oncology", "Surgical Gastroenterology & Laparoscopy", "Urology & Endourology", "Neurosurgery & Spine").

CRITICAL CLINICAL SAFETY RULE:
If the patient's stated illness or symptoms are placeholders (e.g. "NA", "none", "nothing", "asdf"), non-medical, or too vague to assess, DO NOT guess or hallucinate any surgery!
Instead, return:
{
  "predictedSurgery": "Insufficient Clinical Information / In-Person Evaluation Needed",
  "priority": "Inconclusive / More Details Required",
  "summary": "The symptoms and details provided are insufficient to determine a surgical procedure. Please provide specific symptoms such as location, duration, and nature of pain.",
  "specialty": "General Medicine / Outpatient Consultation"
}

Format your output strictly in valid JSON matching this schema:
{
  "predictedSurgery": "Procedure Name (e.g. Total Knee Arthroplasty (TKR))",
  "priority": "Moderate Priority / Schedule Within 1-2 Weeks",
  "summary": "Clinical rationale summary...",
  "specialty": "Orthopedics & Joint Reconstruction"
}`;

/**
 * Clinical relevance validation for illness description & symptoms
 */
export interface ClinicalValidationResult {
  isValid: boolean;
  reason?: string;
}

const PLACEHOLDER_TERMS = new Set([
  'na', 'n/a', 'n.a.', 'n a', 'none', 'nil', 'null', 'nothing', 'no',
  'not applicable', 'no symptoms', 'dont know', 'don\'t know', 'dontknow',
  'idk', 'kuch nahi', 'kuch nhi', 'nhi', 'nahi', 'nothing special',
  'asdf', 'asdfgh', 'asdfghjkl', 'test', 'testing', 'tester', 'test123',
  'xyz', 'abc', 'qwerty', 'qwertyuiop', 'hello', 'hi', 'hey', 'bye', 'ok', 'okay',
  'good', 'fine', 'random', 'check', 'something', 'anything',
  'i am not well', 'not well', 'i am sick', 'sick', 'feeling sick', 'help me'
]);

const KEYBOARD_PATTERNS = [
  'qwerty', 'wertyu', 'ertyui', 'rtyuio', 'tyuiop', 'qwertyuiop',
  'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl', 'asdfghjkl',
  'zxcvbn', 'xcvbnm', 'zxcvbnm',
  'qazwsx', 'edcrfv', 'tgbyhn', 'ujmikol'
];

const BODY_PARTS = [
  'knee', 'hip', 'joint', 'joints', 'spine', 'back', 'neck', 'shoulder', 'chest',
  'heart', 'stomach', 'abdomen', 'abdominal', 'belly', 'pelvis', 'pelvic',
  'liver', 'kidney', 'kidneys', 'renal', 'bladder', 'gallbladder', 'colon', 'bowel',
  'rectum', 'rectal', 'anus', 'anal', 'throat', 'head', 'brain', 'eye', 'eyes',
  'ear', 'ears', 'nose', 'mouth', 'leg', 'legs', 'foot', 'feet', 'arm', 'arms',
  'hand', 'hands', 'bone', 'bones', 'rib', 'ribs', 'muscle', 'muscles', 'nerve',
  'nerves', 'artery', 'vein', 'valve', 'lung', 'lungs', 'groin', 'uterus',
  'uterine', 'ovary', 'ovarian', 'prostate', 'thyroid', 'tonsil', 'tonsils',
  'appendix', 'disc', 'ligament', 'ligaments', 'tendon', 'tendons', 'skin'
];

const CLINICAL_SIGNS = [
  'pain', 'pains', 'painful', 'ache', 'aching', 'sharp', 'dull', 'throbbing', 'burning',
  'swelling', 'swollen', 'inflamed', 'inflammation', 'stiff', 'stiffness',
  'fever', 'chills', 'bleed', 'bleeding', 'blood', 'fracture', 'fractured', 'broken',
  'tear', 'torn', 'lump', 'mass', 'tumor', 'tumour', 'growth', 'cyst', 'stone',
  'stones', 'calculus', 'nausea', 'vomit', 'vomiting', 'dizziness', 'dizzy', 'vertigo',
  'breath', 'breathing', 'breathless', 'shortness', 'cough', 'coughing',
  'phlegm', 'fatigue', 'weakness', 'weak', 'numb', 'numbness', 'tingling',
  'cramp', 'cramps', 'spasm', 'spasms', 'diarrhea', 'constipation', 'reflux',
  'heartburn', 'jaundice', 'yellow', 'itching', 'rash', 'ulcer', 'wound',
  'discharge', 'hernia', 'piles', 'fistula', 'fissure', 'mobility',
  'walking', 'bending', 'sitting', 'crepitus', 'blockage', 'obstruction',
  'pressure', 'palpitation', 'palpitations', 'seizure', 'blurred'
];

const MEDICAL_ACTIONS_CONDITIONS = [
  'doctor', 'dr', 'hospital', 'clinic', 'scan', 'mri', 'ct', 'xray', 'x-ray',
  'ultrasound', 'biopsy', 'ecg', 'diagnosed', 'diagnosis', 'surgery',
  'operation', 'replacement', 'bypass', 'endoscopy', 'laparoscopy',
  'transplant', 'infection', 'cancer', 'carcinoma', 'fibroid', 'fibroids',
  'stenosis', 'arthritis', 'osteoarthritis', 'angina', 'infarction', 'aneurysm'
];

export function validateClinicalInput(
  illnessText: string | undefined | null,
  symptoms: string[] = []
): ClinicalValidationResult {
  if (!illnessText || typeof illnessText !== 'string') {
    return {
      isValid: false,
      reason: 'Please describe your illness or primary symptoms in detail (minimum 15 characters).'
    };
  }

  const trimmed = illnessText.trim();
  const lower = trimmed.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check minimum character length
  if (trimmed.length < 15) {
    return {
      isValid: false,
      reason: `Description is too short (${trimmed.length}/15 characters). Please describe your specific pain, location, or symptoms in detail.`
    };
  }

  // 2. Check pure placeholder / generic non-symptom terms
  if (PLACEHOLDER_TERMS.has(lower) || PLACEHOLDER_TERMS.has(normalized)) {
    return {
      isValid: false,
      reason: `"${trimmed}" is too generic or a placeholder. Please describe what actual symptoms or pain you are experiencing.`
    };
  }

  // 3. Strict Keyboard Mashing Detection (e.g. 'qwertyuiop', 'asdfghjkl')
  for (const pattern of KEYBOARD_PATTERNS) {
    if (lower.includes(pattern)) {
      return {
        isValid: false,
        reason: `Keyboard pattern / gibberish ("${pattern}") detected. Please enter meaningful medical symptoms.`
      };
    }
  }

  // 4. Check for repeated character sequences (e.g. 'aaaaaaa', 'zzzzzz', '1111111')
  const repetitiveRegex = /(.)\1{4,}/;
  if (repetitiveRegex.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Description contains repetitive characters. Please enter genuine medical details.'
    };
  }

  // 5. Check for unreadable consonant clusters (words with 5+ consonants in a row, e.g. 'qwrtp', 'sdfgh')
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const consonantClusterRegex = /[bcdfghjklmnpqrstvwxyz]{5,}/i;
  for (const word of words) {
    if (consonantClusterRegex.test(word)) {
      return {
        isValid: false,
        reason: `Unrecognized gibberish word ("${word}") detected. Please enter real clinical symptoms in plain language.`
      };
    }
  }

  // 6. Strict Clinical Relevancy Check:
  // Must contain either:
  // a) At least one anatomical body part (e.g. knee, back, chest, stomach) OR
  // b) At least one recognized clinical symptom (e.g. pain, swelling, fever, bleeding) OR
  // c) At least one medical condition/diagnostic term (e.g. surgery, arthritis, mri, doctor) OR
  // d) User has explicitly selected at least one symptom from the symptom chips.
  const hasBodyPart = BODY_PARTS.some(bp => normalized.includes(bp));
  const hasClinicalSign = CLINICAL_SIGNS.some(cs => normalized.includes(cs));
  const hasMedicalTerm = MEDICAL_ACTIONS_CONDITIONS.some(mt => normalized.includes(mt));
  const hasSelectedChips = symptoms.length > 0;

  if (!hasBodyPart && !hasClinicalSign && !hasMedicalTerm && !hasSelectedChips) {
    return {
      isValid: false,
      reason: 'No clinical symptoms or body location detected. Please specify where the pain or issue is (e.g. knee, chest, back, stomach) or what symptoms you feel (e.g. pain, fever, swelling).'
    };
  }

  // 7. Word count check: if user hasn't selected chips, must have at least 3 meaningful words
  const meaningfulWords = words.filter(w => w.length > 1);
  if (meaningfulWords.length < 3 && !hasSelectedChips) {
    return {
      isValid: false,
      reason: 'Please provide at least 3 descriptive words explaining your condition, or select symptoms from the list below.'
    };
  }

  return { isValid: true };
}



