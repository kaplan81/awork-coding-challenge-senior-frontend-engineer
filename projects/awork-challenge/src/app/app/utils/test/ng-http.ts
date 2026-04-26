import {
  HttpClient,
  HttpContext,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { expect } from 'vitest';
import { HttpMethodET } from '../../enums/http.enum';

export function checkHttpRequestSuccess<T>({
  body,
  context,
  done,
  headers,
  httpClient,
  httpTestingController,
  method,
  params,
  testData,
  url,
}: {
  body?: unknown;
  context?: HttpContext;
  done: () => void;
  headers?: HttpHeaders;
  httpClient: HttpClient;
  httpTestingController: HttpTestingController;
  method: HttpMethodET;
  params?: HttpParams;
  testData: T | null;
  url: string;
}): void {
  httpClient.request<T>(method, url, { body, context, headers, params }).subscribe((data: T) => {
    expect(data).toEqual(testData);
    done();
  });
  const req: TestRequest = httpTestingController.expectOne(url);
  expect(req.request.method).toEqual(method);
  expect(req.request.body).toEqual(body ?? null);
  if (headers !== undefined) {
    expect(req.request.headers).toEqual(headers);
  }
  if (params !== undefined) {
    expect(req.request.params).toEqual(params);
  }
  if (context !== undefined) {
    expect(req.request.context).toEqual(context);
  }
  req.flush(testData ?? null);
}

export function checkHttpRequestBackendError<T>({
  body,
  context,
  done,
  errorError,
  failingTestMessage,
  headers,
  httpClient,
  httpTestingController,
  method,
  params,
  status,
  statusText,
  url,
}: {
  body?: unknown;
  context?: HttpContext;
  done: () => void;
  errorError: unknown | null;
  failingTestMessage?: string;
  headers?: HttpHeaders;
  httpClient: HttpClient;
  httpTestingController: HttpTestingController;
  method: HttpMethodET;
  params?: HttpParams;
  status?: number;
  statusText?: string;
  url: string;
}): void {
  if (status !== undefined && statusText === undefined) {
    throw new Error('statusText is required when status is provided');
  }
  const failingMessage: string = failingTestMessage !== undefined ? failingTestMessage : 'Failed!';
  httpClient.request<T>(method, url, { body, context, headers, params }).subscribe({
    next: () => expect.fail(failingMessage),
    error: (error: HttpErrorResponse) => {
      if (status !== undefined) {
        expect(error.status).toEqual(status);
      }
      expect(error.error).toEqual(errorError);
      done();
    },
  });
  const req: TestRequest = httpTestingController.expectOne(url);
  req.flush(errorError ?? null, { status, statusText });
}

export function checkHttpRequestNetworkError<T>({
  body,
  context,
  done,
  errorMessage = 'Network error',
  failingTestMessage,
  headers,
  httpClient,
  httpTestingController,
  method,
  params,
  url,
}: {
  body?: unknown;
  context?: HttpContext;
  done: () => void;
  errorMessage?: string;
  failingTestMessage?: string;
  headers?: HttpHeaders;
  httpClient: HttpClient;
  httpTestingController: HttpTestingController;
  method: HttpMethodET;
  params?: HttpParams;
  url: string;
}): void {
  const failingMessage: string = failingTestMessage !== undefined ? failingTestMessage : 'Failed!';
  httpClient.request<T>(method, url, { body, context, headers, params }).subscribe({
    next: () => expect.fail(failingMessage),
    error: (error: HttpErrorResponse) => {
      expect(error.error).toBeInstanceOf(ProgressEvent);
      expect(error.error.type).toBe(errorMessage);
      done();
    },
  });
  const req: TestRequest = httpTestingController.expectOne(url);
  req.error(new ProgressEvent(errorMessage));
}
