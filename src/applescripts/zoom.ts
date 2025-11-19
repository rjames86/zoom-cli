export const ZOOM_STATE_SCRIPT = `

set videoStatus to "OFF"
set audioStatus to "OFF"
set inMeeting to true
set participantsStatus to "CLOSED"
set chatStatus to "CLOSED"

try
	tell application "System Events"
		-- First check if zoom.us process exists
		if not (exists process "zoom.us") then
			set inMeeting to false
		end if

		delay 1
		tell process "zoom.us"
			try
				set menuItems to name of every menu item of menu 1 of menu bar item "Meeting" of menu bar 1
				set viewItems to name of every menu item of menu 1 of menu bar item "View" of menu bar 1

				if menuItems contains "Start video" then
					set videoStatus to "OFF"
				else if menuItems contains "Stop video" then
					set videoStatus to "ON"
				end if

				if menuItems contains "Unmute audio" then
					set audioStatus to "OFF"
				else if menuItems contains "Mute audio" then
					set audioStatus to "ON"
				end if

				-- Check participants panel status
				if viewItems contains "Show participants" then
					set participantsStatus to "CLOSED"
				else if viewItems contains "Close participants" then
					set participantsStatus to "OPEN"
				end if

				-- Check chat panel status
				if viewItems contains "Show chat" then
					set chatStatus to "CLOSED"
				else if viewItems contains "Close chat" then
					set chatStatus to "OPEN"
				end if
			on error
				set inMeeting to false
			end try
		end tell
	end tell
on error
	set inMeeting to false
end try

do shell script "echo audioStatus:" & (audioStatus as text) & ",videoStatus:" & (videoStatus as text) & ",inMeeting:" & (inMeeting as text) & ",participantsStatus:" & (participantsStatus as text) & ",chatStatus:" & (chatStatus as text)

`;

const TOGGLE_MENU_ITEM = (
	menuName: "Meeting" | "View",
	startCommand: string,
	stopCommand: string
) => `
on toggleMeetingMenu(startCommand, stopCommand)
	tell application "System Events"
		-- First check if zoom.us process exists
		if not (exists process "zoom.us") then
			return "NO_MEETING"
		end if

		tell process "zoom.us"
			-- Check if Meeting menu exists
			if not (exists menu bar item "Meeting" of menu bar 1) then
				return "NO_MEETING"
			end if

			set menuItems to name of every menu item of menu 1 of menu bar item "${menuName}" of menu bar 1

			if menuItems contains startCommand then
				click menu item startCommand of menu 1 of menu bar item "${menuName}" of menu bar 1
			else if menuItems contains stopCommand then
				click menu item stopCommand of menu 1 of menu bar item "${menuName}" of menu bar 1
			end if
		end tell
	end tell
end toggleMeetingMenu

toggleMeetingMenu("${startCommand}", "${stopCommand}")
`;

export const TOGGLE_MEETING_MENU = (
	startCommand: string,
	stopCommand: string
) => TOGGLE_MENU_ITEM("Meeting", startCommand, stopCommand);

export const TOGGLE_VIEW_MENU = (startCommand: string, stopCommand: string) =>
	TOGGLE_MENU_ITEM("View", startCommand, stopCommand);

export const LEAVE_MEETING = `
tell application "System Events"
	if exists process "zoom.us" then
		tell process "zoom.us"
			if exists window "Zoom Meeting" then
				set endButton to the first button of window "Zoom Meeting" whose accessibility description is "End"
				click endButton

				delay 0.25

				set allWindows to every window
				set foundButton to false

				repeat with currentWindow in allWindows
					try
						set buttonsInWindow to (buttons of currentWindow whose accessibility description is "Leave meeting")
						if (count of buttonsInWindow) > 0 then
							set foundButton to item 1 of buttonsInWindow
							exit repeat
						end if
					end try
				end repeat

				if foundButton is not false then
					click foundButton
				else
					-- Button not found
				end if
			else
				return "NO_MEETING"
			end if
		end tell
	else
		return "NO_MEETING"
	end if
end tell
`;
