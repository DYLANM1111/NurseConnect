const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET // || include our jwt secret key development
};

//JWT strategy to authenticate user
passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            //finding user by id
            const user = await User.findByPk(jwtPayload.id);

            if (user) {
                //if user is found, return the user object
                return done(null, user);
            } else {
                //if user is not found, return false
                return done(null, false);
            }
        } catch (error) {
            return done(null,false);
        }
    }
)
);


//authenticate middleware to protect routes
exports.authenticateJwt = passport.authenticate('jwt', { session: false });


//Role based authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden'});
        }

        next();
    };
};