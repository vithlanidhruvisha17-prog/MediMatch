import { 
  Hospital, 
  Doctor, 
  Patient, 
  Assessment, 
  Inquiry, 
  AIProviderConfig, 
  DEFAULT_AI_SYSTEM_PROMPT 
} from '@medimatch/shared';
import { prisma } from '../lib/prisma';
import { 
  RAW_100_HOSPITALS, 
  RAW_DOCTORS, 
  INITIAL_DEMO_PATIENTS, 
  INITIAL_DEMO_ASSESSMENTS, 
  INITIAL_DEMO_INQUIRIES 
} from '../data/seedData';
import { encrypt, decrypt, maskApiKey } from '../lib/encryption';
import { Prisma } from '@prisma/client';

const db = prisma!;

function formatPatient(patient: any): Patient {
  return {
    id: patient.id,
    fullName: patient.fullName,
    phone: patient.phone,
    age: patient.age ?? null,
    gender: patient.gender ?? null,
    city: patient.city,
    email: patient.email ?? '',
    budgetCap: patient.budgetCap,
    role: patient.role || 'PATIENT',
    createdAt: patient.createdAt instanceof Date ? patient.createdAt.toISOString() : String(patient.createdAt)
  };
}

function formatAssessment(assessment: any): Assessment {
  return {
    id: assessment.id,
    patientId: assessment.patientId,
    patient: assessment.patient ? formatPatient(assessment.patient) : undefined,
    illnessText: assessment.illnessText,
    conditionKey: assessment.conditionKey ?? null,
    conditionDetail: assessment.conditionDetail ?? null,
    durationBucket: assessment.durationBucket,
    severity: assessment.severity,
    symptoms: assessment.symptoms,
    preExisting: assessment.preExisting,
    medicalHistoryText: assessment.medicalHistoryText ?? null,
    aiPredictedSurgery: assessment.aiPredictedSurgery ?? null,
    aiPriority: assessment.aiPriority ?? null,
    aiSummary: assessment.aiSummary ?? null,
    status: assessment.status,
    createdAt: assessment.createdAt instanceof Date ? assessment.createdAt.toISOString() : String(assessment.createdAt)
  };
}

function formatInquiry(inquiry: any): Inquiry {
  return {
    id: inquiry.id,
    patientId: inquiry.patientId,
    patient: inquiry.patient ? formatPatient(inquiry.patient) : undefined,
    hospitalId: inquiry.hospitalId ?? null,
    hospitalName: inquiry.hospitalName ?? null,
    doctorId: inquiry.doctorId ?? null,
    doctorName: inquiry.doctorName ?? null,
    procedure: inquiry.procedure,
    status: inquiry.status,
    notes: inquiry.notes ?? null,
    notifyVia: inquiry.notifyVia ?? ['EMAIL'],
    createdAt: inquiry.createdAt instanceof Date ? inquiry.createdAt.toISOString() : String(inquiry.createdAt)
  };
}

async function getOrCreateAIConfigRow() {
  let row = await db.aIProviderConfig.findFirst();
  if (!row) {
    row = await db.aIProviderConfig.create({
      data: {
        provider: 'gemini',
        modelName: 'gemini-1.5-flash',
        systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
        apiKeyEnc: encrypt(process.env.GEMINI_API_KEY || '')
      }
    });
  }
  return row;
}

