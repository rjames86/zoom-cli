#!/usr/bin/env node

import {
	getZoomState,
	toggleAudio,
	toggleVideo,
	toggleParticipants,
	toggleChat,
	leaveMeeting,
} from "./zoom";

const commands = {
	status: async () => {
		const state = await getZoomState();
		console.log(JSON.stringify(state, null, 2));
	},
	"toggle-audio": async () => {
		const result = await toggleAudio();
	},
	"toggle-video": async () => {
		const result = await toggleVideo();
	},
	"toggle-participants": async () => {
		const result = await toggleParticipants();
	},
	"toggle-chat": async () => {
		const result = await toggleChat();
	},
	leave: async () => {
		await leaveMeeting();
		console.log("Left meeting");
	},
	help: async () => {
		console.log(`
Zoom CLI - Control Zoom meetings from the command line

Usage: zoom-cli <command>

Commands:
  status              Get current Zoom meeting status
  toggle-audio        Toggle audio mute/unmute
  toggle-video        Toggle video on/off
  toggle-participants Toggle participants panel
  toggle-chat         Toggle chat panel
  leave               Leave current meeting
  help                Show this help message

Example:
  zoom-cli status
  zoom-cli toggle-audio
		`);
	},
};

async function main() {
	const command = process.argv[2];

	if (!command || !(command in commands)) {
		await commands.help();
		process.exit(command ? 1 : 0);
	}

	try {
		await commands[command as keyof typeof commands]();
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
