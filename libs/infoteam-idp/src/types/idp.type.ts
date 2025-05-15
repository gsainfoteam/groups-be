/** jwt api response type from infoteam idp */
export type IdpJwtResponse = {
  access_token: string;
  refresh_token: string;
};

/** user info api response type from infoteam idp */
export type IdpUserInfoRes = {
  sub: string;
  email: string;
  name: string;
};
