export type PresenceStatus = {
  id: number; code: string; color: string; title: string; type: string|undefined; aliasses: string|undefined; 
};

export type ExtraStatus = {
  id: number|undefined; 'ref-id': number|undefined; code: string|undefined; color: string|undefined; title: string|undefined; aliasses: string|undefined;
};

export type Presence = {
  id: number; title: string; metadata: { order: number[]; statuses: ExtraStatus[]; };
};
