import gql from 'graphql-tag'

import type {
  GenericPost,
  Override,
  PhotoWithResizedOnly,
} from '~/types/common'

import { resizeImagesFragment } from './resized-images'

export type Post = Override<
  Pick<
    GenericPost,
    | 'id'
    | 'slug'
    | 'style'
    | 'title'
    | 'publishTime'
    | 'readingTime'
    | 'heroImage'
    | 'ogImage'
  >,
  {
    heroImage: PhotoWithResizedOnly | null
    ogImage: PhotoWithResizedOnly | null
  }
>

export const postFragment = gql`
  fragment PostFields on Post {
    id
    slug
    style
    title: name
    heroImage {
      resized {
        ...ResizedImagesField
      }
    }
    ogImage {
      resized {
        ...ResizedImagesField
      }
    }
    publishTime
    readingTime
  }
  ${resizeImagesFragment}
`
