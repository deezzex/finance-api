import { z } from 'zod';

// Deliberately a local copy, not an import from accounts-service's source: finance-api
// and accounts-service are separate deployable services as of Phase 31, and reaching
// into another service's src/ directly for even a trivial schema breaks the moment
// they're built and shipped independently (as the Docker build already proved).
export const accountIdParamSchema = z.object({
    id: z.string().uuid('id must be a valid UUID')
});

export type AccountIdParam = z.infer<typeof accountIdParamSchema>;
