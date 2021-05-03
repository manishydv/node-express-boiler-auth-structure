const router = require('express').Router();

// const AUTH = require('../../controllers/web/auth');
router.get('/', async (req, res, next) => { res.render('login') });
router.get('/login', async (req, res, next) => { res.render('login') });
router.get('/register', async (req, res, next) => { res.render('register') });
router.get('/forgot', async (req, res, next) => { res.render('forgot') });

// router.post('/login', AUTH.login);
// router.get('/logout', AUTH.logout);
// router.get('/changePassword', async (req, res, next) => { res.sendRender('changePassword') });
// router.post('/changePassword', AUTH.changePassword);

module.exports = router;