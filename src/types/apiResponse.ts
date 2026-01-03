export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    // Cursor-based (Facebook)
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;

    // Page-based (optional / future)
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
};

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
