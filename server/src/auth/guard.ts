import type { RequestHandler, Request, Response } from "express";
import z from "zod/v4";

const authenticatedLocalsSchema = z.object({
  user: z.object({
    userId: z.number(),
  }),
});

export type AuthenticatedLocals = z.infer<typeof authenticatedLocalsSchema>;

export type Authenticated<T extends RequestHandler> =
  T extends RequestHandler<
    infer P,
    infer ResBody,
    infer ReqBody,
    infer ReqQuery,
    Record<string, unknown>
  >
    ? RequestHandler<P, ResBody, ReqBody, ReqQuery, AuthenticatedLocals>
    : never;

export const authenticated = <T extends RequestHandler>(
  handler: Authenticated<T>,
): RequestHandler => {
  return ((req: Request, res: Response, next) =>
    authenticatedLocalsSchema
      .parseAsync(res.locals)
      .catch(next)
      .then(() =>
        handler(
          req as Parameters<Authenticated<T>>[0],
          res as Parameters<Authenticated<T>>[1],
          next,
        ),
      )) as RequestHandler;
};
