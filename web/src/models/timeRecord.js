const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class timeRecord extends Model {
        static associate(models){
            timeRecord.belongsTo(models.Shift, {
                foreignKey: 'shift_id',
                as: 'shift'
            });

            timeRecord.belongsTo(models.NurseProfile, {
                foreignKey: 'nurse_id',
                as: 'nurse'
            });

            timeRecord.belongsTo(models.payment, {
                foreignKey: 'payment_id',
                as: 'payment'
            });
        }
    }

    timeRecord.init({
        id: { 
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        shift_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Shift',
                key: 'id'
            }
        },
        nurse_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'NurseProfile',
                key: 'id'
            }
        },
        clock_in: {
            type: DataTypes.DATE,
            allowNull: true
        },
        clock_out: {
            type: DataTypes.DATE,
            allowNull: true
        },
        total_hours_worked: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        status: 
        {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        update_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize, 
        modelName: 'timeRecord',
        tableName: 'time_records',
        timestamps: false,
        underscored: true
    
    });

    return timeRecord;
};