const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Shift = sequelize.define('Shift', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        facility_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Facilities',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shift_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        hourly_rate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'assigned', 'completed', 'cancelled'),
            allowNull: false
        },
        requirements: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
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
        tableName: 'shifts',
        timestamps: true,
        underscored: true
    });

    Shift.associate = (models) => {
        Shift.belongsTo(models.Facility, {
            foreignKey: 'facility_id',
            as: 'facility'
        });
        Shift.hasMany(models.ShiftApplication, {
            foreignKey: 'shift_id',
            as: 'shiftApplications'
        });
        Shift.hasMany(models.TimeRecord, {
            foreignKey: 'shift_id',
            as: 'timeRecords'
        });
    };

    return Shift;
};