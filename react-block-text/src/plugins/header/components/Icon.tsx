import type { IconProps } from '../types'

function Icon({ children }: IconProps) {
  return (
    <>
      <div className="rbt-font-serif rbt-text-gray-600">
        {children}
      </div>
      <div className="rbt-w-full rbt-flex rbt-flex-col rbt-gap-1">
        <div className="rbt-border-b rbt-border-gray-300" />
        <div className="rbt-w-[75%] rbt-border-b rbt-border-gray-300" />
        <div className="rbt-w-[50%] rbt-border-b rbt-border-gray-300" />
      </div>
    </>
  )
}

export default Icon
