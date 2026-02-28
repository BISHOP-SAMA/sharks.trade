import { z } from 'zod';
import { insertSubmissionSchema, submissions, auctions, bids, insertAuctionSchema } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/submissions' as const,
      responses: { 200: z.array(z.custom<typeof submissions.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/submissions' as const,
      input: insertSubmissionSchema,
      responses: { 201: z.custom<typeof submissions.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/submissions/:id' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof submissions.$inferSelect>(), 404: errorSchemas.notFound },
    },
  },
  auctions: {
    list: {
      method: 'GET' as const,
      path: '/api/auctions' as const,
      responses: { 200: z.array(z.custom<typeof auctions.$inferSelect>()) },
    },
    getActive: {
      method: 'GET' as const,
      path: '/api/auctions/active' as const,
      responses: { 200: z.custom<typeof auctions.$inferSelect>().nullable() },
    },
    create: {
      method: 'POST' as const,
      path: '/api/auctions' as const,
      input: insertAuctionSchema,
      responses: { 201: z.custom<typeof auctions.$inferSelect>(), 400: errorSchemas.validation },
    },
    close: {
      method: 'POST' as const,
      path: '/api/auctions/:id/close' as const,
      responses: { 200: z.custom<typeof auctions.$inferSelect>(), 404: errorSchemas.notFound },
    },
  },
  bids: {
    list: {
      method: 'GET' as const,
      path: '/api/auctions/:auctionId/bids' as const,
      responses: { 200: z.array(z.custom<typeof bids.$inferSelect>()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/auctions/:auctionId/bids' as const,
      input: z.object({ bidderWallet: z.string(), amount: z.string() }),
      responses: { 201: z.custom<typeof bids.$inferSelect>(), 400: errorSchemas.validation },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
