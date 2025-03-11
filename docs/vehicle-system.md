# Vehicle System Documentation

## Overview

The Vehicle System in Sketchbook provides a flexible framework for implementing various vehicle types with realistic physics. It handles vehicle movement, player control, passenger management, and interaction with the world. The system supports different vehicle types including cars, helicopters, and airplanes.

## Core Components

### 1. Vehicle Base Class

The `Vehicle` abstract class serves as the foundation for all vehicle types:

- Extends THREE.Object3D for 3D rendering
- Implements physics using CANNON.RaycastVehicle
- Manages seats, doors, and entry/exit points
- Handles input processing for vehicle control
- Maintains visual components and wheel animations

```typescript
export abstract class Vehicle extends THREE.Object3D implements IWorldEntity {
    public updateOrder: number = 2;
    public abstract entityType: EntityType;
    
    public controllingCharacter: Character;
    public actions: { [action: string]: KeyBinding; } = {};
    public rayCastVehicle: CANNON.RaycastVehicle;
    public seats: VehicleSeat[] = [];
    public wheels: Wheel[] = [];
    // ...
}
```

### 2. Specialized Vehicle Types

The system includes several specialized vehicle implementations:

#### Car Class

- Implements realistic car physics with suspension
- Engine and transmission simulation
- Steering and braking
- Air control for jumps and stunts
- Automatic transmission with multiple gears

#### Helicopter Class

- Simplified helicopter physics model
- Rotors and lift simulation
- Stability and controls
- Hovering and vertical movement

#### Airplane Class

- Airplane physics with lift, drag, and thrust
- Wing dynamics
- Takeoff and landing mechanics
- Flight controls

### 3. Vehicle Components

#### Wheels

Wheels are managed through the Wheel class:
- Visual representation
- Connection to physics raycast wheel
- Suspension visualization
- Rotation and steering animation

#### Seats

The VehicleSeat class handles:
- Seat positions and entry/exit animations
- Character attachment to seats
- Connections between seats for switching
- Driver/passenger differentiation

#### Doors

The VehicleDoor class manages:
- Door open/close animations
- Entry/exit point definition
- Interaction triggers

### 4. Physics Implementation

Vehicle physics are primarily implemented using CANNON.RaycastVehicle:

```typescript
// Raycast vehicle setup
this.rayCastVehicle = new CANNON.RaycastVehicle({
    chassisBody: this.collision,
    indexUpAxis: 1,
    indexRightAxis: 0,
    indexForwardAxis: 2
});
```

Key physics features:
- Chassis body with mass and inertia
- Wheel raycasts for suspension
- Friction and material properties
- Suspension parameters (stiffness, damping, travel)
- Engine force application

### 5. Car Physics Details

Cars have specialized physics handling:

#### Suspension System
```typescript
// Car suspension setup
{
    radius: 0.25,
    suspensionStiffness: 20,
    suspensionRestLength: 0.35,
    maxSuspensionTravel: 1,
    frictionSlip: 0.8,
    dampingRelaxation: 2,
    dampingCompression: 2,
    rollInfluence: 0.8
}
```

#### Engine and Transmission
- Engine force: 500 units
- Multi-gear transmission simulation
- Power curve modeling
- Automatic gear shifting based on speed and load

#### Air Control System
- Mid-air rotational control
- Flip recovery
- Jump and stunt capabilities

### 6. Vehicle Entry and Exit

Vehicles implement a detailed entry/exit system:

- Character approach and alignment
- Door opening as needed
- Seat entry animation
- Character state transition
- Visibility toggling between character and vehicle
- Exit points and safety checks

### 7. Vehicle Controls

Each vehicle type implements its own control scheme:

#### Car Controls
- Throttle (W), Reverse (S), Brake (Space)
- Steering (A/D)
- Vehicle exit (F)
- Seat switching (X)
- Camera toggle (V)

#### Aircraft Controls
- Similar base controls with specialized functions
- Additional controls for altitude and specialized maneuvers

## Key Files

- **Vehicle.ts**: Abstract base class for all vehicles
- **Car.ts**: Car implementation
- **Helicopter.ts**: Helicopter implementation
- **Airplane.ts**: Airplane implementation
- **VehicleSeat.ts**: Seat management
- **VehicleDoor.ts**: Door functionality
- **Wheel.ts**: Wheel and suspension

## Vehicle Spawn System

Vehicles can be spawned in the world through the VehicleSpawnPoint system:

```typescript
// Spawning a vehicle
let vehicle: Vehicle = this.getNewVehicleByType(model, this.type);
vehicle.spawnPoint = this.object;
vehicle.setPosition(worldPos.x, worldPos.y + 1, worldPos.z);
world.add(vehicle);
```

Features:
- Type-based vehicle instantiation
- Position and rotation setup
- Initial vehicle state configuration
- Optional automatic character entry

## Integration with Other Systems

The Vehicle System interacts closely with other systems:

1. **World System**: For spawning and world integration
2. **Physics System**: For collision and movement simulation
3. **Character System**: For driver/passenger interaction
4. **Input System**: For processing player controls
5. **Camera System**: For vehicle-specific camera behavior

## Customization

Vehicles can be customized in several ways:

1. **Model Customization**: Different vehicle models
2. **Physics Tuning**: Adjustable suspension, engine parameters
3. **New Vehicle Types**: Extending the base Vehicle class
4. **Control Schemes**: Custom control bindings
5. **Visual Effects**: Custom effects for engines, wheels, etc.

## Debug Features

The Vehicle System includes debugging capabilities:

- Wheel contact visualization
- Suspension debugging
- Physics values visualization (speed, forces)
- Control input display

## Usage Example

```javascript
// Create a car
const car = new Car(carModel);

// Configure car physics
car.rayCastVehicle.chassisBody.mass = 800;

// Position the car
car.setPosition(0, 2, 0);

// Add to world
world.add(car);

// Make character enter the car
character.enterVehicle(car, car.seats[0]);
``` 