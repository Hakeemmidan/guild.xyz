import { GridItem, SimpleGrid, Stack } from "@chakra-ui/react"
import Layout from "components/common/Layout"
import GroupsGuildsNav from "components/index/GroupsGuildsNav"
import GuildsList from "components/index/GuildsList"
import OrderSelect from "components/index/OrderSelect"
import SearchBar from "components/index/SearchBar"
import fetchGuilds from "components/index/utils/fetchGuilds"
import { GetStaticProps } from "next"
import { useState } from "react"
import useSWR from "swr"
import { Guild } from "temporaryData/types"

type Props = {
  guilds: Guild[]
}

const Page = ({ guilds: guildsInitial }: Props): JSX.Element => {
  const { data: guilds } = useSWR("guilds", fetchGuilds, {
    fallbackData: guildsInitial,
  })
  const [searchInput, setSearchInput] = useState("")
  const [orderedGuilds, setOrderedGuilds] = useState(guilds)

  return (
    <Layout
      title="Guildhall"
      description="A place for Web3 guilds"
      imageUrl="/logo.svg"
    >
      <SimpleGrid
        templateColumns={{ base: "auto 50px", md: "1fr 1fr 1fr" }}
        gap={{ base: 2, md: "6" }}
        mb={16}
      >
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <SearchBar placeholder="Search guilds" setSearchInput={setSearchInput} />
        </GridItem>
        <OrderSelect {...{ guilds, setOrderedGuilds }} />
      </SimpleGrid>

      <GroupsGuildsNav />

      <Stack spacing={12}>
        <GuildsList orderedGuilds={orderedGuilds} searchInput={searchInput} />
      </Stack>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const guilds = await fetchGuilds()

  return {
    props: { guilds },
    revalidate: 10,
  }
}

export default Page
