/** @format */

const express = require("express");
const router = express.Router();
const teamController = require("../Controllers/TeamController");

router.get("/", teamController.GetTeams);
router.get("/:id", teamController.GetTeambyId);

router.delete("/:id", teamController.DeleteTeam);

router.post("/", teamController.CreateTeam);

router.patch("/:id", teamController.UpdateTeam);
module.exports = router;
