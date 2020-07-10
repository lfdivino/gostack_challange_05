import fs from 'fs';
import csvParse from 'csv-parse';
import path from 'path';

import UploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(csv: string): Promise<Transaction[]> {
    const transactions_data: { title: string; type: 'income' | 'outcome'; value: number; category: string; }[] = [];
    const transactions: Transaction[] = []
    const createTransactionsService = new CreateTransactionService();

    const readCSV = async () => {
      const csvFilePath = path.join(UploadConfig.directory, csv);

      const readCSVStream = fs.createReadStream(csvFilePath);

      const parseStream = csvParse({ 
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });
      
      const parseCSV = readCSVStream.pipe(parseStream);

      parseCSV.on('data', async line => {
        transactions_data.push({
          title: line[0],
          type: line[1],
          value: line[2],
          category: line[3]
        });
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });
    };

    await readCSV();

    const run = async () => {
      for (let index = 0; index < transactions_data.length; index++) {
        const new_transaction = await createTransactionsService.execute(transactions_data[index]);
        transactions.push(new_transaction);
      }  
    };

    await run();
    
    return (transactions);
  }
}

export default ImportTransactionsService;
