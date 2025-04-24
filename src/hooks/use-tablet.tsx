import * as React from "react"

const TABLET_MIN = 768
const TABLET_MAX = 1024

/**
 * タブレット端末かどうかを判定するフック
 * 画面幅が768px以上1024px以下の場合にtrueを返す
 */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_MIN}px) and (max-width: ${TABLET_MAX}px)`)
    
    const onChange = () => {
      setIsTablet(window.innerWidth >= TABLET_MIN && window.innerWidth <= TABLET_MAX)
    }
    
    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= TABLET_MIN && window.innerWidth <= TABLET_MAX)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

/**
 * デスクトップ端末かどうかを判定するフック
 * 画面幅が1024pxより大きい場合にtrueを返す
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${TABLET_MAX + 1}px)`)
    
    const onChange = () => {
      setIsDesktop(window.innerWidth > TABLET_MAX)
    }
    
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth > TABLET_MAX)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}