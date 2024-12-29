import React, { type ReactNode } from 'react';

export interface ErrorDetails {
  message: string;
  code?: string;
  stack?: string;
}

export class ErrorService {
  private static instance: ErrorService;
  private errors: ErrorDetails[] = [];

  private constructor() {}

  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  public logError(error: Error | string, code?: string): void {
    const errorDetails: ErrorDetails = {
      message: typeof error === 'string' ? error : error.message,
      code,
      stack: error instanceof Error ? error.stack : undefined,
    };
    this.errors.push(errorDetails);
    console.error(`[Error ${code || 'UNKNOWN'}]:`, errorDetails.message);
  }

  public getLastError(): ErrorDetails | null {
    return this.errors[this.errors.length - 1] || null;
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public formatErrorMessage(error: Error | string): ReactNode {
    const message = typeof error === 'string' ? error : error.message;
    return message.split('\n').map((line, i) => React.createElement(
      'span',
      { key: i },
      line,
      i < message.split('\n').length - 1 && React.createElement('br')
    ));
  }
}

export const errorService = ErrorService.getInstance();
