/** @format */

const Team = require("../Models/Team");
exports.CreateTeam = async (req, res) => {
	const { name, description, teamLeader, teamViceHead } = req.body;

	const team = new Team({
		name,
		description,
		teamLeader,
		teamViceHead,
	});

	team.save();
	res.status(201).json({ message: "Team created successfully" });
};

exports.GetTeams = async (req, res) => {
	Team.find().then((teams) => {
		res.status(200).json(teams);
	});
};

exports.UpdateTeam = async (req, res) => {
	try {
		const teamId = req.params.id;
		const { name, description } = req.body;
		//update team
		const updatedteam = await Team.findOneAndUpdate(
			{ _id: teamId },
			{ name, description },
			{ new: true }
		);
		if (!updatedteam) {
			return res.status(404).json({ message: "Team not found" });
		}
		//save the updated team
		await updatedteam.save();
		res.status(201).json({ message: "Team updated successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.DeleteTeam = async (req, res) => {
	try {
		const teamId = req.params.id;
		const deletedteam = await Team.findOneAndDelete({ _id: teamId });
		if (!deletedteam) {
			return res.status(404).json({ message: "Team not found" });
		}
		res.status(201).json({ message: "Team deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.GetTeambyId = async (req, res) => {
	try {
		const teamId = req.params.id;
		const team = await Team.findById(teamId);
		if (!team) {
			return res.status(404).json({ message: "Team not found" });
		}
		await team.populate("members");
		res.status(200).json(team);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
