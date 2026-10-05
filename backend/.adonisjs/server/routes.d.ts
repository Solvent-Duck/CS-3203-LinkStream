import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'links.index': { paramsTuple?: []; params?: {} }
    'links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'links.store': { paramsTuple?: []; params?: {} }
    'links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'redirects.resolve_scoped': { paramsTuple: [ParamValue,ParamValue]; params: {'teamSlug': ParamValue,'linkSlug': ParamValue} }
    'redirects.resolve_global': { paramsTuple: [ParamValue]; params: {'linkSlug': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'links.index': { paramsTuple?: []; params?: {} }
    'links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'redirects.resolve_scoped': { paramsTuple: [ParamValue,ParamValue]; params: {'teamSlug': ParamValue,'linkSlug': ParamValue} }
    'redirects.resolve_global': { paramsTuple: [ParamValue]; params: {'linkSlug': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'links.index': { paramsTuple?: []; params?: {} }
    'links.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'redirects.resolve_scoped': { paramsTuple: [ParamValue,ParamValue]; params: {'teamSlug': ParamValue,'linkSlug': ParamValue} }
    'redirects.resolve_global': { paramsTuple: [ParamValue]; params: {'linkSlug': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'links.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'links.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}