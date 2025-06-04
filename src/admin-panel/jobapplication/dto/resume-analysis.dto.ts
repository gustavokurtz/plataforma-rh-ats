export class ResumeAnalysisDto {
  applicationId: number;
  candidateName: string;
  aiSummary?: string;
  aiIdentifiedSkills?: string; // Pode ser uma string longa ou você pode tentar parsear para array
  aiSuggestedRoles?: string; // Pode ser uma string longa ou você pode tentar parsear para array
  originalExtractedText?: string; // Opcional, para referência ou debug
  error?: string; // Para reportar erros no processo
}