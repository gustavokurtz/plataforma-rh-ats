import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplicationDto } from './dto/job-application-dto';
// Certifique-se de que o caminho para Prisma está correto ou use '@prisma/client'
// Se 'generated/prisma' for o output do seu 'prisma generate', está ok.
// Senão, geralmente é importado como:
// import { Prisma, JobApplication, Candidate } from '@prisma/client';
import { Prisma } from 'generated/prisma'; // Se este for o seu output do client Prisma
import * as pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { ResumeAnalysisDto } from './dto/resume-analysis.dto';


@Injectable()
export class JobapplicationService {
    private readonly openai: OpenAI;

    constructor(private readonly prisma: PrismaService) {
        // Certifique-se de que a variável de ambiente OPENAI_API_KEY está configurada
        if (!process.env.OPENAI_API_KEY) {
            console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.warn("!!! AVISO: OPENAI_API_KEY não está configurada.             !!!");
            console.warn("!!! A análise de currículo com IA não funcionará.          !!!");
            console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            // Você pode optar por lançar um erro aqui se a chave for essencial
            // throw new Error("OPENAI_API_KEY não está configurada.");
        }
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async createJobApplication(
        createJobApplicationDto: CreateJobApplicationDto,
        resumeBuffer?: Buffer,
    ) {
        try {
            const job = await this.prisma.job.findUnique({
                where: { id: createJobApplicationDto.jobId }
            });

            if (!job) {
                throw new NotFoundException('Vaga não encontrada');
            }

            if (!job.isActive) {
                throw new ConflictException('Esta vaga não está mais aceitando candidaturas');
            }

            const candidateDataCreate = { // Removida a tipagem explícita para Prisma.CandidateCreateInput para simplicidade se não for estritamente necessária
                name: createJobApplicationDto.candidateName,
                email: createJobApplicationDto.candidateEmail,
                phone: createJobApplicationDto.candidatePhone,
                resume: resumeBuffer,
            };

            const candidateDataUpdate = { // Removida a tipagem explícita
                name: createJobApplicationDto.candidateName,
                phone: createJobApplicationDto.candidatePhone,
                resume: resumeBuffer,
            };
            
            const candidate = await this.prisma.candidate.upsert({
                where: { email: createJobApplicationDto.candidateEmail },
                update: candidateDataUpdate,
                create: candidateDataCreate,
            });

            const applicationData = { // Removida a tipagem explícita
                job: { connect: { id: createJobApplicationDto.jobId } },
                candidate: { connect: { id: candidate.id } },
                candidateName: createJobApplicationDto.candidateName,
                candidateEmail: createJobApplicationDto.candidateEmail,
                candidatePhone: createJobApplicationDto.candidatePhone,
                candidateResume: resumeBuffer,
            };

            const data = await this.prisma.jobApplication.create({
                data: applicationData,
                include: {
                    job: true,
                    candidate: true
                }
            });

            return data;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error('Error creating job application:', error.message, error.stack);
            // Verifica se o erro é uma instância de PrismaClientKnownRequestError
            // Acessar 'code' diretamente em 'error' pode ser inseguro se 'error' for 'any' ou 'unknown'
            // Uma forma mais segura é checar o tipo do erro antes.
            if (error && typeof error === 'object' && 'code' in error) {
                 // O tipo Prisma.PrismaClientKnownRequestError pode ser usado para type guard,
                 // mas uma checagem simples por 'code' pode funcionar se você souber que é um erro do Prisma.
                if (error.code === 'P2002') { // P2002 é unique constraint violation
                    throw new ConflictException('Já existe uma candidatura para este candidato nesta vaga.');
                }
            }
            throw new Error('Falha ao criar a candidatura.');
        }
    }

    async getResumeByApplicationId(applicationId: number): Promise<{ resumeBuffer: Buffer, candidateName: string } | null> {
        const application = await this.prisma.jobApplication.findUnique({
            where: { id: applicationId },
            select: {
                candidateResume: true,
                candidateName: true,
            },
        });

        if (!application || !application.candidateResume) {
            return null;
        }

        const resumeBuffer = Buffer.from(application.candidateResume);

        return {
            resumeBuffer: resumeBuffer,
            candidateName: application.candidateName
        };
    }


    async analyzeResumeByApplicationId(applicationId: number): Promise<ResumeAnalysisDto | null> {
        const resumeData = await this.getResumeByApplicationId(applicationId);

        if (!resumeData || !resumeData.resumeBuffer) {
            console.warn(`Buffer do currículo não encontrado para applicationId: ${applicationId} no analyzeResumeByApplicationId.`);
            // Retorna um DTO com erro se o buffer não for encontrado,
            // ou null se o controller já trata null do getResumeByApplicationId
            return {
                applicationId: applicationId,
                candidateName: resumeData?.candidateName || "Desconhecido", // Usa o nome se disponível
                error: "Buffer do currículo não encontrado ou inválido.",
            };
        }

        let extractedText: string;
        try {
            const pdfData = await pdfParse(resumeData.resumeBuffer);
            extractedText = pdfData.text;
        } catch (parseError) {
            console.error(`Erro ao fazer parse do PDF para applicationId ${applicationId}:`, parseError);
            return {
                applicationId: applicationId,
                candidateName: resumeData.candidateName,
                error: "Erro ao ler o conteúdo do PDF.",
            };
        }

        if (!extractedText || extractedText.trim() === "") {
            console.warn(`Texto extraído do PDF está vazio para applicationId: ${applicationId}`);
            return {
                applicationId: applicationId,
                candidateName: resumeData.candidateName,
                error: "Não foi possível extrair texto do PDF ou o PDF está vazio.",
                originalExtractedText: extractedText.substring(0, 200) // Envia um trecho se o texto for só espaços
            };
        }

        // Se a chave da OpenAI não estiver configurada, retorna uma análise "manual" ou de erro.
        if (!process.env.OPENAI_API_KEY) {
            console.warn(`OPENAI_API_KEY não configurada. Realizando análise básica de keywords para applicationId: ${applicationId}.`);
            // Implementação de análise básica de keywords como fallback
            const keywordsToFind = ['javascript', 'typescript', 'react', 'node.js', 'nestjs', 'prisma', 'sql', 'liderança', 'gestão', 'python', 'java', 'angular', 'vue'];
            const foundKeywords: string[] = [];
            const lowerCaseText = extractedText.toLowerCase();
            keywordsToFind.forEach(keyword => {
                if (lowerCaseText.includes(keyword)) {
                    foundKeywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
                }
            });
            return {
                applicationId: applicationId,
                candidateName: resumeData.candidateName,
                error: "Análise com IA indisponível (chave não configurada). Palavras-chave encontradas (análise básica).",
                aiIdentifiedSkills: foundKeywords.join(', ') || "Nenhuma palavra-chave básica encontrada.",
                originalExtractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
            };
        }

        try {
            const MAX_TEXT_LENGTH = 15000; 
            const truncatedText = extractedText.length > MAX_TEXT_LENGTH
                ? extractedText.substring(0, MAX_TEXT_LENGTH)
                : extractedText;

            const prompt = `
Você é um especialista em Recrutamento e Seleção (ATS - Applicant Tracking System) altamente experiente.
Sua tarefa é analisar o seguinte texto de currículo, que foi extraído de um arquivo PDF.

Texto do Currículo:
---
${truncatedText}
---

Com base neste currículo, por favor, forneça as seguintes informações:

1.  **Resumo do Perfil:** Um breve resumo (2-4 frases) do perfil profissional do candidato, destacando suas principais qualificações, nível de experiência e, se aparente, ambições ou tipo de desafio que busca.
2.  **Principais Habilidades e Experiências:** Liste de 5 a 8 das habilidades técnicas (com nível de proficiência estimado como iniciante, intermediário, avançado, ou anos de experiência, se inferível) e habilidades comportamentais (soft skills) mais relevantes. Destaque também experiências profissionais notáveis ou projetos significativos.
3.  **Tipos de Vagas Sugeridas:** Sugira de 3 a 5 tipos de vagas ou áreas de atuação específicas para as quais este candidato seria um bom concorrente no mercado de trabalho brasileiro. Justifique brevemente cada sugestão (1-2 frases por sugestão).

Formate sua resposta de forma clara e concisa, utilizando exatamente os seguintes títulos em negrito para separar cada seção:
**Resumo do Perfil:**
[Aqui seu texto para o resumo]

**Principais Habilidades e Experiências:**
[Aqui seu texto para habilidades e experiências]

**Tipos de Vagas Sugeridas:**
[Aqui seu texto para as sugestões de vagas]

Evite qualquer introdução, saudação, despedida ou comentário fora da análise solicitada. Não inclua a frase "Texto do Currículo:" na sua resposta.
Se o texto do currículo for insuficiente para uma análise completa, indique isso claramente em cada seção.
`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Ou "gpt-4o" / "gpt-4-turbo" para melhores resultados, se disponível e orçamento permitir
                messages: [
                    { role: "system", content: "Você é um ATS especialista em análise de currículos para o mercado brasileiro." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.4, // Ligeiramente reduzido para mais consistência
                // max_tokens: 1500, // Ajuste conforme a necessidade de detalhe da resposta
            });

            const aiResponse = completion.choices[0]?.message?.content?.trim();

            if (!aiResponse) {
                throw new Error("Resposta da IA veio vazia ou inválida.");
            }

            // Parse da resposta da IA (melhorado para ser um pouco mais flexível)
            let summary = "Não foi possível extrair o resumo.";
            let skills = "Não foi possível extrair as habilidades.";
            let roles = "Não foi possível extrair as sugestões de vagas.";

            const summaryMatch = aiResponse.match(/\*\*Resumo do Perfil:\*\*\s*([\s\S]*?)(?=\*\*Principais Habilidades e Experiências:\*\*|\*\*Tipos de Vagas Sugeridas:\*\*|$)/);
            if (summaryMatch && summaryMatch[1]) summary = summaryMatch[1].trim();

            const skillsMatch = aiResponse.match(/\*\*Principais Habilidades e Experiências:\*\*\s*([\s\S]*?)(?=\*\*Resumo do Perfil:\*\*|\*\*Tipos de Vagas Sugeridas:\*\*|$)/);
            if (skillsMatch && skillsMatch[1]) skills = skillsMatch[1].trim();
            
            const rolesMatch = aiResponse.match(/\*\*Tipos de Vagas Sugeridas:\*\*\s*([\s\S]*?)(?=\*\*Resumo do Perfil:\*\*|\*\*Principais Habilidades e Experiências:\*\*|$)/);
            if (rolesMatch && rolesMatch[1]) roles = rolesMatch[1].trim();
            
            return {
                applicationId: applicationId,
                candidateName: resumeData.candidateName,
                aiSummary: summary,
                aiIdentifiedSkills: skills,
                aiSuggestedRoles: roles,
                originalExtractedText: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''),
            };

        } catch (aiError) {
            console.error(`Erro ao chamar a API da OpenAI para applicationId ${applicationId}:`, aiError.message);
            return {
                applicationId: applicationId,
                candidateName: resumeData.candidateName,
                error: `Erro ao processar o currículo com a IA: ${aiError.message || "Erro desconhecido."}`,
                originalExtractedText: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''),
            };
        }
    }
}