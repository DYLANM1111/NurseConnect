const {Model, DataTypes} = require('sequelize');
const bcrypt = require('bcrypt');
const { authenticate } = require('passport');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            /// Define associations here
            User.hasOne(models.NurseProfile, {
                foreignKey: 'userId',
                as: 'nurseProfile',
            });
        }

        async validatePassword(password){
            return await bcrypt.compare(password, this.password);
        }
    }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: [['admin', 'nurse', 'facility']],
            },
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        }

    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            }
        }

});

    return User;
};


