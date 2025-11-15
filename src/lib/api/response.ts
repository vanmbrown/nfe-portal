/**
 * Standardized API Response Types and Helpers
 * 
 * Provides consistent response format across all API routes:
 * - Success: { success: true, data: T, message?: string }
 * - Error: { success: false, error: string, details?: unknown, code?: string }
 */

import { NextResponse } from 'next/server';

/**
 * Standard API Success Response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Standard API Response (union type)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * HTTP Status Codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  status: number = HttpStatus.OK,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_SERVER_ERROR,
  details?: unknown,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details !== undefined && { details }),
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: (message: string = 'Unauthorized. Please log in to continue.') =>
    errorResponse(message, HttpStatus.UNAUTHORIZED, undefined, 'UNAUTHORIZED'),

  badRequest: (message: string, details?: unknown) =>
    errorResponse(message, HttpStatus.BAD_REQUEST, details, 'BAD_REQUEST'),

  notFound: (message: string = 'Resource not found') =>
    errorResponse(message, HttpStatus.NOT_FOUND, undefined, 'NOT_FOUND'),

  conflict: (message: string, details?: unknown) =>
    errorResponse(message, HttpStatus.CONFLICT, details, 'CONFLICT'),

  internalError: (message: string = 'Internal server error', details?: unknown) =>
    errorResponse(message, HttpStatus.INTERNAL_SERVER_ERROR, details, 'INTERNAL_ERROR'),
};

