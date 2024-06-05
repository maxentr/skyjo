"use client"

import { Link } from "@/navigation"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

type Props = {
  href: string
}

const MovingArrow = ({ href }: Props) => {
  return (
    <Link href={href} data-testid="moving-arrow">
      <motion.div
        initial={{ translateY: 0 }}
        animate={{ translateY: "12px" }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <ArrowDown />
      </motion.div>
    </Link>
  )
}

export default MovingArrow
