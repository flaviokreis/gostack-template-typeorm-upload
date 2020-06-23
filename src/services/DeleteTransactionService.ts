import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    const transaction = await transactionsRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction not found');
    }

    if (transaction.type === 'income' && transaction.value > balance.total) {
      throw new AppError(
        'The account not have balance enough to delete income.',
      );
    }

    await transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
