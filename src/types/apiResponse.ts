export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    pagination?: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}