import { Router } from 'express';
import { getCustomRepository, UpdateDateColumn } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import UploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(UploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({ relations: ['category']});
  const balance = await transactionsRepository.getBalance();

  const result = {
    transactions,
    balance
  }

  return response.json(result);
});

transactionsRouter.post('/', async (request, response) => {
  const { type, title, value, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    type,
    value,
    category
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).json();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const csv = request.file.filename;
  const importTransactionsService = new ImportTransactionsService();
  const transactions = await importTransactionsService.execute(csv);

  return response.status(200).json(transactions);
});

export default transactionsRouter;
