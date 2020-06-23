import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  const result = {
    transactions,
    balance,
  };
  return response.json(result);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const generatedCategory = await createTransaction.execute({
    title,
    type,
    value,
    category,
  });

  return response.json(generatedCategory);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('csv'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const { filename } = request.file;

    const result = await importTransactions.execute({ filename });

    return response.json(result);
  },
);

export default transactionsRouter;
