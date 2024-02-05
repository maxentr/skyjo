import { SkyjoCardToJSON } from "shared/types/SkyjoCard"

interface ISkyjoCardToJSON {
  readonly value: number
  readonly isVisible: boolean

  turnVisible(): void
  toJSON(): SkyjoCardToJSON
}

export class SkyjoCard implements ISkyjoCardToJSON {
  private _value: number
  private _isVisible: boolean = false

  constructor(value: number) {
    this._value = value
  }

  public get value() {
    return this._value
  }

  public get isVisible() {
    return this._isVisible
  }

  private set isVisible(value: boolean) {
    this._isVisible = value
  }

  public turnVisible() {
    this.isVisible = true
  }

  public toJSON() {
    return {
      value: this.isVisible ? this.value : undefined,
      isVisible: this.isVisible,
    }
  }
}
