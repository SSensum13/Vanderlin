/// Subsystem that controlls special roles waves, spawns and invasions.
SUBSYSTEM_DEF(special_roles)
	name = "Special Roles"
	priority = FIRE_PRIORITY_SPECIAL_ROLES
	runlevels = RUNLEVEL_GAME
	var/list/entries = list()

/datum/controller/subsystem/special_roles/fire(resumed = FALSE)

/datum/controller/subsystem/special_roles/New()
	. = ..()

/datum/controller/subsystem/special_roles/proc/create_event(to_create, spawn_delay = 30 SECONDS)
	if(istype(to_create, /datum/special_roles_wave))
		to_create:time_of_spawn = world.time + spawn_delay
	entries[to_create:id] = to_create
		
/datum/controller/subsystem/special_roles/proc/announce_event(event)

/datum/controller/subsystem/special_roles/ui_state()
	return GLOB.always_state

/datum/controller/subsystem/special_roles/ui_interact(mob/user, datum/tgui/ui)
	ui = SStgui.try_update_ui(user, src, ui)
	if(!ui)
		ui = new(user, src, "SpecialRoles")
		ui.open()

/datum/controller/subsystem/special_roles/ui_data(mob/user)
	var/list/data = list()
	var/list/data_entries = list()
	for(var/id in entries)
		var/list/data_entry = list()
		var/list/data_roles = list()
		data_entry["id"] = id
		data_entry["name"] = entries[id]:name
		data_entry["description"] = entries[id]:description
		if(istype(entries[id], /datum/special_roles_wave))
			data_entry["isInvasion"] = FALSE
			data_entry["timeLeft"] = entries[id]:time_of_spawn - world.time
			var/datum/job/player_choice = entries[id]:player_choices[user.ckey]
			data_entry["playerChoice"] = player_choice?.title
			var/roles = entries[id]:roles
			for(var/datum/job/role as anything in roles)
				data_roles += list(list("title" = role.title, "description" = role.tutorial, "value" = roles[role]))
		else
			data_entry["isInvasion"] = TRUE
			data_entry["spawnsLeft"] = entries[id]:spawns_left
			var/roles = entries[id]:get_ratio_available_roles()
			for(var/datum/job/role as anything in roles)
				data_roles += list(list("title" = role.title, "description" = role.tutorial, "value" = roles[role]))
		data_entry["roles"] = data_roles
		data_entries += list(data_entry)
	data["entries"] = data_entries
	return data

/datum/controller/subsystem/special_roles/ui_act(action, list/params, datum/tgui/ui, datum/ui_state/state)
	. = ..()
	if(.)
		return
	if(action == "selectrole")
		var/entry_id = params["entryId"]
		var/role_title = params["role"]
		if(!entry_id || !role_title)
			return FALSE
		if(entries[entry_id] == null)
			return FALSE
		if(istype(entries[entry_id], /datum/special_roles_wave))
			var/datum/special_roles_wave/wave = entries[entry_id]
			var/datum/job/already_selected = wave.player_choices[ui.user.ckey]
			if(already_selected != null && already_selected.title == role_title)
				wave.player_choices[ui.user.ckey] = null
			else
				for(var/datum/job/role as anything in wave.roles)
					if(role.title == role_title)
						wave.player_choices[ui.user.ckey] = role
						break

/datum/special_roles_wave
	var/name = ""
	var/description = ""
	///List where job datum typepath is key and number of positions is value
	var/list/roles
	///Can be either typepath or string with name of landmark to spawn on. 
	///If there are multiple landmarks of that name/type - will spawn on random one.
	var/landmark = /obj/effect/landmark/start/outsider

	var/time_of_spawn
	var/id = ""
	var/list/player_choices = list()

/datum/special_roles_wave/New()
	id = "[world.time]-[rand(0, 9999)]"

/datum/special_roles_wave/test
	name = "test wave"
	description = "WOAH, TESTING WAVES, HUH???"
	roles = list(
		/datum/job/absolver = 1,
		/datum/job/royalknight = 2,
		/datum/job/bard = 1
	)

/datum/special_roles_invasion
	var/name = ""
	var/description = ""
	///List where job datum typepath is key and value is ratio to other roles of this invasion (0 to ignore ratio).
	///Example:
	///You will have 2 roles: fighter with ratio 0 and mage with ratio of 3.
	///In that case people will be able to join as fighter at any time,
	///but joining mage requires people to join other roles 3 times before that.
	var/list/roles
	///Can be either typepath or string with name of landmark to spawn on. 
	///If there are multiple landmarks of that name/type - will spawn on random one.
	var/landmark = /obj/effect/landmark/start/outsider
	var/spawns_left = 1

	var/id = ""
	var/list/roles_tracker = list()

/datum/special_roles_invasion/New()
	id = "[world.time]-[rand(0, 9999)]"

/// return list of roles with TRUE or FALSE as values depending on role availability.
/datum/special_roles_invasion/proc/get_ratio_available_roles()
	var/list/return_list = list()
	for(var/role in roles)
		if(roles[role] == 0) // does not have ratio requirments
			return_list[role] = 1
			continue
		var/other_roles_spawns_count = 0
		for(var/tracked_role in roles_tracker)
			if(tracked_role == role)
				continue
			other_roles_spawns_count += roles_tracker[tracked_role]
		if(!roles_tracker[role]) // if this role did not spawn yet
			return_list[role] = 1
			continue
		if(!other_roles_spawns_count) // if other roles did not spawn yet
			return_list[role] = 0
			continue
		return_list[role] = other_roles_spawns_count / roles_tracker[role] >= roles[role] // checking ratio
	return return_list

/datum/special_roles_invasion/test
	name = "test invasion"
	description = "WOAH, TESTING INVASION, HUH???"
	spawns_left = 10
	roles = list(
		/datum/job/absolver = 2,
		/datum/job/royalknight = 1,
		/datum/job/bard = 0
	)
	