/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  links: {
    index: typeof routes['links.index']
    store: typeof routes['links.store']
    show: typeof routes['links.show']
    destroy: typeof routes['links.destroy']
  }
  redirects: {
    resolveScoped: typeof routes['redirects.resolve_scoped']
    resolveGlobal: typeof routes['redirects.resolve_global']
  }
}
