// Em algum lugar como src/job-application/dto/resume-analysis.dto.ts
export class ResumeAnalysisDto {
  applicationId: number;
  candidateName: string;
  extractedText?: string; // Texto completo ou um trecho
  foundKeywords?: string[];
  // Você pode adicionar mais campos simples aqui, como:
  // wordCount?: number;
  // possibleEmail?: string;
  // possiblePhone?: string;
}