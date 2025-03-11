# Character System Documentation

## Overview

The Character System in Sketchbook provides a comprehensive framework for implementing player-controlled and AI characters. It handles character movement, physics, animation, state management, and interactions with the world and vehicles.

## Core Components

### 1. Character Base Class

The `Character` class is the foundation of the character system:

- Extends THREE.Object3D for 3D rendering
- Implements character physics with a capsule collider
- Handles animations and model representation
- Manages character state transitions
- Processes input and controls character movement

### 2. State Machine Architecture

Characters use a robust state machine to manage different behaviors and actions:

```typescript
// State transition example
public setState(state: ICharacterState): void {
    this.charState = state;
    this.charState.onInputChange();
}
```

Common character states include:
- Idle
- Walk/Run
- Jump
- Fall
- Swim
- Vehicle entry/exit
- Seat switching
- Death

Each state has its own implementation with specific behaviors, animations, and transitions.

### 3. Character Physics

The character uses a capsule collider for physics interactions:

- Capsule collider attached to a CANNON.Body
- Raycast-based ground detection
- Custom movement handling for slopes and stairs
- Velocity-based movement with acceleration and deceleration
- Gravity and jump physics

```typescript
// Capsule setup example
this.characterCapsule = new CapsuleCollider({
    mass: 1,
    position: new CANNON.Vec3(),
    height: 0.5,
    radius: 0.25,
    segments: 8,
    friction: 0.0
});
```

### 4. Animation System

Characters use a sophisticated animation system:

- Animation mixer for blending animations
- Crossfading between animation states
- Animation weights for partial blending
- Root motion extraction
- Procedural animation for specific movements

### 5. Character Controls

The character handles various forms of input:

- Keyboard and mouse for movement and actions
- Input processing based on current state
- Camera-relative movement
- Configurable control bindings

### 6. Interaction System

Characters can interact with the world and objects:

- Vehicle entry and exit
- Object interaction
- Collision response
- Environmental interaction (swimming, climbing)

### 7. Character AI

AI-controlled characters use pathfinding and behavior systems:

- Pathfinding on predefined paths
- Simple decision making
- State-based behaviors
- Target following and obstacle avoidance

## Key Files

- **Character.ts**: Main character implementation
- **character_states/**: Various character state implementations
  - **Idle.ts**, **Walk.ts**, **Jump.ts**, etc.
  - **vehicles/**: States related to vehicle interaction
- **character_ai/**: AI behavior implementations
- **GroundImpactData.ts**: Data for ground impact events
- **VehicleEntryInstance.ts**: Management of vehicle entry process

## Character States

The character state system is hierarchical, with specialized states for different situations:

1. **Basic Movement States**:
   - **Idle**: Character standing still
   - **Walk**: Basic walking movement
   - **Run**: Faster movement
   - **Sprint**: Maximum speed movement
   - **Jump**: Jumping action
   - **Fall**: Falling when not on ground

2. **Specialized States**:
   - **Swim**: Swimming in water
   - **Opening**: Interacting with objects
   - **ClimbingLadder**: Climbing up/down ladders

3. **Vehicle-Related States**:
   - **EnteringVehicle**: Transitioning into a vehicle
   - **ExitingVehicle**: Getting out of a vehicle
   - **SwitchingSeats**: Moving between vehicle seats
   - **Driving**: Controlling a vehicle

### State Transitions

States have several methods that control transitions:

```typescript
interface ICharacterState {
    canFindVehiclesToEnter: boolean;
    canEnterVehicles: boolean;
    canLeaveVehicles: boolean;
    update(timeStep: number): void;
    onInputChange(): void;
}
```

## Character Physics and Movement

Character movement is implemented through a combination of physics forces and direct transformation:

1. **Velocity-Based Movement**:
   - Input direction converted to velocity
   - Acceleration and deceleration curves
   - Collision response handling

2. **Raycast Ground Detection**:
   - Detects ground beneath character
   - Provides surface normal for slope handling
   - Determines surface material for footstep sounds

3. **Jump and Fall**:
   - Jump implemented as impulse force
   - Fall controlled by gravity
   - Landing detection and response

## Integration with Other Systems

The Character System interacts closely with other systems:

1. **World System**: For spawning and world interaction
2. **Physics System**: For collision and movement
3. **Vehicle System**: For entering, exiting, and controlling vehicles
4. **Input System**: For processing player controls
5. **Camera System**: For third-person view and camera following

## Character Customization

Characters can be customized in several ways:

1. **Model Customization**: Different character models can be loaded
2. **Animation Overrides**: Custom animations can be applied
3. **State Customization**: New states can be created for special behaviors
4. **Physics Tuning**: Physics parameters can be adjusted
5. **Control Customization**: Input bindings can be modified

## Debug Features

The Character System includes debugging capabilities:

- Visualization of character capsule
- State machine debugging
- Physics values visualization
- Animation debugging

## Usage Example

```javascript
// Create a character with a model
const character = new Character({
    model: characterModel,
    height: 1.8,
    radius: 0.25,
    mass: 1
});

// Add character to world
world.add(character);

// Set character as player-controlled
world.inputManager.setInputReceiver(character);

// Set up character for AI control
character.setBehaviour(new FollowPathBehaviour(path));
``` 