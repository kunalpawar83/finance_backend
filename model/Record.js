const { Model } = require('objection');

class FinancialRecord extends Model {
    static get tableName() {
        return 'records';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['amount', 'type', 'date'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer' },
                amount: { type: 'number' },
                type: { type: 'string', enum: ['I', 'E'] },
                category: { type: 'string' },
                date: { type: 'string', format: 'date' },
                notes: { type: 'string' },
            },
        };
    }

    static get relationMappings() {
        const User = require('./User');
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'financial_records.user_id',
                    to: 'users.id',
                },
            }
        };
    }
}

module.exports = FinancialRecord;
