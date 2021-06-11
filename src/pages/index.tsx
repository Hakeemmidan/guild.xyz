import { SimpleGrid, Stack, Text } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import Layout from "components/Layout"
import { communities as communitiesJSON } from "temporaryData/communities"
import CategorySection from "components/allCommunities/CategorySection"
import CommunityCard from "components/allCommunities/CommunityCard"
import { GetStaticProps } from "next"
import type { Community } from "temporaryData/communities"

type Props = {
  communities: Community[]
}

const AllCommunities = ({ communities }: Props): JSX.Element => {
  const { account, library } = useWeb3React()

  const isConnected = typeof account === "string" && !!library

  return (
    <Layout title="All communities on Agora" token={null}>
      <Stack spacing={8}>
        <CategorySection title="Your communities">
          {isConnected ? (
            <Text>You're not part of any communities yet</Text>
          ) : (
            <div>Wallet not connected</div>
          )}
        </CategorySection>

        <CategorySection title="Communities you have access to">
          {isConnected ? (
            <Text>You don't have access to any communities</Text>
          ) : (
            <div>Wallet not connected</div>
          )}
        </CategorySection>

        <CategorySection title="All communities">
          <SimpleGrid columns={2} spacing={10}>
            {communities.map((i) => (
              <CommunityCard community={i} key={i.id} />
            ))}
          </SimpleGrid>
        </CategorySection>
      </Stack>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: { communities: communitiesJSON },
})

export default AllCommunities