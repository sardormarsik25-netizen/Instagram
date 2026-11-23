const { Router } = require('express');
const { register, getProfile } = require('../controllers/userController');

const router = Router();

router.post('/', register);
router.get('/:username', getProfile);

module.exports = router;
