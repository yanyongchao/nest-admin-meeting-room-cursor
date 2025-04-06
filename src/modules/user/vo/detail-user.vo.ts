export class DetailUserVo {
  id: number;
  username: string;
  nickName?: string;
  email?: string;
  headPic?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isFrozen: boolean;
  roles: string[];
  createTime: Date;
  updateTime: Date;
}
