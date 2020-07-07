import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO

    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Insuficient founds');
    }

    let databaseCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!databaseCategory) {
      databaseCategory = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(databaseCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: databaseCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
