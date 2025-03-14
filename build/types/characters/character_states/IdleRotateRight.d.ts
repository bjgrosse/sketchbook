import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
export declare class IdleRotateRight extends CharacterStateBase implements ICharacterState {
    constructor(character: Character);
    reset(): void;
    update(timeStep: number): void;
    onInputChange(): void;
}
