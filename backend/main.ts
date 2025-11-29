import { Blockchain } from './Blockchain';
import { Transaction } from './Transaction';

const myCoin = new Blockchain();

console.log('Creating some transactions...');
myCoin.createTransaction(new Transaction('address1', 'address2', 100));
myCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\nStarting the miner...');
myCoin.minePendingTransactions('xaviers-address');

console.log('\nBalance of xavier is', myCoin.getBalanceOfAddress('xaviers-address'));

console.log('\nStarting the miner again...');
myCoin.minePendingTransactions('xaviers-address');

console.log('\nBalance of xavier is', myCoin.getBalanceOfAddress('xaviers-address'));

console.log('\nIs chain valid?', myCoin.isChainValid());

console.log('\nTampering with the chain...');
myCoin.chain[1].transactions[0].amount = 1;

console.log('\nIs chain valid?', myCoin.isChainValid());
