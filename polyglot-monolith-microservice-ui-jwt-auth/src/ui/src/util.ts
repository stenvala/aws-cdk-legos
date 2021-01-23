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

export function getAmisAxiosClient(jwt: string) {
  return axios.create({
    headers: {
      common: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
}
