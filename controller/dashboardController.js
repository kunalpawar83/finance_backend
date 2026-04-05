const Record = require('../model/Record');
const catchAsync = require('../utils/catchAsync');

exports.getSummary = catchAsync(async (req, res, next) => {
    // Total income (I)
    const totalIncome = await Record.query()
        .where('type', 'I')
        .where('isDelete', false)
        .sum('amount as total')
        .first();

    // Total expenses (E)
    const totalExpenses = await Record.query()
        .where('type', 'E')
        .where('isDelete', false)
        .sum('amount as total')
        .first();

    const income = parseFloat(totalIncome?.total || 0);
    const expenses = parseFloat(totalExpenses?.total || 0);
    const balance = income - expenses;

    // Category wise totals
    const categoryTotals = await Record.query()
        .select('category', 'type')
        .sum('amount as total')
        .where('isDelete', false)
        .groupBy('category', 'type')
        .then(results => results.map(item => ({
            category: item.category,
            type: item.type,
            total: parseFloat(item.total)
        })));

    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    // Recent activity
    const recentActivity = await Record.query()
        .where('isDelete', false)
        .orderBy('date', 'desc')
        .limit(limit)
        .offset(offset);

    res.status(200).json({
        status: 'success',
        data: {
            totals: {
                income,
                expenses,
                balance,
            },
            categoryTotals,
            recentActivity,
        },
    });
});

exports.getTrends = catchAsync(async (req, res, next) => {
    // Monthly trends for the current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

    const records = await Record.query()
        .where('date', '>=', startOfYear)
        .where('isDelete', false)
        .orderBy('date', 'asc');

    // Aggregate in JS to remain DB agnostic
    const trendsMap = {};
    records.forEach(record => {
        const dateObj = typeof record.date === 'string' ? new Date(record.date) : record.date;
        const month = dateObj.toISOString().substring(0, 7); // YYYY-MM
        if (!trendsMap[month]) {
            trendsMap[month] = { month, income: 0, expenses: 0 };
        }
        if (record.type === 'I') {
            trendsMap[month].income += parseFloat(record.amount);
        } else if (record.type === 'E') {
            trendsMap[month].expenses += parseFloat(record.amount);
        }
    });

    const trends = Object.values(trendsMap);

    res.status(200).json({
        status: 'success',
        data: { trends },
    });
});
