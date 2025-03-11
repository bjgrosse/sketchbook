# Sketchbook Framework Overview

## Introduction

Sketchbook is a web-based game engine built on [three.js](https://github.com/mrdoob/three.js) and [cannon-es](https://github.com/pmndrs/cannon-es) physics, focused on third-person character controls and related gameplay mechanics. It serves as a playground for exploring and implementing conventional third-person gameplay mechanics found in modern games.

## Project Structure

The project is organized into several core systems and modules:

```
src/
├── ts/                   # TypeScript source code
│   ├── characters/       # Character system implementation
│   ├── core/             # Core functionality and utilities
│   ├── enums/            # Enumeration types
│   ├── interfaces/       # TypeScript interfaces
│   ├── physics/          # Physics system implementation
│   ├── vehicles/         # Vehicle system implementation
│   ├── world/            # World and environment
│   └── sketchbook.ts     # Main entry point
├── css/                  # Stylesheets
├── img/                  # Images and textures
├── lib/                  # External libraries
└── blend/                # Blender assets
```

## Core Systems

### 1. World System

The world system manages the overall game environment, including:

- Three.js scene setup and management
- Cannon.js physics world integration
- World object loading and initialization
- Asset loading and management
- Day/night cycle with sky system
- Scene serialization and deserialization
- Scenario management

Key files:
- `World.ts`: Main world class that coordinates all other systems
- `Sky.ts`: Sky and environmental lighting
- `Ocean.ts`: Water rendering and physics
- `Scenario.ts`: Game scenario management

### 2. Character System

The character system provides comprehensive character control and animation:

- Third-person camera control
- Character state machine architecture
- Raycast character controller with capsule collisions
- Character physics and movement
- Animation management and blending
- Character AI and pathfinding
- Interaction with vehicles and objects

Key files:
- `Character.ts`: Base character implementation
- `character_states/`: State machine implementations for different actions
- `character_ai/`: AI behaviors and decision making

### 3. Physics System

The physics system handles all physical interactions in the world:

- Cannon.js physics integration
- Collision detection and resolution
- Character capsule collisions
- Vehicle physics including suspension, engine forces
- Terrain collisions and interaction
- Performance optimizations for physics calculations

Key files:
- `physics/colliders/`: Various collider implementations
- `physics/spring_simulation/`: Spring physics for suspension and animation

### 4. Vehicle System

The vehicle system implements various vehicle types and their behaviors:

- Base vehicle class with common functionality
- Car physics with realistic suspension and engine modeling
- Aircraft (helicopter and airplane) physics
- Vehicle entry/exit mechanics
- Vehicle-specific controls and camera positioning
- Multiple seat positions with transitions

Key files:
- `Vehicle.ts`: Base vehicle class
- `Car.ts`: Car-specific implementation
- `Helicopter.ts`: Helicopter-specific implementation
- `Airplane.ts`: Airplane-specific implementation

### 5. Input System

The input system manages user input and control mappings:

- Keyboard and mouse input handling
- Gamepad support
- Configurable key bindings
- Input abstraction for different control schemes
- Input delegation to active entity

Key files:
- `InputManager.ts`: Central input management
- `KeyBinding.ts`: Key binding configuration
- `IInputReceiver.ts`: Interface for objects receiving input

### 6. Camera System

The camera system provides various camera modes and behaviors:

- Third-person follow camera
- First-person view
- Camera collision detection
- Smooth camera transitions
- Camera effects and post-processing

Key files:
- `CameraOperator.ts`: Camera control and management

## Architecture and Design Patterns

Sketchbook employs several key design patterns:

1. **Component-Entity System**: World entities are composed of various components
2. **State Machine Pattern**: Used for character states and AI behaviors
3. **Observer Pattern**: For event handling and communication
4. **Interface-based Design**: Clean abstractions through TypeScript interfaces
5. **Factory Pattern**: For creating entities and components

## Integration with External Tools

- **Blender Integration**: Custom scene format for importing Blender scenes
- **three.js**: Core rendering engine
- **cannon-es**: Physics simulation
- **Webpack**: Build system and module bundling

## Usage and Extension

The framework is designed to be extended with:

1. Custom character behaviors through the state machine
2. New vehicle types by extending the base vehicle class
3. Custom scenarios through the scenario system
4. Modified physics parameters for different gameplay feels
5. Custom UI overlays for game-specific information

## Debug Features

Sketchbook includes various debug features:

- Physics visualization
- Performance metrics
- State debugging
- Camera debugging tools

## Build and Development

The project uses:
- TypeScript for type-safe code
- Webpack for bundling and development server
- NPM for package management
- Various loaders for assets and resources 