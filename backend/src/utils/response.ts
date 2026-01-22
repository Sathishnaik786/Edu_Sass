import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: any;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: T,
    error?: any
) => {
    const response: ApiResponse<T> = {
        success,
        message,
        data,
        error,
    };
    return res.status(statusCode).json(response);
};
