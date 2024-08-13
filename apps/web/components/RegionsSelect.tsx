// "use client"

// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { useSocket } from "@/contexts/SocketContext"
// import { getRegionsResponseTime } from "@/lib/utils"
// import { useRouter } from "@/navigation"
// import { useTranslations } from "next-intl"
// import { useEffect, useState } from "react"
// import { API_REGIONS, ApiRegions, ApiRegionsTag } from "shared/constants"

// const RegionsSelect = () => {
//   const t = useTranslations("components.RegionsSelect")
//   const { region, changeRegion } = useSocket()
//   const router = useRouter()

//   const [regions, setRegions] = useState<Array<ApiRegions>>(
//     API_REGIONS[
//       process.env.NEXT_PUBLIC_ENVIRONMENT as keyof typeof API_REGIONS
//       // biome-ignore lint/suspicious/noExplicitAny: API_REGIONS is typed as const so it doesn't fit with ApiRegions[]
//     ] as any,
//   )
//   const [open, setOpen] = useState(false)

//   useEffect(() => {
//     const getRegions = async () => {
//       const regions = await getRegionsResponseTime()

//       setRegions(regions)
//     }

//     getRegions()

//     const interval = setInterval(getRegions, 10000)

//     return () => clearInterval(interval)
//   }, [])

//   const selectedRegion = regions.find((r) => r.tag === region)
//   const buttonLabel = `${selectedRegion?.name}${
//     selectedRegion?.ms ? ` (${selectedRegion?.ms}ms)` : ""
//   }`

//   return (
//     <div className="flex flex-col text-black text-sm items-start">
//       <span>{t("title")}</span>

//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <button className="underline">
//             {region ? buttonLabel : t("button-loading")}
//           </button>
//         </PopoverTrigger>
//         <PopoverContent className="w-[180px] p-0">
//           <Command>
//             <CommandInput placeholder={t("command.placeholder")} />
//             <CommandEmpty>{t("command.empty")}</CommandEmpty>
//             <CommandGroup>
//               <CommandList>
//                 {regions.map((r) => (
//                   <CommandItem
//                     key={r.tag}
//                     value={r.tag}
//                     onSelect={(currentValue) => {
//                       changeRegion(currentValue as ApiRegionsTag, true)
//                       router.replace("/")
//                       setOpen(false)
//                     }}
//                     className="flex flex-row items-center justify-between"
//                   >
//                     <span>{r.name}</span>
//                     {r?.ms && (
//                       <span className="text-sm text-slate-500">{r.ms}ms</span>
//                     )}
//                   </CommandItem>
//                 ))}
//               </CommandList>
//             </CommandGroup>
//           </Command>
//         </PopoverContent>
//       </Popover>
//     </div>
//   )
// }

// export default RegionsSelect
