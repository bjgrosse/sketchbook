import * as THREE from 'three';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { SpringSimulator } from '../../../physics/spring_simulation/SpringSimulator';
export declare const SPRING_SIMULATOR: SpringSimulator;
export declare class OpenVehicleDoor extends CharacterStateBase {
    private seat;
    private entryPoint;
    private hasOpenedDoor;
    private startPosition;
    private endPosition;
    private startRotation;
    private endRotation;
    private factorSimulator;
    constructor(character: Character, seat: VehicleSeat, entryPoint: THREE.Object3D);
    reset(): void;
    update(timeStep: number): void;
}
