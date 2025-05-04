/** user info api response type from infoteam idp */
export type IdpUserInfoRes = {
  sub: string; // user uuid
  profile?: string;
  picture?: string;
  name?: string;
  email?: string;
  student_id?: string;
  phone_number?: string;
};

/** token api response type from infoteam idp of client credential flows */
export type IdPTokenRes = {
  access_token: string; // access token
  token_type: string; // token type
  expires_in: number; // expires in seconds
  scope: string; // scope
};
