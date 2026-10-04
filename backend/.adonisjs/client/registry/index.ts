/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'links.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/links',
    tokens: [{"old":"/api/v1/links","type":0,"val":"api","end":""},{"old":"/api/v1/links","type":0,"val":"v1","end":""},{"old":"/api/v1/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['links.index']['types'],
  },
  'links.store': {
    methods: ["POST"],
    pattern: '/api/v1/links',
    tokens: [{"old":"/api/v1/links","type":0,"val":"api","end":""},{"old":"/api/v1/links","type":0,"val":"v1","end":""},{"old":"/api/v1/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['links.store']['types'],
  },
  'links.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/links/:id',
    tokens: [{"old":"/api/v1/links/:id","type":0,"val":"api","end":""},{"old":"/api/v1/links/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/links/:id","type":0,"val":"links","end":""},{"old":"/api/v1/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['links.show']['types'],
  },
  'links.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/links/:id',
    tokens: [{"old":"/api/v1/links/:id","type":0,"val":"api","end":""},{"old":"/api/v1/links/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/links/:id","type":0,"val":"links","end":""},{"old":"/api/v1/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['links.destroy']['types'],
  },
  'redirects.resolve_scoped': {
    methods: ["GET","HEAD"],
    pattern: '/go/:teamSlug/:linkSlug',
    tokens: [{"old":"/go/:teamSlug/:linkSlug","type":0,"val":"go","end":""},{"old":"/go/:teamSlug/:linkSlug","type":1,"val":"teamSlug","end":""},{"old":"/go/:teamSlug/:linkSlug","type":1,"val":"linkSlug","end":""}],
    types: placeholder as Registry['redirects.resolve_scoped']['types'],
  },
  'redirects.resolve_global': {
    methods: ["GET","HEAD"],
    pattern: '/go/:linkSlug',
    tokens: [{"old":"/go/:linkSlug","type":0,"val":"go","end":""},{"old":"/go/:linkSlug","type":1,"val":"linkSlug","end":""}],
    types: placeholder as Registry['redirects.resolve_global']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
