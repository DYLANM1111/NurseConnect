const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Certification extends Model {
        static associate(models){
            Certification.belongsTo(models.NurseProfile, {
                foreignKey: 'nurse_id',
                as: 'nurse'
            });
        }
    }

    Certification.init({
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
        certification_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        issuing_body: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
            validate: {
                isIn: [['active', 'inactive', 'expired']],
            }
        },
        document_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        }
    }, {
        sequelize, 
        modelName: 'Certification',
        tableName: 'certifications',
        timestamps: false
    });

    return Certification;
};