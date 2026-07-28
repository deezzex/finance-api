import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from '@prisma/client/runtime/client'
import { transferMoney } from '../../src/services/transferService.ts';

const mockTx = {
    account: {
        findUnique: vi.fn(),
        update: vi.fn()
    },
    transaction: {
        create: vi.fn()
    }
};

vi.mock('../../src/db/prismaClient.ts', () => ({
    prisma: {
        $transaction: vi.fn((callback: (tx: typeof mockTx) => unknown) =>
             callback(mockTx))
    }
}));

function account(overrides: Partial<{
    id: string; ownerId: string; balance: Decimal
}> = {}) {
    return {
        id: 'acc-1',
        ownerId: 'user-1',
        balance: new Decimal(100),
        currency: 'USD',
        createdAt: new Date(),
        ...overrides
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    mockTx.transaction.create.mockResolvedValue({id: 'tx-mock-id'});
});

describe('transferMoney', () => {
    it('rejects a transfer to the same account', async () => {
        await expect(transferMoney('acc-1', 'acc-1', 10, 'user-1'))
            .rejects.toMatchObject({ code: 'SELF_TRANSFER'});
    });

    it('rejects a transfer from an account that does not exist', async () => {
        mockTx.account.findUnique.mockResolvedValueOnce(null);
        mockTx.account.findUnique.mockResolvedValueOnce(account({id: 'acc-2'}));

        await expect(transferMoney('acc-1',  'acc-2', 10, 'user-1'))
            .rejects.toMatchObject({code: 'NOT_FOUND'}); 
    });

    it('rejects a transfer to an account that does not exist', async () => {
        mockTx.account.findUnique.mockResolvedValueOnce(account({ id: 'acc-1' }));
        mockTx.account.findUnique.mockResolvedValueOnce(null);

        await expect(transferMoney('acc-1', 'acc-2', 10, 'user-1'))
            .rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('rejects a transfer when the source balance is insufficient', async () => {
        mockTx.account.findUnique.mockResolvedValueOnce(account({ id: 'acc-1', balance: new Decimal(5) }));
        mockTx.account.findUnique.mockResolvedValueOnce(account({ id: 'acc-2' }));

        await expect(transferMoney('acc-1', 'acc-2', 10, 'user-1'))
            .rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' });
    });

    it('rejects a non-positive amount', async () => {
        mockTx.account.findUnique.mockResolvedValueOnce(account({ id: 'acc-1' }));
        mockTx.account.findUnique.mockResolvedValueOnce(account({ id: 'acc-2' }));

        await expect(transferMoney('acc-1', 'acc-2', -10, 'user-1'))
            .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    });
});