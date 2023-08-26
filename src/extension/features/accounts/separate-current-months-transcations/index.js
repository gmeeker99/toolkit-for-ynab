import { Feature } from 'toolkit/extension/features/feature';

const YNAB_DATE_HEADER_CLASS =
  '.ynab-grid-header-cell.js-ynab-grid-header-cell.ynab-grid-cell-date';
const YNAB_DATE_CELL_CLASS = '.ynab-grid-cell.ynab-grid-cell-date.user-data';

export class SeparateCurrentMonthsTransactions extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    if (!this.isDateSorted()) return;

    const sortDirection = this.getSortDirection();

    const transaction = this.findPreviousMonthsTransaction(sortDirection);
    transaction.classList.add('currentMonthSeparator');
  }

  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')) {
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

    const currentMonth = new Date(Date.now()).getMonth();
    const currentYear = new Date(Date.now()).getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthsTransaction = transactionDates.find((transaction) => {
      let transactionDate = new Date(transaction.textContent.trim());
      return (
        previousMonth === transactionDate.getMonth() &&
        previousYear === transactionDate.getFullYear()
      );
    });
    return previousMonthsTransaction.parentElement;
  }
}
