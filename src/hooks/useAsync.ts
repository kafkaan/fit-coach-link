import { useState, useCallback } from 'react';
import { useErrorHandler } from './useError';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T = any>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const { handleError } = useErrorHandler();
  
  const execute = useCallback(async (asyncFunction: () => Promise<T>, context?: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      setState({ data: null, loading: false, error });
      handleError(error, context);
      throw error;
    }
  }, [handleError]);
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  return {
    ...state,
    execute,
    reset,
  };
}