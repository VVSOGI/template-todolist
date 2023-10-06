import Negotiator from 'negotiator'
import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import { i18n } from '../i18n.config'

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))
    // @ts-ignore locales are readonly
    const locales: string[] = i18n.locales
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    const locale = match(languages, locales, i18n.defaultLocale)
    return locale
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    if (pathname === '/' || pathname === '/ko' || pathname === '/en') {
        const locale = getLocale(request)
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    const pathnameIsMissingLocale = i18n.locales.every((locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`)

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)
        return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url))
    }
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: '/((?!api|static|locales|.*\\..*|_next).*)'
}