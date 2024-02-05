// FisherYates Shuffle
export const shuffle = (array: number[], times = 1): number[] => {
  const shuffledArray = [...array]

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return times > 0 ? shuffle(shuffledArray, times - 1) : shuffledArray
}
