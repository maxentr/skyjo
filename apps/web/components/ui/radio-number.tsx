import { cva } from "class-variance-authority"

const classValue = cva(
  "h-8 w-8 flex items-center justify-center rounded-md border-2 border-black cursor-pointer",
  {
    variants: {
      selected: {
        true: " bg-button",
        false: "bg-white",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
  },
)

interface RadioNumberProps {
  name: string
  max: number
  selected: number
  onChange: (value: number) => void
  title?: string
  disabled?: boolean
  disabledRadioNumber?: number[]
}

const RadioNumber = ({
  selected,
  max,
  onChange,
  name,
  title,
  disabled = false,
  disabledRadioNumber = [],
}: RadioNumberProps) => {
  return (
    <div className="flex flex-row gap-1 items-center">
      {Array.from({ length: max }, (_, index) => index + 1).map((index) => (
        <label
          htmlFor={`${name}-${index}`}
          className={classValue({
            selected: selected === index,
            disabled: disabled || disabledRadioNumber.includes(index),
          })}
          title={title?.replace("$number", index.toString())}
          key={index}
        >
          {index}
          <input
            type="radio"
            name={name}
            id={`${name}-${index}`}
            value={index}
            checked={selected === index}
            onChange={(e) => onChange(+e.target.value)}
            disabled={disabled || disabledRadioNumber.includes(index)}
            hidden
          />
        </label>
      ))}
    </div>
  )
}

export default RadioNumber
