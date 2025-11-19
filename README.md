# Zoom CLI

Node module and CLI for controlling Zoom meetings on macOS using AppleScript.

## Requirements

- macOS
- Node.js >= 18.0.0
- Zoom desktop application

## Installation

### Via Homebrew (Recommended)

```bash
brew tap rjames86/tap
brew install zoom-cli
```

### Via npm (from GitHub)

```bash
npm install -g https://github.com/rjames86/zoom-cli.git
```

### As a project dependency

```bash
npm install https://github.com/rjames86/zoom-cli.git
```

## Usage

### CLI

```bash
# Get current Zoom meeting status
zoom-cli status

# Toggle audio mute/unmute
zoom-cli toggle-audio

# Toggle video on/off
zoom-cli toggle-video

# Toggle participants panel
zoom-cli toggle-participants

# Toggle chat panel
zoom-cli toggle-chat

# Leave current meeting
zoom-cli leave

# Show help
zoom-cli help
```

### As a Node Module

```typescript
import {
  getZoomState,
  toggleAudio,
  toggleVideo,
  toggleParticipants,
  toggleChat,
  leaveMeeting,
  type ZoomState,
} from 'zoom-cli';

// Get current meeting state
const state: ZoomState = await getZoomState();
console.log(state);
// {
//   audioState: 'ON' | 'OFF',
//   videoState: 'ON' | 'OFF',
//   inMeeting: true | false,
//   participantsStatus: 'OPEN' | 'CLOSED',
//   chatStatus: 'OPEN' | 'CLOSED'
// }

// Toggle audio
const audioState = await toggleAudio(); // Returns 'ON' | 'OFF'

// Toggle video
const videoState = await toggleVideo(); // Returns 'ON' | 'OFF'

// Toggle participants panel
const participantsState = await toggleParticipants(); // Returns 'OPEN' | 'CLOSED'

// Toggle chat panel
const chatState = await toggleChat(); // Returns 'OPEN' | 'CLOSED'

// Leave meeting
await leaveMeeting();
```

## API

### `getZoomState(): Promise<ZoomState>`

Returns the current state of the Zoom meeting.

**Returns:**
```typescript
{
  audioState: 'ON' | 'OFF',
  videoState: 'ON' | 'OFF',
  inMeeting: boolean,
  participantsStatus: 'OPEN' | 'CLOSED',
  chatStatus: 'OPEN' | 'CLOSED'
}
```

### `toggleAudio(): Promise<'ON' | 'OFF'>`

Toggles the audio mute/unmute state. Returns the new state.

### `toggleVideo(): Promise<'ON' | 'OFF'>`

Toggles the video on/off state. Returns the new state.

### `toggleParticipants(): Promise<'OPEN' | 'CLOSED'>`

Toggles the participants panel. Returns the new state.

### `toggleChat(): Promise<'OPEN' | 'CLOSED'>`

Toggles the chat panel. Returns the new state.

### `leaveMeeting(): Promise<void>`

Leaves the current meeting.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```

## Distribution

For information about publishing and maintaining this package via Homebrew, see [HOMEBREW_GUIDE.md](HOMEBREW_GUIDE.md).

## How it Works

This tool uses AppleScript to interact with the Zoom desktop application through macOS's System Events. It reads the menu items to determine the current state and clicks menu items to perform actions.

## Permissions

macOS may prompt you to grant permissions for:
- Accessibility access
- Screen recording (for some operations)

Grant these permissions in System Preferences > Security & Privacy > Privacy.

## License

MIT
