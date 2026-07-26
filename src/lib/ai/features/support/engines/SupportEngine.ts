import { prisma } from '@/lib/prisma';
import { StaticKnowledgeProvider } from '@/lib/data/support/StaticKnowledgeProvider';
import { IntentRouter } from '../capabilities/IntentRouter';
import { KnowledgeCapability } from '../capabilities/KnowledgeCapability';
import { EducationalCapability } from '../capabilities/EducationalCapability';
import { LeadQualificationCapability } from '../capabilities/LeadQualificationCapability';
import { HumanEscalationCapability } from '../capabilities/HumanEscalationCapability';
import { ComplianceCapability } from '../capabilities/ComplianceCapability';
import { SupportResponse } from '@/schemas/support.schema';

export class SupportEngine {
  private knowledgeProvider = new StaticKnowledgeProvider();

  async processMessage(sessionId: string, userId: string | null, message: string): Promise<SupportResponse> {
    console.log(`[SupportEngine] Processing message for session ${sessionId}`);
    
    // 1. Fetch History
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });
    
    const history = session?.messages.map(m => ({ role: m.role, content: m.content })) || [];
    
    // 2. Fetch Lead Data if available
    let lead = await prisma.lead.findFirst({
      where: userId ? { userId } : { id: 'dummy_for_now' }, // Real logic would link via session or user
      orderBy: { createdAt: 'desc' }
    });
    
    // For anonymous users, we might link lead to sessionId. Let's just pass empty for now.
    const leadData = lead ? { name: lead.name, email: lead.email, phone: lead.phone, city: lead.city, investmentRange: lead.investmentRange } : {};

    // 3. Intent Detection
    const intentResult = await IntentRouter.execute({ history, latestMessage: message });
    console.log(`[SupportEngine] Intent detected: ${intentResult.intent} (${intentResult.confidence}%)`);

    let proposedResponse = '';
    let escalationDetails = undefined;
    let isEscalated = false;
    let capturedLeadData = undefined;

    // 4. Capability Routing
    if (intentResult.intent === 'General Question' || intentResult.intent === 'Product Information') {
      const knowledgeDocs = await this.knowledgeProvider.retrieve(message, 3);
      console.log(`[SupportEngine] Retrieved ${knowledgeDocs.length} knowledge documents`);
      const result = await KnowledgeCapability.execute({ knowledgeDocs, history, latestMessage: message });
      proposedResponse = result.response;
    } 
    else if (intentResult.intent === 'Educational') {
      const result = await EducationalCapability.execute({ history, latestMessage: message });
      proposedResponse = result.response;
    }
    else if (intentResult.intent === 'Lead Intent') {
      const result = await LeadQualificationCapability.execute({ leadData, history, latestMessage: message });
      proposedResponse = result.response;
      capturedLeadData = result.capturedLeadData;
    }
    else if (intentResult.intent === 'Human Advisor' || intentResult.intent === 'Complaint') {
      const result = await HumanEscalationCapability.execute({ leadData, history, latestMessage: message });
      proposedResponse = result.response;
      escalationDetails = result.handoff;
      isEscalated = true;
    }
    else {
      // Greeting or Unknown
      proposedResponse = "Hello! I am your digital relationship manager for Knowith Capital. How can I assist you with your wealth management needs today?";
    }

    // 5. Compliance Review
    const complianceResult = await ComplianceCapability.execute({ proposedResponse });
    if (!complianceResult.isCompliant && complianceResult.revisedResponse) {
      console.log(`[SupportEngine] Compliance intervention triggered. Reason: ${complianceResult.reason}`);
      proposedResponse = complianceResult.revisedResponse;
    }

    // 6. Save User Message
    await prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: message
      }
    });

    // 7. Save Assistant Message
    await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: proposedResponse
      }
    });

    // 8. Update Lead if new data captured
    if (capturedLeadData && Object.keys(capturedLeadData).length > 0) {
       console.log(`[SupportEngine] Lead data captured:`, capturedLeadData);
       // In a real implementation, we'd upsert the lead here based on sessionId or userId
    }

    return {
      message: proposedResponse,
      isEscalated,
      escalationDetails,
      suggestedQuestions: [
        "What is Portfolio Management (PMS)?",
        "How do I start a SIP?",
        "Can I speak to an advisor?"
      ]
    };
  }
}
