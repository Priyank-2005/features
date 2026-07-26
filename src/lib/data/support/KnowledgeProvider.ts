export interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface KnowledgeProvider {
  retrieve(query: string, limit?: number): Promise<KnowledgeDocument[]>;
}
