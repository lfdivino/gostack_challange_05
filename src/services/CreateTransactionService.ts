// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string
}

class CreateTransactionService {
  public async execute({ title, type, value, category }: Request): Promise<Transaction> {
    if (!title || !type || !value || !category) {
      throw new AppError("All the fields are required!");
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError("Transaction type could only be 'income' or 'outcome'!");
    }

    if (value < 0) {
      throw new AppError("Value needs to be positive!");
    }

    const transactionRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError("You couldn't outcome a value bigger than balance's total!");
    }

    const categoryRepository = getRepository(Category);

    const category_exists = await categoryRepository.findOne({ where: { title: category }});

    if (!category_exists) {
      const category_obj = categoryRepository.create({ title: category });
      await categoryRepository.save(category_obj);

      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category: category_obj.id
      });
      await transactionRepository.save(transaction);

      return (transaction);
    } else {
      const transaction = transactionRepository.create({
        title,
        type,
        value,
        category: category_exists.id
      });
      await transactionRepository.save(transaction);

      return (transaction);
    }
  }
}

export default CreateTransactionService;
