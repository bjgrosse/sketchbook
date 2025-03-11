# Input System Documentation

## Overview

The Input System in Sketchbook provides a flexible and extensible framework for handling user input across various devices and control schemes. It manages keyboard, mouse, and touch inputs, routes them to the appropriate receiver, and provides a clean abstraction for input-based interactions.

## Core Components

### 1. Input Manager

The `InputManager` class is the central hub for all input processing:

```typescript
export class InputManager {
    private domElement: any;
    private actions: { [action: string]: KeyBinding } = {};
    private keyStates: { [key: string]: boolean } = {};
    private receiver: IInputReceiver;
    // ...
}
```

Key responsibilities:
- Capturing raw input events from DOM
- Maintaining input state
- Routing input to current receiver
- Supporting multiple input methods
- Handling input conflicts

### 2. Input Receiver Interface

Input receivers implement the `IInputReceiver` interface:

```typescript
export interface IInputReceiver {
    actions: { [action: string]: KeyBinding };
    
    handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void;
    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void;
    handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
    handleMouseWheel(event: WheelEvent, value: number): void;
    // ...
}
```

Common input receivers include:
- Characters
- Vehicles
- Camera operators
- UI elements

### 3. Key Binding System

The `KeyBinding` class manages individual input bindings:

```typescript
export class KeyBinding {
    public eventCodes: string[];
    public isPressed: boolean = false;
    public justPressed: boolean = false;
    public justReleased: boolean = false;

    constructor(eventCodes: string | string[]) {
        if (typeof eventCodes === 'string') {
            this.eventCodes = [eventCodes];
        } else {
            this.eventCodes = eventCodes;
        }
    }
}
```

Features:
- Support for multiple key codes per action
- Tracking of press/release state
- Just-pressed and just-released detection
- Configurable bindings

### 4. Input Delegation

The InputManager delegates input to the current active receiver:

```typescript
// Example of input delegation
public setInputReceiver(receiver: IInputReceiver): void {
    this.receiver = receiver;
}

private handleKeyDown(event: KeyboardEvent): void {
    // Update key state
    this.keyStates[event.code] = true;
    
    // Pass to current receiver
    if (this.receiver !== undefined) {
        this.receiver.handleKeyboardEvent(event, event.code, true);
    }
}
```

This allows for seamless transitions between different control contexts, such as:
- Switching from character to vehicle control
- Activating UI or menu navigation
- Temporary camera control modes

### 5. Mouse Input Handling

The system handles various mouse inputs:

- Mouse movement for camera control
- Mouse buttons for actions
- Mouse wheel for zooming or scrolling
- Pointer lock for seamless 3D control

```typescript
// Mouse movement handling
private handleMouseMove(event: MouseEvent): void {
    if (this.receiver !== undefined) {
        // Calculate delta movement
        const deltaX = event.movementX;
        const deltaY = event.movementY;
        
        this.receiver.handleMouseMove(event, deltaX, deltaY);
    }
}
```

### 6. Touch Input Support

For mobile devices, the input system translates touch events to equivalent mouse/keyboard actions:

- Touch and drag for movement
- Multi-touch gestures
- Virtual buttons for key inputs
- Orientation-based inputs

## Input Processing Flow

The general flow of input processing is:

1. DOM events captured by InputManager
2. Events translated to standard internal format
3. Input state updated
4. Input delegated to current active receiver
5. Receiver processes input based on current state
6. Actions triggered based on input

## Action Mapping

Actions are mapped to specific keys or input combinations:

```typescript
// Example action mapping for character
this.actions = {
    'up': new KeyBinding('KeyW'),
    'down': new KeyBinding('KeyS'),
    'left': new KeyBinding('KeyA'),
    'right': new KeyBinding('KeyD'),
    'jump': new KeyBinding('Space'),
    'sprint': new KeyBinding('ShiftLeft'),
    'interact': new KeyBinding('KeyE'),
};
```

This abstraction allows:
- Easy remapping of controls
- Context-sensitive input handling
- Multi-key bindings
- Input visualization in UI

## Advanced Features

### 1. Input Buffering

For certain actions, the system can implement input buffering:

- Short-term memory of recently pressed inputs
- Allows for timing-forgiving combos
- Improved responsiveness for jumps, actions, etc.

### 2. Input Contexts

The system supports different input contexts:

- Normal gameplay
- Vehicle control
- UI navigation
- Camera control
- Debug modes

Each context can have its own set of bindings and handling logic.

### 3. Input Visualization

The input system facilitates input visualization in the UI:

- Key prompts for available actions
- Input feedback
- Control remapping UI

## Integration with Other Systems

The Input System interacts closely with:

1. **Character System**: For controlling character movement and actions
2. **Vehicle System**: For vehicle-specific controls
3. **Camera System**: For camera movement and modes
4. **UI System**: For menu navigation and UI interaction

## Customization

The Input System can be customized in several ways:

1. **Key Remapping**: Change key bindings for actions
2. **Custom Receivers**: Create new input receivers for special functionality
3. **Input Modes**: Define additional input contexts
4. **Device Support**: Extend for additional input devices
5. **Gesture Recognition**: Add custom gesture detection

## Debug Features

The Input System includes debugging capabilities:

- Input state visualization
- Key binding inspection
- Input event logging
- Simulated input for testing

## Usage Example

```javascript
// Setting up input for a character
const inputManager = new InputManager(document);

// Create character with actions
const character = new Character();
character.actions = {
    'up': new KeyBinding('KeyW'),
    'down': new KeyBinding('KeyS'),
    'left': new KeyBinding('KeyA'),
    'right': new KeyBinding('KeyD'),
    'jump': new KeyBinding('Space'),
};

// Set character as input receiver
inputManager.setInputReceiver(character);

// Later, switch to vehicle control
character.enterVehicle(car, car.seats[0]);
inputManager.setInputReceiver(car);
``` 