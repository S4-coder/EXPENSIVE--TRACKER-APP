describe('Expenses Tracker', () => {
    let expenses;

    beforeEach(() => {
        expenses = [];
    });

    test('should add an expense', () => {
        const expense = { id: 1, amount: 100, description: 'Groceries' };
        expenses.push(expense);
        expect(expenses.length).toBe(1);
        expect(expenses[0]).toEqual(expense);
    });

    test('should calculate total expenses', () => {
        expenses.push({ id: 1, amount: 100 });
        expenses.push({ id: 2, amount: 200 });
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        expect(total).toBe(300);
    });

    test('should remove an expense', () => {
        expenses.push({ id: 1, amount: 100 });
        expenses.push({ id: 2, amount: 200 });
        expenses = expenses.filter(expense => expense.id !== 1);
        expect(expenses.length).toBe(1);
        expect(expenses[0].id).toBe(2);
    });
});