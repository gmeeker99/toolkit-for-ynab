import { Feature } from 'toolkit/extension/features/feature';

const YNAB_DATE_HEADER_CLASS =
  '.ynab-grid-header-cell.js-ynab-grid-header-cell.ynab-grid-cell-date';
const YNAB_DATE_CELL_CLASS = '.ynab-grid-cell.ynab-grid-cell-date.user-data';

export class SeparateCurrentMonthsTransactions extends Feature {
  shouldInvoke() {
    const dateHeader = document.querySelector(YNAB_DATE_HEADER_CLASS);
    if (dateHeader) {
      return true;
    }
    return false;
  }

  invoke() {
    if (!this.isDateSorted()) return;

    const sortDirection = this.getSortDirection();
    const transaction = this.findPreviousMonthsTransaction(sortDirection);

    if (!transaction) {
      return;
    }

    if (sortDirection === 'desc') {
      transaction.classList.add('currentMonthSeparatorTop');
    } else if (sortDirection === 'asc') {
      transaction.classList.add('currentMonthSeparatorBottom');
    }
  }

  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (
      changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data') ||
      changedNodes.has('flaticon stroke sort-icon up') ||
      changedNodes.has('flaticon stroke sort-icon down')
    ) {
      this.invoke();
    }
  }

  isDateSorted() {
    const dateHeader = document.querySelector(YNAB_DATE_HEADER_CLASS);
    const isDateSorted = dateHeader.classList.contains('is-sorting');
    return isDateSorted;
  }

  getSortDirection() {
    const dateSort = document.querySelector(YNAB_DATE_HEADER_CLASS.concat(' .sort-icon'));
    const isAscending = dateSort.classList.contains('up');
    return isAscending ? 'asc' : 'desc';
  }

  findPreviousMonthsTransaction(sortDirection) {
    const transactionDates = Array.from(document.querySelectorAll(YNAB_DATE_CELL_CLASS));

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const isPreviousMonthTransaction = (transactionDate) => {
      return (
        previousMonth === transactionDate.getMonth() &&
        previousYear === transactionDate.getFullYear()
      );
    };

    let previousMonthsTransaction;

    if (sortDirection === 'desc') {
      previousMonthsTransaction = transactionDates.find((transaction) => {
        const [month, day, year] = transaction.textContent.trim().split('/');
        let transactionDate = new Date(year, month - 1, day);
        return isPreviousMonthTransaction(transactionDate);
      });
    } else if (sortDirection === 'asc') {
      transactionDates.forEach((transaction) => {
        const [month, day, year] = transaction.textContent.trim().split('/');
        let transactionDate = new Date(year, month - 1, day);
        if (isPreviousMonthTransaction(transactionDate)) {
          previousMonthsTransaction = transaction;
        }
      });
    }

    if (!previousMonthsTransaction) {
      return null;
    }

    return previousMonthsTransaction.parentElement;
  }
}
