import { SkyjoCardToJson } from "shared/types/skyjoCard"

interface SkyjoCardInterface {
  readonly value: number
  readonly isVisible: boolean

  turnVisible(): void
  toJson(): SkyjoCardToJson
}

export class SkyjoCard implements SkyjoCardInterface {
  private _value: number
  private _isVisible: boolean = false

  constructor(value: number, isVisible: boolean = false) {
    this._value = value
    this._isVisible = isVisible
  }

  get value() {
    return this._value
  }

  get isVisible() {
    return this._isVisible
  }

  turnVisible() {
    this.isVisible = true
  }

  toJson() {
    return {
      value: this.isVisible ? this.value : undefined,
      isVisible: this.isVisible,
    }
  }

  //#region private methods
  private set isVisible(value: boolean) {
    this._isVisible = value
  }
  //#endregion
}
