import { configureStore } from '@reduxjs/toolkit'
import { moApiLimitApi } from '@/services/mo_api_limitApi'
import { moApiSignatureApi } from '@/services/mo_api_signatureApi'
import { moArticleApi } from '@/services/mo_articleApi'
import { moAttachmentsApi } from '@/services/mo_attachmentsApi'
import { moBadgeApi } from '@/services/mo_badgeApi'
import { moBadgeHistoryApi } from '@/services/mo_badge_historyApi'
import { moBannerApi } from '@/services/mo_bannerApi'
import { moCollectApi } from '@/services/mo_collectApi'
import { moColumnApi } from '@/services/mo_columnApi'
import { moColumnRequestApi } from '@/services/mo_column_requestApi'
import { moCommentApi } from '@/services/mo_commentApi'
import { moDownloadApi } from '@/services/mo_downloadApi'
import { moDownloadRateApi } from '@/services/mo_download_rateApi'
import { moFollowApi } from '@/services/mo_followApi'
import { moInviteCodeApi } from '@/services/mo_invite_codeApi'
import { moLogApi } from '@/services/mo_logApi'
import { moManagerRoleApi } from '@/services/mo_manager_roleApi'
import { moNoticeApi } from '@/services/mo_noticeApi'
import { moPageApi } from '@/services/mo_pageApi'
import { moPraiseApi } from '@/services/mo_praiseApi'
import { moReportApi } from '@/services/mo_reportApi'
import { moSettingApi } from '@/services/mo_settingApi'
import { moSigninHistoryApi } from '@/services/mo_signin_historyApi'
import { moTagsApi } from '@/services/mo_tagsApi'
import { moTopicApi } from '@/services/mo_topicApi'
import { moUserApi } from '@/services/mo_userApi'
import { moVcodeApi } from '@/services/mo_vcodeApi'
import { moViewsApi } from '@/services/mo_viewsApi'

export const store = configureStore({
  reducer: {
    [moApiLimitApi.reducerPath]: moApiLimitApi.reducer,
    [moApiSignatureApi.reducerPath]: moApiSignatureApi.reducer,
    [moArticleApi.reducerPath]: moArticleApi.reducer,
    [moAttachmentsApi.reducerPath]: moAttachmentsApi.reducer,
    [moBadgeApi.reducerPath]: moBadgeApi.reducer,
    [moBadgeHistoryApi.reducerPath]: moBadgeHistoryApi.reducer,
    [moBannerApi.reducerPath]: moBannerApi.reducer,
    [moCollectApi.reducerPath]: moCollectApi.reducer,
    [moColumnApi.reducerPath]: moColumnApi.reducer,
    [moColumnRequestApi.reducerPath]: moColumnRequestApi.reducer,
    [moCommentApi.reducerPath]: moCommentApi.reducer,
    [moDownloadApi.reducerPath]: moDownloadApi.reducer,
    [moDownloadRateApi.reducerPath]: moDownloadRateApi.reducer,
    [moFollowApi.reducerPath]: moFollowApi.reducer,
    [moInviteCodeApi.reducerPath]: moInviteCodeApi.reducer,
    [moLogApi.reducerPath]: moLogApi.reducer,
    [moManagerRoleApi.reducerPath]: moManagerRoleApi.reducer,
    [moNoticeApi.reducerPath]: moNoticeApi.reducer,
    [moPageApi.reducerPath]: moPageApi.reducer,
    [moPraiseApi.reducerPath]: moPraiseApi.reducer,
    [moReportApi.reducerPath]: moReportApi.reducer,
    [moSettingApi.reducerPath]: moSettingApi.reducer,
    [moSigninHistoryApi.reducerPath]: moSigninHistoryApi.reducer,
    [moTagsApi.reducerPath]: moTagsApi.reducer,
    [moTopicApi.reducerPath]: moTopicApi.reducer,
    [moUserApi.reducerPath]: moUserApi.reducer,
    [moVcodeApi.reducerPath]: moVcodeApi.reducer,
    [moViewsApi.reducerPath]: moViewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
        moApiLimitApi.middleware,
        moApiSignatureApi.middleware,
        moArticleApi.middleware,
        moAttachmentsApi.middleware,
        moBadgeApi.middleware,
        moBadgeHistoryApi.middleware,
        moBannerApi.middleware,
        moCollectApi.middleware,
        moColumnApi.middleware,
        moColumnRequestApi.middleware,
        moCommentApi.middleware,
        moDownloadApi.middleware,
        moDownloadRateApi.middleware,
        moFollowApi.middleware,
        moInviteCodeApi.middleware,
        moLogApi.middleware,
        moManagerRoleApi.middleware,
        moNoticeApi.middleware,
        moPageApi.middleware,
        moPraiseApi.middleware,
        moReportApi.middleware,
        moSettingApi.middleware,
        moSigninHistoryApi.middleware,
        moTagsApi.middleware,
        moTopicApi.middleware,
        moUserApi.middleware,
        moVcodeApi.middleware,
        moViewsApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
