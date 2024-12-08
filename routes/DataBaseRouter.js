const router = require('express').Router()
const Tasks = require('../controllers/TasksController')
const Users = require('../controllers/UserController')
const Auth = require('../controllers/AuthController')


router.route('/tasks')
    .get(Auth.Auth_Middleware, Tasks.getAllTasks)
    .post(Auth.Auth_Middleware, Tasks.postTask)
    .patch(Auth.Auth_Middleware, Tasks.patchTask)
    .delete(Auth.Auth_Middleware, Tasks.deleteTask);

router.route('/users')
    .patch(Auth.Auth_Middleware, Users.UpdateUser);


module.exports = router;