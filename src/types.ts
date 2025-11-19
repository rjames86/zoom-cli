export type ON_OFF = "ON" | "OFF";
export type OPEN_CLOSED = "OPEN" | "CLOSED";

export type ZoomState = {
	audioState: ON_OFF;
	videoState: ON_OFF;
	inMeeting: boolean;
	participantsStatus: OPEN_CLOSED;
	chatStatus: OPEN_CLOSED;
};
