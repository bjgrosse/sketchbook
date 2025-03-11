# Sketchbook Simplification Plan: Car-Only Gameplay

## Overview

This document outlines the plan to simplify the Sketchbook framework by removing the character system and other vehicle types, focusing exclusively on direct car gameplay. The goal is to streamline the codebase and create a more focused driving experience where players spawn and play directly as cars.

## Current Architecture

The current system includes:
- Character System for player control
- Multiple vehicle types (Cars, Helicopters, Airplanes)
- Character-to-vehicle transitions
- Complex input systems handling multiple entity types
- Camera systems that accommodate different perspectives

## Target Architecture

The simplified architecture will:
- Remove the Character System entirely
- Keep only the Car vehicle type
- Allow players to spawn directly as cars
- Simplify input handling for car-only control
- Optimize camera behavior specifically for cars
- Remove vehicle switching mechanics

## Implementation Plan

### Phase 1: System Removal (Estimated time: 2-3 days)

#### 1.1 Remove Character System
- Delete all character-related files:
  - `Character.ts`
  - All files in `character_states/` directory
  - `CharacterSpawnPoint.ts`
  - Character animation and model files
- Remove character references from:
  - Vehicle system (entry/exit points)
  - Camera system (character following logic)
  - Input system (character controls)
  - World system (character spawning and management)

#### 1.2 Remove Non-Car Vehicles
- Delete non-car vehicle implementations:
  - `Helicopter.ts`
  - `Airplane.ts`
  - Any other specialized vehicle types
- Remove vehicle type detection and conditional handling
- Remove specialized vehicle components (rotors, wings, etc.)
- Update vehicle factory classes to only instantiate cars

### Phase 2: Car System Enhancement (Estimated time: 2-3 days)

#### 2.1 Direct Car Control Implementation
- Modify `Car.ts` to directly implement `IInputReceiver`
- Update car class to handle input without requiring a character:
```typescript
// Car.ts
export class Car extends Vehicle implements IInputReceiver {
    // Define input actions directly on car
    public actions = {
        'accelerate': new KeyBinding('KeyW'),
        'brake': new KeyBinding('KeyS'),
        'left': new KeyBinding('KeyA'),
        'right': new KeyBinding('KeyD'),
        'handbrake': new KeyBinding('Space'),
        'horn': new KeyBinding('KeyH'),
        'reset': new KeyBinding('KeyR')
    };

    // Handle input directly
    public handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void {
        // Map input directly to car controls
        // No need for character-based input routing
    }
}
```

#### 2.2 Simplify Vehicle Base Class
- Update `Vehicle.ts` to focus only on car-specific functionality
- Remove seat management and character attachment points
- Remove door animations and entry/exit logic
- Simplify vehicle physics to focus on car handling

#### 2.3 Enhance Car Physics and Controls
- Fine-tune car physics for direct player control
- Improve handling, acceleration, and braking feel
- Add additional car control features (drift, boost, etc.)
- Implement car damage and repair systems

### Phase 3: Supporting Systems Update (Estimated time: 3-4 days)

#### 3.1 Update World System
- Modify `World.ts` to initialize player as car directly
- Implement car respawn mechanics
- Create car checkpoint system
- Update entity management to handle only cars:
```typescript
// World.ts
export class World {
    // Remove character arrays
    // public characters: Character[] = [];
    
    // Keep only car references
    public cars: Car[] = [];
    public playerCar: Car; // Reference to player's car
    
    // Update spawn method
    public spawnPlayerAsCar(position: Vector3, rotation: Quaternion): void {
        const car = new Car(this.carModels.default);
        car.setPosition(position.x, position.y, position.z);
        car.quaternion.copy(rotation);
        
        this.playerCar = car;
        this.cars.push(car);
        this.add(car);
        
        // Set input receiver
        this.inputManager.setInputReceiver(car);
        
        // Set camera target
        this.cameraOperator.target = car;
        this.cameraOperator.followMode = true;
        this.cameraOperator.setCarCameraPosition();
    }
}
```

