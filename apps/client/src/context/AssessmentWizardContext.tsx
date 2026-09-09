import React, { createContext, useContext, useState } from 'react';
import { AssessmentResponse, CreateAssessmentPayload } from '@medimatch/shared';
import { assessmentsApi } from '../api/assessments';

interface ProfileState {
  fullName: string;
  phone: string;
  age: number | string;
  gender: string;
  city: string;
  email: string;
  budgetCap: number;
}

interface IllnessState {
  illnessText: string;
  conditionKey: string;
  conditionDetail: string;
  durationBucket: string;
  severity: number;
  symptoms: string[];
  symptomNotes: string;
  preExisting: string[];
  medicalHistoryText: string;
}

interface AssessmentWizardContextType {
  currentStep: 1 | 2 | 3;
  profile: ProfileState;
  illness: IllnessState;
  isSubmitting: boolean;
  submissionError: string | null;
  assessmentResponse: AssessmentResponse | null;
  setCurrentStep: (step: 1 | 2 | 3) => void;
  updateProfile: (data: Partial<ProfileState>) => void;
  updateIllness: (data: Partial<IllnessState>) => void;
  toggleSymptom: (symptom: string) => void;
  togglePreExisting: (condition: string) => void;
  submitAssessment: () => Promise<boolean>;
  resetWizard: () => void;
}

const defaultProfile: ProfileState = {
  fullName: '',
  phone: '',
  age: 48,
  gender: 'Male',
  city: 'Mumbai',
  email: '',
  budgetCap: 250000
};

const defaultIllness: IllnessState = {
  illnessText: '',
  conditionKey: '',
  conditionDetail: '',
  durationBucket: '1-4 weeks',
  severity: 7,
  symptoms: [],
  symptomNotes: '',
  preExisting: [],
  medicalHistoryText: ''
};

const AssessmentWizardContext = createContext<AssessmentWizardContextType | undefined>(undefined);

export const AssessmentWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [illness, setIllness] = useState<IllnessState>(defaultIllness);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [assessmentResponse, setAssessmentResponse] = useState<AssessmentResponse | null>(null);

  const updateProfile = (data: Partial<ProfileState>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const updateIllness = (data: Partial<IllnessState>) => {
    setIllness(prev => ({ ...prev, ...data }));
  };

  const toggleSymptom = (symptom: string) => {
    setIllness(prev => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
      };
    });
  };

  const togglePreExisting = (condition: string) => {
    setIllness(prev => {
      if (condition === 'No Known Pre-existing Conditions') {
        return {
          ...prev,
          preExisting: prev.preExisting.includes(condition) ? [] : [condition]
        };
      }
      const filtered = prev.preExisting.filter(c => c !== 'No Known Pre-existing Conditions');
      const exists = filtered.includes(condition);
      return {
        ...prev,
        preExisting: exists ? filtered.filter(c => c !== condition) : [...filtered, condition]
      };
    });
  };

  const submitAssessment = async (): Promise<boolean> => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload: CreateAssessmentPayload = {
        fullName: profile.fullName || 'Patient',
        phone: profile.phone || '+91 9800000000',
        age: Number(profile.age) || 45,
        gender: profile.gender,
        city: profile.city,
        email: profile.email || undefined,
        budgetCap: profile.budgetCap,
        illnessText: illness.illnessText.trim(),
        conditionKey: illness.conditionKey || undefined,
        conditionDetail: illness.conditionDetail || undefined,
        durationBucket: illness.durationBucket,
        severity: illness.severity,
        symptoms: illness.symptoms,
        preExisting: illness.preExisting,
        medicalHistoryText: [illness.symptomNotes, illness.medicalHistoryText].filter(Boolean).join('\n') || undefined
      };

      const result = await assessmentsApi.create(payload);
      setAssessmentResponse(result);
      setCurrentStep(3);
      return true;
    } catch (err: any) {
      console.error('Failed to submit assessment:', err);
      setSubmissionError(err.response?.data?.error || err.message || 'Failed to generate medical assessment');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setProfile(defaultProfile);
    setIllness(defaultIllness);
    setAssessmentResponse(null);
    setCurrentStep(1);
    setSubmissionError(null);
  };

  return (
    <AssessmentWizardContext.Provider
      value={{
        currentStep,
        profile,
        illness,
        isSubmitting,
        submissionError,
        assessmentResponse,
        setCurrentStep,
        updateProfile,
        updateIllness,
        toggleSymptom,
        togglePreExisting,
        submitAssessment,
        resetWizard
      }}
    >
      {children}
    </AssessmentWizardContext.Provider>
  );
};

export function useAssessmentWizard() {
  const context = useContext(AssessmentWizardContext);
  if (!context) throw new Error('useAssessmentWizard must be used within an AssessmentWizardProvider');
  return context;
}

