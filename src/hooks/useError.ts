import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export function useErrorHandler() {
  const handleError = useCallback((error: any, context?: string) => {
    console.error(`Error in ${context || 'application'}:`, error);
    
    let title = 'Erreur';
    let description = 'Une erreur inattendue s\'est produite';
    
    if (error?.message) {
      description = error.message;
    }
    
    if (error?.code === 'PGRST116') {
      title = 'Données introuvables';
      description = 'Les données demandées n\'ont pas été trouvées';
    }
    
    if (error?.code === '23505') {
      title = 'Conflit de données';
      description = 'Cette donnée existe déjà';
    }
    
    if (error?.code === '42501') {
      title = 'Accès refusé';
      description = 'Vous n\'avez pas les permissions nécessaires';
    }
    
    toast({
      title,
      description,
      variant: 'destructive',
    });
    
    return { title, description };
  }, []);
  
  const handleSuccess = useCallback((message: string, title = 'Succès') => {
    toast({
      title,
      description: message,
    });
  }, []);
  
  return {
    handleError,
    handleSuccess,
  };
}