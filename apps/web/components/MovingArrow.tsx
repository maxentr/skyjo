"use client"

import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

type Props = {
  href: string
}

const MovingArrow = ({ href }: Props) => {
  return (
    <motion.a
      href={href}
      initial={{ translateY: 0 }}
      animate={{ translateY: "12px" }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <ArrowDown />
    </motion.a>
  )
}

export default MovingArrow
