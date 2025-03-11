# World System Documentation

## Overview

The World System is the foundation of the Sketchbook framework, managing the overall game environment, scene setup, and coordination between different subsystems. It serves as the central hub that connects physics, rendering, character control, and other core functionalities.

## Core Components

### 1. Scene Management

The World class manages the Three.js scene which contains all visual elements:

- Scene initialization and configuration
- Lighting setup (ambient, directional, and point lights)
- Camera setup and management
- Renderer configuration
- Post-processing effects

### 2. Physics World Integration

The World class maintains a Cannon.js physics world that simulates all physical interactions:

```typescript
// Physics initialization
this.physicsWorld = new CANNON.World();
this.physicsWorld.gravity.set(0, -9.81, 0);
this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
this.physicsWorld.allowSleep = true;
```

Key features:
- Gravity configuration (default: -9.81 m/s² on Y-axis)
- SAPBroadphase for efficient collision detection
- Sleep states for inactive objects
- Configurable physics frame rate (default: 60 FPS)

### 3. Asset Loading and Management

The World System handles loading of assets and world objects:

- GLTF/GLB model loading
- Texture loading and management
- Scene parsing and object instantiation
- World object creation based on model metadata

### 4. Environmental Systems

The World manages various environmental systems:

- **Sky System**: Day/night cycle, atmospheric scattering
- **Ocean System**: Water rendering and physics
- **Terrain**: Ground collision and rendering

### 5. Entity Management

The World maintains collections of entities and handles their lifecycle:

- Characters (player and NPCs)
- Vehicles (cars, airplanes, helicopters)
- Interactive objects
- Collision objects

```typescript
// Entity collections
public characters: Character[] = [];
public vehicles: Vehicle[] = [];
public cars: Car[] = [];
```

### 6. Update Loop

The World manages the game update loop, ensuring all systems are updated in the correct order:

```typescript
public update(timeStep: number, unscaledTimeStep: number): void {
    // Update world entities
    this.updateEntities(timeStep);
    
    // Update physics
    this.updatePhysics(timeStep);
    
    // Update rendering
    this.render();
}
```

### 7. Scenario Management

The World supports different gameplay scenarios:

- Scenario loading and unloading
- Spawn point management
- Initial state setup
- Level transitions

## Key Files

- **World.ts**: Main world class implementing core functionality
- **Sky.ts**: Sky rendering and day/night cycle
- **Ocean.ts**: Water simulation and rendering
- **Scenario.ts**: Scenario management
- **Path.ts** & **PathNode.ts**: Path definition for AI and gameplay
- **VehicleSpawnPoint.ts** & **CharacterSpawnPoint.ts**: Spawn point management

## Integration with Other Systems

The World System interacts with all other core systems:

1. **Physics System**: Maintains the physics world and updates physics state
2. **Character System**: Manages character instances and their integration
3. **Vehicle System**: Handles vehicle spawning and management
4. **Input System**: Routes input to the appropriate receivers
5. **Camera System**: Manages camera positioning and effects

## Debug Features

The World System includes various debug features:

- Physics visualization (Cannon debug renderer)
- Performance metrics
- GUI controls for world parameters through dat.GUI
- Scene exploration tools

## Usage Example

```javascript
// Create a new world instance with a scene file
const world = new World('scene.glb');

// Configure world parameters
world.timeScale = 1.0;
world.params.Shadows = true;
world.params.Fog = true;

// Access world components
world.cameraOperator.setRadius(5);
world.physicsWorld.gravity.set(0, -20, 0); // stronger gravity

// Add event listeners
world.addEventListener('entity-added', (entity) => {
    console.log('New entity added:', entity);
});
```

## Customization

The World System can be customized in several ways:

1. **Parameters**: Various rendering and physics parameters can be adjusted
2. **Scene Definition**: Custom scenes can be defined in Blender
3. **Event Handling**: Custom event listeners can be added
4. **Rendering Extensions**: Post-processing and shader effects can be added
5. **Environmental Settings**: Sky, lighting, and atmosphere can be customized 