const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Facility = sequelize.define('Facility', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zip_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        contact_phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        contact_email: {
            type: DataTypes.STRING,
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
        tableName: 'facilities',
        timestamps: true,
        underscored: true
    });

    Facility.associate = (models) => {
        Facility.hasMany(models.Shift, {
            foreignKey: 'facility_id',
            as: 'shifts'
        });
    };

    return Facility;
};