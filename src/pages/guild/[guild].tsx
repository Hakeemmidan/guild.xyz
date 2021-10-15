import { HStack, Icon, SimpleGrid, Stack, Tag, Text, VStack } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import ColorButton from "components/common/ColorButton"
import CustomizationButton from "components/common/CustomizationButton"
import useEdit from "components/common/CustomizationButton/hooks/useEdit"
import DeleteButton from "components/common/DeleteButton"
import Layout from "components/common/Layout"
import Section from "components/common/Section"
import { GuildProvider, useGuild } from "components/[guild]/Context"
import EditForm from "components/[guild]/EditForm"
import useIsOwner from "components/[guild]/hooks/useIsOwner"
import JoinButton from "components/[guild]/JoinButton"
import LogicDivider from "components/[guild]/LogicDivider"
import Members from "components/[guild]/Members"
import useMembers from "components/[guild]/Members/hooks/useMembers"
import RequirementCard from "components/[guild]/RequirementCard"
import { GetStaticPaths, GetStaticProps } from "next"
import { Gear } from "phosphor-react"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import guilds from "temporaryData/guilds"
import { Guild } from "temporaryData/types"
import kebabToCamelCase from "utils/kebabToCamelCase"

const GuildPageContent = (): JSX.Element => {
  const { account } = useWeb3React()
  const { id, urlName, name, guildPlatforms, imageUrl, requirements, logic } =
    useGuild()
  const hashtag = `${kebabToCamelCase(urlName)}Guild`
  const isOwner = useIsOwner(account)
  const members = useMembers()

  const methods = useForm({
    mode: "all",
    defaultValues: {
      name,
      requirements,
    },
  })
  console.log(requirements)
  const [editMode, setEditMode] = useState(false)
  const { onSubmit, isLoading } = useEdit("guild", id, () => setEditMode(false))

  return (
    <Layout
      title={editMode ? "Edit guild" : name}
      action={
        <HStack spacing={2}>
          {!editMode && guildPlatforms[0] && <JoinButton />}
          {isOwner && (
            <>
              {!editMode && <CustomizationButton />}
              {!editMode && (
                <ColorButton
                  rounded="2xl"
                  color="blue.500"
                  onClick={() => setEditMode(true)}
                >
                  <Icon as={Gear} />
                </ColorButton>
              )}
              {editMode && (
                <>
                  <ColorButton
                    rounded="2xl"
                    color="gray.500"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </ColorButton>
                  <ColorButton
                    rounded="2xl"
                    color="green.500"
                    isLoading={isLoading}
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    Save
                  </ColorButton>
                </>
              )}
              {!editMode && <DeleteButton />}
            </>
          )}
        </HStack>
      }
      imageUrl={editMode ? null : imageUrl}
    >
      {!editMode ? (
        <Stack spacing="12">
          <Section title="Requirements">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, md: 6 }}>
              <VStack>
                {requirements?.map((requirement, i) => (
                  <React.Fragment key={i}>
                    <RequirementCard requirement={requirement} />
                    {i < requirements.length - 1 && <LogicDivider logic={logic} />}
                  </React.Fragment>
                ))}
              </VStack>
            </SimpleGrid>
          </Section>
          {/* <Section title={`Use the #${hashtag} hashtag!`}>
              <TwitterFeed hashtag={`${hashtag}`} />
            </Section> */}
          <Section
            title={
              <HStack spacing={2} alignItems="center">
                <Text as="span">Members</Text>
                <Tag size="sm">
                  {members?.filter((address) => !!address)?.length ?? 0}
                </Tag>
              </HStack>
            }
          >
            <Members
              members={members}
              fallbackText="This guild has no members yet"
            />
          </Section>
        </Stack>
      ) : (
        <FormProvider {...methods}>
          <EditForm />
        </FormProvider>
      )}
    </Layout>
  )
}

type Props = {
  guildData: Guild
}

const GuildPageWrapper = ({ guildData }: Props): JSX.Element => (
  <GuildProvider data={guildData}>
    <GuildPageContent />
  </GuildProvider>
)

const DEBUG = false

const getStaticProps: GetStaticProps = async ({ params }) => {
  const localData = guilds.find((i) => i.urlName === params.guild)

  const guildData =
    DEBUG && process.env.NODE_ENV !== "production"
      ? localData
      : await fetch(
          `${process.env.NEXT_PUBLIC_API}/guild/urlName/${params.guild}`
        ).then((response: Response) => (response.ok ? response.json() : undefined))

  if (!guildData) {
    return {
      notFound: true,
    }
  }

  return {
    props: { guildData },
    revalidate: 10,
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  const mapToPaths = (_: Guild[]) =>
    _.map(({ urlName: guild }) => ({ params: { guild } }))

  const pathsFromLocalData = mapToPaths(guilds)

  const paths =
    DEBUG && process.env.NODE_ENV !== "production"
      ? pathsFromLocalData
      : await fetch(`${process.env.NEXT_PUBLIC_API}/guild`).then((response) =>
          response.ok ? response.json().then(mapToPaths) : pathsFromLocalData
        )

  return {
    paths,
    fallback: "blocking",
  }
}

export { getStaticPaths, getStaticProps }
export default GuildPageWrapper
