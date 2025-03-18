const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        time_record_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'TimeRecords',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'processed', 'failed'),
            allowNull: false
        },
        processed_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'payments',
        timestamps: true,
        underscored: true
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.TimeRecord, {
            foreignKey: 'time_record_id',
            as: 'timeRecord'
        });
    };

    return Payment;
};