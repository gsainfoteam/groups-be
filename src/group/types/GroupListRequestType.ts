export const groupListRequestType = ['all', 'included'] as const;
export type GroupListRequestType = (typeof groupListRequestType)[number];
