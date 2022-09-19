import axios from 'axios'

export const CLIENT_GATEWAY_URL = import.meta.env.VITE_APP_GATEWAY_URL
export const clientGateway = axios.create({
  baseURL: CLIENT_GATEWAY_URL
})

export enum ChannelTypes {
  TEXT = 1,
  CATEGORY = 2,
  VOICE = 3,
  CUSTOM = 4
}

export enum ModalTypes {
  UPDATE,
  ADD_PARTICIPANT,
  DELETE_CHANNEL,
  DELETE_MESSAGE,
  NEW_CHANNEL,
  NEW_COMMUNITY,
  NEW_CONVERSATION,
  NEW_INVITE,
  NEW_PERMISSION,
  NEW_PRODUCT,
  NEW_RESOURCE,
  NEW_VERSION,
  PREVIEW_IMAGE,
  STATUS,
  MANAGE_MEMBER_GROUPS,
  ADD_FRIEND,
  DEVELOPER_MODE,
  PREVIEW_USER,
  GENERATE_KEYCHAIN,
  DECRYPT_KEYCHAIN,
  ENABLED_2FA,
  CODE_PROMPT,
  RINGING,
  ADD_INTEGRATION
}

export enum Groups {
  BASIC,
  MOD,
  ADMIN
}

export enum Permissions {
  READ_MESSAGES = 1,
  SEND_MESSAGES = 2,
  EMBED_LINKS = 3,
  MENTION_MEMBERS = 4,
  MENTION_GROUPS = 5,
  MENTION_EVERYONE = 6,
  MENTION_SOMEONE = 7,
  CREATE_INVITES = 8,
  BAN_MEMBERS = 9,
  KICK_MEMBERS = 10,
  MANAGE_GROUPS = 11,
  MANAGE_CHANNELS = 12,
  MANAGE_INVITES = 13,
  MANAGE_COMMUNITY = 14,
  MANAGE_MESSAGES = 15,
  ADMINISTRATOR = 16,
  OWNER = 17,
  MANAGE_PRODUCTS = 18
}

export enum ChannelPermissions {
  READ_MESSAGES = 1,
  SEND_MESSAGES = 2,
  EMBED_LINKS = 3,
  MENTION_MEMBERS = 4,
  MENTION_GROUPS = 5,
  MENTION_EVERYONE = 6,
  MENTION_SOMEONE = 7,
  MANAGE_MESSAGES = 15
}

export const overrides = [
  ChannelPermissions.READ_MESSAGES,
  ChannelPermissions.SEND_MESSAGES,
  ChannelPermissions.EMBED_LINKS,
  ChannelPermissions.MENTION_MEMBERS,
  ChannelPermissions.MENTION_GROUPS,
  ChannelPermissions.MENTION_SOMEONE,
  ChannelPermissions.MENTION_EVERYONE,
  ChannelPermissions.MANAGE_MESSAGES
]

export const supportedChannelPermissions = [
  Permissions.READ_MESSAGES,
  Permissions.SEND_MESSAGES,
  Permissions.EMBED_LINKS,
  Permissions.MENTION_MEMBERS,
  Permissions.MENTION_GROUPS,
  Permissions.MENTION_SOMEONE,
  Permissions.MENTION_EVERYONE,
  Permissions.MANAGE_MESSAGES
]

export const PermissionsGroups: { [key in Groups]: Permissions[] } = {
  [Groups.BASIC]: [
    Permissions.READ_MESSAGES,
    Permissions.SEND_MESSAGES,
    Permissions.MENTION_MEMBERS,
    Permissions.MENTION_GROUPS,
    Permissions.MENTION_SOMEONE,
    Permissions.EMBED_LINKS,
    Permissions.CREATE_INVITES
  ],
  [Groups.MOD]: [
    Permissions.BAN_MEMBERS,
    Permissions.KICK_MEMBERS,
    Permissions.MENTION_EVERYONE,
    Permissions.MANAGE_GROUPS,
    Permissions.MANAGE_CHANNELS,
    Permissions.MANAGE_INVITES,
    Permissions.MANAGE_MESSAGES
  ],
  [Groups.ADMIN]: [
    Permissions.MANAGE_PRODUCTS,
    Permissions.MANAGE_COMMUNITY,
    Permissions.ADMINISTRATOR,
    Permissions.OWNER
  ]
}

