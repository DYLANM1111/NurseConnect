const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ShiftApplication = sequelize.define('ShiftApplication', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        shift_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Shifts',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        nurse_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'NurseProfiles',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
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
        tableName: 'shift_applications',
        timestamps: true,
        underscored: true
    });

    ShiftApplication.associate = (models) => {
        ShiftApplication.belongsTo(models.Shift, {
            foreignKey: 'shift_id',
            as: 'shift'
        });
        ShiftApplication.belongsTo(models.NurseProfile, {
            foreignKey: 'nurse_id',
            as: 'nurseProfile'
        });
    };

    return ShiftApplication;
};