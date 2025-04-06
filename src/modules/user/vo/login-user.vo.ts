export class LoginUserVo {
  id: number;
  username: string;
  nickName?: string;
  email?: string;
  headPic?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  token: string;
  roles: string[];
}
