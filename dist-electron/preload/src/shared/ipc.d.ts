/** IPC channel names */
export declare const IPC_CHANNELS: {
    readonly FILE_OPEN: "file:open";
    readonly FILE_READ: "file:read";
    readonly FILE_WRITE: "file:write";
    readonly FILE_CHANGED: "file:changed";
    readonly FILE_DELETED: "file:deleted";
    readonly FILE_ERROR: "file:error";
    readonly TEST_IPC: "test:ipc";
    readonly TEST_IPC_REPLY: "test:ipc:reply";
};
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
