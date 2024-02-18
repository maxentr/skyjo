import { SkyjoCardToJson } from "shared/types/skyjoCard.js"

interface SkyjoCardInterface {
  readonly value: number
  readonly isVisible: boolean

  turnVisible(): void
  toJson(): SkyjoCardToJson
}

export class SkyjoCard implements SkyjoCardInterface {
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

  public toJson() {
    return {
      value: this.isVisible ? this.value : undefined,
      isVisible: this.isVisible,
    }
  }
}
