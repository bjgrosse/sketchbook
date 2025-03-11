# Physics System Documentation

## Overview
The project implements a sophisticated physics system using the Cannon.js physics engine (specifically cannon-es) integrated with Three.js for 3D rendering. The physics system is primarily focused on vehicle simulation, with special attention to car physics including suspension, engine forces, and air control.

## Core Components

### 1. World Physics
- Uses CANNON.World for physics simulation
- Gravity set to -9.81 m/s² on Y-axis
- Uses SAPBroadphase for collision detection
- Implements sleep states for performance optimization
- Physics runs at 60 FPS (physicsFrameRate)

### 2. Vehicle Base Class
The `Vehicle` class serves as the foundation for all vehicles in the system:

- Extends THREE.Object3D for 3D rendering
- Implements CANNON.RaycastVehicle for wheel physics
- Features:
  - Collision body with mass of 50 units
  - Customizable friction (default: 0.01)
  - Support for multiple seats
  - Wheel management
  - First/third person camera views

### 3. Car Physics Implementation

#### Basic Properties
- Uses CANNON.RaycastVehicle for wheel-based physics
- Implements All-Wheel Drive (AWD) system
- Tracks vehicle speed and gear states

#### Suspension System
Default configuration:
```typescript
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
- 5-speed transmission + reverse
- Gear speed limits:
  - Reverse: -4
  - Neutral: 0
  - 1st: 5
  - 2nd: 9
  - 3rd: 13
  - 4th: 17
  - 5th: 22
- Automatic gear shifting based on power factor
- Shift time: 0.2 seconds

#### Air Control System
The car implements a sophisticated air control system for when the vehicle is airborne:
- Tracks time spent in air (airSpinTimer)
- Maximum air spin magnitude: 2.0
- Air spin acceleration: 0.15
- Air control increases gradually over 2 seconds in air
- Influence factors:
  - Speed-based influence
  - Flip-over prevention system
  - Up-vector orientation

## Controls and Input

### Car Controls
- Throttle: W
- Reverse: S
- Brake: Space
- Steering Left: A
- Steering Right: D
- Exit Vehicle: F
- Switch Seat: X
- Toggle View: V

### Physics Interactions
1. **Ground Contact**
   - Monitors wheels in contact with ground
   - Implements automatic flip-over recovery
   - Adjusts handling based on surface contact

2. **Engine Forces**
   - Dynamic force application based on gear and speed
   - Power factor calculation for realistic acceleration
   - Automatic transmission system

3. **Steering**
   - Uses spring simulation for smooth steering
   - Implements steering wheel visual rotation
   - Drift correction system

## Performance Considerations
- Uses physics sleep states for inactive objects
- Implements broadphase collision detection
- Separate physics and render loops
- Optimized wheel ray casting

## Integration with Three.js
- Synchronizes physics body position/rotation with visual model
- Updates wheel transformations
- Handles camera following and transitions
- Manages model loading and setup

## Debug Features
- Optional physics debug rendering
- Axes helper for orientation
- Wheel contact visualization
- Speed and state monitoring 