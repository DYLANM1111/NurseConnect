//const e = require('express');
const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class License extends Model {
        static associate(models) {
            License.belongsTo(models.NurseProfile, {
                foreignKey: 'nurse_id',
                as: 'nurse'
            });
        }
    }
    License.init({ 
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nurse_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'NurseProfile',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        license_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        license_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'expired'),
            allowNull: false,
            defaultValue: 'active'
        },
        verification_status: {
            type: DataTypes.ENUM('pending', 'verified', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        },
        document_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        modelName: 'License',
        tableName: 'licenses',
        timestamps: false,
        underscored: true
    });
   
    return License;
};