#### 3.2 Update Input System
- Simplify `InputManager.ts` to focus on car controls
- Remove input mappings for characters and other vehicles
- Enhance car-specific input handling for better driving feel
- Add support for different control schemes (keyboard, gamepad)

#### 3.3 Update Camera System
- Optimize `CameraOperator.ts` for car-specific views
- Implement multiple car camera modes:
  - Chase camera (third-person)
  - Hood view (close third-person)
  - Dashboard view (first-person)
  - Cinematic camera (beauty shots)
- Add smooth transitions between camera modes
- Improve collision detection for car cameras

#### 3.4 Create Car-Specific UI
- Implement car dashboard UI (speedometer, tachometer)
- Add car status indicators (damage, fuel if applicable)
- Create minimap or navigation aids
- Design respawn/reset UI elements

### Phase 4: Startup and Game Flow (Estimated time: 1-2 days)

#### 4.1 Update Game Initialization
- Modify startup sequence to spawn player as car immediately
- Create car selection menu if multiple car types are available
- Update scene loading to place cars at appropriate spawn points
- Implement save/load system for car state

#### 4.2 Refine Game Loop
- Update main game loop to focus on car simulation
- Optimize physics updates for car-only interactions
- Implement car-specific events and triggers
- Create race/time trial mechanics if needed

### Phase 5: Testing and Polish (Estimated time: 3-5 days)

#### 5.1 Comprehensive Testing
- Test car physics in various scenarios
- Validate camera behavior in different environments
- Verify input responsiveness and control feel
- Conduct performance testing with multiple cars

#### 5.2 Optimization and Polish
- Optimize car rendering and physics
- Add visual polish (particle effects, skid marks)
- Enhance audio for engine, collisions, and environment
- Fine-tune controls based on testing feedback

## Technical Considerations

### Modified Files
- `Vehicle.ts` - Simplify for car-only functionality
- `Car.ts` - Enhance for direct player control
- `VehicleSpawnPoint.ts` - Update to spawn player cars
- `InputManager.ts` - Refine for car-specific input
- `CameraOperator.ts` - Optimize for car camera views
- `World.ts` - Remove character references, simplify for cars

### Deleted Files
- All files in `character_states/` directory
- `Character.ts` and related character files
- `Helicopter.ts`, `Airplane.ts` and other vehicle types
- `VehicleSeat.ts` (unless repurposed for car passenger view)
- Character animation and model files

### Code Patterns to Watch For
- Character references in event handlers
- Vehicle type checking and branching code
- Character-based input routing
- Camera logic that assumes character presence
- Vehicle entry/exit logic

## Risks and Mitigations

### Risks
1. **Broken References**: Removing characters may break references throughout the codebase
   - **Mitigation**: Systematically search for character references and update or remove them

2. **Physics Issues**: Changing how vehicles are controlled could affect physics behavior
   - **Mitigation**: Incremental testing after each physics modification

3. **Camera Behavior**: Camera code might have dependencies on character positioning
   - **Mitigation**: Create new car-specific camera presets rather than modifying existing ones

4. **Game Flow Disruption**: Current scenarios might expect characters to exist
   - **Mitigation**: Modify scenario loading to account for car-only gameplay

## Future Extensions

After implementing this simplification, future development could include:
- Multiple car types with different handling characteristics
- Car customization and upgrade systems
- More advanced driving mechanics (drifting, stunts)
- AI-controlled opponent cars
- Track/race creation tools
- Multiplayer car gameplay

## Conclusion

This simplification will streamline the Sketchbook framework to focus solely on car gameplay, removing the complexity of the character system and other vehicle types. The result will be a more focused driving experience with optimized controls, physics, and camera behavior specifically for cars.

By implementing this plan in phases, we can systematically remove unnecessary components while enhancing the core car experience, resulting in a cleaner codebase and more engaging gameplay. 