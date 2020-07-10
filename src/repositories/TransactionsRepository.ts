import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = this.find();

    const income = (await transactions).reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + transaction.value;
      }

      return total;
    }, 0);

    const outcome = (await transactions).reduce((total, transaction) => {
      if (transaction.type === 'outcome') {
        return total + transaction.value;
      }

      return total;
    }, 0);

    return {
      income: income,
      outcome: outcome,
      total: income - outcome
    }
  }
}

export default TransactionsRepository;
