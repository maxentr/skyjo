import { cn } from "@/lib/utils"

export type AutoCompleteChoice = {
  name: string
  value: string
  description?: string
}

type AutocompleteProps = {
  choices: AutoCompleteChoice[]
  onSelect: (choice: string) => void
  selectedIndex: number
}

const Autocomplete = ({
  choices,
  onSelect,
  selectedIndex,
}: AutocompleteProps) => {
  return (
    <div className="absolute bottom-full left-0 right-3 bg-white dark:bg-dark-input border-2 mb-2 border-black dark:border-dark-border rounded-md w-full max-h-32 overflow-y-auto select-none scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
      {choices.map((choice, index) => {
        return (
          <button
            key={choice.name}
            id={`autocomplete-option-${index}`}
            className={cn(
              "w-full px-3 py-1 flex flex-col items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-focus transition-colors duration-200",
              index === selectedIndex && "bg-gray-200 dark:bg-dark-input",
            )}
            onClick={() => onSelect(choice.value)}
          >
            <span className="text-sm text-black dark:text-dark-font">
              {choice.name}
            </span>
            {choice.description && (
              <span className="text-sm text-black dark:text-dark-font">
                {choice.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { Autocomplete }
