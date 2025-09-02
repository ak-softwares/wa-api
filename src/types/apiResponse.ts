export interface ApiResponse {
    success: boolean;
    message: string;
    errors?: string | Record<string, any>;
    data?: any;
}