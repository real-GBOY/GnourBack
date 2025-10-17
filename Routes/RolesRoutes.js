const router = require("express").Router();



const roleController = require("../Controllers/RolesController");


router.get("/", roleController.GetRoles);

module.exports = router;