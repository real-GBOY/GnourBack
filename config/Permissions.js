/** @format */

const Permissions = {
	// Person
	ApprovePerson: "approve_person",
	ViewUnProvedPerson: "view_unproved_person",
	RejectPerson: "reject_person",
	ViewPerson: "view_person",
	VerifyPerson: "verify_person",
	ViewTeamMembers: "view_team_members",
	// Team permissions
	CreateTeam: "create_team",
	EditTeam: "edit_team",
	DeleteTeam: "delete_team",
	ViewTeam: "view_team",
	CreateTeamsInTask: "create_teams_in_task",
	EditTeamsInTask: "edit_teams_in_task",
	DeleteTeamsInTask: "delete_teams_in_task",
	ViewTeamsInTask: "view_teams_in_task",
	// Event permissions
	CreateEvent: "create_event",
	EditEvent: "edit_event",
	DeleteEvent: "delete_event",
	ViewEvent: "view_event",
	InviteMembersToEvent: "invite_members_to_event", // New permission for inviting members to events
	RemoveMembersFromEvent: "remove_members_from_event", // New permission for removing members from events
	ManageEventGuests: "manage_event_guests", // New permission for managing event guests
	// Task permissions
	CreateTask: "create_task",
	EditTask: "edit_task",
	DeleteTask: "delete_task",
	ViewTask: "view_task",
	UploadFile: "upload_file",
	// Feedback permissions
	CreateFeeBack: "create_feedback",
	EditFeedback: "edit_feedback",
	DeleteFeedback: "delete_feedback",
	ViewFeedback: "view_feedback",
	//Attendance permissions
	CreateAttendance: "create_attendance",
	EditAttendance: "edit_attendance",
	DeleteAttendance: "delete_attendance",
	ViewAttendance: "view_attendance",
	// Achievement permissions
	CreateAchievement: "create_achievement",
	EditAchievement: "edit_achievement",
	DeleteAchievement: "delete_achievement",
	ViewAchievement: "view_achievement",
	AssignAchievement: "assign_achievement",

		// Applicants (President-only by design)
		CreateApplicant: "create_applicant",
		EditApplicant: "edit_applicant",
		DeleteApplicant: "delete_applicant",
		ViewApplicants: "view_applicants",
	
};

module.exports = Permissions;
