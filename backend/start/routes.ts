/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const RedirectsController = () => import('#controllers/redirects_controller')
const LinksController = () => import('#controllers/links_controller')

router.get('/', () => {
  return { hello: 'world' }
})

// --- API Endpoints (Frontend Portal & Autocomplete) ---
router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // CWE-770: reads (search, tag filter) are throttled per client
    router
      .group(() => {
        router.get('/links', [LinksController, 'index']) // Full-text list & typeahead search
        router.get('/links/:id', [LinksController, 'show']) // Fetch single link metadata
      })
      .use(middleware.throttle({ name: 'links-read', max: 60, windowMs: 60_000 }))

    // CWE-770: writes (which can create tags) get a tighter per-user limit
    router
      .group(() => {
        router.post('/links', [LinksController, 'store']) // Create new shortcut
        router.patch('/links/:id', [LinksController, 'update']) // Edit a shortcut
        router.delete('/links/:id', [LinksController, 'destroy']) // Soft/hard delete
      })
      .use([
        middleware.auth(),
        middleware.throttle({ name: 'links-write', max: 20, windowMs: 60_000 }),
      ])
  })
  .prefix('/api/v1')

// --- Core Redirection Engine (Browser go/ routing) ---
// Scoped team redirect: http://go/sprint/team-allocation
router.get('/go/:teamSlug/:linkSlug', [RedirectsController, 'resolveScoped'])

// Global redirect: http://go/api-docs
router.get('/go/:linkSlug', [RedirectsController, 'resolveGlobal'])
