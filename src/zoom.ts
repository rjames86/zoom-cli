import osascript from "node-osascript";

import {
	TOGGLE_VIEW_MENU,
	TOGGLE_MEETING_MENU,
	ZOOM_STATE_SCRIPT,
	LEAVE_MEETING,
} from "./applescripts/zoom";
import { ON_OFF, OPEN_CLOSED, ZoomState } from "./types";

// "audioStatus:MUTED,videoStatus:VIDEO_OFF,inMeeting:true,participantsStatus:CLOSED,chatStatus:CLOSED"
const parseZoomState = (result: string): ZoomState => {
	const [audioStatus, videoStatus, inMeeting, participantsStatus, chatStatus] =
		result.split(",");
	return {
		audioState: audioStatus.split(":")[1] as ON_OFF,
		videoState: videoStatus.split(":")[1] as ON_OFF,
		participantsStatus: participantsStatus.split(":")[1] as OPEN_CLOSED,
		chatStatus: chatStatus.split(":")[1] as OPEN_CLOSED,
		inMeeting: inMeeting.split(":")[1] === "true",
	};
};

const runAppleScript = async <T>(
	script: string,
	resolveHandler: Function = (result: T) => result
): Promise<T> =>
	new Promise((resolve, reject) => {
		osascript.execute(script, (err: any, result: T) => {
			if (err) return reject(err);
			resolve(resolveHandler(result));
		});
	});

export const getZoomState = async (): Promise<ZoomState> =>
	runAppleScript<ZoomState>(ZOOM_STATE_SCRIPT, parseZoomState);

export const toggleAudio = async (): Promise<ON_OFF> =>
	runAppleScript<ON_OFF>(TOGGLE_MEETING_MENU("Unmute audio", "Mute audio"));

export const toggleVideo = async (): Promise<ON_OFF> =>
	runAppleScript<ON_OFF>(TOGGLE_MEETING_MENU("Start video", "Stop video"));

export const toggleParticipants = async (): Promise<OPEN_CLOSED> =>
	runAppleScript<OPEN_CLOSED>(
		TOGGLE_VIEW_MENU("Show participants", "Close participants")
	);

export const toggleChat = async (): Promise<OPEN_CLOSED> =>
	runAppleScript<OPEN_CLOSED>(TOGGLE_VIEW_MENU("Show chat", "Close chat"));

export const leaveMeeting = async (): Promise<void> =>
	runAppleScript<void>(LEAVE_MEETING);
