import { Socket } from 'phoenix';

export default new Socket('/socket', {
  params: { token: window.userToken },
  logger: (kind, msg, data) => console.log(`%s: %s %O`, kind, msg, data),
});
