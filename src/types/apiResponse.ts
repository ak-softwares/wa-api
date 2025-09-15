export interface ApiResponse {
    success: boolean;
    message: string;
    error?: string | Record<string, any>;
    data?: any;
    pagination?: {
        total: number;
        page: number;
        perPage: number;
        pages: number;
    };
}