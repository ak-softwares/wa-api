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

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
