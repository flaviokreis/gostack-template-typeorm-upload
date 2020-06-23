import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: string;
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Transaction only accept income or outcome.');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('The account not have balance enough.');
    }

    const saveCategory = await this.getCategory(category);

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: saveCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }

  private async getCategory(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const category = await categoriesRepository.findOne({
      where: { title },
    });

    if (category) {
      return category;
    }

    const savedCategory = categoriesRepository.create({
      title,
    });

    await categoriesRepository.save(savedCategory);

    return savedCategory;
  }
}

export default CreateTransactionService;
