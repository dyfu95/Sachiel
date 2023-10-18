import { print } from 'graphql'
import type { GetServerSideProps } from 'next'
import React from 'react'
import styled from 'styled-components'

import CustomHead from '~/components/custom-head'
import DefaultLayout from '~/components/layout/default'
import Nav from '~/components/nav'
import Title from '~/components/politics/title'
import Section from '~/components/politics-detail/section'
import { ConfigContext } from '~/components/react-context/global'
import { cmsApiUrl, feedbackFormConfig } from '~/constants/config'
import GetPersonElections from '~/graphql/query/person/get-person-elections.graphql'
import GetPersonOrganization from '~/graphql/query/politics/get-person-organization.graphql'
import GetPersonOverView from '~/graphql/query/politics/get-person-overview.graphql'
import GetPoliticDetail from '~/graphql/query/politics/get-politic-detail.graphql'
import GetPoliticsRelatedToPersonElections from '~/graphql/query/politics/get-politics-related-to-person-elections.graphql'
import type {
  PersonElectionTerm,
  PoliticAmount,
  PoliticDetail,
} from '~/types/politics-detail'
import { fireGqlRequest } from '~/utils/utils'

const Main = styled.main`
  background-color: #fffcf3;
  height: 100%;
  min-height: 100vh;
  margin-top: 64px;
  padding-bottom: 40px;
  ${({ theme }) => theme.breakpoint.md} {
    margin-top: 80px;
  }
`

type Config = {
  fieldId?: string
  formId?: string
}
type PoliticDetailPageProps = {
  politicData: PoliticDetail
  politicAmount: PoliticAmount
  latestPersonElection: string
  config: Config
  personOrganization: PersonElectionTerm
}
export default function PoliticsDetail({
  politicData,
  politicAmount,
  latestPersonElection,
  config,
  personOrganization,
}: PoliticDetailPageProps): JSX.Element {
  const { person } = politicData

  const navProps = {
    prev: {
      backgroundColor: 'bg-button',
      textColor: 'text-black',
      content: '回政見總覽',
      href: {
        pathname: '/politics/[personId]',
        query: {
          personId: person?.person_id?.id,
        },
      },
    },
    alwaysShowHome: true,
  }
  if (person?.party === null) {
    person.party = { name: '無黨籍', image: '' }
  }

  //next/head title & description
  const headProps = { title: '', description: '' }
  headProps.title = `${person?.person_id?.name} - ${politicData.desc}｜READr 政商人物資料庫`

  //get election name
  const rawElectionName = person?.election?.name
  const electionWithoutYear = rawElectionName?.slice(
    rawElectionName.indexOf('年') + 1
  )

  // if election.level = "地方選舉" add "electoral_district.name"
  if (person?.election?.level === '地方選舉' || 'local') {
    headProps.description = `${person?.person_id?.name}在${
      person?.election?.election_year_year
    }${person?.electoral_district?.name.slice(
      0,
      3
    )}${electionWithoutYear}提出的政見：${politicData.desc}`
  } else {
    headProps.description = `${person?.person_id?.name}在${person?.election?.election_year_year}${person?.election?.type}選舉提出的政見：${politicData.desc}`
  }

  return (
    <DefaultLayout>
      <CustomHead {...headProps} />
      <ConfigContext.Provider value={config}>
        <Main>
          <Title
            id={person?.person_id?.id || ''}
            name={person?.person_id?.name || ''}
            avatar={person?.person_id?.image || ''}
            campaign={latestPersonElection}
            party={person?.party?.name || ''}
            partyIcon={person?.party?.image || ''}
            completed={politicAmount.passed}
            waiting={politicAmount.waiting}
          />
          <Section
            politicData={politicData}
            personOrganization={personOrganization}
          />
        </Main>
        <Nav {...navProps} />
      </ConfigContext.Provider>
    </DefaultLayout>
  )
}

export const getServerSideProps: GetServerSideProps<
  PoliticDetailPageProps
> = async ({ query, res }) => {
  res.setHeader(
    'Cache-Control',
    'public, max-age=600, stale-while-revalidate=60'
  )

  const id = query.politicId

  try {
    //get politic detail info by politicId
    const {
      data: { politics },
    } = await fireGqlRequest(
      print(GetPoliticDetail),
      { politicId: id },
      cmsApiUrl
    )
    if (!politics.length) {
      return {
        notFound: true,
      }
    }

    //get all personElections ID this person join
    const {
      data: { personElections },
    } = await fireGqlRequest(
      print(GetPersonElections),
      { Id: politics[0].person.person_id.id },
      cmsApiUrl
    )

    const rawPersonElection = [...personElections]

    //@ts-ignore
    const personElectionIds = []
    rawPersonElection.map((item) => {
      personElectionIds.push(item.id)
    })

    /**
     * @typedef {import('~/types/common').RawPolitic} RawPolitic
     * @type {import('axios').AxiosResponse<{politics: RawPolitic[]}>}
     */
    const {
      data: { politics: allPoliticList },
    } = await fireGqlRequest(
      print(GetPoliticsRelatedToPersonElections),
      //@ts-ignore
      { ids: personElectionIds },
      cmsApiUrl
    )

    const passedAmount = allPoliticList.filter(
      (value: any) =>
        value.status === 'verified' &&
        value.reviewed &&
        value.thread_parent === null
    ).length
    const waitingAmount = allPoliticList.filter(
      (value: any) => !value.reviewed
    ).length

    //get latest election type this person join ( put in <Title> component)
    const {
      data: { personElections: personAllElections },
    } = await fireGqlRequest(
      print(GetPersonOverView),
      // @ts-ignore
      { personId: politics[0].person.person_id.id },
      cmsApiUrl
    )

    //get election term by person id
    const {
      data: { personOrganizations: personOrganization },
    } = await fireGqlRequest(
      print(GetPersonOrganization),
      { electionId: politics[0]?.person?.id },
      cmsApiUrl
    )

    return {
      props: {
        personOrganization: personOrganization[0] || {},
        politicData: politics[0],
        politicAmount: {
          passed: passedAmount,
          waiting: waitingAmount,
        },
        latestPersonElection:
          personAllElections[personAllElections.length - 1].election.type,
        config: feedbackFormConfig,
      },
    }
  } catch (err) {
    console.error(err)
    return {
      notFound: true,
    }
  }
}