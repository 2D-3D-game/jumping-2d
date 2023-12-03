import { _decorator, Component, Node, Input, EventMouse, Vec3, Animation } from 'cc';
import { GameState, GameManager, eventTarget } from './GameManager';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40;

@ccclass('PlayerController')
export class PlayerController extends Component {

    @property(Animation)
    BodyAnim: Animation = null;
    private _startJump: boolean = false;
    private _jumpStep: number = 0;
    private _jumpTime: number = 0.1;
    private _curJumpTime: number = 0;
    private _curJumpSpeed: number = 0;
    private _curPos: Vec3 = new Vec3();
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    private _targetPos: Vec3 = new Vec3();
    private _curMoveIndex: number = 0;
    playerState = true;

    start() {
        const input = new Input();
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        // this.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    reset() {
        this._curMoveIndex = 0;
    }

    oneStepStart() {
        this.playerState = false;
    }

    oneStepEnd() {
        this.playerState = true;
    }

    twoStepStart() {
        this.playerState = false;
    }

    twoStepEnd() {
        this.playerState = true;
    }

    onMouseUp(event: EventMouse) {
        if (this.playerState && GameManager.currentGameState == GameState.GS_REAL_PLAYING) {
            if (event.getButton() === EventMouse.BUTTON_LEFT) {
                this.jumpByStep(1);
                this.BodyAnim.play('oneStep');
            } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
                this.jumpByStep(2);
                this.BodyAnim.play('twoStep');
            }
        }
    }

    update(deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.onOnceJumpEnd(); 
            } else {
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    onOnceJumpEnd() {
        // this.node.emit('JumpEnd', this._curMoveIndex);
        eventTarget.emit('JumpEnd', this._curMoveIndex);
    }

    jumpByStep(step: number) {
        const clipName = step == 1 ? 'oneStep' : 'twoStep';
        const state = this.BodyAnim.getState(clipName);
        this._jumpTime = state.duration;

        if (this._startJump) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0));

        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }

        this._curMoveIndex += step;
    }
}


