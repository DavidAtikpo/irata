export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number';
  question: string;
  options?: string[];
  required: boolean;
}

export interface FormulaireQuotidien {
  id: string;
  titre: string;
  description?: string;
  session: string;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
  valide: boolean;
  questions: Question[];
  dejaRepondu: boolean;
  dateDerniereReponse?: string;
}

export interface ReponseFormulaire {
  id: string;
  formulaireId: string;
  utilisateurId: string;
  utilisateurNom: string;
  utilisateurEmail: string;
  dateReponse: string;
  reponses: {
    questionId: string;
    question: string;
    reponse: any;
  }[];
  commentaires?: string;
  soumis: boolean;
} 