/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSeries = /* GraphQL */ `
  mutation CreateSeries(
    $input: CreateSeriesInput!
    $condition: ModelSeriesConditionInput
  ) {
    createSeries(input: $input, condition: $condition) {
      id
      tvdbid
      slug
      name
      year
      image
      description
      seasons {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        nextToken
      }
      statusText
      createdAt
      updatedAt
    }
  }
`;
export const updateSeries = /* GraphQL */ `
  mutation UpdateSeries(
    $input: UpdateSeriesInput!
    $condition: ModelSeriesConditionInput
  ) {
    updateSeries(input: $input, condition: $condition) {
      id
      tvdbid
      slug
      name
      year
      image
      description
      seasons {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        nextToken
      }
      statusText
      createdAt
      updatedAt
    }
  }
`;
export const deleteSeries = /* GraphQL */ `
  mutation DeleteSeries(
    $input: DeleteSeriesInput!
    $condition: ModelSeriesConditionInput
  ) {
    deleteSeries(input: $input, condition: $condition) {
      id
      tvdbid
      slug
      name
      year
      image
      description
      seasons {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        nextToken
      }
      statusText
      createdAt
      updatedAt
    }
  }
`;
export const createSourceMedia = /* GraphQL */ `
  mutation CreateSourceMedia(
    $input: CreateSourceMediaInput!
    $condition: ModelSourceMediaConditionInput
  ) {
    createSourceMedia(input: $input, condition: $condition) {
      id
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      files {
        items {
          id
          key
          status
          createdAt
          updatedAt
          sourceMediaFilesId
          fileSourceMediaId
        }
        nextToken
      }
      status
      user {
        id
        sub
        email
        stripeId
        sourceMedia {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      userDetailsSourceMediaId
      sourceMediaSeriesId
      sourceMediaUserId
    }
  }
`;
export const updateSourceMedia = /* GraphQL */ `
  mutation UpdateSourceMedia(
    $input: UpdateSourceMediaInput!
    $condition: ModelSourceMediaConditionInput
  ) {
    updateSourceMedia(input: $input, condition: $condition) {
      id
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      files {
        items {
          id
          key
          status
          createdAt
          updatedAt
          sourceMediaFilesId
          fileSourceMediaId
        }
        nextToken
      }
      status
      user {
        id
        sub
        email
        stripeId
        sourceMedia {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      userDetailsSourceMediaId
      sourceMediaSeriesId
      sourceMediaUserId
    }
  }
`;
export const deleteSourceMedia = /* GraphQL */ `
  mutation DeleteSourceMedia(
    $input: DeleteSourceMediaInput!
    $condition: ModelSourceMediaConditionInput
  ) {
    deleteSourceMedia(input: $input, condition: $condition) {
      id
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      files {
        items {
          id
          key
          status
          createdAt
          updatedAt
          sourceMediaFilesId
          fileSourceMediaId
        }
        nextToken
      }
      status
      user {
        id
        sub
        email
        stripeId
        sourceMedia {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      userDetailsSourceMediaId
      sourceMediaSeriesId
      sourceMediaUserId
    }
  }
`;
export const createFile = /* GraphQL */ `
  mutation CreateFile(
    $input: CreateFileInput!
    $condition: ModelFileConditionInput
  ) {
    createFile(input: $input, condition: $condition) {
      id
      sourceMedia {
        id
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        files {
          nextToken
        }
        status
        user {
          id
          sub
          email
          stripeId
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        userDetailsSourceMediaId
        sourceMediaSeriesId
        sourceMediaUserId
      }
      key
      status
      createdAt
      updatedAt
      sourceMediaFilesId
      fileSourceMediaId
    }
  }
`;
export const updateFile = /* GraphQL */ `
  mutation UpdateFile(
    $input: UpdateFileInput!
    $condition: ModelFileConditionInput
  ) {
    updateFile(input: $input, condition: $condition) {
      id
      sourceMedia {
        id
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        files {
          nextToken
        }
        status
        user {
          id
          sub
          email
          stripeId
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        userDetailsSourceMediaId
        sourceMediaSeriesId
        sourceMediaUserId
      }
      key
      status
      createdAt
      updatedAt
      sourceMediaFilesId
      fileSourceMediaId
    }
  }
`;
export const deleteFile = /* GraphQL */ `
  mutation DeleteFile(
    $input: DeleteFileInput!
    $condition: ModelFileConditionInput
  ) {
    deleteFile(input: $input, condition: $condition) {
      id
      sourceMedia {
        id
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        files {
          nextToken
        }
        status
        user {
          id
          sub
          email
          stripeId
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
        userDetailsSourceMediaId
        sourceMediaSeriesId
        sourceMediaUserId
      }
      key
      status
      createdAt
      updatedAt
      sourceMediaFilesId
      fileSourceMediaId
    }
  }
`;
export const createSeason = /* GraphQL */ `
  mutation CreateSeason(
    $input: CreateSeasonInput!
    $condition: ModelSeasonConditionInput
  ) {
    createSeason(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      episodes {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seasonEpisodesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seriesSeasonsId
    }
  }
`;
export const updateSeason = /* GraphQL */ `
  mutation UpdateSeason(
    $input: UpdateSeasonInput!
    $condition: ModelSeasonConditionInput
  ) {
    updateSeason(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      episodes {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seasonEpisodesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seriesSeasonsId
    }
  }
`;
export const deleteSeason = /* GraphQL */ `
  mutation DeleteSeason(
    $input: DeleteSeasonInput!
    $condition: ModelSeasonConditionInput
  ) {
    deleteSeason(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      series {
        id
        tvdbid
        slug
        name
        year
        image
        description
        seasons {
          nextToken
        }
        statusText
        createdAt
        updatedAt
      }
      episodes {
        items {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seasonEpisodesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seriesSeasonsId
    }
  }
`;
export const createEpisode = /* GraphQL */ `
  mutation CreateEpisode(
    $input: CreateEpisodeInput!
    $condition: ModelEpisodeConditionInput
  ) {
    createEpisode(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      season {
        id
        tvdbid
        year
        image
        description
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        episodes {
          nextToken
        }
        createdAt
        updatedAt
        seriesSeasonsId
      }
      subtitles {
        items {
          id
          tvdbid
          year
          image
          description
          start
          end
          createdAt
          updatedAt
          episodeSubtitlesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seasonEpisodesId
    }
  }
`;
export const updateEpisode = /* GraphQL */ `
  mutation UpdateEpisode(
    $input: UpdateEpisodeInput!
    $condition: ModelEpisodeConditionInput
  ) {
    updateEpisode(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      season {
        id
        tvdbid
        year
        image
        description
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        episodes {
          nextToken
        }
        createdAt
        updatedAt
        seriesSeasonsId
      }
      subtitles {
        items {
          id
          tvdbid
          year
          image
          description
          start
          end
          createdAt
          updatedAt
          episodeSubtitlesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seasonEpisodesId
    }
  }
`;
export const deleteEpisode = /* GraphQL */ `
  mutation DeleteEpisode(
    $input: DeleteEpisodeInput!
    $condition: ModelEpisodeConditionInput
  ) {
    deleteEpisode(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      season {
        id
        tvdbid
        year
        image
        description
        series {
          id
          tvdbid
          slug
          name
          year
          image
          description
          statusText
          createdAt
          updatedAt
        }
        episodes {
          nextToken
        }
        createdAt
        updatedAt
        seriesSeasonsId
      }
      subtitles {
        items {
          id
          tvdbid
          year
          image
          description
          start
          end
          createdAt
          updatedAt
          episodeSubtitlesId
        }
        nextToken
      }
      createdAt
      updatedAt
      seasonEpisodesId
    }
  }
`;
export const createSubtitle = /* GraphQL */ `
  mutation CreateSubtitle(
    $input: CreateSubtitleInput!
    $condition: ModelSubtitleConditionInput
  ) {
    createSubtitle(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      start
      end
      episode {
        id
        tvdbid
        year
        image
        description
        season {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        subtitles {
          nextToken
        }
        createdAt
        updatedAt
        seasonEpisodesId
      }
      createdAt
      updatedAt
      episodeSubtitlesId
    }
  }
`;
export const updateSubtitle = /* GraphQL */ `
  mutation UpdateSubtitle(
    $input: UpdateSubtitleInput!
    $condition: ModelSubtitleConditionInput
  ) {
    updateSubtitle(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      start
      end
      episode {
        id
        tvdbid
        year
        image
        description
        season {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        subtitles {
          nextToken
        }
        createdAt
        updatedAt
        seasonEpisodesId
      }
      createdAt
      updatedAt
      episodeSubtitlesId
    }
  }
`;
export const deleteSubtitle = /* GraphQL */ `
  mutation DeleteSubtitle(
    $input: DeleteSubtitleInput!
    $condition: ModelSubtitleConditionInput
  ) {
    deleteSubtitle(input: $input, condition: $condition) {
      id
      tvdbid
      year
      image
      description
      start
      end
      episode {
        id
        tvdbid
        year
        image
        description
        season {
          id
          tvdbid
          year
          image
          description
          createdAt
          updatedAt
          seriesSeasonsId
        }
        subtitles {
          nextToken
        }
        createdAt
        updatedAt
        seasonEpisodesId
      }
      createdAt
      updatedAt
      episodeSubtitlesId
    }
  }
`;
export const createAnalyticsMetrics = /* GraphQL */ `
  mutation CreateAnalyticsMetrics(
    $input: CreateAnalyticsMetricsInput!
    $condition: ModelAnalyticsMetricsConditionInput
  ) {
    createAnalyticsMetrics(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const updateAnalyticsMetrics = /* GraphQL */ `
  mutation UpdateAnalyticsMetrics(
    $input: UpdateAnalyticsMetricsInput!
    $condition: ModelAnalyticsMetricsConditionInput
  ) {
    updateAnalyticsMetrics(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const deleteAnalyticsMetrics = /* GraphQL */ `
  mutation DeleteAnalyticsMetrics(
    $input: DeleteAnalyticsMetricsInput!
    $condition: ModelAnalyticsMetricsConditionInput
  ) {
    deleteAnalyticsMetrics(input: $input, condition: $condition) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const createContentMetadata = /* GraphQL */ `
  mutation CreateContentMetadata(
    $input: CreateContentMetadataInput!
    $condition: ModelContentMetadataConditionInput
  ) {
    createContentMetadata(input: $input, condition: $condition) {
      id
      title
      description
      frameCount
      colorMain
      colorSecondary
      emoji
      status
      createdAt
      updatedAt
    }
  }
`;
export const updateContentMetadata = /* GraphQL */ `
  mutation UpdateContentMetadata(
    $input: UpdateContentMetadataInput!
    $condition: ModelContentMetadataConditionInput
  ) {
    updateContentMetadata(input: $input, condition: $condition) {
      id
      title
      description
      frameCount
      colorMain
      colorSecondary
      emoji
      status
      createdAt
      updatedAt
    }
  }
`;
export const deleteContentMetadata = /* GraphQL */ `
  mutation DeleteContentMetadata(
    $input: DeleteContentMetadataInput!
    $condition: ModelContentMetadataConditionInput
  ) {
    deleteContentMetadata(input: $input, condition: $condition) {
      id
      title
      description
      frameCount
      colorMain
      colorSecondary
      emoji
      status
      createdAt
      updatedAt
    }
  }
`;
export const createHomepageSection = /* GraphQL */ `
  mutation CreateHomepageSection(
    $input: CreateHomepageSectionInput!
    $condition: ModelHomepageSectionConditionInput
  ) {
    createHomepageSection(input: $input, condition: $condition) {
      id
      index
      title
      subtitle
      buttons
      bottomImage
      buttonSubtext
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`;
export const updateHomepageSection = /* GraphQL */ `
  mutation UpdateHomepageSection(
    $input: UpdateHomepageSectionInput!
    $condition: ModelHomepageSectionConditionInput
  ) {
    updateHomepageSection(input: $input, condition: $condition) {
      id
      index
      title
      subtitle
      buttons
      bottomImage
      buttonSubtext
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`;
export const deleteHomepageSection = /* GraphQL */ `
  mutation DeleteHomepageSection(
    $input: DeleteHomepageSectionInput!
    $condition: ModelHomepageSectionConditionInput
  ) {
    deleteHomepageSection(input: $input, condition: $condition) {
      id
      index
      title
      subtitle
      buttons
      bottomImage
      buttonSubtext
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`;
export const createUserDetails = /* GraphQL */ `
  mutation CreateUserDetails(
    $input: CreateUserDetailsInput!
    $condition: ModelUserDetailsConditionInput
  ) {
    createUserDetails(input: $input, condition: $condition) {
      id
      sub
      email
      stripeId
      sourceMedia {
        items {
          id
          status
          createdAt
          updatedAt
          userDetailsSourceMediaId
          sourceMediaSeriesId
          sourceMediaUserId
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const updateUserDetails = /* GraphQL */ `
  mutation UpdateUserDetails(
    $input: UpdateUserDetailsInput!
    $condition: ModelUserDetailsConditionInput
  ) {
    updateUserDetails(input: $input, condition: $condition) {
      id
      sub
      email
      stripeId
      sourceMedia {
        items {
          id
          status
          createdAt
          updatedAt
          userDetailsSourceMediaId
          sourceMediaSeriesId
          sourceMediaUserId
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const deleteUserDetails = /* GraphQL */ `
  mutation DeleteUserDetails(
    $input: DeleteUserDetailsInput!
    $condition: ModelUserDetailsConditionInput
  ) {
    deleteUserDetails(input: $input, condition: $condition) {
      id
      sub
      email
      stripeId
      sourceMedia {
        items {
          id
          status
          createdAt
          updatedAt
          userDetailsSourceMediaId
          sourceMediaSeriesId
          sourceMediaUserId
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