export const storageService = {
  // Stats
  async getStats() {
    const [
      totalPatients,
      totalHospitals,
      totalDoctors,
      totalInquiries,
      totalAssessments
    ] = await Promise.all([
      db.patient.count(),
      db.hospital.count(),
      db.doctor.count(),
      db.inquiry.count(),
      db.assessment.count()
    ]);

    return {
      totalPatients,
      totalHospitals,
      totalDoctors,
      totalInquiries,
      totalAssessments
    };
  },

  // Hospitals
  async getHospitals(filters?: { city?: string; search?: string; accreditation?: string }): Promise<Hospital[]> {
    const where: Prisma.HospitalWhereInput = {};

    if (filters?.city && filters.city !== 'All Cities') {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    if (filters?.accreditation && filters.accreditation !== 'All Accreditations') {
      where.accreditation = { contains: filters.accreditation, mode: 'insensitive' };
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } }
      ];
    }

    return (await db.hospital.findMany({
      where,
      orderBy: { name: 'asc' }
    })) as Hospital[];
  },

  async getHospitalById(id: string): Promise<Hospital | null> {
    const hospital = await db.hospital.findUnique({
      where: { id }
    });
    return hospital as Hospital | null;
  },

  async createHospital(data: Omit<Hospital, 'id'>): Promise<Hospital> {
    const hospital = await db.hospital.create({
      data: {
        name: data.name,
        city: data.city,
        accreditation: data.accreditation,
        address: data.address,
        beds: data.beds,
        icuBeds: data.icuBeds,
        imageUrl: data.imageUrl ?? null,
        contactEmail: data.contactEmail ?? null
      }
    });
    return hospital as Hospital;
  },

  async updateHospital(id: string, data: Partial<Hospital>): Promise<Hospital | null> {
    try {
      const updateData: Prisma.HospitalUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.accreditation !== undefined) updateData.accreditation = data.accreditation;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.beds !== undefined) updateData.beds = data.beds;
      if (data.icuBeds !== undefined) updateData.icuBeds = data.icuBeds;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;

      const updated = await db.hospital.update({
        where: { id },
        data: updateData
      });
      return updated as Hospital;
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      if (err?.code === 'P2025') {
        return null;
      }
      throw err;
    }
  },

  async deleteHospital(id: string): Promise<boolean> {
    try {
      await db.hospital.delete({
        where: { id }
      });
      return true;
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return false;
      }
      if (err?.code === 'P2025') {
        return false;
      }
      throw err;
    }
  },

  // Doctors
  async getDoctors(filters?: { specialty?: string; search?: string }): Promise<Doctor[]> {
    const where: Prisma.DoctorWhereInput = {};

    if (filters?.specialty && filters.specialty !== 'All Specialties') {
      where.specialty = { contains: filters.specialty, mode: 'insensitive' };
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { specialty: { contains: q, mode: 'insensitive' } },
        { credentials: { contains: q, mode: 'insensitive' } }
      ];
    }

    return (await db.doctor.findMany({
      where,
      orderBy: { yearsExp: 'desc' }
    })) as Doctor[];
  },

  async getDoctorById(id: string): Promise<Doctor | null> {
    const doctor = await db.doctor.findUnique({
      where: { id }
    });
    return doctor as Doctor | null;
  },

  async createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
    const doctor = await db.doctor.create({
      data: {
        name: data.name,
        specialty: data.specialty,
        credentials: data.credentials,
        yearsExp: data.yearsExp,
        fee: data.fee,
        photoUrl: data.photoUrl ?? null,
        contactEmail: data.contactEmail ?? null
      }
    });
    return doctor as Doctor;
  },

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor | null> {
    try {
      const updateData: Prisma.DoctorUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.specialty !== undefined) updateData.specialty = data.specialty;
      if (data.credentials !== undefined) updateData.credentials = data.credentials;
      if (data.yearsExp !== undefined) updateData.yearsExp = data.yearsExp;
      if (data.fee !== undefined) updateData.fee = data.fee;
      if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
      if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;

      const updated = await db.doctor.update({
        where: { id },
        data: updateData
      });
      return updated as Doctor;
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      if (err?.code === 'P2025') {
        return null;
      }
      throw err;
    }
  },

  async deleteDoctor(id: string): Promise<boolean> {
    try {
      await db.doctor.delete({
        where: { id }
      });
      return true;
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return false;
      }
      if (err?.code === 'P2025') {
        return false;
      }
      throw err;
    }
  },

  // Patients
  async createPatient(data: Omit<Patient, 'id' | 'createdAt'> & { passwordHash?: string; role?: string }): Promise<Patient> {
    const patient = await db.patient.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        age: data.age ?? null,
        gender: data.gender ?? null,
        city: data.city,
        email: data.email,
        passwordHash: data.passwordHash || '',
        role: data.role || 'PATIENT',
        budgetCap: data.budgetCap
      }
    });
    return formatPatient(patient);
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.age !== undefined) updateData.age = data.age;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.budgetCap !== undefined) updateData.budgetCap = data.budgetCap;
      if (data.role !== undefined) updateData.role = data.role;

      const updated = await db.patient.update({
        where: { id },
        data: updateData
      });
      return formatPatient(updated);
    } catch (err: any) {
      if (err?.code === 'P2025') return null;
      throw err;
    }
  },

  async findPatientByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return await db.patient.findFirst({
      where: {
        email: { equals: normalized, mode: 'insensitive' }
      }
    });
  },

  async getPatients(): Promise<Patient[]> {
    const patients = await db.patient.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return patients.map(formatPatient);
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const patient = await db.patient.findUnique({
      where: { id }
    });
    return patient ? formatPatient(patient) : null;
  },

  async getPatientAssessments(patientId: string): Promise<Assessment[]> {
    const assessments = await db.assessment.findMany({
      where: { patientId },
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return assessments.map(formatAssessment);
  },

  async getPatientInquiries(patientId: string): Promise<Inquiry[]> {
    const inquiries = await db.inquiry.findMany({
      where: { patientId },
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return inquiries.map(formatInquiry);
  },

  // Assessments
  async createAssessment(data: Omit<Assessment, 'id' | 'createdAt'>): Promise<Assessment> {
    const assessment = await db.assessment.create({
      data: {
        patientId: data.patientId,
        illnessText: data.illnessText,
        conditionKey: data.conditionKey ?? null,
        conditionDetail: data.conditionDetail ?? null,
        durationBucket: data.durationBucket,
        severity: data.severity,
        symptoms: data.symptoms || [],
        preExisting: data.preExisting || [],
        medicalHistoryText: data.medicalHistoryText ?? null,
        aiPredictedSurgery: data.aiPredictedSurgery ?? null,
        aiPriority: data.aiPriority ?? null,
        aiSummary: data.aiSummary ?? null,
        status: data.status || 'Assessed & Predicted'
      },
      include: {
        patient: true
      }
    });
    return formatAssessment(assessment);
  },

  async getAssessments(): Promise<Assessment[]> {
    const assessments = await db.assessment.findMany({
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return assessments.map(formatAssessment);
  },

  async getAssessmentById(id: string): Promise<Assessment | null> {
    const assessment = await db.assessment.findUnique({
      where: { id },
      include: {
        patient: true
      }
    });
    return assessment ? formatAssessment(assessment) : null;
  },

  // Inquiries
  async createInquiry(data: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const inquiry = await db.inquiry.create({
      data: {
        patientId: data.patientId,
        hospitalId: data.hospitalId ?? null,
        hospitalName: data.hospitalName ?? null,
        doctorId: data.doctorId ?? null,
        doctorName: data.doctorName ?? null,
        procedure: data.procedure,
        notes: data.notes ?? null,
        status: data.status || 'New',
        notifyVia: data.notifyVia ?? undefined,
      },
      include: {
        patient: true
      }
    });
    return formatInquiry(inquiry);
  },

  async getInquiries(): Promise<Inquiry[]> {
    const inquiries = await db.inquiry.findMany({
      include: {
        patient: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return inquiries.map(formatInquiry);
  },

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry | null> {
    try {
      const inquiry = await db.inquiry.update({
        where: { id },
        data: { status },
        include: {
          patient: true
        }
      });
      return formatInquiry(inquiry);
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      if (err?.code === 'P2025') {
        return null;
      }
      throw err;
    }
  },

  // AI Provider Config
  async getAIConfig(): Promise<AIProviderConfig> {
    const row = await getOrCreateAIConfigRow();
    let decryptedKey = decrypt(row.apiKeyEnc);
    if (!decryptedKey || decryptedKey.trim().length === 0) {
      decryptedKey = (process.env.GEMINI_API_KEY || '').trim();
    }
    return {
      id: row.id,
      provider: row.provider,
      modelName: row.modelName,
      systemPrompt: row.systemPrompt,
      apiKeyEnc: row.apiKeyEnc,
      maskedApiKey: maskApiKey(decryptedKey),
      updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt)
    };
  },

  async getRawDecryptedKey(): Promise<string> {
    const row = await getOrCreateAIConfigRow();
    const decrypted = decrypt(row.apiKeyEnc);
    if (decrypted && decrypted.trim().length > 5) {
      return decrypted.trim();
    }
    return (process.env.GEMINI_API_KEY || '').trim();
  },

  async updateAIConfig(data: { provider?: string; apiKey?: string; modelName?: string; systemPrompt?: string }): Promise<AIProviderConfig> {
    const row = await getOrCreateAIConfigRow();
    const updateData: Prisma.AIProviderConfigUpdateInput = {};
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.modelName !== undefined) updateData.modelName = data.modelName;
    if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt;
    if (data.apiKey !== undefined && data.apiKey.trim() !== '') {
      updateData.apiKeyEnc = encrypt(data.apiKey.trim());
    }

    const updated = await db.aIProviderConfig.update({
      where: { id: row.id },
      data: updateData
    });

    const decryptedKey = decrypt(updated.apiKeyEnc);
    return {
      id: updated.id,
      provider: updated.provider,
      modelName: updated.modelName,
      systemPrompt: updated.systemPrompt,
      apiKeyEnc: updated.apiKeyEnc,
      maskedApiKey: maskApiKey(decryptedKey),
      updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : String(updated.updatedAt)
    };
  },

  // Admin Auth
  async findAdminByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return await db.adminUser.findFirst({
      where: {
        email: { equals: normalized, mode: 'insensitive' }
      }
    });
  },

  // Reset / Bulk Seed
  async resetAndSeed() {
    const hospitalData = RAW_100_HOSPITALS.map((h, i) => ({
      id: `hosp_${i + 1}`,
      name: h.name,
      city: h.city,
      accreditation: h.accreditation,
      address: h.address,
      beds: h.beds,
      icuBeds: h.icuBeds,
      imageUrl: h.imageUrl
    }));

    const doctorData = RAW_DOCTORS.map((d, i) => ({
      id: `doc_${i + 1}`,
      name: d.name,
      specialty: d.specialty,
      credentials: d.credentials,
      yearsExp: d.yearsExp,
      fee: d.fee,
      photoUrl: d.photoUrl
    }));

    const patientData = INITIAL_DEMO_PATIENTS.map(p => ({
      id: p.id,
      fullName: p.fullName,
      phone: p.phone,
      age: p.age ?? null,
      gender: p.gender ?? null,
      city: p.city,
      email: p.email,
      passwordHash: (p as any).passwordHash || '',
      role: (p as any).role || 'PATIENT',
      budgetCap: p.budgetCap,
      createdAt: new Date(p.createdAt)
    }));

    const assessmentData = INITIAL_DEMO_ASSESSMENTS.map(a => ({
      id: a.id,
      patientId: a.patientId,
      illnessText: a.illnessText,
      conditionKey: a.conditionKey ?? null,
      conditionDetail: a.conditionDetail ?? null,
      durationBucket: a.durationBucket,
      severity: a.severity,
      symptoms: a.symptoms,
      preExisting: a.preExisting,
      medicalHistoryText: a.medicalHistoryText ?? null,
      aiPredictedSurgery: a.aiPredictedSurgery ?? null,
      aiPriority: a.aiPriority ?? null,
      aiSummary: a.aiSummary ?? null,
      status: a.status,
      createdAt: new Date(a.createdAt)
    }));

    const inquiryData = INITIAL_DEMO_INQUIRIES.map(inq => ({
      id: inq.id,
      patientId: inq.patientId,
      hospitalId: inq.hospitalId ?? null,
      hospitalName: inq.hospitalName ?? null,
      procedure: inq.procedure,
      notes: inq.notes ?? null,
      status: inq.status,
      createdAt: new Date(inq.createdAt)
    }));

    await db.$transaction(async (tx: any) => {
      // Delete child rows first respecting foreign key constraints
      await tx.inquiry.deleteMany();
      await tx.assessment.deleteMany();
      await tx.patient.deleteMany();
      await tx.doctor.deleteMany();
      await tx.hospital.deleteMany();

      // Seed catalog and demo rows
      await tx.hospital.createMany({ data: hospitalData });
      await tx.doctor.createMany({ data: doctorData });
      await tx.patient.createMany({ data: patientData });
      await tx.assessment.createMany({ data: assessmentData });
      await tx.inquiry.createMany({ data: inquiryData });
    }, {
      timeout: 30000
    });

    return {
      hospitalsCount: hospitalData.length,
      doctorsCount: doctorData.length,
      patientsCount: patientData.length,
      assessmentsCount: assessmentData.length,
      inquiriesCount: inquiryData.length
    };
  }
};