export const PermissionNames = {
  [Permissions.READ_MESSAGES]: 'Read Messages',
  [Permissions.SEND_MESSAGES]: 'Send Messages',
  [Permissions.MENTION_MEMBERS]: 'Mention Members',
  [Permissions.MENTION_GROUPS]: 'Mention Groups',
  [Permissions.MENTION_SOMEONE]: 'Mention Someone',
  [Permissions.EMBED_LINKS]: 'Embed Links',
  [Permissions.CREATE_INVITES]: 'Create Invites',
  [Permissions.BAN_MEMBERS]: 'Ban Members',
  [Permissions.KICK_MEMBERS]: 'Kick Members',
  [Permissions.MENTION_EVERYONE]: 'Mention Everyone',
  [Permissions.MANAGE_GROUPS]: 'Manage Groups',
  [Permissions.MANAGE_CHANNELS]: 'Manage Channels',
  [Permissions.MANAGE_INVITES]: 'Manage Invites',
  [Permissions.MANAGE_MESSAGES]: 'Manage Messages',
  [Permissions.MANAGE_PRODUCTS]: 'Manage Products',
  [Permissions.MANAGE_COMMUNITY]: 'Manage Community',
  [Permissions.ADMINISTRATOR]: 'Administrator',
  [Permissions.OWNER]: 'Owner'
}

export const GroupNames: { [key in Groups]: string } = {
  [Groups.BASIC]: 'Basic Permissions',
  [Groups.MOD]: 'Mod Permissions',
  [Groups.ADMIN]: 'Admin Permissions'
}

export enum Events {
  ACCEPTED_VOICE_SESSION = 'ACCEPTED_VOICE_SESSION',
  DELETED_CHANNEL = 'DELETED_CHANNEL',
  DELETED_GROUP = 'DELETED_GROUP',
  DELETED_MEMBER = 'DELETED_MEMBER',
  DELETED_GROUP_MEMBER = 'DELETED_GROUP_MEMBER',
  DELETED_MESSAGE = 'DELETED_MESSAGE',
  DELETED_OVERRIDE = 'DELETED_OVERRIDE',
  DELETED_PARTICIPANT = 'DELETED_PARTICIPANT',
  DELETED_RELATIONSHIP = 'DELETED_RELATIONSHIP',
  NEW_CHANNEL = 'NEW_CHANNEL',
  NEW_GROUP = 'NEW_GROUP',
  NEW_GROUP_MEMBER = 'NEW_GROUP_MEMBER',
  NEW_MEMBER = 'NEW_MEMBER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_MENTION = 'NEW_MENTION',
  NEW_OVERRIDE = 'NEW_OVERRIDE',
  NEW_PARTICIPANT = 'NEW_PARTICIPANT',
  NEW_RELATIONSHIP = 'NEW_RELATIONSHIP',
  NEW_VOICE_SESSION = 'NEW_VOICE_SESSION',
  REORDERED_CHANNELS = 'REORDERED_CHANNELS',
  REORDERED_CHILDREN = 'REORDERED_CHILDREN',
  REORDERED_GROUPS = 'REORDERED_GROUPS',
  TYPING = 'TYPING',
  UPDATED_CHANNEL = 'UPDATED_CHANNEL',
  UPDATED_COMMUNITY = 'UPDATED_COMMUNITY',
  UPDATED_CONVERSATION = 'UPDATED_CONVERSATION',
  UPDATED_GROUP = 'UPDATED_GROUP',
  UPDATED_MESSAGE = 'UPDATED_MESSAGE',
  UPDATED_USER = 'UPDATED_USER',
  UPDATED_OVERRIDE = 'UPDATED_OVERRIDE',
  RINGING = 'RINGING'
}

export enum MessageTypes {
  NORMAL = 1,
  PINNED = 2,
  MEMBER_ADDED = 3,
  MEMBER_REMOVED = 4,
  ADMINISTRATOR = 5,
  WEBHOOK = 6,
  INTEGRATION = 7
}

export enum InternalChannelTypes {
  PrivateChannel,
  GroupChannel,
  CommunityChannel
}
