import type { Request, Response } from 'express';

export function getHealth(req: Request, res: Response) {
    return res.json({ status: 'ok' });
}