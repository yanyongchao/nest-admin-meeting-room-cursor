export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export enum LogCategory {
  USER = 'user', // 用户相关
  MEETING_ROOM = 'room', // 会议室相关
  BOOKING = 'booking', // 预订相关
  SYSTEM = 'system', // 系统相关
  AUTH = 'auth', // 认证相关
}

export const LOG_CONTEXT = 'MeetingRoomSystem';
