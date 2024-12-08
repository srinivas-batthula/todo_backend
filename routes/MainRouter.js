const router = require('express').Router();
const DataBaseRouter = require('./DataBaseRouter')
const AuthRouter = require('./AuthRouter')


router.use('/db', DataBaseRouter);

router.use('/auth', AuthRouter)


module.exports = router;