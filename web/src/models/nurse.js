const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const NurseProfile = sequelize.define('NurseProfile', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        specialty: {
            type: DataTypes.STRING,
            allowNull: true
        },
        years_experience: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        preferred_shift_type: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true,
            defaultValue: []
        },
        preferred_distance: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 25
        },
        min_hourly_rate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        max_hourly_rate: {
            type: DataTypes.DECIMAL(10, 2),
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
        tableName: 'nurse_profiles',
        timestamps: true,
        underscored: true
    });

    NurseProfile.associate = (models) => {
        NurseProfile.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        NurseProfile.hasMany(models.License, {
            foreignKey: 'nurse_id',
            as: 'licenses'
        });
        NurseProfile.hasMany(models.Certification, {
            foreignKey: 'nurse_id',
            as: 'certifications'
        });
        NurseProfile.hasMany(models.ShiftApplication, {
            foreignKey: 'nurse_id',
            as: 'shiftApplications'
        });
        NurseProfile.hasMany(models.TimeRecord, {
            foreignKey: 'nurse_id',
            as: 'timeRecords'
        });
    };

    return NurseProfile;
};