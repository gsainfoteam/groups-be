/** user info api response type from infoteam idp */
export type IdpUserInfoRes = {
  sub: string;
  profile: string;
  picture: string;
  name: string;
  email: string;
  student_id: string;
};

/** id token payload */
export type IdTokenPayload = {
  sub: string;
  aud: string;
  scope: string;
  nonce: string;
  profile: string;
  picture: string;
  name: string;
  email: string;
  student_id: string;
};

/** Client credential api request type to infoteam idp */
export type ClientAccessTokenRequest = {
  grant_type: 'client_credentials';
  client_id: string;
  client_secret: string;
  scope?: string;
};

/** Client credential api response type from infoteam idp */
export type ClientAccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};
