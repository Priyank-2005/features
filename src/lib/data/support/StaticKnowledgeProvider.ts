import { KnowledgeProvider, KnowledgeDocument } from './KnowledgeProvider';
import knowledgeData from './knowledge.json';

export class StaticKnowledgeProvider implements KnowledgeProvider {
  async retrieve(query: string, limit: number = 5): Promise<KnowledgeDocument[]> {
    // In a real RAG system, this would perform a vector search.
    // Here we do a basic keyword match on title/content as a placeholder for embeddings.
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const scoredDocs = knowledgeData.map((doc: any) => {
      let score = 0;
      const textToSearch = (doc.title + " " + doc.content).toLowerCase();
      for (const kw of keywords) {
        if (textToSearch.includes(kw)) {
          score += 1;
        }
      }
      return { doc, score };
    });

    // Sort by score descending
    scoredDocs.sort((a, b) => b.score - a.score);
    
    // Return top matches (even if score is 0, we'll return some context just in case, but prefer scored)
    // For this static mock, if no keywords match well, we just return the first few.
    const topDocs = scoredDocs.slice(0, limit).map(sd => sd.doc as KnowledgeDocument);
    
    return topDocs;
  }
}
