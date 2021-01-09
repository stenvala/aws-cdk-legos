import axios from "axios";

export function getMonoAxiosClient(state: any) {
  return axios.create({
    headers: {
      common: {
        Authorization: `Bearer ${state.user.id},${state.user.sessionId}`,
      },
    },
  });
}

export function getAmisAxiosClient(state: any) {
  return axios.create({
    headers: {
      common: {
        Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MTAyMDg1MjgsImlzcyI6IkFVVEgiLCJpYXQiOjE2MTAxNzI1MjgsImRvY0lkIjoicmFuZG9taWQiLCJwZXJtaXNzaW9ucyI6W3siaWQiOiJpbWFnZSIsInBlcm1pc3Npb25zIjpbIkFERCIsIkRFTEVURSIsIkdFVCJdfSx7ImlkIjoiYXR0YWNobWVudCIsInBlcm1pc3Npb25zIjpbIkFERCIsIkRFTEVURSIsIkdFVCJdfSx7ImlkIjoic2VjcmV0ZmlsZSIsInBlcm1pc3Npb25zIjpbIkFERCIsIkRFTEVURSIsIkdFVCJdfV0sIm1ldGEiOnsidXNlcklkIjoiYWRtaW4iLCJnaXZlbk5hbWUiOiJEZW1vIiwiZmFtaWx5TmFtZSI6IkFkbWluIn19.FNiS-UKWF1G9CHDTve_8Ok1wumNEpcAeSDNlTuLaHO4`,
      },
    },
  });
}
