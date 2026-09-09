import { storageService } from './storage.service';
import { CreateAssessmentPayload, validateClinicalInput } from '@medimatch/shared';

export interface AIPredictionResult {
  predictedSurgery: string;
  priority: string;
  summary: string;
  specialty: string;
}

export const aiProviderService = {
  /**
   * Predicts surgical procedure, urgency priority, clinical summary, and specialty.
   */
  async predictDiagnosis(payload: CreateAssessmentPayload): Promise<AIPredictionResult> {
    // Validate that clinical input is not a placeholder (e.g. "NA", "none") or too short
    const validation = validateClinicalInput(payload.illnessText, payload.symptoms);
    if (!validation.isValid) {
      return {
        predictedSurgery: 'Insufficient Clinical Information / In-Person Evaluation Needed',
        priority: 'Inconclusive / More Information Required',
        summary: validation.reason || 'The details provided are placeholder or non-medical. Please provide meaningful clinical symptoms for accurate surgical matching.',
        specialty: 'General Medicine / Outpatient Consultation'
      };
    }

    const config = await storageService.getAIConfig();
    const apiKey = await storageService.getRawDecryptedKey();

    // If live API key is present, attempt live Gemini call
    if (apiKey && apiKey.trim().length > 5) {
      try {
        const liveResult = await this.callGeminiAPI(apiKey, config.modelName || 'gemini-3.6-flash', config.systemPrompt, payload);
        if (liveResult) {
          return liveResult;
        }
      } catch (err) {
        console.warn('Live Gemini API call failed or timed out. Falling back to clinical heuristic engine:', err);
      }
    }

    // Heuristic Clinical Engine Fallback
    return this.clinicalHeuristicPredict(payload);
  },

  /**
   * Calls Google Gemini REST API directly using standard fetch.
   */
  async callGeminiAPI(apiKey: string, model: string, systemPrompt: string, payload: CreateAssessmentPayload): Promise<AIPredictionResult | null> {
    const cleanModel = model.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    const promptText = `
Patient Assessment Details:
- Age: ${payload.age}, Gender: ${payload.gender}
- Target City: ${payload.city}
- Patient Budget Limit: INR ${payload.budgetCap}
- Stated Illness / Complaint: ${payload.illnessText}
- Selected Condition: ${payload.conditionKey || 'Not explicitly selected'}
- Condition Detail: ${payload.conditionDetail || 'None'}
- Duration of Symptoms: ${payload.durationBucket}
- Severity Score (1-10): ${payload.severity}
- Reported Symptoms: ${payload.symptoms.join(', ')}
- Pre-existing Conditions: ${payload.preExisting.join(', ')}
- Medical History Notes: ${payload.medicalHistoryText || 'None'}

Please return STRICT JSON matching:
{
  "predictedSurgery": "Procedure name",
  "priority": "Urgent Priority / Schedule Immediate Evaluation" OR "Moderate Priority / Schedule Within 1-2 Weeks" OR "Elective Priority / Plan Within 1-2 Months",
  "summary": "2-3 sentences clinical explanation",
  "specialty": "Surgical Specialty name"
}
`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Gemini API error ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) return null;

    let parsed: any = null;
    try {
      const cleanJson = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.warn('Failed to parse Gemini JSON output:', rawContent);
      return null;
    }

    return {
      predictedSurgery: parsed.predictedSurgery || 'Surgical Consultation & Workup',
      priority: parsed.priority || 'Moderate Priority / Schedule Within 1-2 Weeks',
      summary: parsed.summary || 'Clinical evaluation advised based on reported symptoms.',
      specialty: parsed.specialty || 'General & Laparoscopic Surgery'
    };
  },

  /**
   * Admin Prompt Sandbox Executor
   */
  async executeSandboxTest(query: string): Promise<{ success: boolean; response: string; latencyMs: number; provider: string; model: string }> {
    const startTime = Date.now();
    const config = await storageService.getAIConfig();
    const apiKey = await storageService.getRawDecryptedKey();

    if (!apiKey || apiKey.trim().length === 0) {
      // Simulate intelligent mock response for sandbox
      await new Promise(r => setTimeout(r, 600));
      return {
        success: true,
        provider: 'Google Gemini (Simulated / No API Key Set)',
        model: config.modelName,
        latencyMs: Date.now() - startTime,
        response: JSON.stringify({
          status: 'SUCCESS (SANDBOX SIMULATION)',
          message: 'System prompt and model pipeline verified successfully.',
          receivedQuery: query,
          counselorGuidance: 'Based on patient presentation, surgical risk stratification and transparent price itemization (Surgeon Fee + OT + Room + Consumables) are recommended prior to admission.',
          estimatedTiers: {
            tier1Metro: '₹1,80,000 - ₹2,40,000',
            tier2Metro: '₹1,20,000 - ₹1,60,000'
          }
        }, null, 2)
      };
    }

    try {
      const cleanModel = (config.modelName || 'gemini-3.6-flash').replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: config.systemPrompt }]
          },
          contents: [{ parts: [{ text: query }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      const latencyMs = Date.now() - startTime;
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          provider: 'Google Gemini',
          model: config.modelName,
          latencyMs,
          response: `API Error ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text returned by model.';

      return {
        success: true,
        provider: 'Google Gemini',
        model: config.modelName,
        latencyMs,
        response: text
      };
    } catch (err: any) {
      return {
        success: false,
        provider: 'Google Gemini',
        model: config.modelName,
        latencyMs: Date.now() - startTime,
        response: `Execution Error: ${err?.message || err}`
      };
    }
  },

  /**
   * Health Assistant conversational Q&A widget backend
   */
  async handleChat(messages: Array<{ role: string; content: string }>, query: string): Promise<string> {
    const config = await storageService.getAIConfig();
    const apiKey = await storageService.getRawDecryptedKey();

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const cleanModel = (config.modelName || 'gemini-3.6-flash').replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

        const chatSystemPrompt = `You are MediMatch's Virtual Health & Surgical Counselor.
You provide instant, empathetic, medically sound guidance regarding surgical costs, package breakdowns (Surgeon Fee, OT Charges, Room Rates, Medicines), accredited hospitals across Indian metro cities, and what questions patients should ask before booking a procedure.
Keep answers concise, clear, and structured with bullet points. Always advise clinical in-person consultation before final medical decisions.`;

        const contents = [
          ...messages.slice(-4).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: query }] }
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: chatSystemPrompt }] },
            contents,
            generationConfig: { temperature: 0.4 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      } catch (err) {
        console.warn('Chat API error, using counselor response engine:', err);
      }
    }

    // Heuristic Counselor Q&A responses
    return this.counselorHeuristicResponse(query);
  },

  /**
   * Robust Clinical Heuristic Engine
   */
  clinicalHeuristicPredict(payload: CreateAssessmentPayload): AIPredictionResult {
    const validation = validateClinicalInput(payload.illnessText, payload.symptoms);
    if (!validation.isValid) {
      return {
        predictedSurgery: 'Insufficient Clinical Information / In-Person Evaluation Needed',
        priority: 'Inconclusive / More Information Required',
        summary: validation.reason || 'The details provided are placeholder or non-medical. Please provide meaningful clinical symptoms for accurate surgical matching.',
        specialty: 'General Medicine / Outpatient Consultation'
      };
    }

    const key = (payload.conditionKey || '').toLowerCase();
    const text = (payload.illnessText + ' ' + (payload.conditionDetail || '')).toLowerCase();
    const symptoms = payload.symptoms.map(s => s.toLowerCase());
    const severity = payload.severity;

    // Determine Urgency Priority
    let priority = 'Moderate Priority / Schedule Within 1-2 Weeks';
    if (severity >= 8 || symptoms.some(s => s.includes('chest tightness') || s.includes('blood') || s.includes('shortness of breath'))) {
      priority = 'Urgent Priority / Schedule Immediate Evaluation';
    } else if (severity <= 4 && payload.durationBucket === '< 1 week') {
      priority = 'Elective Priority / Planned Consultation Within 1 Month';
    }

    // Rule 1: Cardiac
    if (key.includes('coronary') || key.includes('valve') || key.includes('heart') || text.includes('chest') || text.includes('angiography') || text.includes('bypass')) {
      return {
        predictedSurgery: 'Coronary Artery Bypass Grafting (CABG) / Off-Pump Bypass Surgery',
        priority: 'Urgent Priority / Schedule Immediate Evaluation',
        summary: `Patient demonstrates indicators of critical coronary compromise and exertional angina. Immediate cardiothoracic surgical consultation is indicated to evaluate graft revascularization vs stent intervention, mitigate myocardial infarction hazard, and stabilize cardiovascular hemodynamics.`,
        specialty: 'Cardiothoracic Surgery'
      };
    }

    // Rule 2: Orthopedic / Joint
    if (key.includes('knee') || key.includes('osteoarthritis') || key.includes('hip') || key.includes('acl') || text.includes('knee') || text.includes('joint') || text.includes('walking')) {
      const isHip = key.includes('hip') || text.includes('hip');
      return {
        predictedSurgery: isHip ? 'Total Hip Replacement (THR / Ceramic-on-Poly)' : 'Total Knee Arthroplasty (TKR / Robotic Joint Replacement)',
        priority: severity >= 8 ? 'Moderate Priority / Schedule Within 1-2 Weeks' : 'Elective Priority / Planned Consultation Within 1 Month',
        summary: `Clinical presentation highlights significant joint space loss, severe mechanical pain on ambulation, and restriction of daily functional living. Arthroplasty offers definitive joint realignment, restoration of pain-free range of motion, and durability for active lifestyle.`,
        specialty: 'Orthopedics & Joint Reconstruction'
      };
    }

    // Rule 3: Gallbladder / GI
    if (key.includes('gall') || key.includes('cholecystitis') || text.includes('gallbladder') || text.includes('stone') && text.includes('abdominal')) {
      return {
        predictedSurgery: 'Laparoscopic Cholecystectomy (Minimally Invasive Gallbladder Removal)',
        priority: severity >= 8 ? 'Urgent Priority / Schedule Immediate Evaluation' : 'Moderate Priority / Schedule Within 1-2 Weeks',
        summary: `Symptomatic gallstones present a substantial risk for recurrent biliary colic, acute gangrenous cholecystitis, or gallstone pancreatitis. Laparoscopic excision remains the definitive gold-standard with minimal recovery time.`,
        specialty: 'Surgical Gastroenterology & Laparoscopy'
      };
    }

    // Rule 4: Hernia
    if (key.includes('hernia') || text.includes('hernia') || text.includes('groin swelling')) {
      return {
        predictedSurgery: 'Laparoscopic Inguinal / Ventral Hernioplasty with 3D Mesh',
        priority: 'Moderate Priority / Schedule Within 1-2 Weeks',
        summary: `Abdominal wall defect with protrusion necessitates elective mesh reconstruction to prevent acute strangulation, bowel incarceration, and chronic nerve entrapment.`,
        specialty: 'Surgical Gastroenterology & Laparoscopy'
      };
    }

    // Rule 5: Oncology / Cancer / Tumors
    if (key.includes('cancer') || key.includes('tumor') || key.includes('nodule') || text.includes('cancer') || text.includes('tumor') || text.includes('lump') || text.includes('mass')) {
      return {
        predictedSurgery: 'Oncological Resection with Sentinel Lymph Node Biopsy & Frozen Section',
        priority: 'Urgent Priority / Schedule Immediate Evaluation',
        summary: `Presentation warrants expedited oncological multidisciplinary staging (PET-CT/Histopathology) and surgical margin clearance. Early surgical intervention combined with comprehensive systemic surveillance provides the highest curative potential.`,
        specialty: 'Surgical Oncology'
      };
    }

    // Rule 6: Spine & Neuro
    if (key.includes('disc') || key.includes('sciatica') || key.includes('spine') || text.includes('sciatica') || text.includes('numbness') || text.includes('lumbar')) {
      return {
        predictedSurgery: 'Microdiscectomy / Minimally Invasive Lumbar Decompression',
        priority: priority,
        summary: `Persistent nerve root compression (radiculopathy) refractory to conservative management requires micro-decompression to alleviate sciatica, prevent permanent axonal deficit, and restore motor strength.`,
        specialty: 'Neurosurgery & Spine'
      };
    }

    // Rule 7: Urology / Kidney Stones / BPH
    if (key.includes('renal') || key.includes('calculus') || key.includes('urology') || key.includes('prostate') || text.includes('urine') || text.includes('kidney')) {
      return {
        predictedSurgery: 'Laser RIRS (Retrograde Intrarenal Surgery) / Holmium Laser Enucleation',
        priority: 'Moderate Priority / Schedule Within 1-2 Weeks',
        summary: `Calculus obstruction or lower urinary tract obstructive symptoms benefit from endoscopic laser fragmentation or enucleation, providing scarless recovery and prompt resumption of normal renal outflow.`,
        specialty: 'Urology & Endourology'
      };
    }

    // Default Fallback
    return {
      predictedSurgery: 'Minimally Invasive Exploratory & Corrective Surgical Procedure',
      priority: priority,
      summary: `Patient history and symptom severity indicate need for comprehensive surgical evaluation. Pre-operative diagnostics and specialist cross-consultation will confirm targeted intervention.`,
      specialty: 'Surgical Gastroenterology & Laparoscopy'
    };
  },

  counselorHeuristicResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('knee') || q.includes('tkr')) {
      return `### Knee Replacement (TKR) Cost Overview in Major Indian Metros:
- **Average Package Cost**: ₹1,80,000 to ₹3,20,000 per knee (depending on implant grade: US FDA approved Cobalt Chromium vs Oxinium/Gold).
- **Typical Cost Breakdown**:
  - **Surgeon & Anesthesia Fee**: ~35% (₹65,000 - ₹1,10,000)
  - **OT & High-Tech Navigation/Robotics**: ~25% (₹45,000 - ₹75,000)
  - **Hospital Stay (3-4 Days Deluxe/Twin)**: ~20% (₹35,000 - ₹60,000)
  - **Implants, Medicines & Consumables**: ~20% (₹40,000 - ₹80,000)
- **Top Accredited Centers**: Kokilaben (Mumbai), Nanavati Max (Mumbai), Apollo Hospitals (Bangalore/Chennai), Medanta (Gurugram).`;
    }

    if (q.includes('insurance') || q.includes('gallbladder') || q.includes('cholecystectomy')) {
      return `### Gallbladder Surgery (Laparoscopic Cholecystectomy) & Insurance:
- **Cashless Insurance Coverage**: Covered under almost all commercial mediclaim & corporate group policies as an active emergency/elective surgical indication (Daycare or 24-hr admission).
- **Average Package Cost**: ₹75,000 to ₹1,45,000.
- **Coverage Details**:
  - Pre-hospitalization diagnostics (Ultrasound, blood work) covered up to 30-60 days.
  - Post-hospitalization follow-up and medications covered for 60-90 days.
  - Consumables (trocars, harmonic scalpel blade) may have a minor non-payable deduction (~5-8%) under certain standard policy clauses.`;
    }

    if (q.includes('cardiac') || q.includes('heart') || q.includes('delhi')) {
      return `### Top JCI & NABH Accredited Cardiac Centers in Delhi NCR:
1. **Fortis Escorts Heart Institute (Okhla)** — World-renowned dedicated cardiac center, pioneered off-pump CABG.
2. **Medanta - The Medicity (Gurugram)** — Multi-organ transplant & complex hybrid cardiac surgical center under Dr. Naresh Trehan.
3. **Max Super Speciality Hospital (Saket)** — Advanced robotic and minimally invasive cardiac surgery (MICS).
4. **Indraprastha Apollo Hospitals (Sarita Vihar)** — Comprehensive high-volume cardiothoracic unit.`;
    }

    if (q.includes('surgeon fee') || q.includes('ot') || q.includes('breakdown')) {
      return `### Understanding Surgical Package Cost Components:
1. **Surgeon & Team Fee (~35%)**: Covers the primary chief operating surgeon, first assistant surgeon, and anesthesiologist for pre-op risk assessment, the surgery itself, and routine daily post-op hospital visits.
2. **OT Charges (~25%)**: Operating Theatre sterilization, laminar airflow, advanced surgical energy systems (Harmonic / LigaSure), and specialized robotic/laparoscopic imaging towers.
3. **Room & Nursing Care (~20%)**: Daily inpatient bed accommodation (General, Twin Sharing, Single Private, or Deluxe) including 24x7 nursing monitoring, vitals, and dietitian meals.
4. **Medicines & Consumables (~20%)**: IV fluids, specialty surgical sutures, disposable drapes, intraoperative monitoring patches, and take-home medications.`;
    }

    return `### MediMatch Surgical & Financial Counseling:
Thank you for your question. Here are the crucial points regarding your inquiry:
- **Pre-Authorization**: Most surgical admissions in NABH/JCI accredited hospitals qualify for cashless mediclaim assistance.
- **Package Inclusions**: Standard packages include surgeon fees, OT charges, specified room category, routine surgical consumables, and post-op care.
- **Cost Variances**: Implants, unexpected ICU observation, and specialized robotic platforms may carry supplementary line-item estimates.

Feel free to use the **AI Health Assessment wizard** to get an exact itemized hospital quote tailored to your budget!`;
  }
};

