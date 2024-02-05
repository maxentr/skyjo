import IndexPage from "@/app/IndexPage"

type IndexServerPageProps = {
  searchParams: {
    gameId?: string
  }
}
const IndexServerPage = ({ searchParams }: IndexServerPageProps) => {
  return <IndexPage gameId={searchParams.gameId} />
}

export default IndexServerPage
