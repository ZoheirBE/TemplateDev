/** IPC channel names */
export const IPC_CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_CHANGED: 'file:changed',
  FILE_DELETED: 'file:deleted',
  FILE_ERROR: 'file:error',
  TEST_IPC: 'test:ipc',
  TEST_IPC_REPLY: 'test:ipc:reply'
} as const;

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];

/** File open message payload */
export interface FileOpenMessage {
  filePath: string;
}

/** File read message payload */
export interface FileReadMessage {
  filePath: string;
}

/** File read response payload */
export interface FileReadResponse {
  content: string;
  error?: string;
}

/** File write message payload */
export interface FileWriteMessage {
  filePath: string;
  content: string;
}

/** File write response payload */
export interface FileWriteResponse {
  success: boolean;
  error?: string;
}

/** File change notification payload */
export interface FileChangeMessage {
  filePath: string;
  type: 'changed' | 'deleted';
}

/** File error payload */
export interface FileErrorMessage {
  filePath: string;
  error: string;
  type: string;
}
