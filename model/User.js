const { Model } = require('objection');

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'email', 'password'],
            properties: {
                id: { type: 'integer' },
                name: { type: 'string', minLength: 1, maxLength: 255 },
                email: { type: 'string', format: 'email', maxLength: 255 },
                password: { type: 'string', minLength: 6 },
                role_id: { type: 'integer' },
                status: { type: 'string', enum: ['A', 'I'] },
            },
        };
    }

    static get relationMappings() {
        const Role = require('./Role');
        //const FinancialRecord = require('./FinancialRecord');
        return {
            role: {
                relation: Model.BelongsToOneRelation,
                modelClass: Role,
                join: {
                    from: 'users.role_id',
                    to: 'roles.id',
                },
            },
            // records: {
            //     relation: Model.HasManyRelation,
            //     modelClass: FinancialRecord,
            //     join: {
            //         from: 'users.id',
            //         to: 'financial_records.user_id',
            //     },
            // },
        };
    }
}

module.exports = User;
