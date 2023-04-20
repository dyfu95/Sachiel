// under construction

import type { ApolloQueryResult } from '@apollo/client/core'
import errors from '@twreporter/errors'
import type { GetServerSideProps } from 'next'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import client from '~/apollo-client'
import editoolsClient from '~/apollo-editools-client'
import Awards from '~/components/about/awards'
import Landing from '~/components/about/landing'
import Members from '~/components/about/members'
import More from '~/components/about/more'
import Qa from '~/components/about/qa'
import LayoutWithLogoOnly from '~/components/layout/layout-with-logo-only'
import { ENV } from '~/constants/environment-variables'
import type { Award } from '~/graphql/query/award'
import { awards as awardsGql } from '~/graphql/query/award'
import type { Member } from '~/graphql/query/member'
import { members as membersGql } from '~/graphql/query/member'
import type { PageVariable } from '~/graphql/query/page-variable'
import { pageVariablesByPage } from '~/graphql/query/page-variable'
import type { QaList } from '~/graphql/query/qa'
import { qALists as qAListsGql } from '~/graphql/query/qa'
import type { Language, RenderedAward } from '~/types/about'

import type { NextPageWithLayout } from './_app'

/*
 * The `content` field is a string that may contain <b> tags for emphasis.
 * This comment specifies that in the English mode, the <b> tags should not be split across lines.
 * However, in the Chinese mode, the <b> tags may still be split across lines due to text wrapping.
 */
type languageWording = {
  landing: {
    title: string
    content: string
  }
  awardsTitle: string
  moreTitle: string
  memberTitle: string
  qaTitle: string
}

const wording: Record<Language, languageWording> = {
  ch: {
    landing: {
      title: '關於我們',
      content:
        'READr 是致力於以<b>資料</b>做<b>新聞</b>與<b>內容實驗</b>的媒體。於 2018 年正式創立，重視與各種專業者、讀者的協作，期望讓以往封閉的新聞編輯室有開放的可能。<b>資料分析、多媒體互動、理想的閱讀體驗、開放資料、開源工具</b>，都是我們提供的服務。',
    },
    awardsTitle: '獲獎經歷',
    moreTitle: '更認識我們',
    memberTitle: '團隊成員',
    qaTitle: '你可能好奇',
  },
  en: {
    landing: {
      title: 'About',
      content:
        'READr uses <b>data</b> for <b>news</b> and <b>content</b> <b>experimentation</b>. Collaboration with diverse professionals and readers opens the once-closed newsroom. We provide services like <b>data</b> <b>analysis,</b> <b>multimedia,</b> <b>ideal</b> <b>reading</b> <b>experiences,</b> <b>open</b> <b>data,</b> <b>and</b> <b>tools.</b>',
    },
    awardsTitle: 'Awards',
    moreTitle: 'More',
    memberTitle: 'Members',
    qaTitle: 'Q&A',
  },
}

const Page = styled.div`
  background: #000928;
  box-shadow: inset 8px 0px 0px #ebf02c;
  max-width: 100vw;
  min-width: 100vw;
  font-family: 'Noto Sans TC';
  overflow: hidden;
  ${({ theme }) => `
    ${theme.breakpoint.md} {
      box-shadow: inset 20px 0px 0px #ebf02c;
    }
  `}
`

type PageProps = {
  awardsData: Award[]
  moreReportData: PageVariable[]
  membersData: Member[]
  qAListsData: QaList[]
}

const About: NextPageWithLayout<PageProps> = ({
  awardsData,
  moreReportData,
  membersData,
  qAListsData,
}) => {
  console.log(qAListsData)
  const [language, setLanguage] = useState<Language>('ch')
  const [renderedMore, setRenderedMore] = useState<
    Record<Language, { data: PageVariable[]; hasFetched: boolean }>
  >({
    ch: { hasFetched: true, data: moreReportData },
    en: { hasFetched: false, data: [] },
  })
  const renderedAwards: RenderedAward[] = useMemo(() => {
    return awardsData.map((awardItem: Award) => {
      const {
        id,
        name,
        name_en,
        report,
        report_en,
        url,
        desc,
        desc_en,
        awardTime,
      } = awardItem
      if (language === 'en') {
        return {
          id,
          name: name_en,
          report: report_en,
          url,
          desc: desc_en,
          awardTime,
        }
      } else {
        return {
          id,
          name,
          report,
          url,
          desc,
          awardTime,
        }
      }
    })
  }, [awardsData, language])

  const fetchENMore = async () => {
    let moreReportDataEn: PageVariable[] = []
    try {
      const result: ApolloQueryResult<{ pageVariables: PageVariable[] }> =
        await client.query({
          query: pageVariablesByPage,
          variables: {
            page: 'about-en',
          },
        })
      moreReportDataEn = result.data.pageVariables
    } catch (err) {
      console.log(err)
    }
    setRenderedMore({
      ...renderedMore,
      en: { data: moreReportDataEn, hasFetched: true },
    })
  }

  useEffect(() => {
    if (!renderedMore[language]?.hasFetched) {
      fetchENMore()
    }
  }, [language, renderedMore])

  return (
    <Page>
      <Landing
        language={language}
        setLanguage={setLanguage}
        title={wording[language].landing.title}
        content={wording[language].landing.content}
      />
      <Qa qaLists={qAListsData} title={wording[language].qaTitle} />
      <Members
        language={language}
        title={wording[language].memberTitle}
        members={membersData}
      />
      <Awards
        renderedAwards={renderedAwards}
        title={wording[language].awardsTitle}
      />
      <More
        title={wording[language].moreTitle}
        renderedMore={renderedMore[language].data}
      />
    </Page>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({}) => {
  let awardsData: Award[] = []
  let moreReportData: PageVariable[] = []
  let membersData: Member[] = []
  let qAListsData: QaList[] = []

  try {
    const awardsResult: ApolloQueryResult<{ awards: Award[] }> =
      await client.query({
        query: awardsGql,
      })

    const pageVariablesResult: ApolloQueryResult<{
      pageVariables: PageVariable[]
    }> = await client.query({
      query: pageVariablesByPage,
      variables: {
        page: 'about',
      },
    })

    const membersResult: ApolloQueryResult<{ authors: Member[] }> =
      await client.query({
        query: membersGql,
      })

    awardsData = awardsResult.data.awards
    moreReportData = pageVariablesResult.data.pageVariables
    membersData = membersResult.data.authors
  } catch (err) {
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(
          err,
          {
            withStack: true,
            withPayload: true,
          },
          0,
          0
        ),
      })
    )
  }

  try {
    // set the variables object to { id1: '8', id2: '9' } if ENV is dev or local, and to { id1: '6', id2: '7' } if ENV is staging or prod.
    const variables =
      ENV === 'dev' || ENV === 'local'
        ? { id1: '8', id2: '9' }
        : { id1: '6', id2: '7' }

    const qAListsResult: ApolloQueryResult<{ qALists: QaList[] }> =
      await editoolsClient.query({
        query: qAListsGql,
        variables,
      })

    qAListsData = qAListsResult.data.qALists
  } catch (err) {
    console.error(
      JSON.stringify({
        severity: 'ERROR',
        message: errors.helpers.printAll(
          err,
          {
            withStack: true,
            withPayload: true,
          },
          0,
          0
        ),
      })
    )
  }

  return {
    props: {
      awardsData,
      moreReportData,
      membersData,
      qAListsData,
    },
  }
}

About.getLayout = function getLayout(page: ReactElement) {
  const pageTitle = '關於我們'

  return <LayoutWithLogoOnly title={pageTitle}>{page}</LayoutWithLogoOnly>
}

export default About
