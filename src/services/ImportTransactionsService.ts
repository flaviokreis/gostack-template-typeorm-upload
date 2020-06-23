import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';

import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

interface Request {
  filename: string;
}

interface CsvTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvTransactions = await this.loadCSV(filename);

    const createTransaction = new CreateTransactionService();

    const transactions = new Array<Promise<Transaction>>();

    csvTransactions.forEach(async item => {
      const { title, type, value, category } = item;

      transactions.push(
        createTransaction.execute({ title, type, value, category }),
      );
    });

    const saved = await Promise.all(transactions);

    return saved;
  }

  async loadCSV(filePath: string): Promise<Array<CsvTransaction>> {
    const csvFilePath = path.resolve(uploadConfig.directory, filePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines = Array<CsvTransaction>();

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
