import { pinoHttp } from 'pino-http';
import { logger } from '../logger/index.ts';
import { randomUUID } from 'node:crypto';

export const requestLogger = pinoHttp({ 
    logger,
    genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];

        if(typeof existing === 'string') {
            return existing;
        }

        const id = randomUUID();
        res.setHeader('x-request-id', id);
        return id;
    },
    redact: ['req.headers.authorization']
 });